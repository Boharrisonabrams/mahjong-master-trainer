import { test, expect, devices } from '@playwright/test';
import { GameBoardPage } from '../page-objects/GameBoard';

test.describe('Cross-Browser Gaming Experience - Universal Compatibility', () => {
  let gamePage: GameBoardPage;
  
  test.beforeEach(async ({ page }) => {
    gamePage = new GameBoardPage(page);
  });

  test('Mahjong tile Unicode rendering - All browsers', async ({ page, browserName }) => {
    await gamePage.goto();
    await gamePage.startNewGame();
    
    // Test Unicode tile rendering across browsers
    const tileTypes = [
      { regex: /[🀙🀚🀛]/, name: 'Dots (Pin)', suit: 'pin' },
      { regex: /[🀐🀑🀒]/, name: 'Bamboo (Sou)', suit: 'sou' }, 
      { regex: /[🀇🀈🀉]/, name: 'Characters (Man)', suit: 'man' },
      { regex: /[🀀🀁🀂🀃]/, name: 'Winds', suit: 'honor' },
      { regex: /[🀄🀅🀆]/, name: 'Dragons', suit: 'honor' }
    ];
    
    for (const tileType of tileTypes) {
      const tiles = page.locator('[class*="text-lg"]').filter({ hasText: tileType.regex });
      const tileCount = await tiles.count();
      
      console.log(`${browserName}: ${tileType.name} tiles found: ${tileCount}`);
      
      if (tileCount > 0) {
        // Test first few tiles for proper rendering
        for (let i = 0; i < Math.min(3, tileCount); i++) {
          const tile = tiles.nth(i);
          
          // Verify tile is visible
          await expect(tile).toBeVisible();
          
          // Verify tile has proper styling
          await expect(tile).toHaveClass(/text-lg/);
          
          // Check if tile text is not empty or garbled
          const tileText = await tile.textContent();
          expect(tileText).toBeTruthy();
          expect(tileText?.length).toBeGreaterThan(0);
        }
      }
    }
    
    // Browser-specific font rendering check
    const firstTile = page.locator('[class*="text-lg"]').filter({ 
      hasText: /[🀙🀚🀛🀐🀑🀒🀇🀈🀉🀀🀁🀂🀃🀄🀅🀆]/ 
    }).first();
    
    if (await firstTile.count() > 0) {
      const tileStyles = await firstTile.evaluate((el) => {
        const computed = getComputedStyle(el);
        return {
          fontSize: computed.fontSize,
          fontFamily: computed.fontFamily,
          color: computed.color,
          display: computed.display
        };
      });
      
      console.log(`${browserName} tile styles:`, tileStyles);
      
      // Verify proper font rendering
      expect(tileStyles.fontSize).toBeTruthy();
      expect(tileStyles.display).not.toBe('none');
    }
  });

  test('Game mechanics consistency - Cross-browser behavior', async ({ page, browserName }) => {
    await gamePage.goto();
    await gamePage.startNewGame();
    
    // Test game state consistency
    const initialState = await gamePage.captureGameState();
    console.log(`${browserName} initial state:`, initialState);
    
    // Verify analysis panel metrics are properly calculated
    const metrics = await gamePage.getAnalysisPanelMetrics();
    
    expect(metrics.efficiency).toBeGreaterThanOrEqual(0);
    expect(metrics.efficiency).toBeLessThanOrEqual(100);
    expect(metrics.safety).toBeGreaterThanOrEqual(0);
    expect(metrics.safety).toBeLessThanOrEqual(100);
    expect(metrics.winProbability).toBeGreaterThanOrEqual(0);
    expect(metrics.winProbability).toBeLessThanOrEqual(100);
    
    console.log(`${browserName} metrics:`, metrics);
    
    // Test tile interaction consistency
    await gamePage.selectTile(0);
    
    // Verify selection visual feedback works across browsers
    const selectedTile = page.locator('[class*="border-blue-500"]').first();
    await expect(selectedTile).toBeVisible();
    await expect(selectedTile).toHaveClass(/-translate-y-2/);
    
    await gamePage.discardSelectedTile();
    
    // Wait for AI turn and verify consistency
    await gamePage.waitForAITurn();
    
    const postMoveState = await gamePage.captureGameState();
    console.log(`${browserName} post-move state:`, postMoveState);
    
    // Game should progress consistently across browsers
    expect(postMoveState.phase).toBeTruthy();
  });

  test('Touch interaction - Mobile browser compatibility', async ({ page, browserName }) => {
    // This test focuses on browsers that support touch
    const isTouchDevice = await page.evaluate(() => 'ontouchstart' in window);
    
    if (!isTouchDevice) {
      test.skip('Touch events not supported in this browser configuration');
      return;
    }
    
    await gamePage.goto();
    await gamePage.startNewGame();
    
    // Test touch tile selection
    const firstTile = page.locator('[class*="w-12 h-16"]').first();
    
    // Simulate touch events
    await firstTile.dispatchEvent('touchstart');
    await firstTile.dispatchEvent('touchend');
    
    // Verify touch selection works
    await expect(firstTile).toHaveClass(/border-blue-500/);
    
    // Test touch discard
    const discardButton = page.getByText('Discard Tile');
    await discardButton.dispatchEvent('touchstart');
    await discardButton.dispatchEvent('touchend');
    
    console.log(`${browserName}: Touch interactions successful`);
  });

  test('CSS feature support - Modern web standards', async ({ page, browserName }) => {
    await gamePage.goto();
    await gamePage.startNewGame();
    
    // Test CSS Grid support (used in tile layouts)
    const cssSupport = await page.evaluate(() => {
      return {
        grid: CSS.supports('display', 'grid'),
        flexbox: CSS.supports('display', 'flex'),
        gradients: CSS.supports('background', 'linear-gradient(red, blue)'),
        transforms: CSS.supports('transform', 'translateY(-0.5rem)'),
        transitions: CSS.supports('transition', 'all 0.2s'),
        borderRadius: CSS.supports('border-radius', '0.5rem'),
        boxShadow: CSS.supports('box-shadow', '0 0 10px rgba(0,0,0,0.1)')
      };
    });
    
    console.log(`${browserName} CSS support:`, cssSupport);
    
    // Essential features for premium gaming UI
    expect(cssSupport.grid).toBe(true);
    expect(cssSupport.flexbox).toBe(true);
    expect(cssSupport.transforms).toBe(true);
    expect(cssSupport.transitions).toBe(true);
    
    // Test layout integrity with modern CSS
    await expect(gamePage.gameBoard).toBeVisible();
    await expect(gamePage.analysisPanel).toBeVisible();
    
    // Check that gradients are working (game board background)
    const boardStyles = await gamePage.gameBoard.evaluate((el) => {
      return getComputedStyle(el).background;
    });
    
    console.log(`${browserName} board background:`, boardStyles);
  });

  test('JavaScript API compatibility - Gaming features', async ({ page, browserName }) => {
    await gamePage.goto();
    
    // Test required JavaScript APIs
    const apiSupport = await page.evaluate(() => {
      return {
        fetch: typeof fetch !== 'undefined',
        promise: typeof Promise !== 'undefined',
        requestAnimationFrame: typeof requestAnimationFrame !== 'undefined',
        localStorage: typeof localStorage !== 'undefined',
        sessionStorage: typeof sessionStorage !== 'undefined',
        webGL: !!document.createElement('canvas').getContext('webgl'),
        webGL2: !!document.createElement('canvas').getContext('webgl2'),
        indexedDB: typeof indexedDB !== 'undefined',
        performance: typeof performance !== 'undefined',
        intersection: typeof IntersectionObserver !== 'undefined'
      };
    });
    
    console.log(`${browserName} API support:`, apiSupport);
    
    // Essential APIs for modern gaming
    expect(apiSupport.fetch).toBe(true);
    expect(apiSupport.promise).toBe(true);
    expect(apiSupport.requestAnimationFrame).toBe(true);
    expect(apiSupport.localStorage).toBe(true);
    expect(apiSupport.performance).toBe(true);
    
    // Test game initialization with these APIs
    await gamePage.startNewGame();
    await expect(gamePage.gameBoard).toBeVisible();
  });

  test('Performance consistency - Cross-browser gaming', async ({ page, browserName }) => {
    const performanceStart = Date.now();
    
    await gamePage.goto();
    await gamePage.startNewGame();
    
    const initTime = Date.now() - performanceStart;
    
    // Test initial load performance across browsers
    console.log(`${browserName} initialization time: ${initTime}ms`);
    expect(initTime).toBeLessThan(5000); // Should be fast on all browsers
    
    // Test interaction performance
    const interactionStart = Date.now();
    await gamePage.selectTile(0);
    const interactionTime = Date.now() - interactionStart;
    
    console.log(`${browserName} interaction time: ${interactionTime}ms`);
    expect(interactionTime).toBeLessThan(100); // Should be responsive
    
    // Test AI processing consistency
    const aiStart = Date.now();
    await gamePage.discardSelectedTile();
    await gamePage.waitForAITurn();
    const aiTime = Date.now() - aiStart;
    
    console.log(`${browserName} AI turn time: ${aiTime}ms`);
    expect(aiTime).toBeLessThan(3000); // AI should be responsive
  });

  test('Console error monitoring - Error-free gaming', async ({ page, browserName }) => {
    const consoleErrors: string[] = [];
    const consoleWarnings: string[] = [];
    
    page.on('console', (msg) => {
      if (msg.type() === 'error') {
        consoleErrors.push(msg.text());
      } else if (msg.type() === 'warning') {
        consoleWarnings.push(msg.text());
      }
    });
    
    page.on('pageerror', (error) => {
      consoleErrors.push(`Page Error: ${error.message}`);
    });
    
    await gamePage.goto();
    await gamePage.startNewGame();
    
    // Perform typical gaming interactions
    if (await page.locator('[class*="animate-pulse"]').count() > 0) {
      await gamePage.selectTile(0);
      await gamePage.discardSelectedTile();
      await gamePage.waitForAITurn();
    }
    
    await gamePage.toggleAnalysisPanel();
    await gamePage.toggleAnalysisPanel();
    
    // Check for browser-specific errors
    console.log(`${browserName} console errors:`, consoleErrors);
    console.log(`${browserName} console warnings:`, consoleWarnings);
    
    // Should have minimal errors/warnings for premium experience
    expect(consoleErrors.length).toBe(0);
    expect(consoleWarnings.length).toBeLessThan(3); // Some warnings may be unavoidable
  });

  test('Network request handling - Cross-browser networking', async ({ page, browserName }) => {
    const networkErrors: string[] = [];
    const slowRequests: any[] = [];
    
    page.on('requestfailed', (request) => {
      networkErrors.push(`Failed: ${request.method()} ${request.url()}`);
    });
    
    page.on('response', (response) => {
      // Monitor slow responses
      if (response.request().timing().responseEnd > 2000) {
        slowRequests.push({
          url: response.url(),
          status: response.status(),
          timing: response.request().timing()
        });
      }
    });
    
    await gamePage.goto();
    await gamePage.startNewGame();
    
    // Wait for all network activity to settle
    await page.waitForLoadState('networkidle');
    
    console.log(`${browserName} network errors:`, networkErrors);
    console.log(`${browserName} slow requests:`, slowRequests);
    
    // Should have clean network behavior
    expect(networkErrors.length).toBe(0);
    expect(slowRequests.length).toBeLessThan(2); // Minimal slow requests
  });

  test('Storage API consistency - Game state persistence', async ({ page, browserName }) => {
    await gamePage.goto();
    
    // Test localStorage functionality
    await page.evaluate(() => {
      localStorage.setItem('mahjong-test', JSON.stringify({
        testData: 'cross-browser-test',
        timestamp: Date.now()
      }));
    });
    
    const storedData = await page.evaluate(() => {
      return JSON.parse(localStorage.getItem('mahjong-test') || '{}');
    });
    
    expect(storedData.testData).toBe('cross-browser-test');
    console.log(`${browserName} localStorage working:`, !!storedData.timestamp);
    
    // Clean up
    await page.evaluate(() => {
      localStorage.removeItem('mahjong-test');
    });
  });

  test('Accessibility features - Universal gaming', async ({ page, browserName }) => {
    await gamePage.goto();
    
    // Test keyboard navigation
    await page.keyboard.press('Tab');
    let focusedElement = await page.evaluate(() => document.activeElement?.tagName);
    console.log(`${browserName} first tab focus:`, focusedElement);
    
    // Should be able to navigate to interactive elements
    expect(focusedElement).toBeTruthy();
    
    // Test with reduced motion preference
    await page.emulateMedia({ reducedMotion: 'reduce' });
    await gamePage.startNewGame();
    
    await expect(gamePage.gameBoard).toBeVisible();
    console.log(`${browserName}: Reduced motion compatibility verified`);
    
    // Test high contrast mode
    await page.emulateMedia({ forcedColors: 'active' });
    await page.reload();
    await gamePage.startNewGame();
    
    await expect(gamePage.gameBoard).toBeVisible();
    console.log(`${browserName}: High contrast compatibility verified`);
  });

  test('Font loading and fallbacks - Typography consistency', async ({ page, browserName }) => {
    await gamePage.goto();
    await gamePage.startNewGame();
    
    // Check font loading
    const fontData = await page.evaluate(() => {
      const element = document.querySelector('[class*="font-mono"]');
      if (element) {
        const styles = getComputedStyle(element);
        return {
          fontFamily: styles.fontFamily,
          fontSize: styles.fontSize,
          fontWeight: styles.fontWeight,
          lineHeight: styles.lineHeight
        };
      }
      return null;
    });
    
    console.log(`${browserName} font data:`, fontData);
    
    if (fontData) {
      expect(fontData.fontFamily).toBeTruthy();
      expect(fontData.fontSize).toBeTruthy();
    }
    
    // Test Unicode character support specifically
    const unicodeSupport = await page.evaluate(() => {
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      if (!ctx) return false;
      
      ctx.font = '16px system-ui';
      const metrics1 = ctx.measureText('🀄');
      const metrics2 = ctx.measureText('□');
      
      // If mahjong tile renders differently than generic square, Unicode is supported
      return metrics1.width !== metrics2.width;
    });
    
    console.log(`${browserName} Unicode support:`, unicodeSupport);
  });
});