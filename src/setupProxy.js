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

  // Proxy Buildly Core API requests to avoid CORS issues in development
  app.use(
    '/api/core',
    createProxyMiddleware({
      target: 'https://labs-api.buildly.dev',
      changeOrigin: true,
      pathRewrite: {
        '^/api/core': '', // remove /api/core prefix
      },
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'GET,PUT,POST,DELETE,OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type, Authorization, Content-Length, X-Requested-With',
      },
    })
  );

  // Proxy Product Service requests to avoid CORS issues in development
  app.use(
    '/api/product',
    createProxyMiddleware({
      target: 'https://labs-product.buildly.dev',
      changeOrigin: true,
      pathRewrite: {
        '^/api/product': '', // remove /api/product prefix
      },
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'GET,PUT,POST,DELETE,OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type, Authorization, Content-Length, X-Requested-With',
      },
    })
  );

  // Proxy Release Service requests to avoid CORS issues in development
  app.use(
    '/api/release',
    createProxyMiddleware({
      target: 'https://labs-release.buildly.dev',
      changeOrigin: true,
      pathRewrite: {
        '^/api/release': '', // remove /api/release prefix
      },
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'GET,PUT,POST,DELETE,OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type, Authorization, Content-Length, X-Requested-With',
      },
    })
  );
};
