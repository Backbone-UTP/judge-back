const healthController = require('./health.controller');

module.exports = {
  path: '/health',
  router: healthController,
};
