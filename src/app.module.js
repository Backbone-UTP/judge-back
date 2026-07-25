const healthModule = require('./modules/health/health.module');
const authModule = require('./modules/auth/auth.module');
const problemsModule = require('./modules/problems/problems.module');
const submissionsModule = require('./modules/submissions/submissions.module');
const modules = [healthModule, authModule];

async function registerModules(app, modules = defaultModules) {
  for (const moduleConfig of modules) {
    if (typeof moduleConfig.init === 'function') {
      await moduleConfig.init();
    }

    app.use(moduleConfig.path, moduleConfig.router);
  }
}

module.exports = {
  registerModules,
  modules,
};
