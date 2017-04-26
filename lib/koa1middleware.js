const mysqlLogger = require('../index.js');

module.exports = (filename) => {
  return function* (next) {
    yield next;
    mysqlLogger.writeFile(filename, this.request);
  };
};
