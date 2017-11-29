const { getLatestData } = require('./lib/cmc-api');
const { getDatabase, convertDatumToRow } = require('./lib/db');

const updateTickerData = (trx, ts, data) => (
  Promise.all(data.map(datum => trx.insert(convertDatumToRow(ts, datum)).into('ticker')))
);


const updateResponse = (trx, ts, data) => (
  trx.insert({ ts, data: JSON.stringify(data) }).into('cmc_response')
);


function updateDatabase() {
  return Promise.all([getDatabase(), getLatestData()])
    .then(([database, data]) => {
      const ts = Math.floor((+new Date()) / 1000);
      return database.transaction(trx =>
        Promise.resolve(true)
          .then(() => updateResponse(trx, ts, data))
          .then(() => updateTickerData(trx, ts, data)));
    });
}

if (module.parent === null) {
  updateDatabase();
}
