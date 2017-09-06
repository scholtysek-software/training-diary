const env = process.env.NODE_ENV || 'development';

if (env === 'development' || env === 'test') {
  // eslint-disable-next-line global-require
  const params = require('./params.json');
  Object.assign(process.env, params[env]);
}
