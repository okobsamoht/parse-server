const { getDatabaseAdapter } = require('./Controllers');
const DatabaseController = require('./Controllers/DatabaseController');

function reConfigDb(config, context = {}) {
  const company = context.company || context.tenant;

  if (config.enableTenants) {
    if (company && typeof company === 'string') {
      const adapterUri = new URL(config.databaseURI);
      if (adapterUri.protocol === 'mongodb:') {
        try {
          const dbUri =
            adapterUri.protocol +
            '//' +
            (adapterUri.username
              ? adapterUri.username + ((adapterUri.password && ':' + adapterUri.password) + '@')
              : '') +
            adapterUri.hostname +
            (adapterUri.port ? ':' + adapterUri.port : '') +
            '/' +
            config.appId +
            '_' +
            company.toString().replace(/\W/g, '_') +
            adapterUri.search;
          const dba = getDatabaseAdapter(dbUri);
          const dbc = new DatabaseController(dba);
          config.database = dbc;
          dbc.performInitialization().catch(error => {
            console.error(error);
          });
          return config;
        } catch (error) {
          console.error('error getting tenant configuration', error);
          return config;
        }
      }
    }
  }

  return config;
}

module.exports = reConfigDb;