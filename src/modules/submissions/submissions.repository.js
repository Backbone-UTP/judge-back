const db = require('../../database/postgres');

async function ensureSubmissionsTables() {
  await db.query(`
    CREATE TABLE IF NOT EXISTS submissions (
      id BIGSERIAL PRIMARY KEY,
      user_id BIGINT NOT NULL REFERENCES users(id),
      problem_id BIGINT NOT NULL,
      language TEXT NOT NULL,
      source_code TEXT NOT NULL,
      status TEXT NOT NULL CHECK (status IN ('queued', 'running', 'finished', 'failed')),
      verdict TEXT CHECK (verdict IN ('AC', 'WA', 'TLE', 'MLE', 'RE', 'CE', 'PE') OR verdict IS NULL),
      execution_time_ms INTEGER,
      memory_kb INTEGER,
      created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
      updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
    );
  `);
}

async function createSubmission(submission) {
  const result = await db.query(
    `
      INSERT INTO submissions (
        user_id,
        problem_id,
        language,
        source_code,
        status,
        verdict
      )
      VALUES ($1, $2, $3, $4, $5, $6)
      RETURNING id, status, verdict, created_at;
    `,
    [
      submission.userId,
      submission.problemId,
      submission.language,
      submission.sourceCode,
      submission.status,
      submission.verdict,
    ],
  );

  return result.rows[0];
}

async function problemExists(problemId) {
  const result = await db.query(
    `
      SELECT 1
      FROM problems
      WHERE id = $1
      LIMIT 1;
    `,
    [problemId],
  );

  return result.rowCount > 0;
}

async function findSubmissionById(id) {
  const result = await db.query(
    `
      SELECT id, user_id, problem_id, language, source_code, status, verdict, created_at, updated_at
      FROM submissions
      WHERE id = $1;
    `,
    [id],
  );

  return result.rows[0] || null;
}

module.exports = {
  ensureSubmissionsTables,
  createSubmission,
  problemExists,
  findSubmissionById,
};