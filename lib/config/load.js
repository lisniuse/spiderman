// @ts-nocheck
const path = require('path');

const fs = require('fs-extra');
const chalk = require('chalk');

const auto = require('./auto.js');

const cdir = path.resolve('.');
const configFilename = 'spiderman.config.js';
const configTargetPath = path.join(cdir, configFilename);
const configDefaultPath = path.join(__dirname, './default.js');

module.exports = async function() {
  if (!fs.existsSync(configTargetPath)) {
    console.log(chalk.red('[ERROR] No configuration file found.'));
    process.exit();
  }
  const defaultConfigFn = require(configDefaultPath);
  const configTargetFn = require(configTargetPath);
  let config = await defaultConfigFn();
  config.AUTO = auto();
  await configTargetFn(config);
  return config;
}
