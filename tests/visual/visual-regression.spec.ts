import { test, expect } from '@playwright/test';
import { GameBoardPage } from '../page-objects/GameBoard';

test.describe('Visual Regression - UI Polish & Premium Gaming Experience', () => {
  let gamePage: GameBoardPage;
  
  test.beforeEach(async ({ page }) => {
    gamePage = new GameBoardPage(page);
    await gamePage.goto();
  });

  test('Landing page - Premium visual design', async ({ page }) => {
    // Verify premium landing page design
    await expect(page).toHaveScreenshot('landing-page-full.png');
    
    // Test individual components
    const heroSection = page.locator('[class*="text-center mb-8"]');
    await expect(heroSection).toHaveScreenshot('landing-hero.png');
    
    const featureGrid = page.locator('[class*="grid md:grid-cols-2 gap-6"]');
    await expect(featureGrid).toHaveScreenshot('landing-features.png');
    
    const ctaButtons = page.locator('[class*="space-y-4"]');
    await expect(ctaButtons).toHaveScreenshot('landing-cta-buttons.png');
  });

  test('Tutorial modal - Educational interface polish', async ({ page }) => {
    await gamePage.openTutorial();
    
    // Test tutorial modal design across all steps
    for (let step = 0; step < 8; step++) {
      await expect(page.locator('[class*="fixed inset-0"]')).toHaveScreenshot(`tutorial-step-${step + 1}.png`);
      
      if (step < 7) {
        await gamePage.tutorialNextButton.click();
        await page.waitForTimeout(500);
      }
    }
  });

  test('Game board - Authentic mahjong table aesthetic', async ({ page }) => {
    await gamePage.startNewGame();
    
    // Full game board visual
    await expect(page).toHaveScreenshot('game-board-full.png');
    
    // Individual game board components
    await expect(gamePage.gameBoard).toHaveScreenshot('mahjong-table.png');
    await expect(gamePage.centerArea).toHaveScreenshot('center-area.png');
    await expect(gamePage.analysisPanel).toHaveScreenshot('analysis-panel.png');
    
    // Player hand areas (test positioning)
    const playerAreas = page.locator('[class*="absolute"]').filter({ hasText: 'Player' });
    for (let i = 0; i < await playerAreas.count(); i++) {
      await expect(playerAreas.nth(i)).toHaveScreenshot(`player-area-${i + 1}.png`);
    }
  });

  test('Tile rendering - Unicode consistency across browsers', async ({ page, browserName }) => {
    await gamePage.startNewGame();
    
    // Test tile rendering for different suits
    const tiles = page.locator('[class*="text-lg"]').filter({ 
      hasText: /[🀙🀚🀛🀐🀑🀒🀇🀈🀉🀀🀁🀂🀃🀄🀅🀆]/ 
    });
    
    // Capture tiles for browser-specific comparison
    for (let i = 0; i < Math.min(10, await tiles.count()); i++) {
      await expect(tiles.nth(i)).toHaveScreenshot(`tile-${i + 1}-${browserName}.png`);
    }
    
    // Test tile selection states
    await gamePage.selectTile(0);
    const selectedTile = page.locator('[class*="border-blue-500"]').first();
    await expect(selectedTile).toHaveScreenshot(`selected-tile-${browserName}.png`);
  });

  test('Analysis panel - Data visualization components', async ({ page }) => {
    await gamePage.startNewGame();
    
    // Full analysis panel
    await expect(gamePage.analysisPanel).toHaveScreenshot('analysis-panel-full.png');
    
    // Individual metrics sections
    const metricsSection = page.locator('[class*="space-y-3 mb-4"]');
    await expect(metricsSection).toHaveScreenshot('analysis-metrics.png');
    
    const waitingTilesSection = page.locator('text=Waiting For:').locator('..');
    await expect(waitingTilesSection).toHaveScreenshot('waiting-tiles.png');
    
    const recommendationSection = page.locator('[class*="bg-blue-50 border-l-4"]');
    await expect(recommendationSection).toHaveScreenshot('ai-recommendation.png');
    
    const learningTipSection = page.locator('[class*="bg-yellow-50"]');
    await expect(learningTipSection).toHaveScreenshot('learning-tip.png');
  });

  test('Game states - Visual consistency across phases', async ({ page }) => {
    // Dealing phase
    await gamePage.startNewGame();
    await expect(page).toHaveScreenshot('game-phase-playing.png');
    
    // Test analysis panel toggle
    await gamePage.toggleAnalysisPanel();
    await expect(page).toHaveScreenshot('game-analysis-hidden.png');
    
    await gamePage.toggleAnalysisPanel();
    await expect(page).toHaveScreenshot('game-analysis-shown.png');
  });

  test('Responsive design - Screen size adaptations', async ({ page }) => {
    const viewports = [
      { width: 375, height: 667, name: 'mobile-portrait' },
      { width: 768, height: 1024, name: 'tablet-portrait' },
      { width: 1024, height: 768, name: 'tablet-landscape' },
      { width: 1920, height: 1080, name: 'desktop-hd' },
      { width: 2560, height: 1440, name: 'desktop-2k' }
    ];
    
    for (const viewport of viewports) {
      await page.setViewportSize({ width: viewport.width, height: viewport.height });
      await page.reload();
      
      // Test landing page responsiveness
      await expect(page).toHaveScreenshot(`responsive-landing-${viewport.name}.png`);
      
      // Test game board responsiveness
      await gamePage.startNewGame();
      await expect(page).toHaveScreenshot(`responsive-game-${viewport.name}.png`);
      
      // Go back for next iteration
      await page.goBack();
    }
  });

  test('Dark mode compatibility', async ({ page }) => {
    // Test with forced dark mode
    await page.emulateMedia({ colorScheme: 'dark' });
    await page.reload();
    
    await expect(page).toHaveScreenshot('landing-dark-mode.png');
    
    await gamePage.startNewGame();
    await expect(page).toHaveScreenshot('game-dark-mode.png');
  });

  test('High contrast accessibility', async ({ page }) => {
    // Test with high contrast mode
    await page.emulateMedia({ forcedColors: 'active' });
    await page.reload();
    
    await expect(page).toHaveScreenshot('landing-high-contrast.png');
    
    await gamePage.startNewGame();
    await expect(page).toHaveScreenshot('game-high-contrast.png');
  });

  test('Animation states - Smooth transitions', async ({ page }) => {
    await gamePage.startNewGame();
    
    // Test tile selection animation
    const firstTile = page.locator('[class*="w-12 h-16"]').first();
    await firstTile.hover();
    await expect(firstTile).toHaveScreenshot('tile-hover-state.png');
    
    await firstTile.click();
    await expect(firstTile).toHaveScreenshot('tile-selected-state.png');
  });

  test('Error states - User feedback visuals', async ({ page }) => {
    await gamePage.startNewGame();
    
    // Try to discard without selecting
    const discardButton = page.getByText('Discard Tile');
    if (await discardButton.isVisible()) {
      await expect(page).toHaveScreenshot('ready-to-discard-state.png');
    }
  });

  test('Loading states - Professional polish', async ({ page }) => {
    // Capture loading transition
    const navigationPromise = page.goto('/');
    await page.waitForLoadState('domcontentloaded');
    await expect(page).toHaveScreenshot('page-loading-state.png');
    
    await navigationPromise;
    await expect(page).toHaveScreenshot('page-loaded-state.png');
  });
});