/* eslint-disable prefer-destructuring */

const { domainTemplate } = require('./lib/templates');
const { firstToUpper, fileWriter } = require('../../utils');

module.exports = async (name) => {
  let config;
  let destination;
  try {
    config = require(`${process.cwd()}/config`);
    destination = config.app.sources.domain[0];
  } catch (err) {
    console.log('Unable to resolve domain config');
    throw new Error(err);
  }


  const formattedName = `${firstToUpper(name)}.js`;
  const content = domainTemplate(firstToUpper(name));

  try {
    await fileWriter(formattedName, destination, content);
    console.log(`${formattedName} created on ${destination}`);
    return;
  } catch (err) {
    console.log(`Unable to create file${formattedName} on ${destination}!`);
    throw new Error(err);
  }
};
