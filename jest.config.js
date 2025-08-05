// Simplified Jest configuration for better compatibility
module.exports = {
  // Test environment
  testEnvironment: 'jsdom',
  
  // Setup files
  setupFilesAfterEnv: ['<rootDir>/test-setup.js'],
  
  // Transform files with babel-jest only
  transform: {
    '^.+\\.(js|jsx|ts|tsx)$': 'babel-jest',
  },
  
  // Module name mapping for assets and path aliases
  moduleNameMapper: {
    // Static assets - catch both aliased and direct paths
    '\\.(css|less|scss)$': '<rootDir>/__mocks__/styleMock.js',
    // First catch any PNG/image files with any characters in the path (including spaces)
    '^.*\\.png$': '<rootDir>/__mocks__/fileMock.js',
    '^.*\\.jpg$': '<rootDir>/__mocks__/fileMock.js',
    '^.*\\.jpeg$': '<rootDir>/__mocks__/fileMock.js',
    '^.*\\.gif$': '<rootDir>/__mocks__/fileMock.js',
    '^.*\\.svg$': '<rootDir>/__mocks__/fileMock.js',
    '^.*\\.webp$': '<rootDir>/__mocks__/fileMock.js',
    '^.*\\.ico$': '<rootDir>/__mocks__/fileMock.js',
    '^.*\\.bmp$': '<rootDir>/__mocks__/fileMock.js',
    '^.*\\.tiff$': '<rootDir>/__mocks__/fileMock.js',
    // Other static assets
    '\\.(ttf|eot|woff|woff2|mp4|webm|wav|mp3|m4a|aac|oga)$': '<rootDir>/__mocks__/fileMock.js',
    
    // Path aliases (from jsconfig.json) - these come after asset mapping
    '^@components/(.*)$': '<rootDir>/src/components/$1',
    '^@context/(.*)$': '<rootDir>/src/context/$1',
    '^@hooks/(.*)$': '<rootDir>/src/hooks/$1',
    '^@pages/(.*)$': '<rootDir>/src/pages/$1',
    '^@utils/(.*)$': '<rootDir>/src/utils/$1',
    '^@react-query/(.*)$': '<rootDir>/src/react-query/$1',
    '^@config/(.*)$': '<rootDir>/src/config/$1',
    '^@layout/(.*)$': '<rootDir>/src/layout/$1',
    '^@modules/(.*)$': '<rootDir>/src/modules/$1',
    '^@styles/(.*)$': '<rootDir>/src/styles/$1',
    '^@zustand/(.*)$': '<rootDir>/src/zustand/$1',
    '^@routes/(.*)$': '<rootDir>/src/routes/$1',
    '^@assets/(.*)$': '<rootDir>/src/assets/$1'
  },
  
  // Test file patterns
  testMatch: [
    '<rootDir>/src/**/__tests__/**/*.{js,jsx,ts,tsx}',
    '<rootDir>/src/**/*.{test,spec}.{js,jsx,ts,tsx}'
  ],
  
  // Coverage settings
  collectCoverageFrom: [
    'src/**/*.{js,jsx}',
    '!src/index.js',
    '!src/serviceWorkerRegistration.js',
    '!src/**/*.stories.{js,jsx}'
  ],
  
  // Timeout
  testTimeout: 10000,
  
  // Verbose output for debugging
  verbose: true
};
