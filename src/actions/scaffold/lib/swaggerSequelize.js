/* eslint-disable no-param-reassign */

/**
 * @namespace
 * @property {object} Sequelize
 * @property {function} Sequelize.BLOB
 * @property {function} Sequelize.ENUM
 * @property {function} Sequelize.STRING
 * @property {function} Sequelize.STRING.BINARY
 * @property {function} Sequelize.DATE
 * @property {function} Sequelize.ARRAY
 * @property {function} Sequelize.BOOLEAN
 * @property {function} Sequelize.DOUBLE
 * @property {function} Sequelize.FLOAT
 * @property {function} Sequelize.INTEGER
 * @property {function} Sequelize.BIGINT
 */
// const Sequelize = require('sequelize');

let dialect = 'mysql';
/**
 * @param {string} newDialect
 * @returns {*}
 */
const setDialect = (newDialect) => {
  if (['mysql', 'mariadb', 'sqlite', 'postgres', 'mssql'].indexOf(newDialect) === -1) {
    throw new Error('Unknown sequalize dialect');
  }
  dialect = newDialect;
};

/**
 *
 * @param {Object|string} swaggerPropertySchema
 * @param {Object} swaggerPropertySchema.properties
 * @param {Object} swaggerPropertySchema.$ref
 * @param {Array} swaggerPropertySchema.enum
 * @param {string} swaggerPropertySchema.type
 * @param {string} swaggerPropertySchema.format
 * @param {Object|string} swaggerPropertySchema.items
 * @returns {*}
 */
const getSequalizeType = (swaggerPropertySchema) => {
  if (typeof swaggerPropertySchema === 'string') {
    swaggerPropertySchema = {
      type: swaggerPropertySchema,
    };
  }

  if (swaggerPropertySchema.properties) {
    console.log('Warning: encountered', JSON.stringify(swaggerPropertySchema.properties));
    console.log('Cannot handle complex subschemas (yet?), falling back to blob');
    return 'DataTypes.BLOB';
  }

  if (swaggerPropertySchema.$ref) {
    console.log('Warning: encountered', JSON.stringify(swaggerPropertySchema.$ref));
    console.log('Cannot handle $ref (yet?), falling back to blob');
    return 'DataTypes.BLOB';
  }

  if (swaggerPropertySchema.enum) {
    return `DataTypes.ENUM.apply(null, ${swaggerPropertySchema.enum})`;
  }

  // as seen http://swagger.io/specification/#dataTypeType
  switch (swaggerPropertySchema.type) {
    case 'string':
      switch (swaggerPropertySchema.format || '') {
        case 'byte':
        case 'binary':
          if (swaggerPropertySchema.maxLength > 5592415) {
            return 'DataTypes.BLOB("long")';
          }

          if (swaggerPropertySchema.maxLength > 21845) {
            return 'DataTypes.BLOB("medium")';
          }

          // NOTE: VARCHAR(255) may container 255 multibyte chars: it's _NOT_ byte delimited
          if (swaggerPropertySchema.maxLength > 255) {
            return 'DataTypes.BLOB()';
          }
          return 'DataTypes.STRING.BINARY';

        case 'date':
          return 'DataTypes.DATEONLY';

        case 'date-time':
          // return Sequelize.DATETIME; //not working?
          return 'DataTypes.DATE';

        default:
          if (swaggerPropertySchema.maxLength) {
            // http://stackoverflow.com/questions/13932750/tinytext-text-mediumtext-and-longtext-maximum-sto
            // http://stackoverflow.com/questions/7755629/varchar255-vs-tinytext-tinyblob-and-varchar65535-v
            // NOTE: text may be in multibyte format!
            if (swaggerPropertySchema.maxLength > 5592415) {
              return 'DataTypes.TEXT("long")';
            }

            if (swaggerPropertySchema.maxLength > 21845) {
              return 'DataTypes.TEXT("medium")';
            }

            // NOTE: VARCHAR(255) may container 255 multibyte chars: it's _NOT_ byte delimited
            if (swaggerPropertySchema.maxLength > 255) {
              return 'DataTypes.TEXT()';
            }
          }

          return 'DataTypes.STRING'; // === VARCHAR
      }

    case 'array':
      if (dialect === 'postgres') {
        return `DataTypes.ARRAY(${getSequalizeType(swaggerPropertySchema.items)})`;
      }
      console.log('Warning: encountered', JSON.stringify(swaggerPropertySchema));
      console.log(
        'Can only handle array for postgres (yet?)',
        'see http://docs.sequelizejs.com/en/latest/api/datatypes/#array',
        'falling back to blob',
      );
      return 'DataTypes.BLOB';

    case 'boolean':
      return 'DataTypes.BOOLEAN';

    case 'integer':
      switch (swaggerPropertySchema.format || '') {
        case 'int32':
          if (typeof swaggerPropertySchema.minimum === 'number' && swaggerPropertySchema.minimum >= 0) {
            return 'DataTypes.INTEGER.UNSIGNED';
          }
          return 'DataTypes.INTEGER';

        default:
          if (typeof swaggerPropertySchema.minimum === 'number' && swaggerPropertySchema.minimum >= 0) {
            return 'DataTypes.BIGINT.UNSIGNED';
          }
          return 'DataTypes.BIGINT';
      }

    case 'number':
      switch (swaggerPropertySchema.format || '') {
        case 'float':
          return 'DataTypes.FLOAT';

        default:
          return 'DataTypes.DOUBLE';
      }

    default:
      console.log('Warning: encountered', JSON.stringify(swaggerPropertySchema));
      console.log('Unknown data type, falling back to blob');
      return 'DataTypes.BLOB';
  }
};

const generate = (schema) => {
  // poor mans deep-clone
  const result = JSON.parse(JSON.stringify(schema.properties));
  let attributes = '';

  Object.keys(result).forEach((propertyName) => {
    const propertySchema = result[propertyName];

    attributes += `${propertyName} : {\n`;
    // BEGIN: Promote Attribute to primaryKey with autoIncrement
    if (propertySchema['x-primary-key'] === true) {
      propertySchema.primaryKey = true;
      propertySchema.autoIncrement = true;

      attributes += '      primaryKey: true,\n';
      attributes += '      autoIncrement: true,\n';
    }
    // END: Promote Attribute to primaryKey with autoIncrement

    propertySchema.type = getSequalizeType(propertySchema);
    attributes += `      type: ${propertySchema.type},\n`;
    if (propertySchema.default) {
      propertySchema.defaultValue = propertySchema.default;
      attributes += `      defaultValue: ${propertySchema.default}\n`;
    }

    attributes += '    },';
  });

  return attributes;
};

module.exports = {
  setDialect,
  generate,
};
