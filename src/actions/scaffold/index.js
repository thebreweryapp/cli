const fs = require('fs');

const {
  scaffoldModels,
  scaffoldDomains,
  scaffoldRepositories,
  scaffoldServices,
  scaffoldControllers,
  scaffoldMigrations,
} = require('./lib');

// eslint-disable-next-line no-unused-vars
const scaffold = (config, command, args) => {
  // Get Swagger JSON Data
  const swaggerPath = `${process.env.PWD}/src/interfaces/http/swagger/swagger.json`;
  if (!fs.existsSync(swaggerPath)) {
    throw new Error('Swagger config doesnt exist');
  }

  const swaggerSpec = JSON.parse(fs.readFileSync(swaggerPath, 'utf8'));
  scaffoldModels(swaggerSpec);
  scaffoldDomains();
  scaffoldRepositories();
  scaffoldServices(swaggerSpec);
  scaffoldControllers(swaggerSpec);
  scaffoldMigrations();
};

module.exports = scaffold;
