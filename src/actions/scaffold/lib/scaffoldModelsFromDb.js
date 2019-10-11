const SequelizeAuto = require('sequelize-auto-v2');

const scaffoldModelsFromDb = () => {
  const config = require(`${process.cwd()}/config/index.js`);

  const auto = new SequelizeAuto(
    config.db.database,
    config.db.username,
    config.db.password,
    {
      host: config.db.host,
      dialect: config.db.dialect,
      directory: `${process.env.PWD}/src/infra/database/models`,
      port: '3306',
      camelCase: true,
      skipTables: ['SequelizeMeta'],
      additional: {
        timestamps: true,
      },
    },
  );

  auto.run((err) => {
    if (err) throw err;
  });
};

module.exports = scaffoldModelsFromDb;
