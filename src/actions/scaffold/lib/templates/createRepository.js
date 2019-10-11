const { firstToUpper } = require('../../../../utils');

const createRepository = (model) => {
  const upperSingular = firstToUpper(model.singular);

  const repository = `const BaseRepository = require('./BaseRepository');
const ${upperSingular} = require('src/domain/${upperSingular}');

class ${upperSingular}Repository extends BaseRepository {
  constructor({ ${upperSingular}Model }) {

    super(${upperSingular}Model, ${upperSingular});
  }

}

module.exports = ${upperSingular}Repository;
`;

  return repository;
};

module.exports = createRepository;
