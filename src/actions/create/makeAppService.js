/* eslint-disable prefer-destructuring */

const { appServiceTemplate } = require('./lib/templates');
const { firstToUpper, fileWriter } = require('../../utils');

module.exports = async (serviceName) => {
  let config;
  let destination;
  try {
    config = require(`${process.cwd()}/config`);
    destination = config.app.sources.app[0];
  } catch (err) {
    console.log('Unable to resolve app config');
    throw new Error(err);
  }

  const formattedName = `${firstToUpper(serviceName)}.js`;
  const content = appServiceTemplate(firstToUpper(serviceName));

  try {
    await fileWriter(formattedName, destination, content);
    console.log(`${formattedName} created on ${destination}`);
    return;
  } catch (err) {
    console.log(`Unable to create file${formattedName} on ${destination}!`);
    throw new Error(err);
  }
};
