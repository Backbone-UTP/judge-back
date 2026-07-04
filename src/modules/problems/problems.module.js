const problemsController = require('./problems.controller');
const { initProblemsModule } = require('./problems.service');

module.exports = {
    path: '/problems',
    router: problemsController,
    init: initProblemsModule,
};
