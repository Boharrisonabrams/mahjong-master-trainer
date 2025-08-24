import { chromium, FullConfig } from '@playwright/test';

async function globalSetup(config: FullConfig) {
  console.log('🀄 Setting up Mahjong Trainer Premium Testing Suite');
  
  // Ensure the application is ready for testing
  const browser = await chromium.launch();
  const page = await browser.newPage();
  
  try {
    await page.goto(config.projects[0].use?.baseURL || 'http://localhost:3000');
    await page.waitForSelector('text=Mahjong Master Trainer', { timeout: 30000 });
    console.log('✅ Application is ready for testing');
  } catch (error) {
    console.error('❌ Failed to connect to application:', error);
    throw error;
  } finally {
    await browser.close();
  }
  
  // Create test data directories
  const fs = require('fs');
  const testDirs = [
    'test-results/visual-regression',
    'test-results/performance-metrics', 
    'test-results/game-states',
    'test-results/screenshots'
  ];
  
  testDirs.forEach(dir => {
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
  });
  
  console.log('🎮 Test environment ready for premium gaming experience validation');
}

export default globalSetup;