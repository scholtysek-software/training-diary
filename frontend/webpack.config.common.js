const webpack = require('webpack');

module.exports = {
  entry: {
    app: './frontend/assets/app/main.ts',
  },

  resolve: {
    extensions: ['.js', '.ts'],
  },

  module: {
    rules: [
      {
        test: /\.html$/,
        use: [{ loader: 'html-loader' }],
      },
      {
        test: /\.css$/,
        use: [{ loader: 'raw-loader' }],
      },
    ],
    exprContextCritical: false,

  },
};
