const dotenv = require('dotenv');

dotenv.config();

const databaseUrl = process.env.DATABASE_URL;

if (!databaseUrl) {
  throw new Error('Missing DATABASE_URL in environment variables');
}

const env = {
  port: Number(process.env.PORT) || 3000,
  databaseUrl,
  auth: {
    googleClientId: process.env.GOOGLE_CLIENT_ID || '',
    jwtSecret: process.env.JWT_SECRET || 'change-this-secret',
    jwtExpiresIn: process.env.JWT_EXPIRES_IN || '7d',
  },
  redis: {
    host: process.env.REDIS_HOST || 'localhost',
    port: Number(process.env.REDIS_PORT) || 6378,
  },
  bullmq: {
    healthQueueName: process.env.BULLMQ_HEALTH_QUEUE || 'health-check-queue',
  },
};

module.exports = env;
