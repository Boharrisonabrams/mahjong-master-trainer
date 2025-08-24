import React from 'react';
import { Tile as TileType } from '@/types/mahjong';
import { getTileUnicode, getTileDisplay } from '@/utils/tiles';

interface TileProps {
  tile: TileType;
  onClick?: () => void;
  isSelected?: boolean;
  isDiscarded?: boolean;
  size?: 'small' | 'medium' | 'large';
  showAnalysis?: boolean;
  analysisText?: string;
}

export const Tile: React.FC<TileProps> = ({
  tile,
  onClick,
  isSelected = false,
  isDiscarded = false,
  size = 'medium',
  showAnalysis = false,
  analysisText
}) => {
  const sizeClasses = {
    small: 'w-8 h-12 text-xs',
    medium: 'w-12 h-16 text-sm',
    large: 'w-16 h-20 text-base'
  };

  const baseClasses = `
    ${sizeClasses[size]}
    bg-white border-2 rounded-lg cursor-pointer
    flex flex-col items-center justify-center
    font-mono font-bold
    transition-all duration-200
    hover:shadow-lg hover:scale-105
    relative
    ${isSelected ? 'border-blue-500 bg-blue-50 -translate-y-2' : 'border-gray-300'}
    ${isDiscarded ? 'opacity-60 rotate-90' : ''}
    ${onClick ? 'hover:border-blue-400' : 'cursor-default'}
    ${tile.isRed ? 'text-red-500' : 'text-gray-800'}
  `;

  const unicode = getTileUnicode(tile);
  const display = getTileDisplay(tile);

  return (
    <div className="relative">
      <div 
        className={baseClasses}
        onClick={onClick}
        role={onClick ? "button" : undefined}
        tabIndex={onClick ? 0 : undefined}
      >
        <div className="text-lg mb-1">
          {unicode}
        </div>
        <div className="text-xs">
          {display}
        </div>
        
        {tile.isRed && (
          <div className="absolute top-0 right-0 w-2 h-2 bg-red-500 rounded-full transform translate-x-1 -translate-y-1"></div>
        )}
      </div>
      
      {showAnalysis && analysisText && (
        <div className="absolute -top-6 left-1/2 transform -translate-x-1/2 bg-black text-white text-xs px-2 py-1 rounded whitespace-nowrap z-10">
          {analysisText}
        </div>
      )}
    </div>
  );
};