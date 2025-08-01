const { createProxyMiddleware } = require('http-proxy-middleware');

module.exports = function(app) {
  // Proxy BabbleBeaver API requests to avoid CORS issues in development
  app.use(
    '/api/babble',
    createProxyMiddleware({
      target: 'https://labs-babble.buildly.dev',
      changeOrigin: true,
      pathRewrite: {
        '^/api/babble': '', // remove /api/babble prefix
      },
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'GET,PUT,POST,DELETE,OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type, Authorization, Content-Length, X-Requested-With',
      },
    })
  );
};
