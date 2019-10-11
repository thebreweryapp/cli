const inflection = require('inflection');

const firstToUpper = (str) => str.replace(/^./, (f) => f.toUpperCase());

class CreateService {
  constructor(service, operationId) {
    this.upperSingular = firstToUpper(inflection.singularize(service));
    this.upperPlural = firstToUpper(inflection.pluralize(service));
    this.lowerPlural = inflection.pluralize(service);
    this.lowerSingular = inflection.singularize(service);
    this.operationId = firstToUpper(operationId);
  }

  list() {
    return `
const Operation = require('src/app/Operation');

class ${this.operationId} extends Operation {
  constructor({ ${this.lowerSingular}Repository }) {
    super();
    this.${this.lowerSingular}Repository = ${this.lowerSingular}Repository;
  }

  async execute() {
    const { SUCCESS, ERROR } = this.outputs;

    try {
      const ${this.lowerPlural} = await this.${this.lowerSingular}Repository.getAll({});

      this.emit(SUCCESS, ${this.lowerPlural});
    } catch(error) {
      this.emit(ERROR, error);
    }
  }
}

${this.operationId}.setOutputs(['SUCCESS', 'ERROR', 'VALIDATION_ERROR', 'NOT_FOUND']);

module.exports = ${this.operationId};
    `;
  }

  show() {
    return `
const Operation = require('src/app/Operation');

class ${this.operationId} extends Operation {
  constructor({ ${this.lowerSingular}Repository }) {
    super();
    this.${this.lowerSingular}Repository = ${this.lowerSingular}Repository;
  }

  async execute(id) {
    const { SUCCESS, NOT_FOUND } = this.outputs;

    try {
      const ${this.lowerSingular} = await this.${this.lowerSingular}Repository.getById(id);
      this.emit(SUCCESS, ${this.lowerSingular});
    } catch(error) {
      this.emit(NOT_FOUND, {
        type: error.message,
        details: error.details
      });
    }
  }
}

${this.operationId}.setOutputs(['SUCCESS', 'ERROR', 'VALIDATION_ERROR', 'NOT_FOUND']);

module.exports = ${this.operationId};
    `;
  }

  create() {
    return `
const Operation = require('src/app/Operation');
const ${this.upperSingular} = require('src/domain/${this.upperSingular}');

class ${this.operationId} extends Operation {
  constructor({ ${this.lowerSingular}Repository }) {
    super();
    this.${this.lowerSingular}Repository = ${this.lowerSingular}Repository;
  }

  async execute(data) {
    const { SUCCESS, ERROR, VALIDATION_ERROR } = this.outputs;

    const ${this.lowerSingular} = new ${this.upperSingular}(data);

    try {
      const new${this.upperSingular} = await this.${this.lowerSingular}Repository.add(${this.lowerSingular});

      this.emit(SUCCESS, new${this.upperSingular});
    } catch(error) {
      if(error.message === 'ValidationError') {
        return this.emit(VALIDATION_ERROR, error);
      }

      this.emit(ERROR, error);
    }
  }
}

${this.operationId}.setOutputs(['SUCCESS', 'ERROR', 'VALIDATION_ERROR', 'NOT_FOUND']);

module.exports = ${this.operationId};
    `;
  }

  update() {
    return `
const Operation = require('src/app/Operation');

class ${this.operationId} extends Operation {
  constructor({ ${this.lowerSingular}Repository }) {
    super();
    this.${this.lowerSingular}Repository = ${this.lowerSingular}Repository;
  }

  async execute(id, data) {
    const {
      SUCCESS, NOT_FOUND, VALIDATION_ERROR, ERROR
    } = this.outputs;

    try {
      const ${this.lowerSingular} = await this.${this.lowerSingular}Repository.update(id, data);
      this.emit(SUCCESS, ${this.lowerSingular});
    } catch(error) {
      switch(error.message) {
      case 'ValidationError':
        return this.emit(VALIDATION_ERROR, error);
      case 'NotFoundError':
        return this.emit(NOT_FOUND, error);
      default:
        this.emit(ERROR, error);
      }
    }
  }
}

${this.operationId}.setOutputs(['SUCCESS', 'NOT_FOUND', 'VALIDATION_ERROR', 'ERROR']);

module.exports = ${this.operationId}; 
    `;
  }

  delete() {
    return `
const Operation = require('src/app/Operation');

class ${this.operationId} extends Operation {
  constructor({ ${this.lowerSingular}Repository }) {
    super();
    this.${this.lowerSingular}Repository = ${this.lowerSingular}Repository;
  }

  async execute(id) {
    const { SUCCESS, ERROR, NOT_FOUND } = this.outputs;

    try {
      await this.${this.lowerSingular}Repository.remove(id);
      this.emit(SUCCESS);
    } catch(error) {
      if(error.message === 'NotFoundError') {
        return this.emit(NOT_FOUND, error);
      }

      this.emit(ERROR, error);
    }
  }
}

${this.operationId}.setOutputs(['SUCCESS', 'ERROR', 'VALIDATION_ERROR', 'NOT_FOUND']);

module.exports = ${this.operationId};
    `;
  }

  default() {
    return `
const Operation = require('src/app/Operation');

class ${this.operationId} extends Operation {
  constructor() {
    super();
  }

  async execute(id) {
    const { SUCCESS, ERROR, NOT_FOUND, VALIDATION_ERROR } = this.outputs;

    try {
      // this.emit(SUCCESS);
    } catch(error) {
      // this.emit(ERROR, error);
    }
  }
}

${this.operationId}.setOutputs(['SUCCESS', 'ERROR', 'VALIDATION_ERROR', 'NOT_FOUND']);

module.exports = ${this.operationId};
    `;
  }
}


module.exports = CreateService;
