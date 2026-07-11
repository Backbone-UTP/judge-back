const express = require('express');
const cors = require('cors');
const env = require('./config/env');
const { registerModules } = require('./app.module');

const app = express();

app.use(cors());
app.use(express.json());

async function bootstrap() {
  await registerModules(app);

  app.use((error, _req, res, _next) => {
    const message = error.message || 'Internal server error';
    const statusCode =
      message === 'Invalid Google account payload' || message === 'Invalid Google token' ? 401 : 500;

    res.status(statusCode).json({
      message,
      statusCode,
    });
  });

  app.listen(env.port, () => {
    console.log(`Server running on port ${env.port}`);
  });
}

bootstrap().catch((error) => {
  console.error('Error while bootstrapping app:', error);
  process.exit(1);
});
