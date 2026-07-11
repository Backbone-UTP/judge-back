const healthModule = require('./modules/health/health.module');
const authModule = require('./modules/auth/auth.module');
const testCasesModule = require('./modules/test-cases/test-cases.module');

const modules = [healthModule, authModule, testCasesModule];

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