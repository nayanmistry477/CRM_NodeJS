var mysql = require('mysql');
const { dbConfig } = require('../configs');
var pool  = mysql.createPool({
  connectionLimit : dbConfig.poolSize,
  host            : dbConfig.host,
  user            : dbConfig.user,
  password        : dbConfig.password,
  database        : dbConfig.name
});

module.exports = pool;