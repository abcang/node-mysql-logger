const mysqlLogger = require('../index.js');

module.exports = (filename) => {
  return async (ctx, next) => {
    await next();
    mysqlLogger.writeFile(filename, ctx);
  };
};
