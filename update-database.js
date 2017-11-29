const { getLatestData } = require('./lib/cmc-api');
const { getDatabase, convertDatumToRow } = require('./lib/db');


Promise.all([getDatabase(), getLatestData()])
  .then(([database, data]) => {
    const ts = Math.floor((+new Date()) / 1000);
    const rows = data.map(datum => convertDatumToRow(ts, datum));
    return database.transaction(trx =>
      trx.insert({ ts, data: JSON.stringify(data) }).into('cmc_response')
        .then(Promise.all(rows.map(row => trx.insert(row).into('ticker')))));
  });
