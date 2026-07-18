const db = require('../../database/postgres');

async function findAllProblems() {
    const result = await db.query(`
        SELECT id, slug, title, difficulty, statement
        FROM problems
        ORDER BY id ASC;
    `);
    return result.rows;
}

module.exports = {
    findAllProblems,
};
