const db = require('../../database/postgres');
const { enqueueHealthCheckJob } = require('../../queues/health-check.queue');

async function getHealth() {
  const [result, job] = await Promise.all([
    db.query('SELECT NOW() AS now'),
    enqueueHealthCheckJob(),
  ]);

  return {
    message: 'OK',
    databaseTime: result.rows[0].now,
    bullmq: {
      queue: job.queueName,
      jobId: job.id,
      name: job.name,
    },
  };
}

module.exports = {
  getHealth,
};
