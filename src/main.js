const express = require('express');
const env = require('./config/env');
const { createApp } = require('./app');

async function bootstrap() {
  const app = await createApp();

  app.listen(env.port, () => {
    console.log(`Server running on port ${env.port}`);
  });
}

bootstrap().catch((error) => {
  console.error('Error while bootstrapping app:', error);
  process.exit(1);
});
