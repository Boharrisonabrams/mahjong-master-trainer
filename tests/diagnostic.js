const { chromium } = require('playwright');

(async () => {
  console.log('🔍 Diagnosing Mahjong Trainer...');
  
  const browser = await chromium.launch({ headless: false });
  const page = await browser.newPage();
  
  try {
    console.log('📡 Navigating to localhost:3000...');
    await page.goto('http://localhost:3000', { timeout: 10000 });
    
    console.log('⏳ Waiting for page to load...');
    await page.waitForLoadState('domcontentloaded');
    
    console.log('📄 Page title:', await page.title());
    
    // Check what's actually on the page
    const bodyContent = await page.evaluate(() => document.body.innerText);
    console.log('📝 Page content preview:', bodyContent.substring(0, 500));
    
    // Check for specific elements
    const hasTitle = await page.locator('text=Mahjong Master Trainer').count();
    console.log('🎯 "Mahjong Master Trainer" found:', hasTitle > 0);
    
    if (hasTitle === 0) {
      // Check for React errors
      const reactErrors = await page.locator('[data-nextjs-dialog]').count();
      console.log('⚠️ React error dialogs:', reactErrors);
      
      // Check console errors
      const consoleErrors = [];
      page.on('console', msg => {
        if (msg.type() === 'error') {
          consoleErrors.push(msg.text());
        }
      });
      
      await page.waitForTimeout(2000);
      console.log('🚨 Console errors:', consoleErrors);
      
      // Take a screenshot for debugging
      await page.screenshot({ path: 'debug-screenshot.png' });
      console.log('📸 Screenshot saved as debug-screenshot.png');
    }
    
  } catch (error) {
    console.error('❌ Diagnostic failed:', error.message);
  }
  
  await browser.close();
  console.log('🏁 Diagnostic complete');
})();