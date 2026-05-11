import type { Config } from 'jest';

const config: Config = {
  preset: 'ts-jest',
  testEnvironment: 'node',
  rootDir: '.',
  testMatch: ['**/*.e2e-spec.ts'],
  testTimeout: 180_000,
  globalSetup: '<rootDir>/setup/global-setup.ts',
  globalTeardown: '<rootDir>/setup/global-teardown.ts',
  moduleNameMapper: {
    '^@app/(.*)$': '<rootDir>/../libs/$1/src',
  },
};

export default config;
