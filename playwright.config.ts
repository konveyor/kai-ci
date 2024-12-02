import { defineConfig } from '@playwright/test';
import dotenv from 'dotenv';

import path from 'path';
dotenv.config({ path: path.resolve(__dirname, '.env') });

export default defineConfig({
  testDir: './e2e/tests',

  fullyParallel: false,
  forbidOnly: !!process.env.CI,
  // retries: process.env.CI ? 2 : 0,
  // workers: process.env.CI ? 1 : undefined,
  retries: 0, // No retries to avoid `beforeAll` repeating due to flaky test retries
  workers: 1, // Single worker to prevent multiple executions of `beforeAll`
  reporter: 'html',

  use: {
    trace: 'on-first-retry',
  },
});
