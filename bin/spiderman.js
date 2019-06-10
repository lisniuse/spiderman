const config = require('../lib/config/load')();
const Spiderman = require('../lib/class/Spiderman');

(async function main() {

  let spiderman = new Spiderman({
    config
  });

  await spiderman.start();

})();