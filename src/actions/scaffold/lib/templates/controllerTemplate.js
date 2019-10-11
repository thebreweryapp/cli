const firstToUpper = (str) => str.replace(/^./, (f) => f.toUpperCase());

const createController = (name) => {
  const upperSingular = firstToUpper(name.singular);
  const upperPlural = firstToUpper(name.plural);
  // const lowerPlural = name.plural;
  // const lowerSingular = name.singular;
  // const modelName = `${upperSingular}Model`;

  const controller = `const { Router } = require('express');
const BaseController = require('./BaseController');

class ${upperPlural}Controller extends BaseController {
  
  constructor() {
    super();
    const router = Router();
    
    /*
    router.get('/', this.injector('getAll${upperPlural}'), this.index);
    router.get('/:id', this.injector('get${upperSingular}'), this.show);
    router.post('/', this.injector('create${upperSingular}'), this.create);
    router.put('/:id', this.injector('update${upperSingular}'), this.update);
    router.delete('/:id', this.injector('delete${upperSingular}'), this.delete);
    */
   
    return router;
  }

}

module.exports = ${upperPlural}Controller;

`;

  return controller;
};

module.exports = createController;
