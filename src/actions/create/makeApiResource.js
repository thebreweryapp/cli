/* eslint-disable prefer-destructuring */

const fs = require('fs');

const inquirer = require('inquirer');
const { controllerTemplate } = require('./lib/templates');
const { firstToUpper, fileWriter } = require('../../utils');
const questions = require('./lib/questions');

const { apiResourceQuestions } = questions;

module.exports = async () => {
  let config;
  let destination;
  let routerPath;

  try {
    config = require(`${process.cwd()}/config`);
    destination = config.app.sources.controller[0];
    routerPath = config.app.sources.router;
  } catch (err) {
    console.log('Unable to resolve controller and router config');
    throw new Error(err);
  }

  const { controller, extendBase, route } = await inquirer.prompt(apiResourceQuestions);

  const controllerName = `${firstToUpper(controller)}Controller.js`;
  const content = controllerTemplate(controller, extendBase);

  if (controller !== '') {
    // Write controller file
    try {
      await fileWriter(controllerName, destination, content);
      console.log(`${controllerName} created on ${destination}`);
    } catch (err) {
      console.log(`Unable to create file${controllerName} on ${destination}!`);
      throw new Error(err);
    }
  }

  if (route !== '') {
    // add route to router.js
    let routerFile = fs.readFileSync(`${process.cwd()}/${routerPath}`, 'utf8');

    if (routerFile.includes(`apiRouter.use('/${route}', controller('controllers/${controllerName}'));`) === false) {
      // eslint-disable-next-line prefer-const
      let [routerFile1, routerFile2] = routerFile.split('  /* apiRoutes END */');
      routerFile1 += `\n  apiRouter.use('/${route}', controller('controllers/${controllerName}'));`;
      routerFile = `${routerFile1}\n  /* apiRoutes END */${routerFile2}`;
    }

    try {
      const fileName = routerPath.substring(routerPath.lastIndexOf('/') + 1);
      const routerDest = routerPath.substring(0, routerPath.lastIndexOf('/'));
      await fileWriter(fileName, routerDest, routerFile, true);
      console.log(`route ${route} created on ${routerPath}`);
    } catch (err) {
      console.log(`Unable to create route ${route} on ${routerPath}`);
      throw new Error(err);
    }
  }
};
