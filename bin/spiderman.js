#!/usr/bin/env node

const config = require('../lib/config/load')();
const Spiderman = require('../lib/class/Spiderman');

(async function main() {

  let spiderman = new Spiderman({
    config,
    urlCallback: function(url) {
      if (config.printUrl === true) {
        console.log('request:', url);
      }
    }
  });

  await spiderman.start();

})();