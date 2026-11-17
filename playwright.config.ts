import { defineConfig, devices } from '@playwright/test';
import * as os from 'node:os';

/**
 * Playwright configuration for WBS QA Tech Challenge
 * - API tests use request fixture (no browser needed)
 * - UI tests use Chromium by default
 * - Allure reporter for rich reporting
 */
export default defineConfig({
  testDir: './tests',
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: process.env.CI ? 1 : undefined,
  timeout: 30_000,
  expect: {
    timeout: 10_000,
  },

  reporter: [
    ['list'],
    [
      'allure-playwright',
      {
        detail: true,
        resultsDir: 'allure-results',
        suiteTitle: true,
        environmentInfo: {
          os_platform: os.platform(),
          os_release: os.release(),
          node_version: process.version,
          framework: 'Playwright + TypeScript',
        },
      },
    ],
  ],

  use: {
    // Base URL for UI tests
    baseURL: 'https://automationintesting.online',
    trace: 'on-first-retry',
    screenshot: 'only-on-failure',
    video: 'retain-on-failure',
  },

  projects: [
    // API project – no browser needed
    {
      name: 'api',
      testMatch: /tests\/api\/.*\.spec\.ts/,
      use: {
        // API tests rely on request context, not a browser
        baseURL: 'https://restful-booker.herokuapp.com',
        // Scoped to the API project so browser page loads still request HTML
        extraHTTPHeaders: {
          Accept: 'application/json',
        },
      },
    },
    // UI project
    {
      name: 'ui-chromium',
      testMatch: /tests\/ui\/.*\.spec\.ts/,
      use: {
        ...devices['Desktop Chrome'],
        baseURL: 'https://automationintesting.online',
      },
    },
  ],
});