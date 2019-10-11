const { firstToUpper } = require('../../../utils/string-manipulation');

const createRepository = (model) => {
  const upperSingular = firstToUpper(model.singular);

  const repository = `const BaseRepository = require('./BaseRepository');
const ${upperSingular} = require('src/domain/${upperSingular}');

class ${upperSingular}Repository extends BaseRepository {
  constructor({ ${upperSingular}Model, dataloader, database }) {

    super(${upperSingular}Model, dataloader, database, ${upperSingular});
  }

}

module.exports = ${upperSingular}Repository;
`;

  return repository;
};

module.exports = createRepository;
