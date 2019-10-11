const fs = require('fs');
const inflection = require('inflection');
const { firstToUpper } = require('../../../utils');
const createController = require('./templates/createController');

const scaffoldControllers = (swaggerSpec) => {
  const { paths } = swaggerSpec;
  const controllers = [];

  let routerFile = fs.readFileSync(`${process.env.PWD}/src/interfaces/http/router.js`, 'utf8');

  // create service directory and operations
  Object.keys(paths).forEach((key) => {
    const serviceName = key.split('/')[1];
    const operations = paths[key];
    const upperPlural = firstToUpper(inflection.pluralize(serviceName));
    const lowerPlural = inflection.pluralize(serviceName).toLowerCase();

    if (
      routerFile.includes(
        `apiRouter.use('/${lowerPlural}', controller('controllers/${upperPlural}Controller'));`,
      ) === false
    ) {
      // eslint-disable-next-line prefer-const
      let [routerFile1, routerFile2] = routerFile.split(
        '  /* apiRoutes END */',
      );
      routerFile1 += `\n  apiRouter.use('/${lowerPlural}', controller('controllers/${upperPlural}Controller'));`;
      routerFile = `${routerFile1}\n  /* apiRoutes END */${routerFile2}`;
    }

    controllers.push({
      fileName: `${upperPlural}Controller.js`,
      destination: `${process.env.PWD}/src/interfaces/http/controllers/`,
      content: createController(serviceName, operations),
    });
  });

  fs.writeFileSync(`${process.env.PWD}/src/interfaces/http/router.js`, routerFile);
  return controllers;
};

module.exports = scaffoldControllers;
