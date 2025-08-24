'use client';

import React from 'react';
import { useGame } from '@/hooks/useGame';
import { GameBoard } from '@/components/GameBoard';
import { Play, RotateCcw, BookOpen, Trophy } from 'lucide-react';

export default function Home() {
  const {
    gameState,
    isGameActive,
    showTutorial,
    initializeGame,
    processAction,
    resetGame,
    startTutorial,
    closeTutorial
  } = useGame();

  if (!isGameActive || !gameState) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-green-900 via-green-800 to-green-700 flex items-center justify-center">
        <div className="bg-white rounded-2xl shadow-2xl p-8 max-w-2xl w-full mx-4">
          <div className="text-center mb-8">
            <div className="flex items-center justify-center mb-4">
              <Trophy className="w-12 h-12 text-yellow-500 mr-3" />
              <h1 className="text-4xl font-bold text-gray-900">Mahjong Master Trainer</h1>
            </div>
            <p className="text-lg text-gray-600">
              Learn Riichi Mahjong through strategic play against intelligent AI opponents
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-6 mb-8">
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
              <h3 className="font-semibold text-blue-900 mb-3">🎯 Strategic Learning</h3>
              <p className="text-blue-800 text-sm">
                Real-time analysis shows optimal plays, hand efficiency, and opponent threats
              </p>
            </div>
            
            <div className="bg-green-50 border border-green-200 rounded-lg p-6">
              <h3 className="font-semibold text-green-900 mb-3">🤖 Smart AI Opponents</h3>
              <p className="text-green-800 text-sm">
                Three difficulty levels with realistic decision-making and strategic depth
              </p>
            </div>
            
            <div className="bg-purple-50 border border-purple-200 rounded-lg p-6">
              <h3 className="font-semibold text-purple-900 mb-3">📊 Post-Game Analysis</h3>
              <p className="text-purple-800 text-sm">
                Review key decisions and learn from alternative strategies
              </p>
            </div>
            
            <div className="bg-orange-50 border border-orange-200 rounded-lg p-6">
              <h3 className="font-semibold text-orange-900 mb-3">🎓 Progressive Tutorials</h3>
              <p className="text-orange-800 text-sm">
                From basic rules to advanced yaku recognition and defensive play
              </p>
            </div>
          </div>

          <div className="space-y-4">
            <button
              onClick={initializeGame}
              className="w-full flex items-center justify-center space-x-3 bg-green-600 hover:bg-green-700 text-white font-semibold py-4 px-6 rounded-lg transition-colors duration-200"
            >
              <Play className="w-6 h-6" />
              <span>Start Training Session</span>
            </button>
            
            <button
              onClick={startTutorial}
              className="w-full flex items-center justify-center space-x-3 bg-blue-600 hover:bg-blue-700 text-white font-semibold py-4 px-6 rounded-lg transition-colors duration-200"
            >
              <BookOpen className="w-6 h-6" />
              <span>Learn the Basics</span>
            </button>
          </div>

          <div className="mt-8 p-4 bg-gray-50 rounded-lg">
            <h4 className="font-semibold text-gray-900 mb-2">🎮 How to Play</h4>
            <ul className="text-sm text-gray-700 space-y-1">
              <li>• Click tiles in your hand to select and discard them</li>
              <li>• Watch the analysis panel for strategic insights</li>
              <li>• Learn from AI decisions and post-game reviews</li>
              <li>• Progress from beginner to master level play</li>
            </ul>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="relative">
      <GameBoard
        gameState={gameState}
        onAction={processAction}
        showTutorial={showTutorial}
        onTutorialClose={closeTutorial}
      />
      
      {/* Game Over Screen */}
      {gameState.phase === 'won' && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-2xl shadow-2xl p-8 max-w-md w-full mx-4">
            <div className="text-center">
              <Trophy className="w-16 h-16 text-yellow-500 mx-auto mb-4" />
              <h2 className="text-2xl font-bold mb-2">Game Complete!</h2>
              
              {gameState.lastAction?.type === 'ron' && (
                <p className="text-gray-600 mb-4">
                  Player {(gameState.lastAction.playerId || 0) + 1} won by Ron!
                </p>
              )}
              
              {gameState.lastAction?.type === 'tsumo' && (
                <p className="text-gray-600 mb-4">
                  Player {(gameState.lastAction.playerId || 0) + 1} won by Tsumo!
                </p>
              )}
              
              <div className="space-y-3 mt-6">
                <button
                  onClick={initializeGame}
                  className="w-full flex items-center justify-center space-x-2 bg-green-600 hover:bg-green-700 text-white font-semibold py-3 px-4 rounded-lg transition-colors"
                >
                  <Play className="w-5 h-5" />
                  <span>Play Again</span>
                </button>
                
                <button
                  onClick={resetGame}
                  className="w-full flex items-center justify-center space-x-2 bg-gray-600 hover:bg-gray-700 text-white font-semibold py-3 px-4 rounded-lg transition-colors"
                >
                  <RotateCcw className="w-5 h-5" />
                  <span>Back to Menu</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
      
      {/* Draw Screen */}
      {gameState.phase === 'draw' && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-2xl shadow-2xl p-8 max-w-md w-full mx-4">
            <div className="text-center">
              <div className="text-4xl mb-4">🤝</div>
              <h2 className="text-2xl font-bold mb-2">Draw Game</h2>
              <p className="text-gray-600 mb-6">
                The wall ran out of tiles. No winner this round.
              </p>
              
              <div className="space-y-3">
                <button
                  onClick={initializeGame}
                  className="w-full flex items-center justify-center space-x-2 bg-green-600 hover:bg-green-700 text-white font-semibold py-3 px-4 rounded-lg transition-colors"
                >
                  <Play className="w-5 h-5" />
                  <span>Play Again</span>
                </button>
                
                <button
                  onClick={resetGame}
                  className="w-full flex items-center justify-center space-x-2 bg-gray-600 hover:bg-gray-700 text-white font-semibold py-3 px-4 rounded-lg transition-colors"
                >
                  <RotateCcw className="w-5 h-5" />
                  <span>Back to Menu</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
