const submissionsController = require('./submissions.controller');
const submissionsService = require('./submissions.service');

module.exports = {
  path: '/submissions',
  router: submissionsController,
  init: submissionsService.initSubmissionsModule,
};