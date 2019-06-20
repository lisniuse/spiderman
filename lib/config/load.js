const path = require('path');

const fs = require('fs-extra');
const chalk = require('chalk');

const auto = require('./auto.js');

const cdir = path.resolve('.');
const configFilename = 'spiderman.config.js';
const configTargetPath = path.join(cdir, configFilename);
const configDefaultPath = path.join(__dirname, './default.js');

module.exports = function() {
  if (!fs.existsSync(configTargetPath)) {
    console.log(chalk.red('[ERROR] No configuration file found.'));
    process.exit();
  }
  let config = require(configDefaultPath)();
  config.AUTO = auto();
  require(configTargetPath)(config);
  return config;
}