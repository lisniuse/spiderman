const fly = require('flyio');

/**
 * @description Used to send http requests.
 * @param {Object} config config
 */

module.exports = function(config) {
  async function request(url, data, method = 'GET') {
    let headers = config.headers;
    let promiseResult = fly.request(url, data, {
      method: method,
      headers: headers,
      responseType: "stream"
    });
    return promiseResult;
  }
  return {
    get: async (url, data) => request(url, data, 'GET'),
    post: async (url, data) => request(url, data, 'POST'),
  };
}