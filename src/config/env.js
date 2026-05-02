const dotenv = require('dotenv');

dotenv.config();

const env = {
  port: Number(process.env.PORT) || 3000,
  db: {
    host: process.env.DB_HOST || 'localhost',
    port: Number(process.env.DB_PORT) || 5434,
    user: process.env.DB_USER || 'postgres',
    password: process.env.DB_PASSWORD || 'postgres',
    database: process.env.DB_NAME || 'judge_back',
  },
  auth: {
    googleClientId: process.env.GOOGLE_CLIENT_ID || '',
    jwtSecret: process.env.JWT_SECRET || 'change-this-secret',
    jwtExpiresIn: process.env.JWT_EXPIRES_IN || '7d',
  },
};

module.exports = env;
