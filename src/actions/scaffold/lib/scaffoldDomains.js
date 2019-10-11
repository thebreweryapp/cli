const inflection = require('inflection');
const fs = require('fs');
const Sequelize = require('sequelize');
const createDomain = require('./templates/createDomain');
const { firstToUpper } = require('../../../utils');

/**
 * scaffold domains from all existing orm models
 *
 * @return {promise}
 */
const scaffoldDomains = () => {
  const config = require(`${process.cwd()}/config/index.js`);
  const sequelize = new Sequelize(config.db);

  return new Promise((resolve) => {
    const files = [];

    fs.readdirSync(`${process.env.PWD}/src/infra/database/models`)
      .filter(
        (file) => file.indexOf('.') !== 0
          && file !== 'index.js'
          && file.slice(-3) === '.js',
      )
      .forEach((file) => {
        const model = sequelize.import(
          `${process.env.PWD}/src/infra/database/models/${file}`,
        );
        const domain = createDomain(model);

        const destination = `${process.env.PWD}/src/domain`;
        const fileName = `${inflection.singularize(
          firstToUpper(file.split('.')[0]),
        )}.js`;

        // if (!fs.existsSync(path)) {
        //   fs.mkdirSync(path);
        //   fs.chmodSync(path, '0775');
        // }

        // fs.writeFileSync(`${path}/${fileName}`, domain);
        // console.log(`Domain ${fileName} created!`);

        files.push({
          fileName,
          destination,
          content: domain,
        });
      });

    resolve(files);
  });
};

/**
 * scaffolds a domain based on a given model
 *
 * @param {string} modelName name of the model to scaffold the domain from
 */
// const scaffoldDomain = (modelName) => {

// };


module.exports = scaffoldDomains;
