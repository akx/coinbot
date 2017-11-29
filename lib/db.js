const qs = require('querystring');
const _knex = require('knex');

const getConfig = () => {
  const connInfo = qs.parse(process.env.DATABASE_URL || 'client=sqlite3&filename=./coinbot.sqlite3');
  const config = { client: connInfo.client, connection: connInfo };
  if (config.client === 'sqlite3') {
    config.useNullAsDefault = true;
  }
  return config;
};

const guardedCreateTable = (knex, tableName, callback) => (
  knex.schema.hasTable(tableName)
    .then(exists => (exists ? Promise.resolve(false) : knex.schema.createTable(tableName, callback)))
);

const tickerColumns = new Set([
  'symbol',
  'ts',
  'rank',
  'price_usd',
  'price_btc',
  '24h_volume_usd',
  'market_cap_usd',
  'percent_change_1h',
  'percent_change_24h',
  'percent_change_7d',
  'available_supply',
]);


const convertDatumToRow = (ts, datum) => {
  const row = { ts };
  Object.keys(datum).forEach((column) => {
    if (tickerColumns.has(column)) {
      row[column] = datum[column];
    }
  });
  return row;
};


const createTickerTable = knex => (
  guardedCreateTable(knex, 'ticker', (table) => {
    table.string('symbol').index();
    table.bigInteger('ts').index();
    table.integer('rank');
    table.decimal('price_usd');
    table.decimal('price_btc');
    table.decimal('24h_volume_usd');
    table.decimal('market_cap_usd');
    table.decimal('available_supply').nullable();
    table.decimal('percent_change_1h').nullable();
    table.decimal('percent_change_24h').nullable();
    table.decimal('percent_change_7d').nullable();
  })
);

const createResponseTable = knex => (
  guardedCreateTable(knex, 'cmc_response', (table) => {
    table.increments();
    table.bigInteger('ts');
    table.string('data');
  })
);

const createTables = knex => (
  Promise.resolve(true)
    .then(() => createTickerTable(knex))
    .then(() => createResponseTable(knex))
);


const getDatabase = (config = null) => {
  if (!config) {
    config = getConfig();
  }
  const knex = _knex(config);
  return createTables(knex).then(() => knex);
};


module.exports.convertDatumToRow = convertDatumToRow;
module.exports.getDatabase = getDatabase;
module.exports.tickerColumns = tickerColumns;
