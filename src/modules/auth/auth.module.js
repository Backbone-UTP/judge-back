const authController = require('./auth.controller');
const { initAuthModule } = require('./auth.service');

module.exports = {
  path: '/auth',
  router: authController,
  init: initAuthModule,
};
