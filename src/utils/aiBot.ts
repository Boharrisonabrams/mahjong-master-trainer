import { Player, GameState, Tile, GameAction, AIAnalysis } from '@/types/mahjong';
import { getWinningTiles, canWin } from './gameLogic';
import { tilesEqual, canFormChi, canFormPon } from './tiles';

export class MahjongAI {
  private difficulty: 'beginner' | 'intermediate' | 'advanced';
  
  constructor(difficulty: 'beginner' | 'intermediate' | 'advanced' = 'intermediate') {
    this.difficulty = difficulty;
  }
  
  makeMove(player: Player, gameState: GameState, drawnTile?: Tile): GameAction {
    const currentHand = drawnTile ? [...player.hand, drawnTile] : player.hand;
    
    // Check for winning conditions first
    if (canWin(currentHand, player.melds)) {
      return {
        type: drawnTile ? 'tsumo' : 'ron',
        playerId: player.id,
        timestamp: Date.now()
      };
    }
    
    // Determine which tile to discard
    const tileToDiscard = this.chooseTileToDiscard(currentHand, gameState, player);
    
    return {
      type: 'discard',
      playerId: player.id,
      tile: tileToDiscard,
      timestamp: Date.now()
    };
  }
  
  private chooseTileToDiscard(hand: Tile[], gameState: GameState, player: Player): Tile {
    switch (this.difficulty) {
      case 'beginner':
        return this.beginnerDiscard(hand);
      case 'intermediate':
        return this.intermediateDiscard(hand, gameState, player);
      case 'advanced':
        return this.advancedDiscard(hand, gameState, player);
      default:
        return this.intermediateDiscard(hand, gameState, player);
    }
  }
  
  private beginnerDiscard(hand: Tile[]): Tile {
    // Beginner: Random discard with slight preference for honors and terminals
    const terminals = hand.filter(tile => {
      if (tile.suit === 'honor') return true;
      return tile.value === 1 || tile.value === 9;
    });
    
    if (terminals.length > 0 && Math.random() < 0.7) {
      return terminals[Math.floor(Math.random() * terminals.length)];
    }
    
    return hand[Math.floor(Math.random() * hand.length)];
  }
  
  private intermediateDiscard(hand: Tile[], gameState: GameState, player: Player): Tile {
    const analysis = this.analyzeHand(hand, gameState, player);
    
    // Prioritize safety while maintaining reasonable efficiency
    const dangerTiles = this.identifyDangerTiles(gameState, player);
    const safeTiles = hand.filter(tile => 
      !dangerTiles.some(danger => tilesEqual(tile, danger))
    );
    
    if (safeTiles.length > 0) {
      // Among safe tiles, choose the least efficient
      return this.findLeastEfficientTile(safeTiles);
    }
    
    // If no safe tiles, choose least dangerous
    return this.findLeastDangerousTile(hand, dangerTiles);
  }
  
  private advancedDiscard(hand: Tile[], gameState: GameState, player: Player): Tile {
    const analysis = this.analyzeHand(hand, gameState, player);
    const winningTiles = getWinningTiles(hand, player.melds);
    
    // Advanced strategy: balance efficiency, safety, and speed
    const tileScores = hand.map(tile => {
      const efficiency = this.calculateTileEfficiency(tile, hand);
      const safety = this.calculateTileSafety(tile, gameState, player);
      const speed = winningTiles.length > 6 ? 0.8 : 0.5; // Adjust for game speed
      
      return {
        tile,
        score: efficiency * 0.4 + safety * 0.4 + speed * 0.2
      };
    });
    
    // Sort by score (lower is worse, so discard)
    tileScores.sort((a, b) => a.score - b.score);
    return tileScores[0].tile;
  }
  
  private analyzeHand(hand: Tile[], gameState: GameState, player: Player): AIAnalysis {
    const winningTiles = getWinningTiles(hand, player.melds);
    const dangerTiles = this.identifyDangerTiles(gameState, player);
    
    return {
      efficiency: this.calculateHandEfficiency(hand),
      safetyRating: this.calculateOverallSafety(hand, dangerTiles),
      recommendedAction: 'discard',
      dangerTiles,
      winProbability: this.calculateWinProbability(winningTiles, gameState),
      opponentThreats: this.analyzeOpponentThreats(gameState, player)
    };
  }
  
  private calculateTileEfficiency(tile: Tile, hand: Tile[]): number {
    // Calculate how many tiles this tile blocks from useful draws
    let efficiency = 0;
    
    if (tile.suit !== 'honor') {
      const value = tile.value as number;
      
      // Count potential sequences
      for (let offset = -2; offset <= 2; offset++) {
        const targetValue = value + offset;
        if (targetValue >= 1 && targetValue <= 9) {
          const hasConnector = hand.some(t => 
            t.suit === tile.suit && t.value === targetValue && !tilesEqual(t, tile)
          );
          if (hasConnector) efficiency += 0.3;
        }
      }
    }
    
    // Count potential triplets
    const matching = hand.filter(t => tilesEqual(t, tile));
    efficiency += matching.length * 0.5;
    
    return efficiency;
  }
  
  private calculateTileSafety(tile: Tile, gameState: GameState, player: Player): number {
    // Check if tile appears in other players' discards (safer)
    let safety = 0;
    
    gameState.players.forEach(otherPlayer => {
      if (otherPlayer.id !== player.id) {
        const discarded = otherPlayer.discards.some(d => tilesEqual(d, tile));
        if (discarded) safety += 0.8;
        
        // Check riichi - more dangerous
        if (otherPlayer.isRiichi) safety -= 0.5;
      }
    });
    
    // Honor tiles and terminals are generally safer
    if (tile.suit === 'honor' || tile.value === 1 || tile.value === 9) {
      safety += 0.3;
    }
    
    return Math.max(0, Math.min(1, safety));
  }
  
  private identifyDangerTiles(gameState: GameState, currentPlayer: Player): Tile[] {
    const dangerTiles: Tile[] = [];
    
    gameState.players.forEach(player => {
      if (player.id !== currentPlayer.id && player.isRiichi) {
        // For riichi players, middle tiles are more dangerous
        ['man', 'pin', 'sou'].forEach(suit => {
          for (let value = 4; value <= 6; value++) {
            dangerTiles.push({
              id: 'danger',
              suit: suit as 'man' | 'pin' | 'sou',
              value,
            });
          }
        });
      }
    });
    
    return dangerTiles;
  }
  
  private calculateHandEfficiency(hand: Tile[]): number {
    const winningTiles = getWinningTiles(hand, []);
    const uniqueWaits = new Set(winningTiles.map(t => `${t.suit}-${t.value}`));
    return uniqueWaits.size / 13; // Normalized efficiency score
  }
  
  private calculateOverallSafety(hand: Tile[], dangerTiles: Tile[]): number {
    const dangerCount = hand.filter(tile =>
      dangerTiles.some(danger => tilesEqual(tile, danger))
    ).length;
    
    return 1 - (dangerCount / hand.length);
  }
  
  private calculateWinProbability(winningTiles: Tile[], gameState: GameState): number {
    if (winningTiles.length === 0) return 0;
    
    // Simple calculation based on remaining tiles
    const totalTilesLeft = gameState.wall.length;
    const winningTilesInWall = winningTiles.length * 4; // Assume 4 of each type
    
    return Math.min(1, winningTilesInWall / Math.max(1, totalTilesLeft));
  }
  
  private analyzeOpponentThreats(gameState: GameState, currentPlayer: Player): string[] {
    const threats: string[] = [];
    
    gameState.players.forEach(player => {
      if (player.id !== currentPlayer.id) {
        if (player.isRiichi) {
          threats.push(`Player ${player.id + 1} is in riichi`);
        }
        
        if (player.melds.length >= 3) {
          threats.push(`Player ${player.id + 1} has ${player.melds.length} melds`);
        }
        
        if (player.discards.length < 6) {
          threats.push(`Player ${player.id + 1} may be building a fast hand`);
        }
      }
    });
    
    return threats;
  }
  
  private findLeastEfficientTile(tiles: Tile[]): Tile {
    let leastEfficient = tiles[0];
    let lowestScore = this.calculateTileEfficiency(leastEfficient, tiles);
    
    tiles.forEach(tile => {
      const score = this.calculateTileEfficiency(tile, tiles);
      if (score < lowestScore) {
        lowestScore = score;
        leastEfficient = tile;
      }
    });
    
    return leastEfficient;
  }
  
  private findLeastDangerousTile(hand: Tile[], dangerTiles: Tile[]): Tile {
    // Find the tile that's least likely to deal into someone's hand
    const scores = hand.map(tile => {
      const isDangerous = dangerTiles.some(danger => tilesEqual(tile, danger));
      return { tile, danger: isDangerous ? 1 : 0 };
    });
    
    scores.sort((a, b) => a.danger - b.danger);
    return scores[0].tile;
  }
  
  shouldCallMeld(player: Player, discardedTile: Tile, fromPlayer: number): GameAction | null {
    if (this.difficulty === 'beginner') {
      // Beginner: rarely calls melds
      if (Math.random() < 0.2) {
        if (canFormPon(player.hand, discardedTile)) {
          return {
            type: 'pon',
            playerId: player.id,
            tile: discardedTile,
            from: fromPlayer,
            timestamp: Date.now()
          };
        }
      }
      return null;
    }
    
    // Check if calling would improve hand significantly
    const currentWaits = getWinningTiles(player.hand, player.melds);
    
    if (canFormPon(player.hand, discardedTile)) {
      // Simulate pon call
      const testMelds = [...player.melds, {
        type: 'pon' as const,
        tiles: [discardedTile, discardedTile, discardedTile],
        from: fromPlayer
      }];
      
      const remainingHand = player.hand.filter(t => !tilesEqual(t, discardedTile));
      const newWaits = getWinningTiles(remainingHand, testMelds);
      
      if (newWaits.length > currentWaits.length * 0.8) {
        return {
          type: 'pon',
          playerId: player.id,
          tile: discardedTile,
          from: fromPlayer,
          timestamp: Date.now()
        };
      }
    }
    
    if (canFormChi(player.hand, discardedTile) && fromPlayer === (player.id + 3) % 4) {
      // Only call chi from previous player
      const newWaits = getWinningTiles(player.hand, player.melds);
      if (newWaits.length >= currentWaits.length) {
        return {
          type: 'chi',
          playerId: player.id,
          tile: discardedTile,
          from: fromPlayer,
          timestamp: Date.now()
        };
      }
    }
    
    return null;
  }
}