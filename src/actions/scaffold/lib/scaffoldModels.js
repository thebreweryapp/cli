const inflection = require('inflection');
const swaggerSequelize = require('./swaggerSequelize');
const createModel = require('./templates/createModel');

const scaffoldModels = (swaggerSpec) => new Promise((resolve) => {
  const models = swaggerSpec.components.schemas;
  const modelFiles = [];

  Object.keys(models).forEach((key) => {
    const model = models[key];
    const attributes = swaggerSequelize.generate(model);
    const sequelizeModel = createModel(key, attributes);

    modelFiles.push({
      fileName: `${inflection.pluralize(key).toLowerCase()}.js`,
      destination: `${process.env.PWD}/src/infra/database/models`,
      content: sequelizeModel,
    });

    // const path = `${process.env.PWD}/src/infra/database/models`;
    // const fileName = `${inflection.pluralize(key).toLowerCase()}.js`;

    // if (!fs.existsSync(path)) {
    //   fs.mkdirSync(path);
    //   fs.chmodSync(path, '0775');
    // }

    // fs.writeFileSync(`${path}/${fileName}`, sequelizeModel);
    // console.log(`Model ${fileName} created!`);
  });

  resolve(modelFiles);
});

module.exports = scaffoldModels;
