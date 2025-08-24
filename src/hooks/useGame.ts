import { useState, useCallback, useEffect } from 'react';
import { GameState, Player, GameAction } from '@/types/mahjong';
import { createWall, dealInitialHands, drawTile, discardTile, canWin } from '@/utils/gameLogic';
import { MahjongAI } from '@/utils/aiBot';
import { sortHand } from '@/utils/tiles';

export const useGame = () => {
  const [gameState, setGameState] = useState<GameState | null>(null);
  const [isGameActive, setIsGameActive] = useState(false);
  const [showTutorial, setShowTutorial] = useState(false);
  
  const [ai] = useState(() => new MahjongAI('intermediate'));

  const initializeGame = useCallback(() => {
    const wall = createWall();
    
    const players: Player[] = [
      {
        id: 0,
        name: 'You',
        hand: [],
        discards: [],
        melds: [],
        score: 25000,
        wind: 'east',
        isDealer: true,
        isRiichi: false,
        isBot: false
      },
      {
        id: 1,
        name: 'AI Player 1',
        hand: [],
        discards: [],
        melds: [],
        score: 25000,
        wind: 'south',
        isDealer: false,
        isRiichi: false,
        isBot: true
      },
      {
        id: 2,
        name: 'AI Player 2',
        hand: [],
        discards: [],
        melds: [],
        score: 25000,
        wind: 'west',
        isDealer: false,
        isRiichi: false,
        isBot: true
      },
      {
        id: 3,
        name: 'AI Player 3',
        hand: [],
        discards: [],
        melds: [],
        score: 25000,
        wind: 'north',
        isDealer: false,
        isRiichi: false,
        isBot: true
      }
    ];

    dealInitialHands(wall, players);

    const initialState: GameState = {
      players,
      wall,
      currentPlayer: 0,
      round: 1,
      honba: 0,
      riichibou: 0,
      phase: 'playing',
      moveHistory: []
    };

    setGameState(initialState);
    setIsGameActive(true);
  }, []);

  const processAction = useCallback((action: GameAction) => {
    if (!gameState || !isGameActive) return;

    setGameState(prevState => {
      if (!prevState) return prevState;
      
      const newState = { ...prevState };
      const currentPlayer = newState.players[action.playerId];
      
      switch (action.type) {
        case 'discard':
          if (action.tile && discardTile(currentPlayer, action.tile)) {
            // Move to next player
            newState.currentPlayer = (newState.currentPlayer + 1) % 4;
            
            // Check if anyone can win with this discard
            for (const player of newState.players) {
              if (player.id !== action.playerId) {
                const testHand = [...player.hand, action.tile];
                if (canWin(testHand, player.melds)) {
                  // AI decision to call ron
                  if (player.isBot && Math.random() < 0.8) {
                    newState.phase = 'won';
                    newState.lastAction = {
                      type: 'ron',
                      playerId: player.id,
                      tile: action.tile,
                      timestamp: Date.now()
                    };
                    return newState;
                  }
                }
              }
            }
          }
          break;
          
        case 'tsumo':
          newState.phase = 'won';
          break;
          
        case 'ron':
          newState.phase = 'won';
          break;
      }
      
      newState.moveHistory.push(action);
      return newState;
    });
  }, [gameState, isGameActive]);

  // AI turn processing
  useEffect(() => {
    if (!gameState || !isGameActive || gameState.phase !== 'playing') return;
    
    const currentPlayer = gameState.players[gameState.currentPlayer];
    
    if (currentPlayer.isBot) {
      const timer = setTimeout(() => {
        // AI draws a tile
        const drawnTile = drawTile(gameState.wall);
        if (drawnTile) {
          currentPlayer.hand.push(drawnTile);
          currentPlayer.hand = sortHand(currentPlayer.hand);
          
          // AI makes decision
          const aiAction = ai.makeMove(currentPlayer, gameState, drawnTile);
          processAction(aiAction);
        } else {
          // Wall exhausted - draw game
          setGameState(prev => prev ? { ...prev, phase: 'draw' } : prev);
        }
      }, 1000 + Math.random() * 2000); // Random delay for realism
      
      return () => clearTimeout(timer);
    }
  }, [gameState, isGameActive, processAction, ai]);

  const drawTileForHuman = useCallback(() => {
    if (!gameState || !isGameActive) return;
    
    const humanPlayer = gameState.players.find(p => !p.isBot);
    if (!humanPlayer || gameState.currentPlayer !== humanPlayer.id) return;
    
    setGameState(prevState => {
      if (!prevState) return prevState;
      
      const drawnTile = drawTile(prevState.wall);
      if (drawnTile) {
        const newState = { ...prevState };
        const player = newState.players[humanPlayer.id];
        player.hand.push(drawnTile);
        player.hand = sortHand(player.hand);
        return newState;
      }
      
      return { ...prevState, phase: 'draw' };
    });
  }, [gameState, isGameActive]);

  const resetGame = useCallback(() => {
    setGameState(null);
    setIsGameActive(false);
  }, []);

  const startTutorial = useCallback(() => {
    setShowTutorial(true);
  }, []);

  const closeTutorial = useCallback(() => {
    setShowTutorial(false);
  }, []);

  // Auto-draw for human player at start of turn
  useEffect(() => {
    if (!gameState || !isGameActive || gameState.phase !== 'playing') return;
    
    const currentPlayer = gameState.players[gameState.currentPlayer];
    
    if (!currentPlayer.isBot && currentPlayer.hand.length === 13) {
      drawTileForHuman();
    }
  }, [gameState?.currentPlayer, drawTileForHuman, gameState, isGameActive]);

  return {
    gameState,
    isGameActive,
    showTutorial,
    initializeGame,
    processAction,
    resetGame,
    startTutorial,
    closeTutorial,
    drawTileForHuman
  };
};