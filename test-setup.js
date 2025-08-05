// Modern Jest test setup for React 18 with Jest 29+
import '@testing-library/jest-dom';

// Global test environment setup
global.window.env = {
  API_URL: 'https://labs-api.buildly.io/',
  OAUTH_CLIENT_ID: 'test-oauth-client-id',
  OAUTH_AUTHORIZATION_URL: 'https://labs-api.buildly.io/authorize/',
  OAUTH_TOKEN_URL: 'https://labs-api.buildly.io/token/',
  OAUTH_REVOKE_URL: 'https://labs-api.buildly.io/revoke_token/',
  OAUTH_REDIRECT_URL: 'http://localhost:3000/auth/callback',
  OAUTH_SCOPE: 'read write',
  GITHUB_CLIENT_ID: 'test-github-client-id',
  TRELLO_API_KEY: 'test-trello-api-key',
  FEEDBACK_SHEET: 'https://sheet.best/api/sheets/test-sheet-id',
  PRODUCT_SERVICE_URL: 'https://labs-product.buildly.io/',
  PRODUCT_SERVICE_TOKEN: 'test-product-service-token',
  RELEASE_SERVICE_URL: 'https://labs-release.buildly.io/',
  RELEASE_SERVICE_TOKEN: 'test-release-service-token',
  FREE_COUPON_CODE: 'test-coupon-code',
  STRIPE_KEY: 'test-stripe-key',
  BOT_API_KEY: 'test-bot-api-key',
  HOSTNAME: 'labs.buildly.io',
  BABBLE_CHATBOT_URL: 'https://labs-babble.buildly.io/chatbot',
  PRODUCTION: false
};

// Mock localStorage
const localStorageMock = {
  getItem: jest.fn(),
  setItem: jest.fn(),
  removeItem: jest.fn(),
  clear: jest.fn(),
};
global.localStorage = localStorageMock;

// Mock sessionStorage
const sessionStorageMock = {
  getItem: jest.fn(),
  setItem: jest.fn(),
  removeItem: jest.fn(),
  clear: jest.fn(),
};
global.sessionStorage = sessionStorageMock;

// Mock fetch globally
global.fetch = jest.fn(() =>
  Promise.resolve({
    ok: true,
    status: 200,
    json: () => Promise.resolve({}),
    text: () => Promise.resolve(''),
    blob: () => Promise.resolve(new Blob()),
  })
);

// Mock window.location
delete window.location;
window.location = {
  href: 'http://localhost:3000',
  origin: 'http://localhost:3000',
  protocol: 'http:',
  host: 'localhost:3000',
  hostname: 'localhost',
  port: '3000',
  pathname: '/',
  search: '',
  hash: '',
  assign: jest.fn(),
  replace: jest.fn(),
  reload: jest.fn(),
};

// Mock window.open
window.open = jest.fn();

// Mock IntersectionObserver
global.IntersectionObserver = class IntersectionObserver {
  constructor() {}
  disconnect() {}
  observe() {}
  unobserve() {}
};

// Mock ResizeObserver
global.ResizeObserver = class ResizeObserver {
  constructor() {}
  disconnect() {}
  observe() {}
  unobserve() {}
};

// Mock matchMedia
Object.defineProperty(window, 'matchMedia', {
  writable: true,
  value: jest.fn().mockImplementation(query => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: jest.fn(), // deprecated
    removeListener: jest.fn(), // deprecated
    addEventListener: jest.fn(),
    removeEventListener: jest.fn(),
    dispatchEvent: jest.fn(),
  })),
});

// Suppress console warnings in tests
const originalConsoleWarn = console.warn;
console.warn = (...args) => {
  // Suppress specific React warnings that are common in tests
  if (
    args[0] &&
    typeof args[0] === 'string' &&
    (args[0].includes('Warning: ReactDOM.render is deprecated') ||
     args[0].includes('Warning: findDOMNode is deprecated'))
  ) {
    return;
  }
  originalConsoleWarn(...args);
};
