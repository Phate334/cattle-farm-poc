// @ts-check
const { defineConfig, devices } = require('@playwright/test');

/**
 * Playwright 測試配置
 * @see https://playwright.dev/docs/test-configuration
 */
module.exports = defineConfig({
  testDir: './tests',
  
  /* 每個測試的最長執行時間 */
  timeout: 30 * 1000,
  
  /* 測試期望的最長等待時間 */
  expect: {
    timeout: 5000
  },
  
  /* 並行執行測試 */
  fullyParallel: true,
  
  /* CI 環境下如果測試失敗則終止 */
  forbidOnly: !!process.env.CI,
  
  /* CI 環境下失敗時重試 */
  retries: process.env.CI ? 2 : 0,
  
  /* CI 環境下使用單一 worker */
  workers: process.env.CI ? 1 : undefined,
  
  /* 測試報告設定 */
  reporter: [
    ['html', { outputFolder: 'test-results/html-report' }],
    ['json', { outputFile: 'test-results/results.json' }],
    ['list']
  ],
  
  /* 共用設定 */
  use: {
    /* 測試的基礎 URL */
    baseURL: 'http://localhost:8000',
    
    /* 執行測試時收集追蹤資訊（用於除錯） */
    trace: 'on-first-retry',
    
    /* 截圖設定 */
    screenshot: 'only-on-failure',
    
    /* 影片錄製設定 */
    video: 'retain-on-failure',
    
    /* 瀏覽器語言設定 */
    locale: 'zh-TW',
    
    /* 時區設定 */
    timezoneId: 'Asia/Taipei',
  },

  /* 測試專案配置 - 不同瀏覽器 */
  projects: [
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] },
    },

    /* 可選擇性啟用其他瀏覽器測試
    {
      name: 'firefox',
      use: { ...devices['Desktop Firefox'] },
    },

    {
      name: 'webkit',
      use: { ...devices['Desktop Safari'] },
    },
    */
  ],

  /* 本地開發伺服器設定 */
  webServer: {
    command: 'python -m http.server 8000',
    url: 'http://localhost:8000',
    reuseExistingServer: !process.env.CI,
    timeout: 120 * 1000,
  },
});
