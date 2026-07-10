import { defineConfig, devices } from '@playwright/test'

// Headed, single-worker, long timeouts (real HashKey testnet txns take a few seconds).
// Video: 'on' asks Playwright to record; because Synpress runs a persistent context
// with the MetaMask extension, if no video lands in test-results/ use the macOS
// screen recording fallback (see README) — that always works.
export default defineConfig({
  testDir: './tests',
  fullyParallel: false,
  workers: 1,
  retries: 0,
  timeout: 240_000,
  expect: { timeout: 30_000 },
  reporter: [['list']],
  use: {
    ...devices['Desktop Chrome'],
    headless: false,
    viewport: { width: 1440, height: 900 },
    video: 'on',
    trace: 'on',
    baseURL: 'http://localhost:3100',
    actionTimeout: 30_000,
  },
})
