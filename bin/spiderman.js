const path = require('path');

const fs = require('fs-extra');
const fly = require('flyio');
const chalk = require('chalk');

const cdir = path.resolve('.');
const configFilename = 'spiderman.config.js';
const configTargetPath = path.join(cdir, configFilename);
const configDefaultPath = path.join(__dirname, '../lib/config/default.js');

if (!fs.existsSync(configTargetPath)) {
  console.log(chalk.red('[ERROR] No configuration file found.'));
  process.exit();
}

let config = require(configDefaultPath)();
require(configTargetPath)(config);
console.log(config);