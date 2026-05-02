const { Worker } = require('bullmq');
const env = require('../config/env');

const connection = {
  host: env.redis.host,
  port: env.redis.port,
};

function createHealthCheckWorker() {
  const worker = new Worker(
    env.bullmq.healthQueueName,
    async (job) => {
      console.log(`Procesando job ${job.id} de tipo ${job.name}`);
      console.log('Datos del job:', job.data);

      await new Promise((resolve) => setTimeout(resolve, 1000));

      console.log(`Job ${job.id} completado`);
      return { processed: true, jobId: job.id };
    },
    { connection }
  );

  worker.on('completed', (job) => {
    console.log(`Job ${job.id} finalizado exitosamente`);
  });

  worker.on('failed', (job, err) => {
    console.error(`Job ${job?.id} falló:`, err.message);
  });

  worker.on('error', (err) => {
    console.error('Error en worker:', err);
  });

  return worker;
}

module.exports = { createHealthCheckWorker };
