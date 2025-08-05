// Simplified Jest test setup
import '@testing-library/jest-dom';

// Basic global environment setup
global.window.env = {
  API_URL: 'https://labs-api.buildly.io/',
  OAUTH_CLIENT_ID: 'test-oauth-client-id',
  OAUTH_AUTHORIZATION_URL: 'https://labs-api.buildly.io/authorize/',
  OAUTH_TOKEN_URL: 'https://labs-api.buildly.io/token/',
  OAUTH_REVOKE_URL: 'https://labs-api.buildly.io/revoke_token/',
  OAUTH_REDIRECT_URL: 'http://localhost:3000/auth/callback',
  OAUTH_SCOPE: 'read write',
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

// Mock fetch
global.fetch = jest.fn(() =>
  Promise.resolve({
    ok: true,
    status: 200,
    json: () => Promise.resolve({}),
  })
);
