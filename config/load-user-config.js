const os = require('os');
const fs = require('fs');
const dotenv = require('dotenv');

module.exports = () => {
  const homeDir = os.homedir();
  const breweryDir = `${homeDir}/.brewery`;
  const breweryConfigDir = `${breweryDir}/config`;

  if (fs.existsSync(breweryConfigDir)) {
    const configs = fs.readdirSync(breweryConfigDir);

    configs.forEach((config) => {
      dotenv.config({ path: `${breweryConfigDir}/${config}` });
    });
  }
};
