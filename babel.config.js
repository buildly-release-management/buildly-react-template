// Simplified Babel configuration for better compatibility
module.exports = function(api) {
  // Cache the configuration
  api.cache(true);
  
  const presets = [
    ['@babel/preset-env', {
      targets: {
        node: 'current'
      },
      modules: 'commonjs'
    }],
    ['@babel/preset-react', {
      runtime: 'automatic'
    }]
  ];

  const plugins = [];

  return {
    presets,
    plugins
  };
};
