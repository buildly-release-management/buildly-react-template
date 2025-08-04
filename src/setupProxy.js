const { createProxyMiddleware } = require('http-proxy-middleware');

module.exports = function(app) {
  // Get environment variables, fallback to defaults if not set
  const BABBLE_URL = process.env.REACT_APP_BABBLE_URL || 'https://labs-babble.buildly.dev';
  const API_URL = process.env.REACT_APP_API_URL || 'https://labs-api.buildly.dev';
  const PRODUCT_SERVICE_URL = process.env.REACT_APP_PRODUCT_SERVICE_URL || 'https://labs-product.buildly.dev';
  const RELEASE_SERVICE_URL = process.env.REACT_APP_RELEASE_SERVICE_URL || 'https://labs-release.buildly.dev';

  // Proxy BabbleBeaver API requests to avoid CORS issues in development
  app.use(
    '/api/babble',
    createProxyMiddleware({
      target: BABBLE_URL,
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
      target: API_URL,
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
      target: PRODUCT_SERVICE_URL,
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
      target: RELEASE_SERVICE_URL,
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
