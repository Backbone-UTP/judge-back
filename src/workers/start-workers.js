const { createHealthCheckWorker } = require('./health-check.worker');

console.log('Iniciando workers...');

const healthWorker = createHealthCheckWorker();

console.log('Worker de health-check iniciado. Esperando jobs...');

process.on('SIGTERM', async () => {
  console.log('Cerrando workers...');
  await healthWorker.close();
  process.exit(0);
});
