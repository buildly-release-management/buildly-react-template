module.exports = function(api) {
  // Cache the configuration based on the environment
  api.cache.using(() => process.env.NODE_ENV);
  
  const presets = [
    ['@babel/preset-env', {
      targets: {
        browsers: ['last 2 versions', 'ie >= 11']
      },
      modules: false
    }],
    ['@babel/preset-react', {
      runtime: 'automatic'
    }]
  ];

  const plugins = [
    '@babel/plugin-transform-runtime',
    ['@babel/plugin-proposal-class-properties', {
      loose: true
    }]
  ];

  // Test environment configuration
  if (process.env.NODE_ENV === 'test') {
    presets[0] = ['@babel/preset-env', {
      targets: {
        node: 'current'
      },
      modules: 'commonjs'
    }];
  }

  return {
    presets,
    plugins
  };
};
