const path = require('path');

const fs = require('fs-extra');
const fly = require('flyio');
const chalk = require('chalk');

const cdir = path.resolve('.');
const configFilename = 'spiderman.config.js';
const configPath = path.join(cdir, configFilename);

if (!fs.existsSync(configPath)) {
  console.log(chalk.red('[ERROR] No configuration file found.'));
  process.exit();
}

let config = {
  
};
require(configPath)(config);
console.log(config);