const params = require('./params.json');

const env = process.env.NODE_ENV || 'development';

if (env === 'development' || env === 'test') {
  Object.assign(process.env, params[env]);
}
