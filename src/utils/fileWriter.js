const fs = require('fs');
const util = require('util');

const writeFile = util.promisify(fs.writeFile);
const inquirer = require('inquirer');


module.exports = async (fileName, destination, content, force = false) => {
  const question = [
    {
      type: 'confirm',
      name: 'confirm',
      message: `${destination}/${fileName} already exists, overwrite existing file?`,
    },
  ];

  if (fs.existsSync(`${destination}/${fileName}`) && !force) {
    const proceed = await inquirer.prompt(question);
    if (!proceed.confirm) {
      process.exit();
    }
  }

  if (!fs.existsSync(destination)) {
    fs.mkdirSync(destination);
    fs.chmodSync(destination, '0775');
  }

  return writeFile(`${destination}/${fileName}`, content);
};
