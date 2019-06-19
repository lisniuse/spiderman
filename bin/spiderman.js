const config = require('../lib/config/load')();
const Spiderman = require('../lib/class/Spiderman');

(async function main() {

  let spiderman = new Spiderman({
    config,
    urlCallback: function(url) {
      console.log('request:', url);
    }
  });

  await spiderman.start();

})();