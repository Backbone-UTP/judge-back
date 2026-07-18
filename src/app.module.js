const healthModule = require('./modules/health/health.module');
const authModule = require('./modules/auth/auth.module');
const problemsModule = require('./modules/problems/problems.module');
const modules = [healthModule, authModule, problemsModule];

async function registerModules(app) {
  for (const moduleConfig of modules) {
    if (typeof moduleConfig.init === 'function') {
      await moduleConfig.init();
    }

    app.use(moduleConfig.path, moduleConfig.router);
  }
}

module.exports = {
  registerModules,
};
