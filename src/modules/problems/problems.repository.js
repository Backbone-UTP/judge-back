const db = require('../../database/postgres');

async function ensureProblemsTables() {
    await db.query(`
    CREATE TABLE IF NOT EXISTS problems (
        id BIGSERIAL PRIMARY KEY,
        slug TEXT NOT NULL UNIQUE,
        title TEXT NOT NULL,
        difficulty TEXT NOT NULL CHECK (difficulty IN ('easy', 'medium', 'hard')),
        statement TEXT NOT NULL,
        created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
        updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
    );
    `);
}

async function findAllProblems() {
    const result = await db.query(`
        SELECT id, slug, title, difficulty, statement
        FROM problems
        ORDER BY id ASC;
    `);
    return result.rows;
}

module.exports = {
    ensureProblemsTables,
    findAllProblems,
};