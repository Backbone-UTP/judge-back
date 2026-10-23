const { Queue } = require('bullmq');
const env = require('../config/env');

const connection = {
  host: env.redis.host,
  port: env.redis.port,
};

let submissionsQueue;

function getSubmissionsQueue() {
  if (!submissionsQueue) {
    submissionsQueue = new Queue(env.bullmq.submissionQueueName, { connection });
  }

  return submissionsQueue;
}

async function enqueueSubmissionJob(payload) {
  return getSubmissionsQueue().add('submission-job', payload);
}

module.exports = {
  enqueueSubmissionJob,
  getSubmissionsQueue,
};