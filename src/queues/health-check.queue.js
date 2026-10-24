const { Queue } = require('bullmq');
const env = require('../config/env');

const connection = {
  host: env.redis.host,
  port: env.redis.port,
};

let healthCheckQueue;

function getHealthCheckQueue() {
  if (!healthCheckQueue) {
    healthCheckQueue = new Queue(env.bullmq.healthQueueName, { connection });
  }

  return healthCheckQueue;
}

async function enqueueHealthCheckJob() {
  return getHealthCheckQueue().add('health-check-job', {
    createdAt: new Date().toISOString(),
  });
}

module.exports = {
  enqueueHealthCheckJob,
};
