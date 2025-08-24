import { Player, Tile, Meld, WinningHand, Yaku } from '@/types/mahjong';
import { tilesEqual, sortHand, createWall } from './tiles';

export { createWall };

export function dealInitialHands(wall: Tile[], players: Player[]): void {
  let wallIndex = 0;
  
  // Deal 13 tiles to each player (dealer gets 14th later)
  for (let round = 0; round < 13; round++) {
    players.forEach(player => {
      if (wallIndex < wall.length) {
        player.hand.push(wall[wallIndex++]);
      }
    });
  }
  
  // Dealer draws extra tile
  const dealer = players.find(p => p.isDealer);
  if (dealer && wallIndex < wall.length) {
    dealer.hand.push(wall[wallIndex++]);
  }
  
  // Sort all hands
  players.forEach(player => {
    player.hand = sortHand(player.hand);
  });
  
  // Remove dealt tiles from wall
  wall.splice(0, wallIndex);
}

export function drawTile(wall: Tile[]): Tile | null {
  return wall.length > 0 ? wall.shift() || null : null;
}

export function isValidDiscard(player: Player, tile: Tile): boolean {
  return player.hand.some(t => t.id === tile.id);
}

export function discardTile(player: Player, tile: Tile): boolean {
  const tileIndex = player.hand.findIndex(t => t.id === tile.id);
  if (tileIndex === -1) return false;
  
  const [discardedTile] = player.hand.splice(tileIndex, 1);
  player.discards.push(discardedTile);
  return true;
}

export function canWin(tiles: Tile[], melds: Meld[] = []): boolean {
  // Simple win detection - 4 melds + 1 pair
  const remainingTiles = [...tiles];
  const totalMelds = melds.length;
  
  // Need exactly 14 tiles total for winning hand
  const totalTiles = remainingTiles.length + (totalMelds * 3);
  if (totalTiles !== 14) return false;
  
  // Try to form 4-x melds + 1 pair from remaining tiles
  const neededMelds = 4 - totalMelds;
  return canFormWinningPattern(remainingTiles, neededMelds, true);
}

function canFormWinningPattern(tiles: Tile[], meldsNeeded: number, needsPair: boolean): boolean {
  if (meldsNeeded === 0) {
    // Base case - check if remaining tiles form a pair
    if (needsPair) {
      return tiles.length === 2 && tilesEqual(tiles[0], tiles[1]);
    }
    return tiles.length === 0;
  }
  
  if (tiles.length < 3) return false;
  
  const sortedTiles = sortHand(tiles);
  const firstTile = sortedTiles[0];
  
  // Try to form a triplet
  const tripletTiles = sortedTiles.filter(t => tilesEqual(t, firstTile));
  if (tripletTiles.length >= 3) {
    const remaining = [...sortedTiles];
    for (let i = 0; i < 3; i++) {
      const index = remaining.findIndex(t => tilesEqual(t, firstTile));
      remaining.splice(index, 1);
    }
    
    if (canFormWinningPattern(remaining, meldsNeeded - 1, needsPair)) {
      return true;
    }
  }
  
  // Try to form a sequence (only for number suits)
  if (firstTile.suit !== 'honor') {
    const value = firstTile.value as number;
    const hasSecond = sortedTiles.some(t => t.suit === firstTile.suit && t.value === value + 1);
    const hasThird = sortedTiles.some(t => t.suit === firstTile.suit && t.value === value + 2);
    
    if (hasSecond && hasThird && value <= 7) {
      const remaining = [...sortedTiles];
      
      // Remove first tile
      remaining.splice(0, 1);
      
      // Remove second tile
      const secondIndex = remaining.findIndex(t => t.suit === firstTile.suit && t.value === value + 1);
      remaining.splice(secondIndex, 1);
      
      // Remove third tile
      const thirdIndex = remaining.findIndex(t => t.suit === firstTile.suit && t.value === value + 2);
      remaining.splice(thirdIndex, 1);
      
      if (canFormWinningPattern(remaining, meldsNeeded - 1, needsPair)) {
        return true;
      }
    }
  }
  
  // Try using first tile as part of a pair
  if (needsPair && tripletTiles.length >= 2) {
    const remaining = [...sortedTiles];
    for (let i = 0; i < 2; i++) {
      const index = remaining.findIndex(t => tilesEqual(t, firstTile));
      remaining.splice(index, 1);
    }
    
    if (canFormWinningPattern(remaining, meldsNeeded, false)) {
      return true;
    }
  }
  
  return false;
}

export function getWinningTiles(tiles: Tile[], melds: Meld[] = []): Tile[] {
  const winningTiles: Tile[] = [];
  
  // Create a unique set of all possible tiles
  const allTileTypes = new Set<string>();
  
  // Add all number tiles
  ['man', 'pin', 'sou'].forEach(suit => {
    for (let value = 1; value <= 9; value++) {
      allTileTypes.add(`${suit}-${value}`);
    }
  });
  
  // Add honor tiles
  ['east', 'south', 'west', 'north', 'white', 'green', 'red'].forEach(honor => {
    allTileTypes.add(`honor-${honor}`);
  });
  
  allTileTypes.forEach(tileType => {
    const [suit, value] = tileType.split('-');
    const testTile: Tile = {
      id: 'test',
      suit: suit as 'man' | 'pin' | 'sou' | 'honor',
      value: suit === 'honor' ? value as 'east' | 'south' | 'west' | 'north' | 'white' | 'green' | 'red' : parseInt(value),
    };
    
    const testHand = [...tiles, testTile];
    if (canWin(testHand, melds)) {
      winningTiles.push(testTile);
    }
  });
  
  return winningTiles;
}

export function calculateScore(winningHand: WinningHand): number {
  let basePoints = winningHand.fu * Math.pow(2, winningHand.han + 2);
  
  if (winningHand.han >= 13) basePoints = 8000; // Yakuman
  else if (winningHand.han >= 11) basePoints = 6000; // Sanbaiman
  else if (winningHand.han >= 8) basePoints = 4000; // Baiman
  else if (winningHand.han >= 6) basePoints = 3000; // Haneman
  else if (basePoints > 2000) basePoints = 2000; // Mangan
  
  return winningHand.isDealer ? Math.ceil(basePoints * 6 / 100) * 100 : Math.ceil(basePoints * 4 / 100) * 100;
}

export function detectYaku(tiles: Tile[], melds: Meld[], isRiichi: boolean, isTsumo: boolean): Yaku[] {
  const yaku: Yaku[] = [];
  
  if (isRiichi) {
    yaku.push({ name: 'Riichi', han: 1, description: 'Declared ready hand' });
  }
  
  if (isTsumo) {
    yaku.push({ name: 'Menzen Tsumo', han: 1, description: 'Self-drawn winning tile with closed hand' });
  }
  
  // Check for all terminals and honors
  const allTerminalsAndHonors = tiles.every(tile => {
    if (tile.suit === 'honor') return true;
    return tile.value === 1 || tile.value === 9;
  });
  
  if (allTerminalsAndHonors) {
    yaku.push({ name: 'Honroutou', han: 2, description: 'All terminals and honors' });
  }
  
  // Check for flush
  const suits = new Set(tiles.map(t => t.suit));
  if (suits.size === 1) {
    if (suits.has('honor')) {
      yaku.push({ name: 'Tsuuiisou', han: 13, description: 'All honors' });
    } else {
      yaku.push({ name: 'Chinitsu', han: 6, description: 'Full flush' });
    }
  } else if (suits.size === 2 && suits.has('honor')) {
    yaku.push({ name: 'Honitsu', han: 3, description: 'Half flush' });
  }
  
  return yaku;
}