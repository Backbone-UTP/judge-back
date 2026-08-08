const db = require('../../database/postgres');

async function findAllProblems() {
    const result = await db.query(`
        SELECT id, slug, title, difficulty, statement
        FROM problems
        ORDER BY id ASC;
    `);
    return result.rows;
}

async function findProblemById(id) {
    const result = await db.query(
        `
        SELECT id, slug, title, difficulty, statement, examples, constraints
        FROM problems
        WHERE id = $1;
        `,
        [id],
    );
    return result.rows[0] || null;
}

module.exports = {
    findAllProblems,
    findProblemById,
};
