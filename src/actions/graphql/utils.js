const inflection = require('inflection');
const fs = require('fs');
const { firstToLower, firstToUpper } = require('../../utils/string-manipulation');
const createModelTemplate = require('./templates/modelTemplate');
const createSchemaTemplate = require('./templates/schemaTemplate');
const createResolverTemplate = require('./templates/resolverTemplate');


const relationTypes = ['hasOne', 'hasMany', 'belongsTo', 'belongsToMany'];

const datatypes = {
  string: 'DataTypes.STRING',
  integer: 'DataTypes.INTEGER',
  DateTime: 'DataTypes.DATE',
  boolean: 'DataTypes.BOOLEAN',
  number: 'DataTypes.FLOAT',
  id: 'DataTypes.INTEGER',
};

const convertToStringModel = (models) => {
  const modelsString = {};

  Object.keys(models).forEach((modelName) => {
    const model = models[modelName];
    modelsString[modelName] = createModelTemplate(modelName, model.columnsString, model.relations);
  });

  return modelsString;
};

const generateSchema = (models) => {
  const typeDefs = {};
  Object.keys(models).forEach((modelName) => {
    const model = models[modelName];
    if (model.type === 'model') {
      typeDefs[modelName] = createSchemaTemplate(
        modelName,
        model.properties,
        model.relations,
        model.columns,
      );
    }
  });
  return typeDefs;
};

const generateResolvers = (models) => {
  const resolvers = {};
  Object.keys(models).forEach((modelName) => {
    const model = models[modelName];
    if (model.type === 'model') {
      resolvers[modelName] = createResolverTemplate(
        modelName,
        model.properties,
        model.relations,
        model.columns,
      );
    }
  });
  return resolvers;
};

const columnsToString = (columns) => {
  let colString = '';

  Object.keys(columns).forEach((columnName) => {
    const column = columns[columnName];
    colString += `${columnName} : {\n`;

    Object.keys(column).forEach((attributeName) => {
      const attribute = column[attributeName];
      colString += `      ${attributeName}: ${attribute},\n`;
    });

    colString += '    },';
  });

  return colString;
};

function deleteFolderRecursive(path) {
  if (fs.existsSync(path)) {
    fs.readdirSync(path).forEach((file) => {
      const curPath = `${path}/${file}`;
      if (fs.lstatSync(curPath).isDirectory()) { // recurse
        deleteFolderRecursive(curPath);
      } else { // delete file
        fs.unlinkSync(curPath);
      }
    });
    fs.rmdirSync(path);
  }
}

const getModelData = (typeDefs) => {
  const models = {};
  // Loop through types
  Object.keys(typeDefs).forEach((key) => {
    const typeDef = typeDefs[key];
    const properties = 'properties' in typeDef ? typeDef.properties : {};

    const relations = {};
    const columns = {};

    // Loop through properties
    Object.keys(properties).forEach((propertyKey) => {
      const property = properties[propertyKey];

      let columnName = propertyKey;
      const column = {};

      const { directives } = property;

      // check if relation
      if (directives.relation) {
        const dirRelation = directives.relation;
        const sourceType = property.type === 'array' ? property.items.type.type : property.type;
        // check relation type and create foreignKey
        // if(!dirRelation.args.as)
        // throw new Error(
        //   `Alias cannot be null on relation of type "${key}" property "${propertyKey}"`
        // );
        if (!dirRelation.args.type) {
          throw new Error(
            `type cannot be null on relation of type "${key}" property "${propertyKey}"`,
          );
        }

        if (!(relationTypes.indexOf(dirRelation.args.type) > -1)) {
          throw new Error(
            `Invalid relation "${dirRelation.args.type}" on relation of type "${key}" property "${propertyKey}"`,
          );
        }

        const relation = {
          type: dirRelation.args.type,
        };

        // set graphql property name as relation alias
        if (relation.type === 'belongsTo') {
          columnName = `${firstToLower(inflection.singularize(sourceType))}_id`;
          column.type = 'DataTypes.INTEGER';
          columns[columnName] = column;
          relation.as = firstToUpper(inflection.singularize(propertyKey));
          relation.foreignKey = `${firstToLower(inflection.singularize(sourceType))}_id`;
        } else if (relation.type === 'hasOne') {
          relation.as = firstToUpper(inflection.singularize(propertyKey));
        } else if (relation.type === 'hasMany' || relation.type === 'hasOne') {
          relation.foreignKey = `${firstToLower(inflection.singularize(key))}_id`;
          relation.as = firstToUpper(inflection.pluralize(propertyKey));
        } else if (relation.type === 'belongsToMany') {
          let assocModel = null;
          const assocModelKey = `${firstToUpper(inflection.singularize(key))}${firstToUpper(inflection.singularize(sourceType))}`;
          const reverseAssocModelKey = `${firstToUpper(inflection.singularize(sourceType))}${firstToUpper(inflection.singularize(key))}`;

          if (models[assocModelKey]) {
            assocModel = assocModelKey;
          } else if (models[reverseAssocModelKey]) {
            assocModel = reverseAssocModelKey;
          } else {
            // create associative model
            assocModel = assocModelKey;

            const assocModelColumns = {
              id: {
                type: 'DataTypes.INTEGER',
                primaryKey: true,
                autoIncrement: true,
                allowNull: false,
              },
            };

            assocModelColumns[`${firstToLower(inflection.singularize(key))}_id`] = {
              type: 'DataTypes.INTEGER',
              allowNull: false,
            };
            assocModelColumns[`${firstToLower(inflection.singularize(sourceType))}_id`] = {
              type: 'DataTypes.INTEGER',
              allowNull: false,
            };

            models[assocModel] = {
              type: 'associative',
              relations: {},
              properties: {},
              columns: assocModelColumns,
              columnsString: columnsToString(assocModelColumns),
            };
          }

          // set relation
          relation.as = firstToUpper(inflection.pluralize(propertyKey));
          relation.through = firstToLower(inflection.pluralize(assocModel));
          relation.foreignKey = `${firstToLower(inflection.singularize(key))}_id`;
        }
        relations[sourceType] = relation;
      } else {
        // check for graphql scalar to sequelize datatype
        if (datatypes[property.type]) {
          column.type = datatypes[property.type];
        } else {
          throw new Error(`invalid data type ${property.type} on property ${propertyKey}`);
        }

        // check if required
        if (property.required) {
          column.allowNull = false;
        }

        // check for directives
        Object.keys(directives).forEach((directiveKey) => {
          const directive = directives[directiveKey];

          switch (directiveKey) {
            case 'unique':
              column.unique = true;
              break;
            case 'primary':
              column.primaryKey = true;
              column.autoIncrement = true;
              break;
            case 'defaultValue':
              if (directive.defaultValue.args.value) {
                column.defaultValue = directive.defaultValue.args.value;
              } else {
                throw new Error(`Directive "defaultValue" on type ${key} property ${propertyKey} requires argument "value"`);
              }
              break;
            default:
              throw new Error(`invalid directive ${directiveKey} on type ${key} property ${propertyKey}`);
          }
        });
        columns[columnName] = column;
      }
    });

    models[firstToUpper(inflection.singularize(key))] = {
      type: 'model',
      columns,
      columnsString: columnsToString(columns),
      relations,
      properties,
    };
  });

  return models;
};

module.exports = {
  getModelData, convertToStringModel, generateSchema, generateResolvers, deleteFolderRecursive,
};
