module.exports = {
  testEnvironment: 'node',
  
  transform: {
    '^.+\\.tsx?$': 'ts-jest',
  },
  
  testMatch: [
    '**/tests/**/*.test.{ts,tsx}',
  ],
  
  testPathIgnorePatterns: [
    '/node_modules/',
    '/tests/api/',
  ],
  
  moduleNameMapper: {
    '^@/(.*)$': '<rootDir>/$1',
  },
  
  collectCoverageFrom: [
    'services/**/*.{ts,tsx}',
    '!services/**/*.test.{ts,tsx}',
    '!services/**/index.{ts,tsx}',
  ],
  
  coverageDirectory: 'coverage',
  coverageReporters: ['text', 'lcov', 'html'],
};