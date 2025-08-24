import { Page, Locator, expect } from '@playwright/test';

export class GameBoardPage {
  readonly page: Page;
  
  // Core game elements
  readonly startButton: Locator;
  readonly tutorialButton: Locator;
  readonly gameBoard: Locator;
  readonly analysisPanel: Locator;
  readonly playerHands: Locator;
  readonly centerArea: Locator;
  readonly discardPonds: Locator;
  
  // Game controls
  readonly analysisToggle: Locator;
  readonly discardButton: Locator;
  readonly gamePhaseIndicator: Locator;
  
  // Tutorial elements
  readonly tutorialModal: Locator;
  readonly tutorialNextButton: Locator;
  readonly tutorialPrevButton: Locator;
  readonly tutorialProgress: Locator;
  
  constructor(page: Page) {
    this.page = page;
    
    // Main menu elements
    this.startButton = page.getByText('Start Training Session');
    this.tutorialButton = page.getByText('Learn the Basics');
    
    // Game board elements
    this.gameBoard = page.locator('[class*="bg-gradient-to-br from-green-800"]');
    this.analysisPanel = page.locator('[class*="bg-white rounded-lg shadow-lg"]').first();
    this.playerHands = page.locator('[class*="absolute"]').filter({ hasText: 'Player' });
    this.centerArea = page.locator('[class*="absolute top-1/2 left-1/2"]');
    this.discardPonds = page.locator('[class*="grid grid-cols-6"]');
    
    // Game controls
    this.analysisToggle = page.getByText(/Hide|Show/).filter({ hasText: 'Analysis' });
    this.discardButton = page.getByText('Discard Tile');
    this.gamePhaseIndicator = page.locator('text=Phase:');
    
    // Tutorial elements
    this.tutorialModal = page.locator('[class*="fixed inset-0 bg-black bg-opacity-50"]');
    this.tutorialNextButton = page.getByRole('button', { name: 'Next' });
    this.tutorialPrevButton = page.getByRole('button', { name: 'Previous' });
    this.tutorialProgress = page.locator('[class*="bg-blue-600 h-2 rounded-full"]');
  }
  
  async goto() {
    await this.page.goto('/');
    await expect(this.page.getByText('Mahjong Master Trainer')).toBeVisible();
  }
  
  async startNewGame() {
    await this.startButton.click();
    await expect(this.gameBoard).toBeVisible({ timeout: 10000 });
    await expect(this.gamePhaseIndicator).toContainText('playing');
  }
  
  async openTutorial() {
    await this.tutorialButton.click();
    await expect(this.tutorialModal).toBeVisible();
    await expect(this.page.getByText('Welcome to Mahjong Trainer!')).toBeVisible();
  }
  
  async completeTutorial() {
    await this.openTutorial();
    
    // Go through all 8 tutorial steps
    for (let step = 0; step < 7; step++) {
      await expect(this.tutorialNextButton).toBeVisible();
      await this.tutorialNextButton.click();
      await this.page.waitForTimeout(500); // Allow transition
    }
    
    // Final step should have "Start Playing!" button
    await expect(this.page.getByText('Start Playing!')).toBeVisible();
    await this.page.getByText('Start Playing!').click();
    
    await expect(this.tutorialModal).toBeHidden();
  }
  
  async selectTile(tileIndex: number = 0) {
    const playerTiles = this.page.locator('[class*="w-12 h-16"]').filter({ hasText: /[🀙🀚🀛🀐🀑🀒🀇🀈🀉🀀🀁🀂🀃🀄🀅🀆]/ });
    const tile = playerTiles.nth(tileIndex);
    
    await expect(tile).toBeVisible();
    await tile.click();
    
    // Verify tile selection visual feedback
    await expect(tile).toHaveClass(/border-blue-500/);
  }
  
  async discardSelectedTile() {
    await expect(this.discardButton).toBeVisible();
    await this.discardButton.click();
  }
  
  async toggleAnalysisPanel() {
    await this.analysisToggle.click();
  }
  
  async waitForAITurn() {
    // Wait for AI turn indicator
    await expect(this.gamePhaseIndicator).toBeVisible();
    
    // Wait for AI turn to complete (up to 5 seconds)
    await this.page.waitForFunction(() => {
      const indicator = document.querySelector('[class*="animate-pulse"]');
      return !indicator || !indicator.textContent?.includes('Current Turn');
    }, { timeout: 5000 });
  }
  
  async getAnalysisPanelMetrics() {
    await expect(this.analysisPanel).toBeVisible();
    
    const efficiency = await this.analysisPanel.locator('text=/\\d+\\.\\d+%/').first().textContent();
    const safety = await this.analysisPanel.locator('text=/\\d+\\.\\d+%/').nth(1).textContent();
    const winProb = await this.analysisPanel.locator('text=/\\d+\\.\\d+%/').last().textContent();
    
    return {
      efficiency: parseFloat(efficiency?.replace('%', '') || '0'),
      safety: parseFloat(safety?.replace('%', '') || '0'),
      winProbability: parseFloat(winProb?.replace('%', '') || '0')
    };
  }
  
  async getWaitingTiles() {
    const waitingSection = this.analysisPanel.locator('text=Waiting For:').locator('..');
    const tiles = waitingSection.locator('[class*="w-8 h-12"]');
    
    return await tiles.count();
  }
  
  async captureGameState() {
    return {
      currentPlayer: await this.centerArea.locator('text=/Round \\d+/').textContent(),
      tilesLeft: await this.centerArea.locator('text=/Tiles left: \\d+/').textContent(),
      analysisMetrics: await this.getAnalysisPanelMetrics(),
      waitingTiles: await this.getWaitingTiles(),
      phase: await this.gamePhaseIndicator.textContent()
    };
  }
  
  async waitForGameEnd() {
    // Wait for game over modal or draw screen
    await expect(
      this.page.locator('text=Game Complete!').or(this.page.locator('text=Draw Game'))
    ).toBeVisible({ timeout: 60000 });
  }
  
  async verifyTileRendering() {
    // Check that Unicode mahjong tiles are rendering properly
    const tiles = this.page.locator('[class*="text-lg"]').filter({ hasText: /[🀙🀚🀛🀐🀑🀒🀇🀈🀉🀀🀁🀂🀃🀄🀅🀆]/ });
    const tileCount = await tiles.count();
    
    expect(tileCount).toBeGreaterThan(0);
    
    // Verify at least some tiles are visible
    for (let i = 0; i < Math.min(5, tileCount); i++) {
      await expect(tiles.nth(i)).toBeVisible();
    }
  }
  
  async verifyResponsiveLayout() {
    // Check that key elements are properly positioned
    await expect(this.gameBoard).toBeVisible();
    await expect(this.centerArea).toBeVisible();
    await expect(this.analysisPanel).toBeVisible();
    
    // Verify no elements are cut off
    const viewport = this.page.viewportSize();
    if (viewport) {
      const bounds = await this.gameBoard.boundingBox();
      expect(bounds).toBeTruthy();
      expect(bounds!.width).toBeLessThanOrEqual(viewport.width);
      expect(bounds!.height).toBeLessThanOrEqual(viewport.height);
    }
  }
}