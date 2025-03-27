import { defineConfig } from '@playwright/test';
import dotenv from 'dotenv';

import path from 'path';
dotenv.config({ path: path.resolve(__dirname, '.env') });

export default defineConfig({
  testDir: './e2e/tests',
  outputDir: 'tests-output',
  forbidOnly: !!process.env.CI,
  retries: 0,
  workers: process.env.CI ? 2 : undefined,
  timeout: 120000,
  reporter: 'line',
  use: {
    screenshot: 'only-on-failure', // Not yet supported on Electron
    trace: 'retain-on-failure',
  },
  projects: [
    {
      name: 'setup',
      testMatch: /global\.setup\.ts/,
    },
    {
      name: 'tests',
      dependencies: ['setup'],
    },
  ],
});
