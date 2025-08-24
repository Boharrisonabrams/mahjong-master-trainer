import { defineConfig, devices } from '@playwright/test';

/**
 * Premium Mahjong Trainer Testing Configuration
 * Comprehensive cross-browser, visual regression, and performance testing
 */
export default defineConfig({
  testDir: './tests',
  
  // Test organization
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: process.env.CI ? 1 : undefined,
  
  // Timeouts and test behavior
  timeout: 30000,
  expect: {
    timeout: 10000,
    // Visual comparisons threshold for UI consistency
    toHaveScreenshot: { threshold: 0.3, maxDiffPixels: 100 },
    toMatchSnapshot: { threshold: 0.3, maxDiffPixels: 100 }
  },
  
  // Reporter configuration for premium testing insights
  reporter: [
    ['html', { outputFolder: 'test-results/html-report' }],
    ['json', { outputFile: 'test-results/results.json' }],
    ['junit', { outputFile: 'test-results/junit.xml' }],
    ['list']
  ],
  
  // Output directories
  outputDir: 'test-results/artifacts',
  
  // Global test configuration
  use: {
    // Base URL for testing
    baseURL: 'http://localhost:3000',
    
    // Browser context settings for mahjong gaming
    viewport: { width: 1920, height: 1080 },
    ignoreHTTPSErrors: true,
    
    // Screenshots and videos for debugging
    screenshot: 'only-on-failure',
    video: 'retain-on-failure',
    trace: 'retain-on-failure',
    
    // Performance monitoring
    actionTimeout: 10000,
    navigationTimeout: 30000,
  },

  // Test projects for comprehensive browser coverage
  projects: [
    // Desktop browsers - Primary gaming platforms
    {
      name: 'chromium-desktop',
      use: { 
        ...devices['Desktop Chrome'],
        viewport: { width: 1920, height: 1080 },
        // Enable console monitoring for mahjong game debugging
        launchOptions: {
          args: ['--enable-logging', '--v=1']
        }
      },
    },
    {
      name: 'firefox-desktop', 
      use: { 
        ...devices['Desktop Firefox'],
        viewport: { width: 1920, height: 1080 }
      },
    },
    {
      name: 'webkit-desktop',
      use: { 
        ...devices['Desktop Safari'],
        viewport: { width: 1920, height: 1080 }
      },
    },
    
    // Mobile devices - Touch interaction testing
    {
      name: 'mobile-chrome',
      use: { 
        ...devices['Pixel 5'],
        // Mobile-specific mahjong interactions
        hasTouch: true,
        isMobile: true,
      },
    },
    {
      name: 'mobile-safari',
      use: { 
        ...devices['iPhone 12'],
        hasTouch: true,
        isMobile: true,
      },
    },
    
    // Tablet devices - Optimal mahjong experience
    {
      name: 'tablet-chrome',
      use: {
        ...devices['Galaxy Tab S4'],
        hasTouch: true,
      },
    },
    {
      name: 'tablet-safari',
      use: {
        ...devices['iPad Pro'],
        hasTouch: true,
      },
    },
    
    // High-DPI displays for tile rendering
    {
      name: 'high-dpi-display',
      use: {
        ...devices['Desktop Chrome HiDPI'],
        viewport: { width: 2560, height: 1440 },
        deviceScaleFactor: 2,
      },
    },
    
    // Accessibility testing
    {
      name: 'accessibility',
      use: {
        ...devices['Desktop Chrome']
      },
    },
  ],

  // Development server configuration
  webServer: {
    command: 'npm run dev',
    url: 'http://localhost:3000',
    reuseExistingServer: !process.env.CI,
    timeout: 120000,
    env: {
      NODE_ENV: 'test'
    }
  },
  
  // Global setup and teardown
  globalSetup: require.resolve('./tests/global-setup.ts'),
  globalTeardown: require.resolve('./tests/global-teardown.ts'),
});