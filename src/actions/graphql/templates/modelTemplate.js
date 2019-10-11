const inflection = require('inflection');
const { firstToUpper, firstToLower } = require('../../../utils/string-manipulation');

const createModel = (name, attributes, relations) => {
  const upperSingular = firstToUpper(inflection.singularize(name));
  // const upperPlural = firstToUpper(inflection.pluralize(name));
  const lowerPlural = firstToLower(inflection.pluralize(name));
  // const lowerSingular = firstToLower(inflection.singularize(name));
  // const modelName = `${upperSingular}Model`;

  let relationString = '';


  // create relation string
  Object.keys(relations).forEach((targetName) => {
    const relation = relations[targetName];
    relationString += `    ${upperSingular}.${relation.type}(sequelize.models.${inflection.pluralize(firstToLower(targetName))}, {
      as: '${relation.as}',
      foreignKey: '${relation.foreignKey}',\n`;

    if (relation.type === 'belongsToMany') {
      relationString += `      through: sequelize.models.${relation.through}\n`;
    }

    relationString += '    }); \n';
  });


  const model = `module.exports = function(sequelize, DataTypes) {
  const ${upperSingular} = sequelize.define('${lowerPlural}', {
    ${attributes}
  }, {
    tableName: '${lowerPlural}',
    timestamps: true
  },{
    paranoid:true
  });

  ${upperSingular}.associate = () => {
${relationString}
  };

  return ${upperSingular};

};`;
  return model;
};

module.exports = createModel;
