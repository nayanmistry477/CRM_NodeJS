 

module.exports = {
  host: (process.env.MYSQL_HOST || 'localhost'),
  user: (process.env.MYSQL_USR || 'root'),
  password: (process.env.MYSQL_PASS || ''),
  name: (process.env.MYSQL_NAME || 'crm'),
  poolSize: (process.env.MYSQL_POOL_SIZE || 16)
}

// module.exports = {
//   host: (process.env.MYSQL_HOST || 'localhost'),
//   user: (process.env.MYSQL_USR || 'xyz'),
//   password: (process.env.MYSQL_PASS || '0e1]lGNmdk@o'),
//   name: (process.env.MYSQL_NAME || 'dbname'),
//   poolSize: (process.env.MYSQL_POOL_SIZE || 16)
// }
