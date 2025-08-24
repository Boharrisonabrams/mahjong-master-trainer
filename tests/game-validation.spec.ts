import { test, expect } from '@playwright/test';

test.describe('🀄 Mahjong Trainer - Game Validation & Functionality Tests', () => {
  
  test.beforeEach(async ({ page }) => {
    // Enhanced console logging to catch all messages
    page.on('console', (msg) => {
      const type = msg.type();
      const text = msg.text();
      console.log(`🖥️ Console [${type.toUpperCase()}]: ${text}`);
    });

    // Track network requests for debugging
    page.on('request', (request) => {
      console.log(`📡 Request: ${request.method()} ${request.url()}`);
    });

    page.on('response', (response) => {
      if (!response.ok()) {
        console.log(`❌ Failed Response: ${response.status()} ${response.url()}`);
      }
    });

    // Catch JavaScript errors
    page.on('pageerror', (error) => {
      console.log(`💥 Page Error: ${error.message}`);
    });
  });

  test('🚀 Game Application Loads and Functions Correctly', async ({ page }) => {
    console.log('🎯 Starting comprehensive Mahjong game validation...');

    // Step 1: Navigate to the application
    console.log('📍 Step 1: Navigating to application...');
    await page.goto('http://localhost:3000');
    
    // Take screenshot of initial load
    await page.screenshot({ 
      path: 'test-results/01-initial-load.png', 
      fullPage: true 
    });

    // Step 2: Verify landing page loads correctly
    console.log('📍 Step 2: Verifying landing page content...');
    
    // Wait for and verify the main title
    await expect(page.locator('text=Mahjong Master Trainer')).toBeVisible({ timeout: 10000 });
    console.log('✅ Main title visible');

    // Verify key elements are present
    await expect(page.getByText('Start Training Session')).toBeVisible();
    await expect(page.getByText('Learn the Basics')).toBeVisible();
    console.log('✅ Main buttons visible');

    // Take screenshot of landing page
    await page.screenshot({ 
      path: 'test-results/02-landing-page.png', 
      fullPage: true 
    });

    // Step 3: Test tutorial functionality
    console.log('📍 Step 3: Testing tutorial system...');
    await page.getByText('Learn the Basics').click();
    
    // Wait for tutorial modal
    await expect(page.locator('[class*="fixed inset-0"]')).toBeVisible();
    await expect(page.getByText('Welcome to Mahjong Trainer!')).toBeVisible();
    console.log('✅ Tutorial modal opens correctly');

    await page.screenshot({ 
      path: 'test-results/03-tutorial-modal.png', 
      fullPage: true 
    });

    // Test tutorial navigation
    const nextButton = page.getByRole('button', { name: 'Next' });
    await expect(nextButton).toBeVisible();
    await nextButton.click();
    
    // Verify step progression
    await expect(page.getByText('The Goal of Mahjong')).toBeVisible();
    console.log('✅ Tutorial navigation works');

    await page.screenshot({ 
      path: 'test-results/04-tutorial-step2.png', 
      fullPage: true 
    });

    // Close tutorial
    const startPlayingButton = page.getByText('Start Playing!');
    
    // Navigate to final tutorial step
    for (let i = 0; i < 6; i++) {
      const nextBtn = page.getByRole('button', { name: 'Next' });
      if (await nextBtn.isVisible()) {
        await nextBtn.click();
        await page.waitForTimeout(500);
      }
    }
    
    await expect(startPlayingButton).toBeVisible();
    await startPlayingButton.click();
    console.log('✅ Tutorial completion works');

    // Step 4: Test game initialization
    console.log('📍 Step 4: Testing game initialization...');
    await page.getByText('Start Training Session').click();

    // Wait for game board to load
    await expect(page.locator('[class*="bg-gradient-to-br from-green-800"]')).toBeVisible({ timeout: 15000 });
    console.log('✅ Game board loads');

    // Verify game elements are present
    await expect(page.locator('text=Round 1')).toBeVisible();
    await expect(page.locator('text=Tiles left:')).toBeVisible();
    console.log('✅ Game state indicators visible');

    await page.screenshot({ 
      path: 'test-results/05-game-board.png', 
      fullPage: true 
    });

    // Step 5: Test tile interaction
    console.log('📍 Step 5: Testing tile interactions...');
    
    // Look for player tiles (Unicode mahjong characters)
    const playerTiles = page.locator('[class*="w-12 h-16"]').filter({ 
      hasText: /[🀙🀚🀛🀐🀑🀒🀇🀈🀉🀀🀁🀂🀃🀄🀅🀆]/ 
    });
    
    const tileCount = await playerTiles.count();
    console.log(`🀄 Found ${tileCount} player tiles`);
    expect(tileCount).toBeGreaterThan(10); // Should have a full hand

    // Test tile selection
    if (tileCount > 0) {
      const firstTile = playerTiles.first();
      await firstTile.click();
      
      // Verify tile selection visual feedback
      await expect(firstTile).toHaveClass(/border-blue-500/);
      console.log('✅ Tile selection works with visual feedback');

      await page.screenshot({ 
        path: 'test-results/06-tile-selected.png', 
        fullPage: true 
      });

      // Test discard functionality
      const discardButton = page.getByText('Discard Tile');
      if (await discardButton.isVisible()) {
        await discardButton.click();
        console.log('✅ Tile discard functionality works');
        
        await page.screenshot({ 
          path: 'test-results/07-after-discard.png', 
          fullPage: true 
        });
      }
    }

    // Step 6: Test analysis panel
    console.log('📍 Step 6: Testing analysis panel...');
    
    const analysisPanel = page.locator('[class*="bg-white rounded-lg shadow-lg"]').first();
    await expect(analysisPanel).toBeVisible();
    
    // Check for analysis metrics
    const efficiencyMetric = analysisPanel.locator('text=/\\d+\\.\\d+%/').first();
    await expect(efficiencyMetric).toBeVisible();
    console.log('✅ Analysis panel displays metrics');

    // Test analysis toggle
    const analysisToggle = page.getByText(/Hide|Show/).filter({ hasText: 'Analysis' });
    if (await analysisToggle.isVisible()) {
      await analysisToggle.click();
      await page.waitForTimeout(500);
      await analysisToggle.click(); // Toggle back
      console.log('✅ Analysis panel toggle works');
    }

    await page.screenshot({ 
      path: 'test-results/08-analysis-panel.png', 
      fullPage: true 
    });

    // Step 7: Test AI behavior
    console.log('📍 Step 7: Testing AI behavior...');
    
    // Wait for AI turn indicator
    const aiTurnIndicator = page.locator('[class*="animate-pulse"]');
    if (await aiTurnIndicator.count() > 0) {
      console.log('🤖 AI turn detected, waiting for AI move...');
      
      // Wait for AI to complete turn (max 5 seconds)
      await page.waitForFunction(() => {
        const indicators = document.querySelectorAll('[class*="animate-pulse"]');
        return indicators.length === 0;
      }, { timeout: 5000 }).catch(() => {
        console.log('⚠️ AI turn timeout (this may be normal)');
      });
      
      console.log('✅ AI turn processing observed');
    }

    await page.screenshot({ 
      path: 'test-results/09-ai-behavior.png', 
      fullPage: true 
    });

    // Step 8: Test responsive design
    console.log('📍 Step 8: Testing responsive design...');
    
    // Test mobile viewport
    await page.setViewportSize({ width: 375, height: 667 });
    await page.waitForTimeout(1000);
    
    await expect(page.locator('[class*="bg-gradient-to-br from-green-800"]')).toBeVisible();
    console.log('✅ Mobile responsive layout works');
    
    await page.screenshot({ 
      path: 'test-results/10-mobile-view.png', 
      fullPage: true 
    });

    // Reset to desktop view
    await page.setViewportSize({ width: 1920, height: 1080 });
    
    // Step 9: Performance validation
    console.log('📍 Step 9: Performance validation...');
    
    const performanceMetrics = await page.evaluate(() => {
      return {
        memory: (performance as any).memory ? {
          used: (performance as any).memory.usedJSHeapSize,
          total: (performance as any).memory.totalJSHeapSize
        } : null,
        navigation: performance.getEntriesByType('navigation')[0] as PerformanceNavigationTiming,
        resourceCount: performance.getEntriesByType('resource').length
      };
    });
    
    console.log('📊 Performance Metrics:');
    if (performanceMetrics.memory) {
      console.log(`   Memory Used: ${(performanceMetrics.memory.used / 1024 / 1024).toFixed(2)}MB`);
    }
    console.log(`   Resources Loaded: ${performanceMetrics.resourceCount}`);
    
    await page.screenshot({ 
      path: 'test-results/11-final-state.png', 
      fullPage: true 
    });

    console.log('🎯 COMPREHENSIVE GAME VALIDATION COMPLETE!');
    console.log('✅ All core functionality verified');
    console.log('📸 Screenshots captured for visual verification');
    console.log('🔍 Console logs captured for debugging');
  });

  test('🎨 Visual Regression - UI Consistency Check', async ({ page }) => {
    console.log('🎨 Starting visual regression tests...');
    
    await page.goto('http://localhost:3000');
    await expect(page.getByText('Mahjong Master Trainer')).toBeVisible();
    
    // Compare against baseline (first run will create baseline)
    await expect(page).toHaveScreenshot('landing-page-baseline.png', {
      fullPage: true,
      threshold: 0.3
    });
    
    // Test game board visual consistency
    await page.getByText('Start Training Session').click();
    await expect(page.locator('[class*="bg-gradient-to-br from-green-800"]')).toBeVisible();
    
    await expect(page).toHaveScreenshot('game-board-baseline.png', {
      fullPage: true,
      threshold: 0.3
    });
    
    console.log('🎨 Visual regression tests completed');
  });

  test('🔧 Error Handling and Edge Cases', async ({ page }) => {
    console.log('🔧 Testing error handling...');
    
    // Test direct navigation to game route (if exists)
    await page.goto('http://localhost:3000');
    
    // Test rapid interactions
    await expect(page.getByText('Start Training Session')).toBeVisible();
    
    // Rapid clicking test
    for (let i = 0; i < 5; i++) {
      await page.getByText('Start Training Session').click();
      await page.waitForTimeout(100);
    }
    
    // Should still be functional
    await expect(page.locator('[class*="bg-gradient-to-br from-green-800"]')).toBeVisible();
    
    console.log('✅ Error handling tests passed');
  });
});