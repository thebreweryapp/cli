/* eslint-disable prefer-destructuring */
const inquirer = require('inquirer');
const { modelTemplate } = require('./lib/templates');
const { firstToUpper, fileWriter, readFiles } = require('../../utils');

const questions = require('./lib/questions');

const { modelQuestions, modelAttributeQuestions } = questions;


const generateAttributes = (attributes) => {
  let attributesText = '';

  attributes.forEach((attribute) => {
    attributesText += `${attribute.name} : {\n`;
    attributesText += `        type: DataTypes.${attribute.type}\n`;
    attributesText += '      },';
  });
  return attributesText;
};


module.exports = async () => {
  let config;
  let destination;
  try {
    config = require(`${process.cwd()}/config`);
    destination = config.app.sources.model[0];
  } catch (err) {
    console.log('Unable to resolve model config');
    throw new Error(err);
  }

  const datasourceConfigs = readFiles(config.app.sources.dataSource, false);
  const datasources = datasourceConfigs.map((datasource) => datasource.name);

  const {
    name, primaryKeyName, primaryKeyType, datasource,
  } = await inquirer.prompt(modelQuestions(datasources));
  console.log('Add attributes....');
  let doneAttributes = false;
  const attributes = [];

  do {
    // eslint-disable-next-line no-await-in-loop
    const attribute = await inquirer.prompt(modelAttributeQuestions);
    if (!attribute.done) {
      doneAttributes = true;
    }
    delete attribute.done;
    attributes.push(attribute);
  } while (doneAttributes === false);


  const formattedName = `${firstToUpper(name)}Model.js`;
  const content = modelTemplate(
    name,
    primaryKeyName,
    primaryKeyType,
    datasource,
    generateAttributes(attributes),
  );

  try {
    await fileWriter(formattedName, destination, content);
    console.log(`${formattedName} created on ${destination}`);
    return;
  } catch (err) {
    console.log(`Unable to create file${formattedName} on ${destination}!`);
    throw new Error(err);
  }
};
