const logo = require('./logo');

const helpCallback = ((txt) => `
${logo}


${txt}
`);

module.exports = helpCallback;
