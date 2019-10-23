#!/usr/bin/env node
const program = require('commander');
const config = require('../config');

// load user config
require('../config/load-user-config')();

// const scaffoldCallback = require('./actions/scaffold');
// const graphqlDeployCallback = require('./actions/graphql');

// module create commands
const {
  makeDomain: createDomainCallback,
  makeDatasource: createDatasourceCallback,
  makeAppService: createAppServiceCallback,
  makeRepository: createRepositoryCallback,
  makeModel: createModelCallback,
  makeApiResource: createApiResourceCallback,
} = require('./actions/create');

const helpCallback = require('./helpers/help');

/** set version */
program.version(config.VERSION);

/** root options */

/** commands */

/**
 * TODO:  UPDATE GRAPHQL SCAFFOLDING
 */
// program
//   .command('graphql:deploy')
//   .description('deploy resolver server using defined SDL')
//   .action(graphqlDeployCallback);

// program
//   .command('scaffold')
//   .description('scaffold infra, interface and domain based on swagger schema')
//   .action(scaffoldCallback);

program
  .command('create:domain <name>')
  .description('create domain base template')
  .action(createDomainCallback);

program
  .command('create:appservice <name>')
  .description('create app service base template')
  .action(createAppServiceCallback);

program
  .command('create:datasource')
  .description('create datasource wizard')
  .action(createDatasourceCallback);

program
  .command('create:repository')
  .description('create repository command')
  .action(createRepositoryCallback);

program
  .command('create:model')
  .description('create model command')
  .action(createModelCallback);

program
  .command('create:apiresource')
  .description('create apiresource command')
  .action(createApiResourceCallback);

program.parse(process.argv);

/** output help if there are no args */
if (!program.args.length) program.help(helpCallback);
