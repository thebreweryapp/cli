const getDomainTemplate = (model) => {
  // capitalize and convert to singular form
  let domain = model.name.charAt(0).toUpperCase() + model.name.slice(1);
  if (domain.slice(-1).toUpperCase() === 'S') {
    domain = domain.slice(0, -1);
  }

  return `const { attributes } = require('structure');

const ${domain} = attributes({
${model.attributes.trimRight()}
})(class ${domain} {
  // Add validation functions below
  // e.g.:
  //
  // isLegal() {
  //   return this.age >= User.MIN_LEGAL_AGE;
  // }
});

// Add constants below
// e.g.:
//
// User.MIN_LEGAL_AGE = 21;

module.exports = ${domain};
`;
};

const getCoercion = (type) => {
  // Currently not supported
  // BLOB
  // ENUM
  // HSTORE
  // ARRAY
  // RANGE
  // GEOMETRY
  // GEOGRAPHY
  // VIRTUAL

  if (type === 'STRING'
    || type === 'CHAR'
    || type === 'TEXT'
    || type.includes('JSON')
    || type.includes('UUID')) {
    return 'String';
  }
  if (type.includes('INT')
    || type === 'FLOAT'
    || type === 'DOUBLE'
    || type === 'DECIMAL'
    || type === 'REAL') {
    return 'Number';
  }
  if (type.includes('DATE')
    || type === 'TIME'
    || type === 'NOW') {
    return 'Date';
  }
  return type.charAt(0).toUpperCase() + type.slice(1);
};

const getFieldTemplate = (field) => {
  if (field.required) {
    return `   ${field.name}: {
     type: ${getCoercion(field.type)},
     required: ${field.required}
   },
`;
  }

  return `  ${field.name}: ${getCoercion(field.type)},
`;
};

const getDomainFromModel = (model) => {
  let fields = '';
  const attrs = model.rawAttributes;
  Object.keys(attrs).forEach((element) => {
    const fieldElement = {
      name: attrs[element].field || element,
      type: attrs[element].type.constructor.key,
      required: attrs[element].allowNull,
    };
    const field = getFieldTemplate(fieldElement);
    fields += field;
  });

  const domain = {
    name: model.name,
    attributes: fields,
  };
  return getDomainTemplate(domain);
};

module.exports = getDomainFromModel;
