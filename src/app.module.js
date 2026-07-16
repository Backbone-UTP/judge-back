const healthModule = require('./modules/health/health.module');
const authModule = require('./modules/auth/auth.module');
const submissionsModule = require('./modules/submissions/submissions.module');

const defaultModules = [healthModule, authModule, submissionsModule];

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
  defaultModules,
};
