//config-overrides.js
module.exports = function override(config, env) {
  // Ensure config and config.module exist
  if (!config || !config.module) {
    console.error('Invalid Webpack config object:', config);
    return config || {};
  }

  // Ignore source maps for react-router-dom
  config.module.rules = (config.module.rules || []).map(rule => {
    if (rule && rule.loader && rule.loader.includes('source-map-loader')) {
      return {
        ...rule,
        exclude: [/node_modules\/react-router-dom/]
      };
    }
    return rule;
  });

  // Suppress React Router deprecation warnings
  if (env === 'development') {
    config.ignoreWarnings = config.ignoreWarnings || [];
    config.ignoreWarnings.push({
      module: /react-router-dom/,
      message: /React Router Future Flag Warning/,
    });
  }

  return config;
};