const datasourceQuestions = [
  {
    type: 'input',
    name: 'name',
    message: 'Datasource name:',
  },
  {
    type: 'rawlist',
    name: 'connector',
    message: 'Connector:',
    choices: [
      'sql',
    ],
    default: 'sql',
  },
  {
    type: 'input',
    name: 'host',
    message: 'host:',
    default: '127.0.0.1',
    when(answers) {
      return answers.connector === 'sql';
    },
  },
  {
    type: 'input',
    name: 'username',
    message: 'username:',
    default: 'root',
    when(answers) {
      return answers.connector === 'sql';
    },
  },
  {
    type: 'password',
    name: 'password',
    message: 'password:',
    default: '',
    when(answers) {
      return answers.connector === 'sql';
    },
  },
  {
    type: 'input',
    name: 'database',
    message: 'database:',
    when(answers) {
      return answers.connector === 'sql';
    },
  },
  {
    type: 'rawlist',
    name: 'dialect',
    message: 'dialect:',
    default: 'mysql',
    choices: [
      'mysql', 'postgres', 'mariadb', 'sqlite', 'mssql',
    ],
    when(answers) {
      return answers.connector === 'sql';
    },
  },
  {
    type: 'confirm',
    name: 'isSync',
    message: 'Sync models to database?:',
    default: false,
    when(answers) {
      return answers.connector === 'sql';
    },
  },
  {
    type: 'confirm',
    name: 'installConnector',
    message: 'Install brewery-sql-connector ?:',
    default: true,
    when(answers) {
      return answers.connector === 'sql';
    },
  },
  {
    type: 'confirm',
    name: 'installDbDriver',
    message: 'Install mysql ?:',
    default: true,
    when(answers) {
      return answers.dialect === 'mysql';
    },
  },
  {
    type: 'confirm',
    name: 'installDbDriver',
    message: 'Install postgres ?:',
    default: true,
    when(answers) {
      return answers.dialect === 'postgres';
    },
  },
  {
    type: 'confirm',
    name: 'installDbDriver',
    message: 'Install sqlite ?:',
    default: true,
    when(answers) {
      return answers.dialect === 'sqlite';
    },
  },
  {
    type: 'confirm',
    name: 'installDbDriver',
    message: 'Install mariadb ?:',
    default: true,
    when(answers) {
      return answers.dialect === 'mariadb';
    },
  },
  {
    type: 'confirm',
    name: 'installDbDriver',
    message: 'Install mssql ?:',
    default: true,
    when(answers) {
      return answers.dialect === 'mssql';
    },
  },
];


const repositoryQuestions = [
  {
    type: 'input',
    name: 'name',
    message: 'Repository name:',
  },
  {
    type: 'confirm',
    name: 'baseCrud',
    message: 'Extend BaseRepository(CRUD) class: ',
  },
];

const modelQuestions = (datasources) => [
  {
    type: 'input',
    name: 'name',
    message: 'Model Name:',
  },
  {
    type: 'rawlist',
    name: 'datasource',
    message: 'Datasource:',
    choices: datasources,
    default: datasources[0],
  },
  {
    type: 'input',
    name: 'primaryKeyName',
    message: 'Primary Key Name:',
    default: 'id',
  },
  {
    type: 'rawlist',
    name: 'primaryKeyType',
    message: 'Primary Key DataType:',
    choices: [
      'STRING',
      'UUID',
      'INTEGER',
    ],
    default: 'INTEGER',
  },
];

const modelAttributeQuestions = [
  {
    type: 'input',
    name: 'name',
    message: 'Attribute Name:',
  },
  {
    type: 'rawlist',
    name: 'type',
    message: 'DataType:',
    choices: [
      'STRING',
      'TEXT',
      'CITEXT',
      'INTEGER',
      'BIGINT',
      'FLOAT',
      'REAL',
      'DOUBLE',
      'DECIMAL',
      'DATE',
      'DATEONLY',
      'BOOLEAN',
    ],
  },
  {
    type: 'confirm',
    name: 'done',
    message: 'Add another attribute?:',
  },
];

const apiResourceQuestions = [
  {
    type: 'input',
    name: 'route',
    message: 'Route name:',
    default: '',
  },
  {
    type: 'input',
    name: 'controller',
    message: 'Controller name(Automatically Suffixed with \'Controller\'):',
    default: '',
  },
  {
    type: 'confirm',
    name: 'extendBase',
    message: 'Extend Base Controller(CRUD) class?:',
    default: true,
  },
];


module.exports = {
  datasourceQuestions,
  repositoryQuestions,
  modelQuestions,
  modelAttributeQuestions,
  apiResourceQuestions,
};
