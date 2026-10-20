import { defineConfig, devices } from '@playwright/test';

const port = 4173;
const executablePath = process.env.CHROMIUM_EXECUTABLE_PATH;

export default defineConfig({
  testDir: 'tests/e2e',
  fullyParallel: true,
  forbidOnly: Boolean(process.env.CI),
  reporter: process.env.CI ? 'github' : 'list',
  use: {
    baseURL: `http://localhost:${port}/liste-de-courses/`,
    trace: 'retain-on-failure',
  },
  projects: [
    {
      name: 'android-chrome',
      use: { ...devices['Pixel 7'], launchOptions: executablePath ? { executablePath } : {} },
    },
  ],
  webServer: {
    command: `npm run build && npm run preview -- --port ${port} --strictPort`,
    port,
    reuseExistingServer: !process.env.CI,
  },
});
