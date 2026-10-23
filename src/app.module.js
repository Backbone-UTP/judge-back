const healthModule = require('./modules/health/health.module');
const authModule = require('./modules/auth/auth.module');
const problemsModule = require('./modules/problems/problems.module');
const submissionsModule = require('./modules/submissions/submissions.module');

const modules = [healthModule, authModule, problemsModule, submissionsModule];
const defaultModules = modules;

async function registerModules(app, modulesToRegister = defaultModules) {
  for (const moduleConfig of modulesToRegister) {
    if (typeof moduleConfig.init === 'function') {
      await moduleConfig.init();
    }

    app.use(moduleConfig.path, moduleConfig.router);
  }
}

module.exports = {
  registerModules,
  modules,
  defaultModules,
};
