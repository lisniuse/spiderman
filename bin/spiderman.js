#!/usr/bin/env node

const config = require('../lib/config/load');
const Spiderman = require('../lib/class/Spiderman');

(async function main() {
  let conf = await config();
  let spiderman = new Spiderman({
    config: conf,
    urlCallback: function(url) {
      if (conf.printUrl === true) {
        console.log('request:', url);
      }
    }
  });
  await spiderman.start();
})();
