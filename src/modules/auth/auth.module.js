const authController = require('./auth.controller');

module.exports = {
  path: '/auth',
  router: authController,
};
