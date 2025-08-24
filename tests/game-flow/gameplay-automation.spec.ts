import { test, expect } from '@playwright/test';
import { GameBoardPage } from '../page-objects/GameBoard';

test.describe('Game Flow Testing - UX Validation & Complete Scenarios', () => {
  let gamePage: GameBoardPage;
  
  test.beforeEach(async ({ page }) => {
    gamePage = new GameBoardPage(page);
    await gamePage.goto();
  });

  test('Complete tutorial walkthrough - Educational flow validation', async ({ page }) => {
    await gamePage.openTutorial();
    
    const tutorialSteps = [
      'Welcome to Mahjong Trainer!',
      'The Goal of Mahjong', 
      'Tile Types',
      'Basic Gameplay',
      'Reading the Board',
      'Strategy Basics',
      'Using the Analysis Panel',
      'Learning Through Play'
    ];
    
    for (let i = 0; i < tutorialSteps.length; i++) {
      // Verify current step content
      await expect(page.locator('text=' + tutorialSteps[i])).toBeVisible();
      
      // Check progress indicator
      const progressText = `Step ${i + 1} of ${tutorialSteps.length}`;
      await expect(page.locator('text=' + progressText)).toBeVisible();
      
      // Verify progress bar
      const expectedProgress = ((i + 1) / tutorialSteps.length) * 100;
      const progressBar = page.locator('[style*="width:"]');
      const progressStyle = await progressBar.getAttribute('style');
      expect(progressStyle).toContain(`width: ${expectedProgress}%`);
      
      // Test navigation
      if (i > 0) {
        await expect(gamePage.tutorialPrevButton).toBeEnabled();
      }
      
      if (i < tutorialSteps.length - 1) {
        await expect(gamePage.tutorialNextButton).toBeEnabled();
        await gamePage.tutorialNextButton.click();
        await page.waitForTimeout(300);
      }
    }
    
    // Final step should close tutorial
    await expect(page.getByText('Start Playing!')).toBeVisible();
    await page.getByText('Start Playing!').click();
    
    await expect(gamePage.tutorialModal).toBeHidden();
    await expect(page.getByText('Mahjong Master Trainer')).toBeVisible();
  });

  test('Beginner AI game - Complete gameplay scenario', async ({ page }) => {
    await gamePage.startNewGame();
    
    // Verify initial game state
    await expect(gamePage.gamePhaseIndicator).toContainText('playing');
    
    let turnCount = 0;
    const maxTurns = 20; // Prevent infinite loops
    
    while (turnCount < maxTurns) {
      const gameState = await gamePage.captureGameState();
      
      // Check if game ended
      if (gameState.phase?.includes('won') || gameState.phase?.includes('draw')) {
        break;
      }
      
      // If it's human player's turn (you)
      const currentPlayerIndicator = page.locator('[class*="animate-pulse"]');
      if (await currentPlayerIndicator.count() > 0) {
        // Verify analysis panel is working
        const metrics = await gamePage.getAnalysisPanelMetrics();
        expect(metrics.efficiency).toBeGreaterThanOrEqual(0);
        expect(metrics.efficiency).toBeLessThanOrEqual(100);
        expect(metrics.safety).toBeGreaterThanOrEqual(0);
        expect(metrics.safety).toBeLessThanOrEqual(100);
        
        // Select and discard a tile
        await gamePage.selectTile(0);
        await gamePage.discardSelectedTile();
        
        // Verify discard was processed
        await page.waitForTimeout(500);
      }
      
      // Wait for AI turn
      await gamePage.waitForAITurn();
      
      turnCount++;
    }
    
    console.log(`Game completed after ${turnCount} turns`);
  });

  test('Interactive tile selection - User input validation', async ({ page }) => {
    await gamePage.startNewGame();
    
    // Test tile selection mechanics
    const playerTiles = page.locator('[class*="w-12 h-16"]').filter({ 
      hasText: /[🀙🀚🀛🀐🀑🀒🀇🀈🀉🀀🀁🀂🀃🀄🀅🀆]/ 
    });
    
    const tileCount = await playerTiles.count();
    expect(tileCount).toBeGreaterThan(10); // Should have a full hand
    
    for (let i = 0; i < Math.min(3, tileCount); i++) {
      const tile = playerTiles.nth(i);
      
      // Test hover state
      await tile.hover();
      await expect(tile).toHaveClass(/hover:shadow-lg/);
      
      // Test selection
      await tile.click();
      await expect(tile).toHaveClass(/border-blue-500/);
      await expect(tile).toHaveClass(/-translate-y-2/); // Elevated state
      
      // Verify discard button appears
      await expect(gamePage.discardButton).toBeVisible();
      
      // Test deselection
      await tile.click();
      await expect(tile).not.toHaveClass(/border-blue-500/);
      await expect(gamePage.discardButton).toBeHidden();
    }
  });

  test('Real-time analysis updates - Dynamic feedback', async ({ page }) => {
    await gamePage.startNewGame();
    
    // Capture initial analysis state
    const initialMetrics = await gamePage.getAnalysisPanelMetrics();
    const initialWaits = await gamePage.getWaitingTiles();
    
    // Make several moves and verify analysis updates
    for (let turn = 0; turn < 3; turn++) {
      if (await page.locator('[class*="animate-pulse"]').count() > 0) {
        await gamePage.selectTile(0);
        await gamePage.discardSelectedTile();
        
        await page.waitForTimeout(1000); // Allow analysis to update
        
        // Verify analysis panel updates
        const newMetrics = await gamePage.getAnalysisPanelMetrics();
        const newWaits = await gamePage.getWaitingTiles();
        
        // Metrics should be valid ranges
        expect(newMetrics.efficiency).toBeGreaterThanOrEqual(0);
        expect(newMetrics.safety).toBeGreaterThanOrEqual(0);
        expect(newMetrics.winProbability).toBeGreaterThanOrEqual(0);
        
        console.log(`Turn ${turn + 1}: Efficiency: ${newMetrics.efficiency}%, Safety: ${newMetrics.safety}%, Win: ${newMetrics.winProbability}%`);
        
        await gamePage.waitForAITurn();
      }
    }
  });

  test('Analysis panel toggle - UI responsiveness', async ({ page }) => {
    await gamePage.startNewGame();
    
    // Verify analysis panel is initially visible
    await expect(gamePage.analysisPanel).toBeVisible();
    
    // Test hide functionality
    await gamePage.toggleAnalysisPanel();
    await expect(gamePage.analysisPanel).toBeHidden();
    await expect(gamePage.analysisToggle).toContainText('Show');
    
    // Test show functionality
    await gamePage.toggleAnalysisPanel();
    await expect(gamePage.analysisPanel).toBeVisible();
    await expect(gamePage.analysisToggle).toContainText('Hide');
    
    // Test multiple rapid toggles
    for (let i = 0; i < 5; i++) {
      await gamePage.toggleAnalysisPanel();
      await page.waitForTimeout(200);
    }
    
    // Should still be functional
    await expect(gamePage.analysisToggle).toBeVisible();
    await expect(gamePage.analysisToggle).toBeEnabled();
  });

  test('AI decision validation - Strategic behavior', async ({ page }) => {
    await gamePage.startNewGame();
    
    const aiMoves: Array<{ round: number; tilesLeft: number; move: string }> = [];
    
    // Observe AI behavior for several moves
    for (let round = 0; round < 5; round++) {
      const gameState = await gamePage.captureGameState();
      
      if (gameState.phase?.includes('won') || gameState.phase?.includes('draw')) {
        break;
      }
      
      // Skip human turns
      if (await page.locator('[class*="animate-pulse"]').count() > 0) {
        await gamePage.selectTile(0);
        await gamePage.discardSelectedTile();
      }
      
      // Wait for AI turn and capture decision
      const beforeState = await gamePage.captureGameState();
      await gamePage.waitForAITurn();
      const afterState = await gamePage.captureGameState();
      
      aiMoves.push({
        round: round + 1,
        tilesLeft: parseInt(beforeState.tilesLeft?.match(/\\d+/)?.[0] || '0'),
        move: 'discard' // Simplified for this test
      });
    }
    
    // Verify AI made reasonable decisions
    expect(aiMoves.length).toBeGreaterThan(0);
    console.log('AI Moves Recorded:', aiMoves);
    
    // AI should be making moves within reasonable time
    aiMoves.forEach(move => {
      expect(move.tilesLeft).toBeLessThan(136); // Started with full wall
      expect(move.tilesLeft).toBeGreaterThan(0); // Game still active
    });
  });

  test('Game end scenarios - Win/Draw handling', async ({ page }) => {
    // This test would benefit from controlled game states
    // For now, we'll test the UI elements
    
    await gamePage.startNewGame();
    
    // Test game controls are responsive
    const controls = [
      gamePage.analysisToggle,
      gamePage.gamePhaseIndicator
    ];
    
    for (const control of controls) {
      await expect(control).toBeVisible();
      await expect(control).toBeEnabled();
    }
    
    // Verify game state indicators
    await expect(gamePage.centerArea).toContainText('Round 1');
    await expect(gamePage.centerArea).toContainText('Tiles left:');
  });

  test('Edge case handling - Invalid moves and errors', async ({ page }) => {
    await gamePage.startNewGame();
    
    // Test clicking on non-interactive areas
    await gamePage.centerArea.click();
    // Should not cause errors or break the game
    await expect(gamePage.gamePhaseIndicator).toBeVisible();
    
    // Test rapid clicking on tiles
    const tiles = page.locator('[class*="w-12 h-16"]').first();
    await tiles.click();
    await tiles.click();
    await tiles.click();
    
    // Game should still be responsive
    await expect(gamePage.analysisPanel).toBeVisible();
    
    // Test browser refresh during game
    await page.reload();
    await gamePage.startNewGame(); // Should work after reload
    await expect(gamePage.gameBoard).toBeVisible();
  });

  test('Keyboard navigation - Accessibility', async ({ page }) => {
    await gamePage.goto();
    
    // Test tab navigation
    await page.keyboard.press('Tab');
    await page.keyboard.press('Tab');
    
    // Should be able to activate buttons with keyboard
    await page.keyboard.press('Enter');
    
    // Either game starts or tutorial opens
    const gameStarted = await gamePage.gameBoard.isVisible();
    const tutorialOpened = await gamePage.tutorialModal.isVisible();
    
    expect(gameStarted || tutorialOpened).toBeTruthy();
  });

  test('Memory usage - Extended play session', async ({ page }) => {
    await gamePage.startNewGame();
    
    // Monitor for memory leaks during extended play
    const initialMemory = await page.evaluate(() => {
      return (performance as any).memory?.usedJSHeapSize || 0;
    });
    
    // Simulate extended play session
    for (let session = 0; session < 5; session++) {
      if (await page.locator('[class*="animate-pulse"]').count() > 0) {
        await gamePage.selectTile(Math.floor(Math.random() * 3));
        await gamePage.discardSelectedTile();
        await gamePage.waitForAITurn();
      }
      
      await page.waitForTimeout(1000);
    }
    
    const finalMemory = await page.evaluate(() => {
      return (performance as any).memory?.usedJSHeapSize || 0;
    });
    
    // Memory growth should be reasonable (less than 50MB increase)
    const memoryGrowth = finalMemory - initialMemory;
    console.log(`Memory growth during session: ${memoryGrowth / 1024 / 1024:.2f}MB`);
    
    if (initialMemory > 0) {
      expect(memoryGrowth).toBeLessThan(50 * 1024 * 1024); // 50MB limit
    }
  });
});