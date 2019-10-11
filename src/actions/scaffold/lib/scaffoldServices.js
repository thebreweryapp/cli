const fs = require('fs');
const inflection = require('inflection');
const CreateService = require('./templates/createService');
const { firstToUpper } = require('../../../utils');

const scaffoldServices = (swaggerSpec) => {
  const { paths } = swaggerSpec;
  const indexFile = {};

  // create service directory and operations
  Object.keys(paths).forEach((key) => {
    let service = key.split('/')[1];
    service = inflection.singularize(service).toLowerCase();
    const path = `${process.env.PWD}/src/app/${service}`;

    if (!fs.existsSync(path)) {
      fs.mkdirSync(path);
      fs.chmodSync(path, '0775');
    }

    const operations = paths[key];

    Object.keys(operations).forEach((method) => {
      let template = null;
      const operationTemplate = new CreateService(service, operations[method].operationId);
      if (operations[method].operationId.substring(0, 4).toLowerCase() === 'list') {
        template = operationTemplate.list();
      } else if (operations[method].operationId.substring(0, 6).toLowerCase() === 'create') {
        template = operationTemplate.create();
      } else if (operations[method].operationId.substring(0, 4).toLowerCase() === 'show') {
        template = operationTemplate.show();
      } else if (operations[method].operationId.substring(0, 6).toLowerCase() === 'update') {
        template = operationTemplate.update();
      } else if (operations[method].operationId.substring(0, 6).toLowerCase() === 'delete') {
        template = operationTemplate.delete();
      } else {
        template = operationTemplate.default();
      }

      const fileName = `${firstToUpper(operations[method].operationId)}.js`;

      fs.writeFileSync(`${path}/${fileName}`, template);
      console.log(`Operation ${fileName} created!`);
      if (indexFile[service]) {
        indexFile[service] += `  ${operations[method].operationId} : require('./${firstToUpper(operations[method].operationId)}'),\n`;
      } else {
        indexFile[service] = 'module.exports = {\n';
        indexFile[service] += `  ${operations[method].operationId} : require('./${firstToUpper(operations[method].operationId)}'),\n`;
      }
    });
  });

  // create index files , register operations to container
  let containerFile = fs.readFileSync(`${process.env.PWD}/src/container.js`, 'utf8');

  Object.keys(indexFile).forEach((service) => {
    // create index file
    indexFile[service] += '};';
    const lowerSingular = inflection.singularize(service).toLowerCase();
    fs.writeFileSync(`${process.env.PWD}/src/app/${lowerSingular}/index.js`, indexFile[service]);

    // register operation on container
    const requireOperation = `const ${lowerSingular}Operations = require('./app/${lowerSingular}');`;
    const registerOperation = `container.registerClass(${lowerSingular}Operations);`;
    if (containerFile.includes(requireOperation) === false) {
      containerFile = `${requireOperation}\n${containerFile}`;
    }

    if (containerFile.includes(registerOperation) === false) {
      containerFile = `${containerFile + registerOperation}\n`;
    }
  });

  fs.writeFileSync(`${process.env.PWD}/src/container.js`, containerFile);
};

module.exports = scaffoldServices;
