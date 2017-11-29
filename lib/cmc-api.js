const https = require('https');

const getHTTPS = url => new Promise((resolve, reject) => {
  https.get(url, (response) => {
    let data = '';
    response.on('data', (chunk) => {
      data += chunk;
    });
    response.on('end', () => {
      if (response.statusCode >= 400) {
        const err = new Error(response.statusMessage);
        err.response = response;
        err.data = data;
        reject(err);
        return;
      }
      resolve({ error: null, response, data });
    });
  })
    .on('error', (e) => {
      reject(e);
    });
});

const getLatestData = () => (
  getHTTPS('https://api.coinmarketcap.com/v1/ticker/?limit=100')
    .then(({ data }) => JSON.parse(data))
);

module.exports.getLatestData = getLatestData;
