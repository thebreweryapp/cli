const exec = require('child_process').execSync;

const scaffoldMigrations = () => {
  // create migration out of model and run migration
  console.log('Creating migrations...');
  console.log('Running Migrations...');
  exec('NODE_PATH=. node ./node_modules/sequelize-auto-migrations/bin/makemigration.js -x');
};

module.exports = scaffoldMigrations;
