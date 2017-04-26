const fs = require('fs');
const Pool = require('mysql/lib/Pool');
const Connection = require('mysql/lib/Connection');

function format(log) {
  const { sql, values, stack, time } = log;
  return [
    'SQL',
    `(${time}ms)`,
    sql.replace(/[\r\n]/, ' ').replace(/ +/, ' ').trim(),
    `[${values.join(', ')}]`,
    stack.split('\n').filter((line) => !line.match(/\/node_modules\/|\(native\)/) && line.includes('(')).map((line) => line.match(/\s+at (.+)/)[1]).join(' <- ')
  ].join('\t');
}

class MysqlLogger {
  constructor() {
    this.logs = [];
  }

  push(log) {
    this.logs.push(log);
  }

  clear() {
    this.logs = [];
  }

  writeFile(filename = '/tmp/sql.log', req = null) {
    const data = [];
    if (req) {
      data.push(`REQUEST\t${req.method}\t${req.url}\t${this.logs.length}`);
    }
    data.push(...this.logs.map(format));

    fs.appendFile(filename, data.join('\n'), 'utf8', (err) => {
      console.log(err);
    });
    this.clear();
  }
}

const mysqlLogger = new MysqlLogger();

const pQuery = Pool.prototype.query;
const cQuery = Connection.prototype.query;

function createQueryLogger(origQuery) {
  return function queryLogger(sql, values, cb) {
    const startTime = new Date();
    const stack = new Error().stack;
    return Reflect.apply(origQuery, this, [sql, values, (...args) => {
      const time = new Date() - startTime;
      mysqlLogger.push({ sql, values, stack, time });
      return cb(...args);
    }]);
  };
}

Pool.prototype.query = createQueryLogger(pQuery);
Connection.prototype.query = createQueryLogger(cQuery);

module.exports = mysqlLogger;
