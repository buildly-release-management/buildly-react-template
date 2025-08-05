module.exports = {
  testEnvironment: 'jsdom',
  testEnvironmentOptions: {
    url: 'http://localhost'
  },
  setupFilesAfterEnv: ['<rootDir>/test-setup.js'],
  moduleNameMapper: {
    '\\.(css|less|scss)$': '<rootDir>/__mocks__/styleMock.js',
    '\\.(gif|ttf|eot|svg|png|jpg)$': '<rootDir>/__mocks__/fileMock.js'
  },
  moduleDirectories: [
    'node_modules',
    '<rootDir>/src',
    'src',
    '<rootDir>/src/styles',
    '<rootDir>'
  ],
  moduleFileExtensions: ['js', 'jsx', 'ts', 'tsx'],
  transform: {
    '^.+\\.(js|jsx)$': [
      'babel-jest',
      {
        presets: [
          ['@babel/preset-env', { targets: { node: 'current' } }],
          ['@babel/preset-react', { runtime: 'automatic' }]
        ]
      }
    ],
    '^.+\\.tsx?$': 'ts-jest'
  },
  collectCoverageFrom: [
    'src/**/*.{js,jsx,tsx}',
    '!src/stories/**',
    '!src/**/*.stories.{js,jsx,ts,tsx}',
    '!src/index.js',
    '!src/serviceWorkerRegistration.js'
  ],
  testTimeout: 10000,
  transformIgnorePatterns: [
    'node_modules/(?!(axios)/)'
  ],
  // Modern Jest doesn't need snapshotSerializers for enzyme
  testMatch: [
    '<rootDir>/src/**/__tests__/**/*.{js,jsx,ts,tsx}',
    '<rootDir>/src/**/*.{test,spec}.{js,jsx,ts,tsx}'
  ],
  // Handle dynamic imports
  extensionsToTreatAsEsm: ['.jsx'],
  globals: {
    'ts-jest': {
      useESM: true
    }
  }
};
