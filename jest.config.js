module.exports = {
  projects: [
    {
      displayName: 'client',
      testEnvironment: 'jsdom',
      testMatch: ['<rootDir>/client/**/*.test.{ts,tsx}'],
      setupFilesAfterEnv: ['<rootDir>/client/src/setupTests.ts'],
      moduleNameMapping: {
        '^@/(.*)$': '<rootDir>/src/$1',
        '^@/types/(.*)$': '<rootDir>/src/types/$1',
      },
      transform: {
        '^.+\\.(ts|tsx)$': 'ts-jest',
      },
      collectCoverageFrom: [
        'client/src/**/*.{ts,tsx}',
        '!client/src/main.tsx',
        '!client/src/vite-env.d.ts',
        '!client/src/**/*.d.ts',
      ],
    },
    {
      displayName: 'server',
      testEnvironment: 'node',
      testMatch: ['<rootDir>/server/**/*.test.ts'],
      preset: 'ts-jest/presets/default-esm',
      extensionsToTreatAsEsm: ['.ts'],
      globals: {
        'ts-jest': {
          useESM: true,
        },
      },
      moduleNameMapping: {
        '^@/(.*)$': '<rootDir>/src/$1',
        '^@/types/(.*)$': '<rootDir>/src/types/$1',
      },
      collectCoverageFrom: [
        'server/src/**/*.ts',
        '!server/src/**/*.d.ts',
        '!server/src/debug/**',
        '!server/src/test-jira.ts',
      ],
    },
  ],
  collectCoverage: true,
  coverageDirectory: 'coverage',
  coverageReporters: ['text', 'lcov', 'html'],
  coverageThreshold: {
    global: {
      branches: 70,
      functions: 70,
      lines: 70,
      statements: 70,
    },
  },
}