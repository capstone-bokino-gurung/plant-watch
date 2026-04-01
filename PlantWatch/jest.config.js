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
    'app/**/*.{ts}',
    '!services/**/*.test.{ts,tsx}',
    '!services/**/index.{ts,tsx}',
    '!**/*.d.ts',
  ],
  
  coverageDirectory: 'coverage',
  coverageReporters: ['text', 'lcov', 'html'],
};