/* eslint-disable no-unused-vars */

const inflection = require('inflection');
const { firstToUpper, firstToLower } = require('../../../utils/string-manipulation');

const gqlDataTypes = {
  string: 'String',
  integer: 'Int',
  DateTime: 'DateTime',
  boolean: 'Boolean',
  number: 'Float',
  id: 'ID',
};

const gqlFilterTypes = {
  String: 'StringFilterType',
  Int: 'IntFilterType',
  DateTime: 'DateFilterType',
  Boolean: 'BooleanFilterType',
  Float: 'FloatFilterType',
  ID: 'IDFilterType',
};

const generateStringInputs = (properties, relations) => {
  let propertiesString = '';
  let createInputString = '';
  let updateInputString = '';
  let filterInputString = '';
  let orderInputString = '';
  let primary = '';

  Object.keys(properties).forEach((propertyName) => {
    const property = properties[propertyName];
    let { type } = property;

    if (property.directives.primary) {
      primary = `  ${propertyName}: ID!`;
    }

    /**
     * createInputString, updateInputString, filterInputString,orderInputString
    * */
    if (property.kind === 'primitive') {
      type = gqlDataTypes[property.type];

      createInputString += `  ${propertyName}: ${type} \n`;
      updateInputString += `  ${propertyName}: ${type} \n`;
      filterInputString += `  ${propertyName}: ${gqlFilterTypes[type]} \n`;
      if (type !== 'Boolean') {
        orderInputString += `  ${propertyName}: OrderByEnum \n`;
      }
    } else { // property kind is relational data
      const relationType = property.directives.relation.args.type;

      if (relationType === 'hasOne' || relationType === 'belongsTo') {
        // Nested Create Mutation - create new node and connect it to a new node of related type
        createInputString += `  ${propertyName}: Create${inflection.singularize(type)}Input \n`;
        updateInputString += `  ${propertyName}: Create${inflection.singularize(type)}Input \n`;
        // Nested Connect Mutation - create new node and connect to an existing relation node
        createInputString += `  ${firstToLower(inflection.singularize(type))}_id: ${firstToUpper(inflection.singularize(type))}Primary \n`;
        updateInputString += `  ${firstToLower(inflection.singularize(type))}_id: ${firstToUpper(inflection.singularize(type))}Primary \n`;
        filterInputString += `  ${propertyName}: ${firstToUpper(inflection.singularize(type))}FilterInput \n`;
      } else { // hasMany || belongsToMany
        // Nested Create Mutation - create new node and connect it to a new node of related type
        createInputString += `  ${propertyName}: [Create${inflection.singularize(type)}Input] \n`;
        updateInputString += `  ${propertyName}: [Create${inflection.singularize(type)}Input] \n`;
        // Nested Connect Mutation - create new node and connect to an existing relation node
        createInputString += `  ${firstToLower(inflection.singularize(type))}_ids: [${firstToUpper(inflection.singularize(type))}Primary] \n`;
        updateInputString += `  ${firstToLower(inflection.singularize(type))}_ids: [${firstToUpper(inflection.singularize(type))}Primary] \n`;
        // Nested Query
        filterInputString += `  ${propertyName}: ${firstToUpper(inflection.singularize(type))}FilterInput \n`;
      }
    }

    /* propertiesString */
    propertiesString += `  ${propertyName}: ${type} \n`;
  });

  return {
    propertiesString,
    createInputString,
    updateInputString,
    filterInputString,
    orderInputString,
    primary,
  };
};

const createSchema = (name, properties, relations) => {
  const upperSingular = firstToUpper(inflection.singularize(name));
  // const upperPlural = firstToUpper(inflection.pluralize(name));
  const lowerPlural = firstToLower(inflection.pluralize(name));
  const lowerSingular = firstToLower(inflection.singularize(name));

  const {
    propertiesString,
    createInputString,
    updateInputString,
    filterInputString,
    orderInputString,
    primary,
  } = generateStringInputs(properties, relations);

  const model = `
module.exports = \`
type ${upperSingular} {
${propertiesString}}

type Query {
  ${lowerPlural}(
      where: ${upperSingular}FilterInput
      orderBy: ${upperSingular}OrderInput
      skip: Int,
      after: String
      first: Int
      last: Int
    ): [${upperSingular}]!

  ${lowerSingular}(where: ${upperSingular}Primary!): ${upperSingular}
}

type Mutation {
  create${upperSingular}(data: Create${upperSingular}Input!): ${upperSingular}!
  update${upperSingular}(data: Update${upperSingular}Input!, where: ${upperSingular}Primary!): ${upperSingular} 
  delete${upperSingular}(where: ${upperSingular}Primary!): ${upperSingular} 
}

# Input for create mutation
input Create${upperSingular}Input{
${updateInputString}}

# Input for update mutation
input Update${upperSingular}Input{
${createInputString}}

# Filter input
input ${upperSingular}FilterInput {
  AND: [${upperSingular}FilterInput!]
  OR: [${upperSingular}FilterInput!]
  NOT: [${upperSingular}FilterInput!]
${filterInputString}}

# OrderInput
input ${upperSingular}OrderInput {
${orderInputString}}

input ${upperSingular}Primary {
${primary}
}
\`;`;
  return model;
};

module.exports = createSchema;
