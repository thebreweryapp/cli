/* eslint-disable prefer-destructuring */

const inquirer = require('inquirer');
const { repositoryTemplate } = require('./lib/templates');
const { firstToUpper, fileWriter } = require('../../utils');

const questions = require('./lib/questions');

const { repositoryQuestions } = questions;

module.exports = async () => {
  let config;
  let destination;
  try {
    config = require(`${process.cwd()}/config`);
    destination = config.app.sources.repository[0];
  } catch (err) {
    console.log('Unable to resolve repository config');
    throw new Error(err);
  }

  const { name, baseCrud } = await inquirer.prompt(repositoryQuestions);
  const formattedName = `${firstToUpper(name)}Repository.js`;
  const content = repositoryTemplate(firstToUpper(name), baseCrud);

  try {
    await fileWriter(formattedName, destination, content);
    console.log(`${formattedName} created on ${destination}`);
    return;
  } catch (err) {
    console.log(`Unable to create file${formattedName} on ${destination}!`);
    throw new Error(err);
  }
};
