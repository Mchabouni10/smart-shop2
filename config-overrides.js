//config-overrides.js
const webpack = require('webpack');

module.exports = function override(config) {
  config.plugins = config.plugins || [];
  config.plugins.push(
    new webpack.LoaderOptionsPlugin({
      options: {
        ignoreWarnings: [/some-warning/], // Adjust regex as needed
      },
    })
  );
  return config;
};