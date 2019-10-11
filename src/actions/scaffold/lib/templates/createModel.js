const inflection = require('inflection');

const createModel = (name, attributes) => {
  // const upperSingular = firstToUpper(inflection.singularize(name));
  // const upperPlural = firstToUpper(inflection.pluralize(name));
  const lowerPlural = inflection.pluralize(name);
  // const lowerSingular = inflection.singularize(name);
  // const modelName = `${upperSingular}Model`;
  const model = `module.exports = function(sequelize, DataTypes) {
  return sequelize.define('${lowerPlural}', {
    ${attributes}
  }, {
    tableName: '${lowerPlural}',
    timestamps: true
  });
};`;

  return model;
};

module.exports = createModel;
