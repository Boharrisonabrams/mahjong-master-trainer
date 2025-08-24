export type Suit = 'man' | 'pin' | 'sou' | 'honor';
export type HonorType = 'east' | 'south' | 'west' | 'north' | 'white' | 'green' | 'red';

export interface Tile {
  id: string;
  suit: Suit;
  value: number | HonorType;
  isRed?: boolean;
}

export interface Meld {
  type: 'chi' | 'pon' | 'kan' | 'ankan';
  tiles: Tile[];
  from?: number;
}

export interface Player {
  id: number;
  name: string;
  hand: Tile[];
  discards: Tile[];
  melds: Meld[];
  score: number;
  wind: 'east' | 'south' | 'west' | 'north';
  isDealer: boolean;
  isRiichi: boolean;
  isBot: boolean;
}

export interface GameState {
  players: Player[];
  wall: Tile[];
  currentPlayer: number;
  round: number;
  honba: number;
  riichibou: number;
  phase: 'dealing' | 'playing' | 'won' | 'draw';
  lastAction?: GameAction;
  moveHistory: GameAction[];
}

export interface GameAction {
  type: 'draw' | 'discard' | 'chi' | 'pon' | 'kan' | 'riichi' | 'tsumo' | 'ron';
  playerId: number;
  tile?: Tile;
  tiles?: Tile[];
  from?: number;
  timestamp: number;
}

export interface WinningHand {
  tiles: Tile[];
  melds: Meld[];
  yaku: Yaku[];
  han: number;
  fu: number;
  points: number;
  isDealer: boolean;
}

export interface Yaku {
  name: string;
  han: number;
  description: string;
}

export interface AIAnalysis {
  efficiency: number;
  safetyRating: number;
  recommendedAction: string;
  dangerTiles: Tile[];
  winProbability: number;
  opponentThreats: string[];
}