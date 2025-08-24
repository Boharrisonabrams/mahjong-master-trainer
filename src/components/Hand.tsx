import React from 'react';
import { Tile as TileType } from '@/types/mahjong';
import { Tile } from './Tile';

interface HandProps {
  tiles: TileType[];
  onTileClick?: (tile: TileType) => void;
  selectedTile?: TileType | null;
  isPlayer?: boolean;
  showTiles?: boolean;
  playerName: string;
}

export const Hand: React.FC<HandProps> = ({
  tiles,
  onTileClick,
  selectedTile,
  isPlayer = false,
  showTiles = true,
  playerName
}) => {
  return (
    <div className="flex flex-col items-center space-y-2">
      <div className="text-sm font-semibold text-gray-700">
        {playerName} {isPlayer && '(You)'}
      </div>
      
      <div className="flex flex-wrap gap-1 justify-center">
        {tiles.map((tile, index) => (
          <Tile
            key={`${tile.id}-${index}`}
            tile={showTiles ? tile : { 
              id: 'hidden', 
              suit: 'honor', 
              value: 'east' 
            }}
            onClick={onTileClick ? () => onTileClick(tile) : undefined}
            isSelected={selectedTile?.id === tile.id}
            size={isPlayer ? 'medium' : 'small'}
          />
        ))}
        
        {!showTiles && (
          <div className="text-xs text-gray-500 mt-2">
            {tiles.length} tiles
          </div>
        )}
      </div>
    </div>
  );
};