# Production Deployment Guide

This document outlines the production configuration and performance optimization settings for the Buildly React Template.

## 🏭 Production Environment Configuration

### 1. Critical Production Setting

**IMPORTANT:** Set `PRODUCTION: true` in your `public/environment.js` file for production deployment.

This single setting automatically enables all performance optimizations:

```javascript
window.env = {
  // ... other settings ...
  
  // CRITICAL: Set to true for production deployment
  PRODUCTION: true,
  
  // ... rest of configuration ...
};
```

### 2. What Happens When PRODUCTION=true

#### Automatic Performance Optimizations:

- **React Query Caching:** Longer cache times (15min vs 5min), extended retention (1hr vs 10min)
- **Network Reliability:** More retry attempts (3 vs 1), exponential backoff for failed requests
- **API Efficiency:** Disabled window focus refetching, reduced background requests
- **Debug Output:** Minimized console logging, performance-focused error handling

### 3. Environment Variables

#### For Production Deployment:
```bash
# .env.production.local or in your deployment environment
PRODUCTION=true
API_URL=https://labs-api.buildly.io/
OAUTH_CLIENT_ID=your-production-oauth-client-id
OAUTH_TOKEN_URL=https://labs-api.buildly.io/token/
GITHUB_CLIENT_ID=your-production-github-client-id
TRELLO_API_KEY=your-production-trello-api-key
FEEDBACK_SHEET=https://sheet.best/api/sheets/your-production-sheet-id
PRODUCT_SERVICE_URL=https://labs-product.buildly.io/
PRODUCT_SERVICE_TOKEN=your-production-product-service-token
RELEASE_SERVICE_URL=https://labs-release.buildly.io/
RELEASE_SERVICE_TOKEN=your-production-release-service-token
FREE_COUPON_CODE=your-production-coupon-code
STRIPE_KEY=pk_live_your-production-stripe-key
BOT_API_KEY=your-production-bot-api-key
HOSTNAME=labs.buildly.io
BABBLE_CHATBOT_URL=https://labs-babble.buildly.io/chatbot
```

#### For environment.js (browser runtime):
```javascript
window.env = {
  API_URL: "https://labs-api.buildly.io/",
  OAUTH_CLIENT_ID: "your-production-oauth-client-id",
  OAUTH_TOKEN_URL: "https://labs-api.buildly.io/token/",
  GITHUB_CLIENT_ID: "your-production-github-client-id",
  TRELLO_API_KEY: "your-production-trello-api-key",
  FEEDBACK_SHEET: "https://sheet.best/api/sheets/your-production-sheet-id",
  PRODUCT_SERVICE_URL: "https://labs-product.buildly.io/",
  PRODUCT_SERVICE_TOKEN: "your-production-product-service-token",
  RELEASE_SERVICE_URL: "https://labs-release.buildly.io/",
  RELEASE_SERVICE_TOKEN: "your-production-release-service-token",
  FREE_COUPON_CODE: "your-production-coupon-code",
  STRIPE_KEY: "pk_live_your-production-stripe-key",
  BOT_API_KEY: "your-production-bot-api-key",
  HOSTNAME: "labs.buildly.io",
  BABBLE_CHATBOT_URL: "https://labs-babble.buildly.io/chatbot",
  PRODUCTION: true
};
```

### 2. Build Commands

#### Production Build:
```bash
npm run build:prod
```

#### Production Testing (local):
```bash
npm run start:prod
```

## ⚡ Performance Optimizations

### 1. React Query Configuration

The application currently uses a basic QueryClient configuration. For production, enhance it with:

```javascript
// src/index.js - Enhanced QueryClient for production
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: window.env.PRODUCTION ? 10 * 60 * 1000 : 5 * 60 * 1000, // 10min prod, 5min dev
      cacheTime: window.env.PRODUCTION ? 30 * 60 * 1000 : 10 * 60 * 1000, // 30min prod, 10min dev
      refetchOnWindowFocus: !window.env.PRODUCTION, // Disable in production
      refetchOnMount: true,
      refetchOnReconnect: true,
      retry: window.env.PRODUCTION ? 3 : 1, // More retries in production
      retryDelay: attemptIndex => Math.min(1000 * 2 ** attemptIndex, 30000),
    },
    mutations: {
      retry: window.env.PRODUCTION ? 2 : 0,
    },
  },
});
```

### 2. Bundle Optimization

The webpack configuration already includes production optimizations:

- **Code Splitting**: Vendor chunks separated
- **Minification**: Enabled in production mode
- **Tree Shaking**: Remove unused code
- **Asset Optimization**: Images and fonts optimized

### 3. Service Worker & PWA

The app includes Workbox service worker configuration:
- **Caching Strategy**: Pre-cache critical resources
- **Offline Support**: Basic offline functionality
- **Background Sync**: Queue failed requests

### 4. Memory Management

#### Current Cache Settings:
- Organization Members: 5 minutes stale, 10 minutes cache
- Task Categories: 5 minutes stale
- Most queries: Default browser cache

#### Recommended Production Settings:
```javascript
// For frequently accessed, stable data
staleTime: 15 * 60 * 1000, // 15 minutes
cacheTime: 60 * 60 * 1000, // 1 hour

// For real-time data
staleTime: 1 * 60 * 1000, // 1 minute
cacheTime: 5 * 60 * 1000, // 5 minutes

// For static data (rarely changes)
staleTime: 60 * 60 * 1000, // 1 hour
cacheTime: 24 * 60 * 60 * 1000, // 24 hours
```

## 🔧 Production Checklist

### Security
- [ ] All API tokens are production keys
- [ ] HTTPS enforced on all endpoints
- [ ] CORS properly configured
- [ ] Environment variables secured
- [ ] No debug statements in production build
- [ ] Error boundaries implemented

### Performance
- [ ] Production build size < 2MB (currently optimized)
- [ ] Initial load time < 3 seconds
- [ ] Service worker enabled
- [ ] Critical resources pre-cached
- [ ] Images optimized and compressed
- [ ] Fonts optimized

### Monitoring
- [ ] Google Analytics configured (when PRODUCTION=true)
- [ ] Error tracking setup
- [ ] Performance monitoring
- [ ] API response time monitoring

### Features
- [ ] All OAuth providers configured
- [ ] Payment processing (Stripe) tested
- [ ] Email notifications working
- [ ] File uploads functional
- [ ] Database constraints properly handled

## 🚀 Deployment Steps

### 1. Pre-deployment
```bash
# Run tests
npm run test:prod

# Build for production
npm run build:prod

# Test production build locally
npm run serve
```

### 2. Environment Setup
```bash
# Set production environment variables
export PRODUCTION=true
export API_URL=https://labs-api.buildly.io/
# ... other variables
```

### 3. Deploy
The built files in `/dist` directory are ready for deployment to:
- **Static hosting**: Netlify, Vercel, S3 + CloudFront
- **Container**: Docker with nginx
- **Server**: Apache, nginx

### 4. Post-deployment Verification
- [ ] Application loads correctly
- [ ] Authentication works
- [ ] API calls successful
- [ ] Service worker active
- [ ] Analytics tracking

## 📊 Performance Monitoring

### Key Metrics to Monitor:
1. **Bundle Size**: Keep main bundle < 1MB
2. **Load Time**: First Contentful Paint < 2s
3. **Cache Hit Rate**: > 80% for static resources
4. **API Response Time**: < 500ms average
5. **Error Rate**: < 1% of requests

### Tools:
- Chrome DevTools Lighthouse
- React DevTools Profiler
- Webpack Bundle Analyzer
- Network monitoring tools

## 🐛 Production Debugging

### Reduced Console Output
Production build has minimal console output:
- Critical errors only
- No debug statements
- Performance timing removed
- User-friendly error messages

### Error Handling
- React Error Boundaries catch component errors
- API errors displayed via user alerts
- Fallback UI for failed components
- Graceful degradation for missing features

## 🔄 Continuous Integration

### Recommended CI/CD Pipeline:
1. **Test**: Run unit tests and linting
2. **Build**: Create production bundle
3. **Audit**: Security and performance checks
4. **Deploy**: Deploy to production environment
5. **Verify**: Health checks and smoke tests

### Environment Promotion:
```
Development → Staging → Production
```

Each environment should have its own configuration and API endpoints.
