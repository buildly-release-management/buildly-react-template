const config = {
  babelrc: false,
  presets: [
    ['@babel/preset-env', { 
      targets: { node: 'current' },
      modules: 'commonjs'
    }],
    ['@babel/preset-react', {
      runtime: 'automatic'
    }]
  ],
  plugins: [
    '@babel/plugin-transform-runtime',
    // Class properties are now handled by @babel/preset-env automatically
  ]
};

module.exports = require('babel-jest').createTransformer(config);
