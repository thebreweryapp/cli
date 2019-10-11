const fs = require('fs');
const inflection = require('inflection');
const createRepository = require('./templates/createRepository');
const { firstToUpper } = require('../../../utils');

const scaffoldRepositories = () => new Promise((resolve) => {
  const repositories = [];
  fs.readdirSync(`${process.env.PWD}/src/infra/database/models`)
    .filter(
      (file) => file.indexOf('.') !== 0
        && file !== 'index.js'
        && file.slice(-3) === '.js',
    )
    .forEach((file) => {
      const singular = inflection.singularize(file.split('.')[0]);
      const plural = inflection.pluralize(file.split('.')[0]);
      const repository = createRepository({
        plural,
        singular,
      });

      repositories.push({
        fileName: `${firstToUpper(singular)}Repository.js`,
        destination: `${process.env.PWD}/src/infra/repositories`,
        content: repository,
      });
    });

  resolve(repositories);
});

module.exports = scaffoldRepositories;
