const express = require('express');
const cors = require('cors');
const { registerModules, defaultModules } = require('./app.module');

function buildErrorResponse(error) {
  const message = error.message || 'Internal server error';

  if (typeof error.statusCode === 'number') {
    return {
      message,
      statusCode: error.statusCode,
    };
  }

  const statusCode =
    message === 'Invalid Google account payload' || message === 'Invalid Google token' ? 401 : 500;

  return {
    message,
    statusCode,
  };
}

async function createApp(modules = defaultModules) {
  const app = express();

  app.use(cors());
  app.use(express.json());

  await registerModules(app, modules);

  app.use((error, _req, res, _next) => {
    const response = buildErrorResponse(error);
    res.status(response.statusCode).json(response);
  });

  return app;
}

module.exports = {
  createApp,
  buildErrorResponse,
};