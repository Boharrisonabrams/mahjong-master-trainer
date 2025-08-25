import React, { useState } from 'react';
import { GameState, Player, Tile as TileType, GameAction } from '@/types/mahjong';
import { Hand } from './Hand';
import { Tile } from './Tile';
import { AnalysisPanel } from './AnalysisPanel';
import { TutorialModal } from './TutorialModal';
import { GlossaryModal } from './GlossaryModal';
import { AmericanMahjongCard } from './AmericanMahjongCard';

interface GameBoardProps {
  gameState: GameState;
  onAction: (action: GameAction) => void;
  showTutorial?: boolean;
  onTutorialClose?: () => void;
}

export const GameBoard: React.FC<GameBoardProps> = ({
  gameState,
  onAction,
  showTutorial = false,
  onTutorialClose
}) => {
  const [selectedTile, setSelectedTile] = useState<TileType | null>(null);
  const [showAnalysis, setShowAnalysis] = useState(true);
  const [showInGameGlossary, setShowInGameGlossary] = useState(false);
  const [showInGameAmericanCard, setShowInGameAmericanCard] = useState(false);
  
  const currentPlayer = gameState.players[gameState.currentPlayer];
  const humanPlayer = gameState.players.find(p => !p.isBot);
  
  const handleTileClick = (tile: TileType) => {
    if (currentPlayer.isBot) return;
    
    if (selectedTile?.id === tile.id) {
      // Discard selected tile
      onAction({
        type: 'discard',
        playerId: currentPlayer.id,
        tile: tile,
        timestamp: Date.now()
      });
      setSelectedTile(null);
    } else {
      setSelectedTile(tile);
    }
  };

  const getPlayerPosition = (playerId: number) => {
    const positions = ['bottom', 'right', 'top', 'left'];
    const humanPlayerIndex = humanPlayer?.id || 0;
    const relativeIndex = (playerId - humanPlayerIndex + 4) % 4;
    return positions[relativeIndex];
  };

  const renderPlayerHand = (player: Player, position: string) => {
    const isHuman = !player.isBot;
    const isCurrent = player.id === gameState.currentPlayer;
    
    const containerClasses = {
      bottom: 'absolute bottom-4 left-1/2 transform -translate-x-1/2',
      top: 'absolute top-4 left-1/2 transform -translate-x-1/2',
      left: 'absolute left-4 top-1/2 transform -translate-y-1/2 rotate-90',
      right: 'absolute right-4 top-1/2 transform -translate-y-1/2 -rotate-90'
    };

    return (
      <div key={player.id} className={`${containerClasses[position as keyof typeof containerClasses]} z-10`}>
        <div className={position === 'left' || position === 'right' ? 'transform rotate-180' : ''}>
          <Hand
            tiles={player.hand}
            onTileClick={isHuman && isCurrent ? handleTileClick : undefined}
            selectedTile={selectedTile}
            isPlayer={isHuman}
            showTiles={isHuman}
            playerName={`Player ${player.id + 1}`}
          />
          
          {/* Player indicators */}
          <div className="flex justify-center mt-2 space-x-1">
            {player.isDealer && (
              <div className="w-2 h-2 bg-red-500 rounded-full" title="Dealer"></div>
            )}
            {player.isRiichi && (
              <div className="w-2 h-2 bg-yellow-500 rounded-full" title="Riichi"></div>
            )}
            {isCurrent && (
              <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" title="Current Turn"></div>
            )}
          </div>
          
          {/* Melds display */}
          {player.melds.length > 0 && (
            <div className="flex space-x-2 mt-2 justify-center">
              {player.melds.map((meld, index) => (
                <div key={index} className="flex space-x-1">
                  {meld.tiles.map((tile, tileIndex) => (
                    <Tile key={tileIndex} tile={tile} size="small" />
                  ))}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    );
  };

  const renderDiscardPond = (player: Player, position: string) => {
    if (player.discards.length === 0) return null;
    
    const containerClasses = {
      bottom: 'absolute bottom-24 left-1/2 transform -translate-x-1/2',
      top: 'absolute top-24 left-1/2 transform -translate-x-1/2', 
      left: 'absolute left-24 top-1/2 transform -translate-y-1/2',
      right: 'absolute right-24 top-1/2 transform -translate-y-1/2'
    };

    return (
      <div key={`discard-${player.id}`} className={containerClasses[position as keyof typeof containerClasses]}>
        <div className="text-xs text-gray-600 mb-1">Discards</div>
        <div className="grid grid-cols-6 gap-1 max-w-48">
          {player.discards.map((tile, index) => (
            <Tile 
              key={index} 
              tile={tile} 
              size="small" 
              isDiscarded={true}
            />
          ))}
        </div>
      </div>
    );
  };

  return (
    <div className="relative w-full h-screen bg-gradient-to-br from-green-800 via-green-700 to-green-900 overflow-hidden">
      {/* Game board background */}
      <div className="absolute inset-0 flex items-center justify-center">
        <div className="w-96 h-96 bg-green-600 rounded-full opacity-20 border-4 border-green-400"></div>
      </div>
      
      {/* Center area - Wall info */}
      <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 text-center text-white z-10">
        <div className="bg-black bg-opacity-30 rounded-lg p-4">
          <div className="text-lg font-bold mb-2">Round {gameState.round}</div>
          <div className="text-sm">Tiles left: {gameState.wall.length}</div>
          <div className="text-sm">Honba: {gameState.honba}</div>
          {gameState.riichibou > 0 && (
            <div className="text-sm">Riichi sticks: {gameState.riichibou}</div>
          )}
        </div>
      </div>

      {/* Render all players */}
      {gameState.players.map(player => {
        const position = getPlayerPosition(player.id);
        return (
          <React.Fragment key={player.id}>
            {renderPlayerHand(player, position)}
            {renderDiscardPond(player, position)}
          </React.Fragment>
        );
      })}

      {/* Game controls */}
      <div className="absolute bottom-4 right-4 space-y-2">
        <button
          onClick={() => setShowAnalysis(!showAnalysis)}
          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
        >
          {showAnalysis ? 'Hide' : 'Show'} Analysis
        </button>
        
        {!currentPlayer.isBot && selectedTile && (
          <button
            onClick={() => {
              onAction({
                type: 'discard',
                playerId: currentPlayer.id,
                tile: selectedTile,
                timestamp: Date.now()
              });
              setSelectedTile(null);
            }}
            className="block w-full px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
          >
            Discard Tile
          </button>
        )}
      </div>

      {/* Analysis panel */}
      {showAnalysis && humanPlayer && (
        <AnalysisPanel 
          player={humanPlayer}
          gameState={gameState}
          className="absolute top-4 left-4 w-80"
        />
      )}

      {/* Tutorial modal */}
      {/* Game controls and help */}
      <div className="absolute top-4 right-4 flex items-center space-x-2">
        <div className="bg-black bg-opacity-50 text-white px-3 py-2 rounded-lg text-sm">
          Phase: {gameState.phase}
        </div>
        <button
          onClick={() => setShowInGameGlossary(true)}
          className="bg-purple-600 hover:bg-purple-700 text-white px-3 py-2 rounded-lg text-sm transition-colors"
          title="Open Glossary"
        >
          📚 Help
        </button>
        <button
          onClick={() => setShowInGameAmericanCard(true)}
          className="bg-red-600 hover:bg-red-700 text-white px-3 py-2 rounded-lg text-sm transition-colors"
          title="American Mahjong Reference"
        >
          🇺🇸 American
        </button>
      </div>
      
      {/* Tutorial Modal */}
      {showTutorial && onTutorialClose && (
        <TutorialModal onClose={onTutorialClose} />
      )}
      
      {/* In-game Help Modals */}
      {showInGameGlossary && (
        <GlossaryModal onClose={() => setShowInGameGlossary(false)} />
      )}
      
      {showInGameAmericanCard && (
        <AmericanMahjongCard onClose={() => setShowInGameAmericanCard(false)} />
      )}
    </div>
  );
};