const fs = require('fs');
const inflection = require('inflection');
const { firstToUpper } = require('../../../utils');

const createController = (serviceName, operations) => {
  const path = `${process.env.PWD}/src/app/${serviceName}`;

  if (!fs.existsSync(path)) {
    fs.mkdirSync(path);
    fs.chmodSync(path, '0775');
  }

  let controllerFile = null;

  Object.keys(operations).forEach((method) => {
    let route = null;
    if (operations[method].operationId.substring(0, 4).toLowerCase() === 'list') {
      route = `router.${method}('/', this.injector('${operations[method].operationId}'), this.index);`;
    } else if (operations[method].operationId.substring(0, 6).toLowerCase() === 'create') {
      route = `router.${method}('/', this.injector('${operations[method].operationId}'), this.create);`;
    } else if (operations[method].operationId.substring(0, 4).toLowerCase() === 'show') {
      route = `router.${method}('/:id', this.injector('${operations[method].operationId}'), this.show);`;
    } else if (operations[method].operationId.substring(0, 6).toLowerCase() === 'update') {
      route = `router.${method}('/:id', this.injector('${operations[method].operationId}'), this.update);`;
    } else if (operations[method].operationId.substring(0, 6).toLowerCase() === 'delete') {
      route = `router.${method}('/:id', this.injector('${operations[method].operationId}'), this.delete);`;
    } else {
      route = `router.${method}('/', this.injector('${operations[method].operationId}'));`;
    }

    if (controllerFile) {
      controllerFile += `    ${route}\n`;
    } else {
      controllerFile = `
const { Router } = require('express');
const BaseController = require('./BaseController');

class ${firstToUpper(inflection.pluralize(serviceName))}Controller extends BaseController {

constructor() {
  super();
  const router = Router();\n`;

      controllerFile += `    ${route}\n`;
    }
  });

  const upperPlural = firstToUpper(inflection.pluralize(serviceName));

  controllerFile += `
    return router;
  }
}

module.exports = ${upperPlural}Controller;`;

  return controllerFile;
};

module.exports = createController;
