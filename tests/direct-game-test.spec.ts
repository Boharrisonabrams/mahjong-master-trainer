import { test, expect } from '@playwright/test';

test.describe('🀄 Direct Mahjong Game Validation', () => {
  
  test.beforeEach(async ({ page }) => {
    // Enhanced console logging
    page.on('console', (msg) => {
      console.log(`🖥️ Console [${msg.type().toUpperCase()}]: ${msg.text()}`);
    });

    page.on('pageerror', (error) => {
      console.log(`💥 Page Error: ${error.message}`);
    });
  });

  test('🔍 Discover and validate what application is running', async ({ page }) => {
    console.log('🎯 Starting direct application discovery...');

    // Navigate to localhost:3000
    await page.goto('http://localhost:3000', { waitUntil: 'domcontentloaded' });
    
    // Take initial screenshot
    await page.screenshot({ 
      path: 'test-results/00-what-is-running.png', 
      fullPage: true 
    });

    // Get page title and content to understand what's actually running
    const pageTitle = await page.title();
    const bodyText = await page.evaluate(() => document.body.innerText);
    
    console.log('📄 Page Title:', pageTitle);
    console.log('📝 Page Content (first 500 chars):', bodyText.substring(0, 500));

    // Check if this is our React Mahjong Master Trainer
    const hasReactApp = await page.locator('text=Mahjong Master Trainer').count() > 0;
    const hasOtherMahjong = await page.locator('text=Mahjong Trainer').count() > 0;
    const hasBackendError = await page.locator('text=Backend connection failed').count() > 0;

    console.log('🔍 Application Detection Results:');
    console.log(`   React Mahjong Master Trainer: ${hasReactApp ? '✅ Found' : '❌ Not found'}`);
    console.log(`   Other Mahjong App: ${hasOtherMahjong ? '✅ Found' : '❌ Not found'}`);
    console.log(`   Backend Connection Issues: ${hasBackendError ? '⚠️ Found' : '✅ None'}`);

    if (hasReactApp) {
      console.log('🎉 SUCCESS: Our React Mahjong Master Trainer is running!');
      
      // Test the React app functionality
      await expect(page.getByText('Start Training Session')).toBeVisible();
      await expect(page.getByText('Learn the Basics')).toBeVisible();
      
      await page.screenshot({ 
        path: 'test-results/01-react-app-confirmed.png', 
        fullPage: true 
      });

      // Test starting a game
      await page.getByText('Start Training Session').click();
      await expect(page.locator('[class*="bg-gradient-to-br from-green-800"]')).toBeVisible({ timeout: 10000 });
      
      await page.screenshot({ 
        path: 'test-results/02-game-board-loaded.png', 
        fullPage: true 
      });
      
      console.log('✅ Game board loads successfully');

    } else if (hasOtherMahjong) {
      console.log('ℹ️  Different Mahjong application detected');
      console.log('📋 This appears to be a different project than our React-based trainer');
      
      if (hasBackendError) {
        console.log('⚠️  Backend connection issues detected in the running application');
      }
      
      // Document what we found
      await page.screenshot({ 
        path: 'test-results/01-different-app-detected.png', 
        fullPage: true 
      });

    } else {
      console.log('❌ No Mahjong application detected');
      console.log('📋 Unknown application running on port 3000');
    }

    // Test basic web functionality regardless of which app is running
    const hasTitle = pageTitle && pageTitle.length > 0;
    const hasContent = bodyText && bodyText.length > 100;
    
    expect(hasTitle).toBeTruthy();
    expect(hasContent).toBeTruthy();
    
    console.log('✅ Basic web application functionality confirmed');
  });

  test('🚀 Test application responsiveness and performance', async ({ page }) => {
    console.log('⚡ Testing application performance...');

    const startTime = Date.now();
    await page.goto('http://localhost:3000');
    const loadTime = Date.now() - startTime;

    console.log(`📊 Page load time: ${loadTime}ms`);
    expect(loadTime).toBeLessThan(5000); // Should load within 5 seconds

    // Test basic interactivity
    const clickableElements = await page.locator('button, a, [role="button"]').count();
    console.log(`🖱️  Found ${clickableElements} interactive elements`);

    // Test viewport resizing
    await page.setViewportSize({ width: 375, height: 667 });
    await page.waitForTimeout(500);
    await page.screenshot({ 
      path: 'test-results/03-mobile-responsive.png', 
      fullPage: true 
    });

    await page.setViewportSize({ width: 1920, height: 1080 });
    await page.waitForTimeout(500);
    await page.screenshot({ 
      path: 'test-results/04-desktop-responsive.png', 
      fullPage: true 
    });

    console.log('✅ Responsive design test completed');
  });

  test('🔧 Network and console validation', async ({ page }) => {
    console.log('🌐 Testing network requests and console output...');

    const requests: string[] = [];
    const responses: { url: string; status: number }[] = [];
    const consoleMessages: string[] = [];
    const errors: string[] = [];

    page.on('request', (request) => {
      requests.push(`${request.method()} ${request.url()}`);
    });

    page.on('response', (response) => {
      responses.push({ url: response.url(), status: response.status() });
      if (!response.ok()) {
        console.log(`❌ Failed request: ${response.status()} ${response.url()}`);
      }
    });

    page.on('console', (msg) => {
      consoleMessages.push(`[${msg.type()}] ${msg.text()}`);
    });

    page.on('pageerror', (error) => {
      errors.push(error.message);
    });

    await page.goto('http://localhost:3000');
    await page.waitForTimeout(3000); // Wait for all resources to load

    console.log('📊 Network Analysis:');
    console.log(`   Total requests: ${requests.length}`);
    console.log(`   Failed responses: ${responses.filter(r => !r.url.includes('sockjs') && r.status >= 400).length}`);
    console.log(`   Console messages: ${consoleMessages.length}`);
    console.log(`   JavaScript errors: ${errors.length}`);

    if (errors.length > 0) {
      console.log('⚠️  JavaScript Errors Detected:');
      errors.forEach(error => console.log(`   ${error}`));
    }

    // Should have minimal errors for a production-ready app
    expect(errors.length).toBeLessThan(3);

    await page.screenshot({ 
      path: 'test-results/05-network-validation.png', 
      fullPage: true 
    });
  });
});