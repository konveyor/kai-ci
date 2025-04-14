import { defineConfig } from '@playwright/test';
import dotenv from 'dotenv';

import path from 'path';
dotenv.config({ path: path.resolve(__dirname, '.env') });

export default defineConfig({
  testDir: './e2e/tests',
  outputDir: 'test-output',
  forbidOnly: !!process.env.CI,
  retries: 0,
  workers: process.env.CI ? 2 : undefined,
  timeout: 120000,
  reporter: 'line',
  expect: {
    timeout: 10000,
  },
  use: {
    viewport: { width: 1920, height: 1080 },
    screenshot: 'only-on-failure', // Not yet supported on Electron
    trace: 'retain-on-failure',
    launchOptions: {
      args: ['--window-size=1920,1080', '--start-maximized'],
    },
  },
  projects: [
    {
      name: 'setup',
      testMatch: /global\.setup\.ts/,
      teardown: 'teardown',
    },
    {
      name: 'teardown',
      testMatch: /global\.teardown\.ts/,
    },
    {
      name: 'tests',
      dependencies: ['setup'],
    },
  ],
});
