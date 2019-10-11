const firstToUpper = (str) => str.replace(/^./, (f) => f.toUpperCase());
const firstToLower = (str) => str.replace(/^./, (f) => f.toLowerCase());

module.exports = { firstToLower, firstToUpper };
