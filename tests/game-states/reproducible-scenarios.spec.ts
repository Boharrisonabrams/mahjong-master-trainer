import { test, expect } from '@playwright/test';
import { GameBoardPage } from '../page-objects/GameBoard';

test.describe('Advanced Game State Testing - Reproducible Mahjong Scenarios', () => {
  let gamePage: GameBoardPage;
  
  test.beforeEach(async ({ page }) => {
    gamePage = new GameBoardPage(page);
  });

  // Game state fixtures for reproducible testing
  const createMockGameState = () => ({
    // This would be injected into the game to create specific scenarios
    players: [
      {
        id: 0,
        name: 'Test Player',
        hand: [
          // Specific hand configuration for testing
          { suit: 'man', value: 1, id: 'test-1' },
          { suit: 'man', value: 2, id: 'test-2' },
          { suit: 'man', value: 3, id: 'test-3' },
          // ... more tiles
        ],
        isBot: false
      }
      // ... other players
    ],
    wall: [], // Controlled tile sequence
    currentPlayer: 0,
    phase: 'playing'
  });

  test('Near-win scenario - Tenpai state validation', async ({ page }) => {
    await gamePage.goto();
    
    // This test would benefit from game state injection
    // For now, we'll test the UI behavior when close to winning
    
    await gamePage.startNewGame();
    
    // Monitor for high-efficiency states that indicate near-win
    let highEfficiencyFound = false;
    const maxAttempts = 10;
    
    for (let attempt = 0; attempt < maxAttempts; attempt++) {
      if (await page.locator('[class*="animate-pulse"]').count() > 0) {
        const metrics = await gamePage.getAnalysisPanelMetrics();
        const waitingTiles = await gamePage.getWaitingTiles();
        
        console.log(`Attempt ${attempt + 1}: Efficiency: ${metrics.efficiency}%, Waiting: ${waitingTiles}`);
        
        // Look for tenpai-like state (high efficiency, multiple waits)
        if (metrics.efficiency > 70 && waitingTiles > 3) {
          highEfficiencyFound = true;
          
          // Test UI behavior in near-win state
          await expect(gamePage.analysisPanel.locator('text=waiting')).toBeVisible();
          
          // Recommendation should be relevant to high-efficiency state
          const recommendation = await gamePage.analysisPanel
            .locator('[class*="bg-blue-50"]')
            .textContent();
          
          expect(recommendation).toBeTruthy();
          console.log('Near-win recommendation:', recommendation);
          
          break;
        }
        
        // Make a move to change state
        await gamePage.selectTile(0);
        await gamePage.discardSelectedTile();
        await gamePage.waitForAITurn();
      }
    }
    
    if (highEfficiencyFound) {
      console.log('✅ Successfully found and tested near-win scenario');
    } else {
      console.log('ℹ️ Near-win scenario not encountered in this test run');
    }
  });

  test('AI riichi declaration - Strategic decision testing', async ({ page }) => {
    await gamePage.goto();
    await gamePage.startNewGame();
    
    const aiRiichiStates: any[] = [];
    let riichiFound = false;
    const maxTurns = 15;
    
    for (let turn = 0; turn < maxTurns; turn++) {
      const gameState = await gamePage.captureGameState();
      
      if (gameState.phase?.includes('won') || gameState.phase?.includes('draw')) {
        break;
      }
      
      // Skip human turns quickly
      if (await page.locator('[class*="animate-pulse"]').count() > 0) {
        await gamePage.selectTile(0);
        await gamePage.discardSelectedTile();
      }
      
      await gamePage.waitForAITurn();
      
      // Check for riichi indicators
      const riichiIndicators = page.locator('[class*="bg-yellow-500"]'); // Riichi indicator
      const riichiCount = await riichiIndicators.count();
      
      if (riichiCount > 0) {
        riichiFound = true;
        
        // Verify riichi state is properly displayed
        await expect(riichiIndicators.first()).toBeVisible();
        
        // Check threat analysis updates
        const threats = await gamePage.analysisPanel
          .locator('text=⚠️')
          .count();
        
        if (threats > 0) {
          console.log(`Turn ${turn}: AI riichi detected, ${threats} threats shown`);
          
          aiRiichiStates.push({
            turn,
            threats,
            gameState: await gamePage.captureGameState()
          });
        }
        
        break;
      }
    }
    
    if (riichiFound) {
      console.log('✅ AI riichi scenario tested successfully');
      console.log('Riichi states captured:', aiRiichiStates);
    } else {
      console.log('ℹ️ AI riichi not encountered in this test run');
    }
  });

  test('Multiple waiting tiles scenario - Complex hand analysis', async ({ page }) => {
    await gamePage.goto();
    await gamePage.startNewGame();
    
    let complexHandFound = false;
    const maxAttempts = 12;
    
    for (let attempt = 0; attempt < maxAttempts; attempt++) {
      if (await page.locator('[class*="animate-pulse"]').count() > 0) {
        const waitingTiles = await gamePage.getWaitingTiles();
        const metrics = await gamePage.getAnalysisPanelMetrics();
        
        console.log(`Attempt ${attempt + 1}: ${waitingTiles} waiting tiles, ${metrics.efficiency}% efficiency`);
        
        // Look for complex hand (multiple waits, good efficiency)
        if (waitingTiles >= 5 && metrics.efficiency > 60) {
          complexHandFound = true;
          
          // Test waiting tiles display
          const waitingSection = gamePage.analysisPanel
            .locator('text=Waiting For:')
            .locator('..');
            
          await expect(waitingSection).toBeVisible();
          
          // Verify tiles are properly displayed
          const tileElements = waitingSection.locator('[class*="w-8 h-12"]');
          const displayedTiles = await tileElements.count();
          
          expect(displayedTiles).toBeLessThanOrEqual(8); // Should limit display
          
          if (waitingTiles > 8) {
            // Should show "+X more" indicator
            await expect(waitingSection.locator('text=+').first()).toBeVisible();
          }
          
          // Test learning tip for complex hands
          const learningTip = gamePage.analysisPanel
            .locator('[class*="bg-yellow-50"]')
            .textContent();
          
          expect(learningTip).toBeTruthy();
          console.log('Complex hand learning tip:', await learningTip);
          
          break;
        }
        
        await gamePage.selectTile(Math.floor(Math.random() * 3));
        await gamePage.discardSelectedTile();
        await gamePage.waitForAITurn();
      }
    }
    
    if (complexHandFound) {
      console.log('✅ Complex waiting tiles scenario tested successfully');
    } else {
      console.log('ℹ️ Complex hand scenario not encountered');
    }
  });

  test('Defensive play scenario - Danger tile detection', async ({ page }) => {
    await gamePage.goto();
    await gamePage.startNewGame();
    
    let dangerousStateFound = false;
    const maxTurns = 10;
    
    for (let turn = 0; turn < maxTurns; turn++) {
      const gameState = await gamePage.captureGameState();
      
      if (gameState.phase?.includes('won') || gameState.phase?.includes('draw')) {
        break;
      }
      
      // Look for opponent threats
      const threatElements = gamePage.analysisPanel.locator('text=⚠️');
      const threatCount = await threatElements.count();
      
      if (threatCount > 0) {
        dangerousStateFound = true;
        
        console.log(`Turn ${turn}: ${threatCount} threats detected`);
        
        // Verify threat display
        await expect(threatElements.first()).toBeVisible();
        
        // Check safety rating reflects danger
        const metrics = await gamePage.getAnalysisPanelMetrics();
        expect(metrics.safety).toBeLessThan(70); // Should be lower when threats exist
        
        // Test defensive recommendation
        const recommendation = await gamePage.analysisPanel
          .locator('[class*="bg-blue-50"]')
          .textContent();
          
        console.log('Defensive recommendation:', recommendation);
        expect(recommendation).toContain('safe'); // Should suggest safety
        
        break;
      }
      
      if (await page.locator('[class*="animate-pulse"]').count() > 0) {
        await gamePage.selectTile(0);
        await gamePage.discardSelectedTile();
      }
      
      await gamePage.waitForAITurn();
    }
    
    if (dangerousStateFound) {
      console.log('✅ Defensive play scenario tested successfully');
    } else {
      console.log('ℹ️ Dangerous game state not encountered');
    }
  });

  test('Wall depletion scenario - Draw game handling', async ({ page }) => {
    await gamePage.goto();
    await gamePage.startNewGame();
    
    // Monitor wall tile count
    let initialTileCount = 0;
    let currentTileCount = 0;
    
    // Get initial count
    const initialText = await gamePage.centerArea
      .locator('text=/Tiles left: \\d+/')
      .textContent();
    initialTileCount = parseInt(initialText?.match(/\\d+/)?.[0] || '0');
    
    console.log('Initial wall tiles:', initialTileCount);
    expect(initialTileCount).toBeGreaterThan(70); // Should start with ~70+ tiles after dealing
    
    // Monitor tile depletion through gameplay
    const tileCountHistory: number[] = [initialTileCount];
    let gameEnded = false;
    
    // Play until wall is significantly depleted or game ends
    while (currentTileCount > 20 && !gameEnded) {
      const gameState = await gamePage.captureGameState();
      
      if (gameState.phase?.includes('won') || gameState.phase?.includes('draw')) {
        gameEnded = true;
        console.log('Game ended with phase:', gameState.phase);
        break;
      }
      
      // Extract tile count
      currentTileCount = parseInt(
        gameState.tilesLeft?.match(/\\d+/)?.[0] || '0'
      );
      
      tileCountHistory.push(currentTileCount);
      
      // Make moves to progress game
      if (await page.locator('[class*="animate-pulse"]').count() > 0) {
        await gamePage.selectTile(0);
        await gamePage.discardSelectedTile();
      }
      
      await gamePage.waitForAITurn();
      
      // Add timeout to prevent infinite loops
      if (tileCountHistory.length > 30) {
        console.log('Max turns reached, ending test');
        break;
      }
    }
    
    console.log('Tile count progression:', tileCountHistory);
    
    // Verify tile count decreases over time
    expect(tileCountHistory[tileCountHistory.length - 1])
      .toBeLessThan(tileCountHistory[0]);
    
    // If game ended naturally, verify proper handling
    if (gameEnded) {
      if (await page.locator('text=Draw Game').count() > 0) {
        console.log('✅ Draw game scenario tested successfully');
        await expect(page.locator('text=Draw Game')).toBeVisible();
      } else {
        console.log('✅ Game completed with winner');
      }
    }
  });

  test('AI difficulty consistency - Behavior validation', async ({ page }) => {
    await gamePage.goto();
    await gamePage.startNewGame();
    
    const aiDecisionTimes: number[] = [];
    const gameStates: any[] = [];
    
    // Monitor AI decision patterns
    for (let observation = 0; observation < 5; observation++) {
      if (await page.locator('[class*="animate-pulse"]').count() > 0) {
        await gamePage.selectTile(0);
        await gamePage.discardSelectedTile();
      }
      
      // Time AI decision making
      const aiStart = Date.now();
      await gamePage.waitForAITurn();
      const aiDecisionTime = Date.now() - aiStart;
      
      aiDecisionTimes.push(aiDecisionTime);
      
      const currentState = await gamePage.captureGameState();
      gameStates.push({
        observation: observation + 1,
        decisionTime: aiDecisionTime,
        state: currentState
      });
      
      console.log(`AI Decision ${observation + 1}: ${aiDecisionTime}ms`);
    }
    
    // Analyze AI behavior consistency
    const avgDecisionTime = aiDecisionTimes.reduce((a, b) => a + b, 0) / aiDecisionTimes.length;
    const maxDecisionTime = Math.max(...aiDecisionTimes);
    const minDecisionTime = Math.min(...aiDecisionTimes);
    
    console.log('AI Performance Analysis:', {
      average: `${avgDecisionTime.toFixed(2)}ms`,
      range: `${minDecisionTime}ms - ${maxDecisionTime}ms`,
      consistency: maxDecisionTime - minDecisionTime < 2000 ? 'Good' : 'Variable'
    });
    
    // AI should make decisions within reasonable time bounds
    expect(avgDecisionTime).toBeLessThan(3000); // Average under 3s
    expect(maxDecisionTime).toBeLessThan(5000); // No decision over 5s
    
    // Decision times should be relatively consistent (not varying wildly)
    const timeVariance = maxDecisionTime - minDecisionTime;
    expect(timeVariance).toBeLessThan(3000); // Max 3s variance
  });

  test('Scoring calculation accuracy - Win condition testing', async ({ page }) => {
    await gamePage.goto();
    await gamePage.startNewGame();
    
    // This test monitors for winning conditions and validates scoring
    let winConditionFound = false;
    const maxTurns = 20;
    
    for (let turn = 0; turn < maxTurns; turn++) {
      const gameState = await gamePage.captureGameState();
      
      if (gameState.phase?.includes('won')) {
        winConditionFound = true;
        
        console.log(`Win condition found at turn ${turn}`);
        
        // Check for win modal
        const winModal = page.locator('text=Game Complete!');
        if (await winModal.count() > 0) {
          await expect(winModal).toBeVisible();
          
          // Verify winner is properly displayed
          const winnerText = await page
            .locator('text=/Player \\d+ won/')
            .textContent();
          
          expect(winnerText).toBeTruthy();
          console.log('Winner announcement:', winnerText);
          
          // Check win method (Ron/Tsumo)
          const winMethod = await page
            .locator('text=/won by (Ron|Tsumo)/')
            .textContent();
          
          if (winMethod) {
            console.log('Win method:', winMethod);
            expect(winMethod).toMatch(/(Ron|Tsumo)/);
          }
        }
        
        break;
      }
      
      if (gameState.phase?.includes('draw')) {
        console.log(`Draw condition found at turn ${turn}`);
        await expect(page.locator('text=Draw Game')).toBeVisible();
        break;
      }
      
      // Continue playing
      if (await page.locator('[class*="animate-pulse"]').count() > 0) {
        await gamePage.selectTile(0);
        await gamePage.discardSelectedTile();
      }
      
      await gamePage.waitForAITurn();
    }
    
    if (winConditionFound) {
      console.log('✅ Win condition testing completed successfully');
    } else {
      console.log('ℹ️ Game did not reach win condition in test timeframe');
    }
  });

  test('Memory leak detection - Extended game session', async ({ page }) => {
    await gamePage.goto();
    
    // Monitor memory throughout extended session
    const memorySnapshots: any[] = [];
    const gamesPlayed = 3;
    
    for (let game = 0; game < gamesPlayed; game++) {
      console.log(`Starting game ${game + 1}/${gamesPlayed}`);
      
      await gamePage.startNewGame();
      
      // Take memory snapshot
      const memory = await page.evaluate(() => {
        const mem = (performance as any).memory;
        return mem ? {
          used: mem.usedJSHeapSize,
          total: mem.totalJSHeapSize,
          limit: mem.jsHeapSizeLimit
        } : null;
      });
      
      if (memory) {
        memorySnapshots.push({
          game: game + 1,
          phase: 'start',
          ...memory
        });
      }
      
      // Play several moves
      for (let move = 0; move < 5; move++) {
        if (await page.locator('[class*="animate-pulse"]').count() > 0) {
          await gamePage.selectTile(Math.floor(Math.random() * 3));
          await gamePage.discardSelectedTile();
          await gamePage.waitForAITurn();
        }
      }
      
      // Take end-of-game memory snapshot
      const endMemory = await page.evaluate(() => {
        const mem = (performance as any).memory;
        return mem ? {
          used: mem.usedJSHeapSize,
          total: mem.totalJSHeapSize,
          limit: mem.jsHeapSizeLimit
        } : null;
      });
      
      if (endMemory) {
        memorySnapshots.push({
          game: game + 1,
          phase: 'end',
          ...endMemory
        });
      }
      
      // Return to menu for next game
      await page.goto('/');
    }
    
    // Analyze memory usage patterns
    if (memorySnapshots.length > 0) {
      const firstSnapshot = memorySnapshots[0];
      const lastSnapshot = memorySnapshots[memorySnapshots.length - 1];
      
      const memoryGrowthMB = (lastSnapshot.used - firstSnapshot.used) / 1024 / 1024;
      
      console.log('Memory Usage Analysis:', {
        initialMB: (firstSnapshot.used / 1024 / 1024).toFixed(2),
        finalMB: (lastSnapshot.used / 1024 / 1024).toFixed(2),
        growthMB: memoryGrowthMB.toFixed(2),
        snapshots: memorySnapshots.length
      });
      
      // Memory growth should be reasonable for extended session
      expect(memoryGrowthMB).toBeLessThan(15); // Less than 15MB growth
      
      console.log('✅ Memory leak detection completed');
    }
  });
});