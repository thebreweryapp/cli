/* eslint-disable prefer-destructuring */

const inquirer = require('inquirer');
const { spawn } = require('child_process');
const questions = require('./lib/questions');

const { datasourceQuestions } = questions;
const { datasourceTemplate } = require('./lib/templates');
const { fileWriter, firstToUpper } = require('../../utils');
const {
  DEFAULT_CONNECTORS: defaultConnectors,
  DB_DRIVERS: dbDrivers,
} = require('../../../config');

module.exports = async () => {
  let appConfig;
  let destination;
  // Get file destination from config;
  try {
    appConfig = require(`${process.cwd()}/config`);
    destination = appConfig.app.sources.dataSource[0];
  } catch (err) {
    console.log('Unable to resolve dataSource config');
    throw new Error(err);
  }

  const datasourceAnswers = await inquirer.prompt(datasourceQuestions);

  const nonConfig = ['name', 'connector', 'installConnector', 'installDbDriver'];

  const config = Object.keys(datasourceAnswers)
    .filter((key) => !nonConfig.includes(key))
    .reduce((acc, val) => {
      acc[val] = datasourceAnswers[val];
      return acc;
    }, {});

  // create datasource from template
  const datasourceFile = datasourceTemplate(
    datasourceAnswers.name,
    datasourceAnswers.connector,
    config,
  );
  const fileName = `${firstToUpper(datasourceAnswers.name)}.js`;

  // write file
  try {
    await fileWriter(fileName, destination, datasourceFile);
    console.log(`${fileName} created on ${destination}`);
  } catch (err) {
    console.log(`Unable to create file${fileName} on ${destination}!`);
    throw new Error(err);
  }


  if (datasourceAnswers.installConnector) {
    const { connector } = defaultConnectors[datasourceAnswers.connector];
    const installExec = spawn(/^win/.test(process.platform) ? 'npm.cmd' : 'npm', ['install'].concat(connector, ['--save']));
    installExec.stdout.on('data', (data) => {
      console.log(data.toString());
    });
    installExec.stderr.on('data', (data) => {
      console.log(data.toString());
    });
  }
  if (datasourceAnswers.installDbDriver) {
    const driver = dbDrivers[datasourceAnswers.dialect];
    const driverInstallExec = spawn(/^win/.test(process.platform) ? 'npm.cmd' : 'npm', ['install'].concat(driver, ['--save']));
    driverInstallExec.stdout.on('data', (data) => {
      console.log(data.toString());
    });
    driverInstallExec.stderr.on('data', (data) => {
      console.log(data.toString());
    });
  }
};
