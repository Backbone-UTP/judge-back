const db = require('../../database/postgres');

async function getHealth() {
  const result = await db.query('SELECT NOW() AS now');
  return {
    message: 'OK',
    databaseTime: result.rows[0].now,
  };
}

module.exports = {
  getHealth,
};
