/* eslint-disable no-param-reassign */

const { spawn } = require('child_process');

const dbExclude = [
  'init',
  'init:config',
  'init:migrations',
  'init:models',
  'init:seeders',
  'migration:generate',
  'model:generate',
  'seed:generate',
];

const db = async (config, command, args) => {
  command.name = dbExclude.indexOf(command.name.substring(3)) === -1
    ? command.name
    : command.name.substring(3);
  args[0] = command.name;

  const ls = spawn(`${process.env.PWD}/node_modules/.bin/sequelize`, args);

  ls.stdout.on('data', (data) => {
    console.log(`${data}`);
  });

  ls.stderr.on('data', (data) => {
    console.log(`${data}`);
  });
};

module.exports = db;
