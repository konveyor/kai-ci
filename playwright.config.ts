import { defineConfig } from '@playwright/test';
import dotenv from 'dotenv';

import path from 'path';
dotenv.config({ path: path.resolve(__dirname, '.env') });

export default defineConfig({
  testDir: './e2e/tests',
  outputDir: 'tests-output',
  fullyParallel: false,
  forbidOnly: !!process.env.CI,
  retries: 0,
  workers: 1,
  timeout: 120000,
  reporter: 'line',
  use: {
    screenshot: 'only-on-failure', // Not supported on Electron yet
    trace: 'retain-on-failure',
  },
});
