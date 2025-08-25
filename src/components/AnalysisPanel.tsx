import React from 'react';
import { Player, GameState, AIAnalysis } from '@/types/mahjong';
import { getWinningTiles } from '@/utils/gameLogic';
import { MahjongAI } from '@/utils/aiBot';
import { Tile } from './Tile';
import { Brain, Target, Shield, TrendingUp } from 'lucide-react';

interface AnalysisPanelProps {
  player: Player;
  gameState: GameState;
  className?: string;
}

export const AnalysisPanel: React.FC<AnalysisPanelProps> = ({
  player,
  gameState,
  className = ''
}) => {
  const winningTiles = getWinningTiles(player.hand, player.melds);
  
  // Get AI analysis for educational purposes
  const getHandAnalysis = (): AIAnalysis => {
    return {
      efficiency: winningTiles.length / 13,
      safetyRating: 0.7, // Simplified for demo
      recommendedAction: winningTiles.length > 0 ? 'Continue building hand' : 'Focus on basic pairs',
      dangerTiles: [],
      winProbability: Math.min(1, winningTiles.length * 4 / Math.max(1, gameState.wall.length)),
      opponentThreats: gameState.players
        .filter(p => p.id !== player.id && p.isRiichi)
        .map(p => `Player ${p.id + 1} is in riichi`)
    };
  };

  const analysis = getHandAnalysis();

  const getEfficiencyColor = (efficiency: number) => {
    if (efficiency > 0.6) return 'text-green-500';
    if (efficiency > 0.3) return 'text-yellow-500';
    return 'text-red-500';
  };

  const getSafetyColor = (safety: number) => {
    if (safety > 0.7) return 'text-green-500';
    if (safety > 0.4) return 'text-yellow-500';
    return 'text-red-500';
  };

  const getWinProbabilityDisplay = (probability: number) => {
    return `${(probability * 100).toFixed(1)}%`;
  };

  return (
    <div className={`bg-white rounded-lg shadow-lg p-4 ${className}`}>
      <div className="flex items-center space-x-2 mb-4">
        <Brain className="w-5 h-5 text-blue-600" />
        <h3 className="text-lg font-semibold">Hand Analysis</h3>
      </div>

      {/* Key Metrics */}
      <div className="space-y-3 mb-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <TrendingUp className="w-4 h-4 text-blue-500" />
            <span className="text-sm">Efficiency:</span>
          </div>
          <span className={`text-sm font-bold ${getEfficiencyColor(analysis.efficiency)}`}>
            {(analysis.efficiency * 100).toFixed(1)}%
          </span>
        </div>

        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Shield className="w-4 h-4 text-green-500" />
            <span className="text-sm">Safety:</span>
          </div>
          <span className={`text-sm font-bold ${getSafetyColor(analysis.safetyRating)}`}>
            {(analysis.safetyRating * 100).toFixed(1)}%
          </span>
        </div>

        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Target className="w-4 h-4 text-purple-500" />
            <span className="text-sm">Win Probability:</span>
          </div>
          <span className="text-sm font-bold text-purple-600">
            {getWinProbabilityDisplay(analysis.winProbability)}
          </span>
        </div>
      </div>

      {/* Waiting Tiles */}
      <div className="mb-4">
        <h4 className="text-sm font-semibold mb-2 text-gray-700">Waiting For:</h4>
        {winningTiles.length > 0 ? (
          <div className="flex flex-wrap gap-1">
            {winningTiles.slice(0, 8).map((tile, index) => (
              <Tile 
                key={index} 
                tile={tile} 
                size="small"
                showAnalysis={true}
                analysisText="Win!"
              />
            ))}
            {winningTiles.length > 8 && (
              <span className="text-xs text-gray-500 self-center">
                +{winningTiles.length - 8} more
              </span>
            )}
          </div>
        ) : (
          <div className="text-xs text-gray-500 italic">
            No winning tiles yet - build pairs and sequences
          </div>
        )}
      </div>

      {/* AI Recommendation */}
      <div className="mb-4">
        <h4 className="text-sm font-semibold mb-2 text-gray-700">Recommendation:</h4>
        <div className="bg-blue-50 border-l-4 border-blue-400 p-3 text-sm">
          {analysis.recommendedAction}
        </div>
      </div>

      {/* Opponent Threats */}
      {analysis.opponentThreats.length > 0 && (
        <div className="mb-4">
          <h4 className="text-sm font-semibold mb-2 text-gray-700">Threats:</h4>
          <div className="space-y-1">
            {analysis.opponentThreats.map((threat, index) => (
              <div key={index} className="bg-red-50 border-l-4 border-red-400 p-2 text-xs text-red-700">
                ⚠️ {threat}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Hand Composition */}
      <div className="text-xs text-gray-600 space-y-1">
        <div>Tiles in hand: {player.hand.length}</div>
        <div>Melds declared: {player.melds.length}</div>
        <div>Tiles discarded: {player.discards.length}</div>
        {player.isRiichi && (
          <div className="text-yellow-600 font-semibold">🎯 Riichi declared!</div>
        )}
      </div>

      {/* Beginner-Friendly Learning Tips */}
      <div className="mt-4 pt-3 border-t border-gray-200">
        <h4 className="text-sm font-semibold mb-2 text-gray-700">💡 Beginner Guidance:</h4>
        <div className="space-y-2">
          {/* Progress indicator */}
          <div className="text-xs text-gray-600 bg-yellow-50 p-2 rounded">
            {winningTiles.length === 0 && (
              <>
                <strong>🔰 Starting Out:</strong> Look for pairs (two identical tiles) or potential sequences (like 3-4 needing a 2 or 5). Discard single tiles that don't connect to anything.
              </>
            )}
            {winningTiles.length > 0 && winningTiles.length <= 3 && (
              <>
                <strong>📈 Making Progress:</strong> Great! You're getting close to a winning hand. Keep collecting the tiles shown in "Waiting For" above.
              </>
            )}
            {winningTiles.length > 3 && winningTiles.length <= 8 && (
              <>
                <strong>🎯 Almost There:</strong> Excellent progress! You have multiple ways to win. Focus on the most common tiles (lower numbers are usually safer).
              </>
            )}
            {winningTiles.length > 8 && (
              <>
                <strong>🏆 Master Level:</strong> Outstanding! Your hand is very flexible. Consider what opponents might be collecting before discarding.
              </>
            )}
          </div>
          
          {/* Next action suggestion */}
          <div className="text-xs bg-blue-50 p-2 rounded border border-blue-200">
            <strong>🎮 What to do next:</strong>
            {analysis.efficiency < 0.3 && " Try discarding your highest single tile (like 9s or honors you don't have pairs of)."}
            {analysis.efficiency >= 0.3 && analysis.efficiency < 0.6 && " Keep tiles that are close to making sequences or sets. Discard isolated tiles."}
            {analysis.efficiency >= 0.6 && " You're close! Focus on the specific tiles you need and avoid dangerous discards."}
          </div>
          
          {/* Safety reminder for beginners */}
          {analysis.safetyRating < 0.5 && (
            <div className="text-xs bg-red-50 p-2 rounded border border-red-200">
              <strong>⚠️ Safety Alert:</strong> Be careful! Other players might be close to winning. Consider discarding safer tiles (like those already discarded by others).
            </div>
          )}
        </div>
      </div>
    </div>
  );
};