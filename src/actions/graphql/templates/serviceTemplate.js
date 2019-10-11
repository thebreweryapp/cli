const inflection = require('inflection');

const firstToUpper = (str) => str.replace(/^./, (f) => f.toUpperCase());

class CreateService {
  constructor(service) {
    this.upperSingular = firstToUpper(inflection.singularize(service));
    this.upperPlural = firstToUpper(inflection.pluralize(service));
    this.lowerPlural = inflection.pluralize(service);
    this.lowerSingular = inflection.singularize(service);
  }

  list() {
    return `
class List${this.upperPlural} {
  constructor({ ${this.lowerSingular}Repository }) {
    this.${this.lowerSingular}Repository = ${this.lowerSingular}Repository;
  }

  async execute(args) {
      return await this.${this.lowerSingular}Repository.getAll(args);
  }
}
module.exports = List${this.upperPlural};
    `;
  }

  show() {
    return `
class Show${this.upperSingular} {
  constructor({ ${this.lowerSingular}Repository }) {
    this.${this.lowerSingular}Repository = ${this.lowerSingular}Repository;
  }

  async execute({ where }) {
      return await this.${this.lowerSingular}Repository.getById(Object.values(where)[0]);
  }
}

module.exports = Show${this.upperSingular};
    `;
  }

  create() {
    return `
const ${this.upperSingular} = require('src/domain/${this.upperSingular}');

class Create${this.upperSingular} {
  constructor({ ${this.lowerSingular}Repository }) {
    this.${this.lowerSingular}Repository = ${this.lowerSingular}Repository;
  }

  async execute(data) {
    const ${this.lowerSingular} = new ${this.upperSingular}(data);
    return await this.${this.lowerSingular}Repository.add(${this.lowerSingular});
  }
}

module.exports = Create${this.upperSingular};
    `;
  }

  update() {
    return `
class Update${this.upperSingular} {
  constructor({ ${this.lowerSingular}Repository }) {
    this.${this.lowerSingular}Repository = ${this.lowerSingular}Repository;
  }

  async execute(id, data) {
      return await this.${this.lowerSingular}Repository.update(id, data);
  }
}

module.exports = Update${this.upperSingular}; 
    `;
  }

  delete() {
    return `
class Delete${this.upperSingular} {
  constructor({ ${this.lowerSingular}Repository }) {
    this.${this.lowerSingular}Repository = ${this.lowerSingular}Repository;
  }

  async execute(id) {
      return await this.${this.lowerSingular}Repository.remove(id);
  }
}

module.exports = Delete${this.upperSingular};
    `;
  }
}

module.exports = CreateService;
