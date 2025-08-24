import { test, expect } from '@playwright/test';
import { GameBoardPage } from '../page-objects/GameBoard';
import fs from 'fs';

test.describe('Performance & Responsiveness - Premium Gaming Experience', () => {
  let gamePage: GameBoardPage;
  
  test.beforeEach(async ({ page }) => {
    gamePage = new GameBoardPage(page);
  });

  test('Page load performance - First contentful paint', async ({ page }) => {
    const startTime = Date.now();
    
    // Start performance monitoring
    await page.addInitScript(() => {
      window.performance.mark('test-start');
    });
    
    await gamePage.goto();
    
    const loadTime = Date.now() - startTime;
    
    // Get Core Web Vitals
    const metrics = await page.evaluate(() => {
      return new Promise((resolve) => {
        new PerformanceObserver((list) => {
          const entries = list.getEntries();
          const vitals: any = {};
          
          entries.forEach((entry) => {
            if (entry.name === 'first-contentful-paint') {
              vitals.fcp = entry.startTime;
            }
            if (entry.name === 'largest-contentful-paint') {
              vitals.lcp = entry.startTime;
            }
          });
          
          // Also get navigation timing
          const nav = performance.getEntriesByType('navigation')[0] as PerformanceNavigationTiming;
          vitals.domContentLoaded = nav.domContentLoadedEventEnd - nav.domContentLoadedEventStart;
          vitals.loadComplete = nav.loadEventEnd - nav.loadEventStart;
          
          resolve(vitals);
        }).observe({ entryTypes: ['paint', 'largest-contentful-paint'] });
        
        // Fallback timeout
        setTimeout(() => resolve({}), 5000);
      });
    });
    
    // Performance thresholds for premium gaming experience
    expect(loadTime).toBeLessThan(3000); // Page should load within 3 seconds
    
    console.log('Performance Metrics:', {
      totalLoadTime: loadTime,
      ...metrics
    });
    
    // Save performance data
    const perfData = {
      timestamp: new Date().toISOString(),
      testName: 'page-load-performance',
      metrics: {
        totalLoadTime: loadTime,
        ...metrics
      }
    };
    
    if (!fs.existsSync('test-results/performance-metrics')) {
      fs.mkdirSync('test-results/performance-metrics', { recursive: true });
    }
    
    fs.writeFileSync(
      `test-results/performance-metrics/page-load-${Date.now()}.json`,
      JSON.stringify(perfData, null, 2)
    );
  });

  test('Game initialization performance - Time to interactive', async ({ page }) => {
    const initStart = Date.now();
    
    await gamePage.goto();
    await gamePage.startNewGame();
    
    // Wait for game board to be fully interactive
    await expect(gamePage.gameBoard).toBeVisible();
    await expect(gamePage.analysisPanel).toBeVisible();
    await expect(gamePage.gamePhaseIndicator).toContainText('playing');
    
    const initTime = Date.now() - initStart;
    
    // Game should be ready within 5 seconds
    expect(initTime).toBeLessThan(5000);
    
    console.log(`Game initialization time: ${initTime}ms`);
    
    // Test immediate responsiveness
    const responseStart = Date.now();
    await gamePage.selectTile(0);
    const responseTime = Date.now() - responseStart;
    
    // Tile selection should be immediate (< 100ms)
    expect(responseTime).toBeLessThan(100);
    
    console.log(`Tile selection response time: ${responseTime}ms`);
  });

  test('Animation performance - Smooth 60fps transitions', async ({ page }) => {
    await gamePage.goto();
    await gamePage.startNewGame();
    
    // Monitor frame rate during animations
    await page.addInitScript(() => {
      let frameCount = 0;
      let lastTime = performance.now();
      
      function countFrames(currentTime: number) {
        frameCount++;
        
        if (currentTime - lastTime >= 1000) {
          (window as any).fps = Math.round((frameCount * 1000) / (currentTime - lastTime));
          frameCount = 0;
          lastTime = currentTime;
        }
        
        requestAnimationFrame(countFrames);
      }
      
      requestAnimationFrame(countFrames);
    });
    
    // Perform actions that trigger animations
    for (let i = 0; i < 5; i++) {
      await gamePage.selectTile(i);
      await page.waitForTimeout(200);
      
      const fps = await page.evaluate(() => (window as any).fps);
      if (fps) {
        console.log(`Animation FPS: ${fps}`);
        expect(fps).toBeGreaterThan(30); // Minimum acceptable frame rate
      }
    }
  });

  test('Memory usage - No leaks during extended gameplay', async ({ page }) => {
    await gamePage.goto();
    await gamePage.startNewGame();
    
    // Get baseline memory
    const baselineMemory = await page.evaluate(() => {
      const memory = (performance as any).memory;
      return memory ? {
        used: memory.usedJSHeapSize,
        total: memory.totalJSHeapSize,
        limit: memory.jsHeapSizeLimit
      } : null;
    });
    
    if (!baselineMemory) {
      test.skip('Memory API not available');
      return;
    }
    
    console.log('Baseline memory:', baselineMemory);
    
    // Simulate extended gameplay
    const memorySnapshots = [baselineMemory];
    
    for (let round = 0; round < 10; round++) {
      // Play several moves
      for (let move = 0; move < 3; move++) {
        if (await page.locator('[class*="animate-pulse"]').count() > 0) {
          await gamePage.selectTile(Math.floor(Math.random() * 5));
          await gamePage.discardSelectedTile();
          await gamePage.waitForAITurn();
        }
      }
      
      // Toggle analysis panel to create/destroy DOM elements
      await gamePage.toggleAnalysisPanel();
      await page.waitForTimeout(100);
      await gamePage.toggleAnalysisPanel();
      
      // Take memory snapshot
      const currentMemory = await page.evaluate(() => {
        const memory = (performance as any).memory;
        return memory ? {
          used: memory.usedJSHeapSize,
          total: memory.totalJSHeapSize,
          limit: memory.jsHeapSizeLimit
        } : null;
      });
      
      if (currentMemory) {
        memorySnapshots.push(currentMemory);
        console.log(`Round ${round + 1} memory:`, currentMemory);
      }
      
      await page.waitForTimeout(500);
    }
    
    // Analyze memory growth
    const finalMemory = memorySnapshots[memorySnapshots.length - 1];
    const memoryGrowth = finalMemory.used - baselineMemory.used;
    const memoryGrowthMB = memoryGrowth / 1024 / 1024;
    
    console.log(`Total memory growth: ${memoryGrowthMB.toFixed(2)}MB`);
    
    // Memory growth should be reasonable (< 20MB for extended session)
    expect(memoryGrowthMB).toBeLessThan(20);
    
    // Save memory profile
    const memoryData = {
      timestamp: new Date().toISOString(),
      testName: 'memory-usage-extended-gameplay',
      snapshots: memorySnapshots,
      totalGrowthMB: memoryGrowthMB
    };
    
    if (!fs.existsSync('test-results/performance-metrics')) {
      fs.mkdirSync('test-results/performance-metrics', { recursive: true });
    }
    
    fs.writeFileSync(
      `test-results/performance-metrics/memory-profile-${Date.now()}.json`,
      JSON.stringify(memoryData, null, 2)
    );
  });

  test('Network performance - Efficient resource loading', async ({ page }) => {
    const requests: any[] = [];
    
    // Monitor all network requests
    page.on('request', (request) => {
      requests.push({
        url: request.url(),
        method: request.method(),
        resourceType: request.resourceType(),
        timestamp: Date.now()
      });
    });
    
    const responses: any[] = [];
    page.on('response', (response) => {
      responses.push({
        url: response.url(),
        status: response.status(),
        size: response.headers()['content-length'] || 0,
        timestamp: Date.now()
      });
    });
    
    await gamePage.goto();
    await gamePage.startNewGame();
    
    // Wait for all resources to load
    await page.waitForLoadState('networkidle');
    
    // Analyze network performance
    const totalRequests = requests.length;
    const failedRequests = responses.filter(r => r.status >= 400).length;
    const totalSize = responses.reduce((sum, r) => sum + parseInt(r.size || '0'), 0);
    
    console.log('Network Performance:', {
      totalRequests,
      failedRequests,
      totalSizeMB: (totalSize / 1024 / 1024).toFixed(2)
    });
    
    // Performance expectations for premium gaming
    expect(failedRequests).toBe(0); // No failed requests
    expect(totalSize).toBeLessThan(10 * 1024 * 1024); // Less than 10MB total
    expect(totalRequests).toBeLessThan(50); // Reasonable number of requests
    
    // Save network data
    const networkData = {
      timestamp: new Date().toISOString(),
      testName: 'network-performance',
      metrics: {
        totalRequests,
        failedRequests,
        totalSizeBytes: totalSize,
        requests: requests.slice(0, 10), // Sample of requests
        responses: responses.slice(0, 10) // Sample of responses
      }
    };
    
    if (!fs.existsSync('test-results/performance-metrics')) {
      fs.mkdirSync('test-results/performance-metrics', { recursive: true });
    }
    
    fs.writeFileSync(
      `test-results/performance-metrics/network-${Date.now()}.json`,
      JSON.stringify(networkData, null, 2)
    );
  });

  test('Rapid interaction performance - Gaming responsiveness', async ({ page }) => {
    await gamePage.goto();
    await gamePage.startNewGame();
    
    const interactionTimes: number[] = [];
    
    // Test rapid tile selections
    for (let i = 0; i < 10; i++) {
      const startTime = performance.now();
      
      await gamePage.selectTile(i % 5); // Cycle through first 5 tiles
      
      const endTime = performance.now();
      const responseTime = endTime - startTime;
      
      interactionTimes.push(responseTime);
      
      await page.waitForTimeout(50); // Brief pause between interactions
    }
    
    // Analyze response times
    const avgResponseTime = interactionTimes.reduce((a, b) => a + b, 0) / interactionTimes.length;
    const maxResponseTime = Math.max(...interactionTimes);
    const minResponseTime = Math.min(...interactionTimes);
    
    console.log('Interaction Performance:', {
      average: `${avgResponseTime.toFixed(2)}ms`,
      max: `${maxResponseTime.toFixed(2)}ms`,
      min: `${minResponseTime.toFixed(2)}ms`
    });
    
    // Gaming-grade responsiveness expectations
    expect(avgResponseTime).toBeLessThan(50); // Average under 50ms
    expect(maxResponseTime).toBeLessThan(100); // No interaction over 100ms
    
    // Test UI update performance during rapid interactions
    const analysisUpdateStart = performance.now();
    await gamePage.toggleAnalysisPanel();
    await gamePage.toggleAnalysisPanel();
    const analysisUpdateTime = performance.now() - analysisUpdateStart;
    
    expect(analysisUpdateTime).toBeLessThan(200); // UI updates under 200ms
    
    console.log(`Analysis panel toggle time: ${analysisUpdateTime.toFixed(2)}ms`);
  });

  test('CPU usage - Efficient processing', async ({ page }) => {
    await gamePage.goto();
    await gamePage.startNewGame();
    
    // Monitor CPU-intensive operations
    const cpuStart = Date.now();
    
    // Perform CPU-intensive game actions
    for (let i = 0; i < 5; i++) {
      if (await page.locator('[class*="animate-pulse"]').count() > 0) {
        await gamePage.selectTile(i);
        await gamePage.discardSelectedTile();
        
        // Wait for AI processing (CPU intensive)
        await gamePage.waitForAITurn();
        
        // Force re-render by toggling analysis
        await gamePage.toggleAnalysisPanel();
        await page.waitForTimeout(100);
        await gamePage.toggleAnalysisPanel();
      }
    }
    
    const cpuTime = Date.now() - cpuStart;
    
    console.log(`CPU-intensive operations completed in: ${cpuTime}ms`);
    
    // Should complete complex game operations efficiently
    expect(cpuTime).toBeLessThan(10000); // Under 10 seconds for 5 turns
    
    // Verify the game remains responsive after CPU-intensive operations
    const responsiveStart = Date.now();
    await gamePage.selectTile(0);
    const responsiveTime = Date.now() - responsiveStart;
    
    expect(responsiveTime).toBeLessThan(100); // Still responsive after CPU work
  });

  test('Viewport resize performance - Responsive gaming', async ({ page }) => {
    await gamePage.goto();
    await gamePage.startNewGame();
    
    const resizeSizes = [
      { width: 1920, height: 1080 },
      { width: 1366, height: 768 },
      { width: 768, height: 1024 },
      { width: 375, height: 667 },
      { width: 2560, height: 1440 }
    ];
    
    const resizeTimes: number[] = [];
    
    for (const size of resizeSizes) {
      const resizeStart = Date.now();
      
      await page.setViewportSize(size);
      
      // Wait for layout to stabilize
      await expect(gamePage.gameBoard).toBeVisible();
      await expect(gamePage.analysisPanel).toBeVisible();
      
      const resizeTime = Date.now() - resizeStart;
      resizeTimes.push(resizeTime);
      
      console.log(`Resize to ${size.width}x${size.height}: ${resizeTime}ms`);
      
      // Each resize should be smooth and fast
      expect(resizeTime).toBeLessThan(1000);
      
      await page.waitForTimeout(200); // Brief pause between resizes
    }
    
    const avgResizeTime = resizeTimes.reduce((a, b) => a + b, 0) / resizeTimes.length;
    console.log(`Average resize time: ${avgResizeTime.toFixed(2)}ms`);
    
    // Overall resize performance should be excellent
    expect(avgResizeTime).toBeLessThan(500);
  });

  test('Bundle size optimization - Fast downloads', async ({ page }) => {
    const bundleRequests: any[] = [];
    
    page.on('response', (response) => {
      const url = response.url();
      if (url.includes('.js') || url.includes('.css')) {
        bundleRequests.push({
          url,
          size: parseInt(response.headers()['content-length'] || '0'),
          compressed: response.headers()['content-encoding'] === 'gzip'
        });
      }
    });
    
    await gamePage.goto();
    
    // Wait for all bundles to load
    await page.waitForLoadState('networkidle');
    
    const totalBundleSize = bundleRequests.reduce((sum, req) => sum + req.size, 0);
    const compressedBundles = bundleRequests.filter(req => req.compressed).length;
    
    console.log('Bundle Analysis:', {
      totalBundles: bundleRequests.length,
      totalSizeKB: (totalBundleSize / 1024).toFixed(2),
      compressedBundles,
      compressionRate: `${((compressedBundles / bundleRequests.length) * 100).toFixed(1)}%`
    });
    
    // Production optimization expectations
    expect(totalBundleSize).toBeLessThan(2 * 1024 * 1024); // Under 2MB total
    expect(compressedBundles / bundleRequests.length).toBeGreaterThan(0.8); // 80%+ compression
    
    // Individual bundle size limits
    bundleRequests.forEach(bundle => {
      expect(bundle.size).toBeLessThan(1024 * 1024); // No single bundle over 1MB
    });
  });
});