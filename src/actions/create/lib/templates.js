const inflection = require('inflection');
const { firstToUpper, firstToLower } = require('../../../utils');
const { BREWERY_CORE_PACKAGE } = require('../../../../config');

module.exports.appServiceTemplate = (serviceName) => `const { Operation } = require('${BREWERY_CORE_PACKAGE}');

class ${firstToUpper(serviceName)} extends Operation {
  constructor({ }) {
    super();
  }

  async execute(data) {
    /**
     * Implement service/usecase logic here. eg:
     * 
     * const { SUCCESS, ERROR, VALIDATION_ERROR, NOT_FOUND } = this.events;
     * 
     * const user = new User(data);
     *
     *  try {
     *     const newUser = await this.UserRepository.add(user);
     *
     *     this.emit(SUCCESS, newUser);
     *   } catch(error) {
     *     if(error.message === 'ValidationError') {
     *       return this.emit(VALIDATION_ERROR, error);
     *     }
     *     this.emit(ERROR, error);
     *   }
     */
  }
}

${firstToUpper(serviceName)}.setEvents(['SUCCESS', 'ERROR', 'VALIDATION_ERROR', 'NOT_FOUND']);

module.exports = ${firstToUpper(serviceName)};
`;


/**
 *
 */
module.exports.datasourceTemplate = (name, connector, config) => {
  const confStr = Object.keys(config).reduce((acc, val) => {
    // eslint-disable-next-line no-param-reassign
    acc += `    ${val}: '${config[val]}',\n`;
    return acc;
  }, '');

  return `
module.exports = {
  name: '${name}',
  connector : '${connector}',
  config: {
${confStr}
  }
};
`;
};


module.exports.domainTemplate = (name) => `const { attributes } = require('structure');

const ${name} = attributes({
  // Add atttributes here
  // id: Number,
  // name: String,
  // createdAt: Date,
  // updatedAt: Date,
})(class ${name} {
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

module.exports = ${name};
`;


module.exports.repositoryTemplate = (name, baseCrud) => {
  const require = baseCrud ? `const { BaseRepository } = require('${BREWERY_CORE_PACKAGE}');` : '';
  const doesExtend = baseCrud ? 'extends BaseRepository' : '';

  return `
${require}

class ${name}Repository ${doesExtend} {
  constructor({ ${name}Model }) {
    super(${name}Model);
  }
}

module.exports = ${name}Repository;

`;
};

module.exports.modelTemplate = (name, primaryKeyName, primaryKeyType, datasource, attributes) => `
module.exports = {
  name: '${firstToUpper(inflection.singularize(name))}Model',
  datasource: '${datasource}',
  definition: function(datasource, DataTypes) {
    const ${firstToUpper(inflection.singularize(name))}Model = datasource.define('${firstToUpper(inflection.singularize(name))}Model', {
      ${primaryKeyName} : {
        primaryKey: true,
        autoIncrement: true,
        type: DataTypes.${primaryKeyType},
      }, 
      ${attributes}
    }, {
      tableName: '${firstToLower(inflection.pluralize(name))}',
      timestamps: true
    });

    /**
     * Examples on how to associate or set relationship with other models
     * 
     *  UserModel.associate = function () {
     *   UserModel.belongsTo(datasource.models.GroupModel, {
     *     foreignKey: 'groupId',
     *     as: 'group',
     *   });
     *  };
     * 
     * refer to sequelize documentation https://sequelize.org/master/manual/associations.html
     */

    return ${firstToUpper(inflection.singularize(name))}Model;
  }
};
  `;

module.exports.controllerTemplate = (name, extendBase) => {
  let baseControllerImport = '';
  let baseControllerExtend = '';

  if (extendBase) {
    baseControllerImport = 'const { BaseController } = require(\'@amberjs/core\');';
    baseControllerExtend = 'extends BaseController';
  }

  return `
const { Router } = require('express');
${baseControllerImport}

class ${firstToUpper(inflection.pluralize(name))}Controller ${baseControllerExtend} {
  
  constructor() {
    super();
    const router = Router();
    // router.get('/', this.injector('List${firstToUpper(inflection.pluralize(name))}'), this.index);
    // router.post('/', this.injector('Create${firstToUpper(inflection.singularize(name))}'), this.create);
    // router.get('/:id', this.injector('Show${firstToUpper(inflection.singularize(name))}'), this.show);
    // router.put('/:id', this.injector('Update${firstToUpper(inflection.singularize(name))}'), this.update);
    // router.delete('/:id', this.injector('Delete${firstToUpper(inflection.singularize(name))}'), this.delete);

    return router;
  }

  /**
   * CRUD sample implementation
   * You may delete the commented code below if you have extended BaseController class
   * The following methods are already inherited upon extending BaseController class from @amberjs/core
   */

  // index(req, res, next) {
  //   const { operation } = req;
  //   const { SUCCESS, ERROR } = operation.events;

  //   operation
  //     .on(SUCCESS, (result) => {
  //       res
  //         .status(Status.OK)
  //         .json(result);
  //     })
  //     .on(ERROR, next);

  //   operation.execute();
  // }

  // show(req, res, next) {
  //   const { operation } = req;

  //   const { SUCCESS, ERROR, NOT_FOUND } = operation.events;

  //   operation
  //     .on(SUCCESS, (result) => {
  //       res
  //         .status(Status.OK)
  //         .json(result);
  //     })
  //     .on(NOT_FOUND, (error) => {
  //       res.status(Status.NOT_FOUND).json({
  //         type: 'NotFoundError',
  //         details: error.details
  //       });
  //     })
  //     .on(ERROR, next);

  //   operation.execute(Number(req.params.id));
  // }

  // create(req, res, next) {
  //   const { operation } = req;
  //   const { SUCCESS, ERROR, VALIDATION_ERROR } = operation.events;

  //   operation
  //     .on(SUCCESS, (result) => {
  //       res
  //         .status(Status.CREATED)
  //         .json(result);
  //     })
  //     .on(VALIDATION_ERROR, (error) => {
  //       res.status(Status.BAD_REQUEST).json({
  //         type: 'ValidationError',
  //         details: error.details
  //       });
  //     })
  //     .on(ERROR, next);

  //   operation.execute(req.body);
  // }

  // update(req, res, next) {
  //   const { operation } = req;
  //   const { SUCCESS, ERROR, VALIDATION_ERROR, NOT_FOUND } = operation.events;

  //   operation
  //     .on(SUCCESS, (result) => {
  //       res
  //         .status(Status.ACCEPTED)
  //         .json(result);
  //     })
  //     .on(VALIDATION_ERROR, (error) => {
  //       res.status(Status.BAD_REQUEST).json({
  //         type: 'ValidationError',
  //         details: error.details
  //       });
  //     })
  //     .on(NOT_FOUND, (error) => {
  //       res.status(Status.NOT_FOUND).json({
  //         type: 'NotFoundError',
  //         details: error.details
  //       });
  //     })
  //     .on(ERROR, next);

  //   operation.execute(Number(req.params.id), req.body);
  // }

  // delete(req, res, next) {
  //   const { operation } = req;
  //   const { SUCCESS, ERROR,  NOT_FOUND } = operation.events;

  //   operation
  //     .on(SUCCESS, () => {
  //       res.status(Status.ACCEPTED).end();
  //     })
  //     .on(NOT_FOUND, (error) => {
  //       res.status(Status.NOT_FOUND).json({
  //         type: 'NotFoundError',
  //         details: error.details
  //       });
  //     })
  //     .on(ERROR, next);

  //   operation.execute(Number(req.params.id));
  // }
}

module.exports = ${firstToUpper(inflection.pluralize(name))}Controller;
`;
};
