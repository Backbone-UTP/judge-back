const db = require('../../database/postgres');

async function ensureAuthTables() {
  await db.query(`
    CREATE TABLE IF NOT EXISTS users (
      id BIGSERIAL PRIMARY KEY,
      google_sub TEXT NOT NULL UNIQUE,
      email TEXT NOT NULL UNIQUE,
      full_name TEXT,
      avatar_url TEXT,
      created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
      updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
    );
  `);
}

async function upsertGoogleUser(user) {
  const result = await db.query(
    `
      INSERT INTO users (google_sub, email, full_name, avatar_url)
      VALUES ($1, $2, $3, $4)
      ON CONFLICT (google_sub)
      DO UPDATE SET
        email = EXCLUDED.email,
        full_name = EXCLUDED.full_name,
        avatar_url = EXCLUDED.avatar_url,
        updated_at = NOW()
      RETURNING id, email, full_name, avatar_url, created_at, updated_at;
    `,
    [user.googleSub, user.email, user.fullName, user.avatarUrl],
  );

  return result.rows[0];
}

async function findUserById(id) {
  const result = await db.query(
    `
      SELECT id, email, full_name, avatar_url, created_at, updated_at
      FROM users
      WHERE id = $1;
    `,
    [id],
  );

  return result.rows[0] || null;
}

module.exports = {
  ensureAuthTables,
  upsertGoogleUser,
  findUserById,
};
