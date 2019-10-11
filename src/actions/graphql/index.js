/* eslint-disable prefer-destructuring */

const transform = require('graphql-to-json-schema');
const fs = require('fs');
const inflection = require('inflection');
const exec = require('child_process').execSync;
const Sequelize = require('sequelize');

const {
  getModelData, convertToStringModel, generateSchema, generateResolvers, deleteFolderRecursive,
} = require('./utils');

const { firstToUpper } = require('../../utils/string-manipulation');
const createRepository = require('./templates/repositoryTemplate');
const CreateService = require('./templates/serviceTemplate');
const createDomain = require('./templates/domainTemplate');

const createModels = (modelData) => {
  // convert modelData to model strings
  const models = convertToStringModel(modelData);
  const path = `${process.env.PWD}/src/infra/database/models`; // '/Users/JoshMante/Projects/brewery/graphql-resolver/src/infra/database/models';

  // write updated models
  Object.keys(models).forEach((key) => {
    const modelString = models[key];
    const fileName = `${inflection.pluralize(key).toLowerCase()}.js`;

    fs.writeFileSync(`${path}/${fileName}`, modelString);
    console.log(`Model ${fileName} created!`);
  });
};

const createDomains = () => {
  const config = require(`${process.cwd()}/config/index.js`);
  const sequelize = new Sequelize(config.db);

  const path = `${process.env.PWD}/src/domain`;

  fs
    .readdirSync(`${process.env.PWD}/src/infra/database/models`)
    .filter((file) => (file.indexOf('.') !== 0) && (file !== 'index.js') && (file.slice(-3) === '.js'))
    .forEach((file) => {
      const model = sequelize.import(`${process.env.PWD}/src/infra/database/models/${file}`);
      const domain = createDomain(model);

      const fileName = `${inflection.singularize(firstToUpper(file.split('.')[0]))}.js`;

      fs.writeFileSync(`${path}/${fileName}`, domain);
      console.log(`Domain ${fileName} created!`);
    });
};

const createRepositories = () => {
  const models = [];
  const path = `${process.env.PWD}/src/infra/repositories`;

  fs
    .readdirSync(`${process.env.PWD}/src/infra/database/models`)
    .filter((file) => (file.indexOf('.') !== 0) && (file !== 'index.js') && (file.slice(-3) === '.js'))
    .forEach((file) => {
      models.push({
        plural: file.split('.')[0],
        singular: inflection.singularize(file.split('.')[0]),
      });
    });

  models.forEach((model) => {
    const repository = createRepository(model);

    const fileName = `${firstToUpper(model.singular)}Repository.js`;

    fs.writeFileSync(`${path}/${fileName}`, repository);
    console.log(`Repository ${fileName} created!`);
  });
};

const createSchemas = (modelData) => {
  // convert modelData to string gql schema
  const schemas = generateSchema(modelData);
  const path = `${process.env.PWD}/src/interfaces/graphql/typeDefs`;

  Object.keys(schemas).forEach((key) => {
    const schemaString = schemas[key];
    const fileName = `${inflection.singularize(key).toLowerCase()}.js`;

    fs.writeFileSync(`${path}/${fileName}`, schemaString);
    console.log(`Schema ${fileName} created!`);
  });
};

const createServices = (modelData) => {
  const indexFile = {};

  // create service directory and operations
  Object.keys(modelData).forEach((modelName) => {
    if (modelData[modelName].type === 'model') {
      const service = inflection.singularize(modelName).toLowerCase();
      const path = `${process.env.PWD}/src/app/${service}`;

      if (!fs.existsSync(path)) {
        fs.mkdirSync(path);
        fs.chmodSync(path, '0775');
      }

      const operationTemplate = new CreateService(service);
      const templateList = operationTemplate.list();
      const templateCreate = operationTemplate.create();
      const templateShow = operationTemplate.show();
      const templateUpdate = operationTemplate.update();
      const templateDelete = operationTemplate.delete();

      fs.writeFileSync(`${path}/List${firstToUpper(service)}.js`, templateList);
      fs.writeFileSync(`${path}/Create${firstToUpper(service)}.js`, templateCreate);
      fs.writeFileSync(`${path}/Show${firstToUpper(service)}.js`, templateShow);
      fs.writeFileSync(`${path}/Update${firstToUpper(service)}.js`, templateUpdate);
      fs.writeFileSync(`${path}/Delete${firstToUpper(service)}.js`, templateDelete);

      console.log(`Service ${service} created!`);

      indexFile[service] = 'module.exports = {\n';
      indexFile[service] += `  list${firstToUpper(inflection.pluralize(service))} : require('./List${firstToUpper(service)}'),\n`;
      indexFile[service] += `  create${firstToUpper(service)} : require('./Create${firstToUpper(service)}'),\n`;
      indexFile[service] += `  show${firstToUpper(service)} : require('./Show${firstToUpper(service)}'),\n`;
      indexFile[service] += `  update${firstToUpper(service)} : require('./Update${firstToUpper(service)}'),\n`;
      indexFile[service] += `  delete${firstToUpper(service)} : require('./Delete${firstToUpper(service)}'),\n`;
    }
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

const createResolvers = (modelData) => {
  const resolvers = generateResolvers(modelData);

  const path = `${process.env.PWD}/src/interfaces/graphql/resolvers`;
  if (!fs.existsSync(path)) {
    fs.mkdirSync(path);
    fs.chmodSync(path, '0775');
  }

  Object.keys(resolvers).forEach((key) => {
    const resolverString = resolvers[key];
    const fileName = `${inflection.singularize(key).toLowerCase()}.js`;
    fs.writeFileSync(`${path}/${fileName}`, resolverString);
    console.log(`Resolver ${fileName} created!`);
  });
};

const deleteFiles = () => {
  /* DELETE MODELS */
  const modelsPath = `${process.env.PWD}/src/infra/database/models`;
  if (!fs.existsSync(modelsPath)) {
    fs.mkdirSync(modelsPath);
    fs.chmodSync(modelsPath, '0775');
  }

  fs
    .readdirSync(modelsPath)
    .filter((file) => (file.indexOf('.') !== 0) && (file !== 'index.js') && (file.slice(-3) === '.js'))
    .forEach((file) => {
      fs.unlinkSync(`${modelsPath}/${file}`, (err) => {
        if (err) throw err;
      });
    });

  /* DELETE DOMAINS */
  const domainsPath = `${process.env.PWD}/src/domain`;

  if (!fs.existsSync(domainsPath)) {
    fs.mkdirSync(domainsPath);
    fs.chmodSync(domainsPath, '0775');
  }

  fs
    .readdirSync(domainsPath)
    .filter((file) => (file.indexOf('.') !== 0) && (file !== 'index.js') && (file.slice(-3) === '.js'))
    .forEach((file) => {
      fs.unlinkSync(`${domainsPath}/${file}`, (err) => {
        if (err) throw err;
      });
    });

  /* DELETE REPOSITORIES */
  const repositoriesPath = `${process.env.PWD}/src/infra/repositories`;

  if (!fs.existsSync(repositoriesPath)) {
    fs.mkdirSync(repositoriesPath);
    fs.chmodSync(repositoriesPath, '0775');
  }

  fs
    .readdirSync(repositoriesPath)
    .filter((file) => (file.indexOf('.') !== 0) && (file !== 'index.js') && (file !== 'BaseRepository.js') && (file.slice(-3) === '.js'))
    .forEach((file) => {
      fs.unlinkSync(`${repositoriesPath}/${file}`, (err) => {
        if (err) throw err;
      });
    });

  /* DELETE SCHEMAS */
  const schemaPath = `${process.env.PWD}/src/interfaces/graphql/typeDefs`;

  if (!fs.existsSync(schemaPath)) {
    fs.mkdirSync(schemaPath);
    fs.chmodSync(schemaPath, '0775');
  }

  fs
    .readdirSync(schemaPath)
    .filter((file) => (file.indexOf('.') !== 0) && (file !== 'FilterTypes.js') && (file.slice(-3) === '.js'))
    .forEach((file) => {
      fs.unlinkSync(`${schemaPath}/${file}`, (err) => {
        if (err) throw err;
      });
    });

  /* DELETE SERVICES */
  const servicesPath = `${process.env.PWD}/src/app`;

  fs
    .readdirSync(servicesPath)
    .filter((file) => (file.indexOf('.') !== 0) && (file !== 'Application.js') && (file !== 'Operation.js'))
    .forEach((file) => {
      deleteFolderRecursive(`${servicesPath}/${file}`);
    });

  let containerFile = fs.readFileSync(`${process.env.PWD}/src/container.js`, 'utf8');
  containerFile = containerFile.split('/* Require Operations END */')[1];
  containerFile = `/* Require Operations END */${containerFile}`;
  containerFile = containerFile.split('/* Operations BEGIN */')[0];
  containerFile += '/* Operations BEGIN */\n';

  fs.writeFileSync(`${process.env.PWD}/src/container.js`, containerFile);

  /* DELETE RESOLVERS */
  const resolversPath = `${process.env.PWD}/src/interfaces/graphql/resolvers`;

  if (!fs.existsSync(resolversPath)) {
    fs.mkdirSync(resolversPath);
    fs.chmodSync(resolversPath, '0775');
  }

  fs
    .readdirSync(resolversPath)
    .forEach((file) => {
      fs.unlinkSync(`${resolversPath}/${file}`, (err) => {
        if (err) throw err;
      });
    });
};


const graphql = () => {
  // Get resolver SDL Data
  const schemaPath = `${process.env.PWD}/src/interfaces/graphql/resolver.graphql`;
  if (!fs.existsSync(schemaPath)) {
    throw new Error('resolver SDL doesnt exist');
  }

  // convert SDL into json schema
  const schemaJson = transform(fs.readFileSync(schemaPath, 'utf8'));

  // convert json schema into simplified json for sequelize
  console.log('Parsing SDL...');
  const modelData = getModelData(schemaJson.definitions);

  // clean up old generated files
  deleteFiles();

  // create sequelize models
  console.log('Creating Models...');
  createModels(modelData);

  // create domains
  console.log('Creating Domains...');
  createDomains();

  // create migration out of model and run migration
  console.log('Creating migrations...');
  console.log('Running Migrations...');
  exec('NODE_PATH=. node ./node_modules/sequelize-auto-migrations/bin/makemigration.js -x');

  // exec('NODE_PATH=. node ./node_modules/sequelize-auto-migrations/bin/runmigration.js');

  // generate repositories
  console.log('Creating repositories...');
  createRepositories();

  // generate schema
  console.log('Creating graphQL schema...');
  createSchemas(modelData);

  // generate service operations
  console.log('Creating Services...');
  createServices(modelData);

  // generate resolvers
  console.log('Creating resolvers...');
  createResolvers(modelData);
};

module.exports = graphql;
