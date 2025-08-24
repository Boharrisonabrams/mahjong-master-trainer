import { Tile, Suit, HonorType } from '@/types/mahjong';
import { v4 as uuidv4 } from 'uuid';

export const HONOR_TILES: HonorType[] = ['east', 'south', 'west', 'north', 'white', 'green', 'red'];

export function createTile(suit: Suit, value: number | HonorType, isRed = false): Tile {
  return {
    id: uuidv4(),
    suit,
    value,
    isRed
  };
}

export function createWall(): Tile[] {
  const wall: Tile[] = [];
  
  // Number tiles (1-9 for each suit, 4 copies each)
  ['man', 'pin', 'sou'].forEach(suit => {
    for (let value = 1; value <= 9; value++) {
      for (let copy = 0; copy < 4; copy++) {
        // Red 5s
        const isRed = value === 5 && copy === 0;
        wall.push(createTile(suit as Suit, value, isRed));
      }
    }
  });
  
  // Honor tiles (4 copies each)
  HONOR_TILES.forEach(honor => {
    for (let copy = 0; copy < 4; copy++) {
      wall.push(createTile('honor', honor));
    }
  });
  
  // Shuffle wall
  for (let i = wall.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [wall[i], wall[j]] = [wall[j], wall[i]];
  }
  
  return wall;
}

export function getTileDisplay(tile: Tile): string {
  if (tile.suit === 'honor') {
    const honorMap: Record<HonorType, string> = {
      east: '東',
      south: '南', 
      west: '西',
      north: '北',
      white: '白',
      green: '發',
      red: '中'
    };
    return honorMap[tile.value as HonorType];
  }
  
  const suitMap: Record<string, string> = {
    man: 'm',
    pin: 'p', 
    sou: 's'
  };
  
  const displayValue = tile.isRed ? `5${suitMap[tile.suit]}` : `${tile.value}${suitMap[tile.suit]}`;
  return displayValue;
}

export function getTileUnicode(tile: Tile): string {
  if (tile.suit === 'honor') {
    const honorUnicode: Record<HonorType, string> = {
      east: '🀀',
      south: '🀁',
      west: '🀂', 
      north: '🀃',
      white: '🀄',
      green: '🀅',
      red: '🀆'
    };
    return honorUnicode[tile.value as HonorType];
  }
  
  const baseUnicode = {
    man: 0x1F007,
    pin: 0x1F019, 
    sou: 0x1F010
  };
  
  const codePoint = baseUnicode[tile.suit] + (tile.value as number) - 1;
  return String.fromCodePoint(codePoint);
}

export function sortHand(tiles: Tile[]): Tile[] {
  return [...tiles].sort((a, b) => {
    // Sort by suit first
    const suitOrder = { man: 0, pin: 1, sou: 2, honor: 3 };
    if (a.suit !== b.suit) {
      return suitOrder[a.suit] - suitOrder[b.suit];
    }
    
    // Then by value
    if (a.suit === 'honor') {
      const honorOrder = { east: 0, south: 1, west: 2, north: 3, white: 4, green: 5, red: 6 };
      return honorOrder[a.value as HonorType] - honorOrder[b.value as HonorType];
    }
    
    return (a.value as number) - (b.value as number);
  });
}

export function tilesEqual(tile1: Tile, tile2: Tile): boolean {
  return tile1.suit === tile2.suit && tile1.value === tile2.value;
}

export function canFormChi(tiles: Tile[], newTile: Tile): boolean {
  if (newTile.suit === 'honor') return false;
  
  const value = newTile.value as number;
  const suitTiles = tiles.filter(t => t.suit === newTile.suit);
  
  // Check for sequence possibilities
  const values = suitTiles.map(t => t.value as number).sort((a, b) => a - b);
  
  // Can form sequence with tiles before
  if (value >= 3 && 
      values.includes(value - 2) && 
      values.includes(value - 1)) return true;
      
  // Can form sequence with tiles after  
  if (value <= 7 &&
      values.includes(value + 1) &&
      values.includes(value + 2)) return true;
      
  // Can form sequence in middle
  if (value >= 2 && value <= 8 &&
      values.includes(value - 1) &&
      values.includes(value + 1)) return true;
      
  return false;
}

export function canFormPon(tiles: Tile[], newTile: Tile): boolean {
  const matchingTiles = tiles.filter(t => tilesEqual(t, newTile));
  return matchingTiles.length >= 2;
}

export function canFormKan(tiles: Tile[], newTile: Tile): boolean {
  const matchingTiles = tiles.filter(t => tilesEqual(t, newTile));
  return matchingTiles.length >= 3;
}