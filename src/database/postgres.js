const { Pool } = require('pg');
const env = require('../config/env');

const pool = new Pool({
  host: env.db.host,
  port: env.db.port,
  user: env.db.user,
  password: env.db.password,
  database: env.db.database,
});

async function query(text, params = []) {
  return pool.query(text, params);
}

module.exports = {
  pool,
  query,
};
