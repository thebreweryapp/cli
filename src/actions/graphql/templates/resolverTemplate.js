const inflection = require('inflection');
const { firstToUpper, firstToLower } = require('../../../utils/string-manipulation');

const createRelationsResolver = (relations, name) => {
  let resolverString = '';

  Object.keys(relations).forEach((targetName) => {
    const relation = relations[targetName];
    let fieldName;

    if (relation.type === 'hasMany' || relation.type === 'belongsToMany') {
      fieldName = firstToLower(inflection.pluralize(targetName));
    } else {
      fieldName = firstToLower(inflection.singularize(targetName));
    }

    resolverString
+= `   ${fieldName}: async (${firstToLower(inflection.singularize(name))}) => {
      return ${firstToLower(inflection.singularize(name))}.get${firstToUpper(fieldName)}();
    },
`;
  });

  return resolverString;
};

const createResolver = (name, properties, relations) => {
  const upperSingular = firstToUpper(inflection.singularize(name));
  const upperPlural = firstToUpper(inflection.pluralize(name));
  const lowerPlural = firstToLower(inflection.pluralize(name));
  const lowerSingular = firstToLower(inflection.singularize(name));

  const relationsResolver = createRelationsResolver(relations, name);

  const model = `
module.exports = {
  ${upperSingular}:{
${relationsResolver}
  },
  Query: {
    ${lowerPlural}: async (_, args, { operations }) => operations.list${upperPlural}.execute(args),
    ${lowerSingular}: async (_, args, { operations }) => operations.show${upperSingular}.execute(args)
  },
  Mutation: {
    create${upperSingular}: async (_, { args }, { operations }) => operations.create${upperSingular}.execute(args),
    update${upperSingular}: async(_, args, { operations }) => operations.update${upperSingular}.execute(args),
    delete${upperSingular}: async(_, args, { operations }) => opertions.delete${upperSingular}.execute(args)
  }
};`;
  return model;
};

module.exports = createResolver;
