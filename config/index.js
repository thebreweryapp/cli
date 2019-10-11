const os = require('os');

const pckg = require('../package.json');

const breweryDir = `${os.homedir()}/.brewery`;
const userConfigDir = `${breweryDir}/config`;

const config = {
  BREWERY_DIR: breweryDir,
  BREWERY_USER_CONFIG_DIR: userConfigDir,
  BREWERY_CONFIG_PROFILES: ['gitlab', 'aws'],
  BREWERY_CORE_PACKAGE: '@amberjs/core',
  VERSION: pckg.version,
  GITLAB_HOST: 'gitlab.stratpoint.dev',
  GITLAB_API_VERSION: 'v4',
  PROJECT_TYPES: [
    {
      type: 'Malt.js (React.js)',
      templates: [
        { name: 'react-boilerplate', projectId: 266, branch: 'master' },
      ],
    },
    {
      type: 'Amber.js (Node.js)',
      templates: [
        { name: 'Express.js', projectId: 273, branch: 'express' },
        { name: 'Serverless', projectId: 273, branch: 'serverless' },
      ],
    },
  ],
  SWAGGER_PATH: 'src/interfaces/http/swagger/swagger.json',
  DEFAULT_CONNECTORS: {
    sql: {
      connector: ['@amberjs/sql-connector'],
    },
  },
  DB_DRIVERS: {
    mysql: ['mysql2'],
    postgres: ['pg', 'pg-hstore'],
    mariadb: ['mariadb'],
    sqlite: ['sqlite3'],
    mssql: ['tedious'],
  },
  // free lambda deployer
  LAMBDA_AWS_ACCESS_KEY_ID: 'AKIAXWLFMHU5WN455KV4',
  LAMBDA_AWS_SECRET_ACCESS_KEY: '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',
};

module.exports = config;
