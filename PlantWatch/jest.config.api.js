const baseConfig = require('./jest.config');

module.exports = {
  ...baseConfig,
  
  // Only run API tests
  testMatch: [
    '**/tests/api/**/*.test.{ts,tsx}',
  ],
  
  // Don't ignore API tests
  testPathIgnorePatterns: [
    '/node_modules/',
  ],
  
  // No coverage for API tests
  collectCoverage: false,
};