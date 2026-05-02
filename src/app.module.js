const healthModule = require('./modules/health/health.module');
const authModule = require('./modules/auth/auth.module');

const modules = [healthModule, authModule];

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
