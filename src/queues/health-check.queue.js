const { Queue } = require('bullmq');
const env = require('../config/env');

const connection = {
  host: env.redis.host,
  port: env.redis.port,
};

const healthCheckQueue = new Queue(env.bullmq.healthQueueName, { connection });

async function enqueueHealthCheckJob() {
  return healthCheckQueue.add('health-check-job', {
    createdAt: new Date().toISOString(),
  });
}

module.exports = {
  enqueueHealthCheckJob,
};
