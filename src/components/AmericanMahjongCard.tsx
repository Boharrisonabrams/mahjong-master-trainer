import React, { useState } from 'react';
import { X, Star, Flag } from 'lucide-react';

interface AmericanMahjongCardProps {
  onClose: () => void;
}

export const AmericanMahjongCard: React.FC<AmericanMahjongCardProps> = ({ onClose }) => {
  const [selectedSection, setSelectedSection] = useState('comparison');

  const americanHands = [
    // Year Hands (Example year: 2024)
    {
      category: "2024 Hands",
      description: "Hands featuring the year 2024",
      hands: [
        { pattern: "2024 2024 2024", points: "25", description: "Three identical 2024 sequences" },
        { pattern: "222 4 2024 2024", points: "25", description: "Triplet of 2s, single 4, two 2024 sequences" },
        { pattern: "20 24 20 24 20 24", points: "25", description: "Three pairs of 20s and 24s alternating" }
      ]
    },
    
    // Consecutive Runs
    {
      category: "Consecutive Runs", 
      description: "Sequential numbers in order",
      hands: [
        { pattern: "1111 2222 3333", points: "25", description: "Four 1s, four 2s, four 3s" },
        { pattern: "11 22 33 44 55 66", points: "30", description: "Six consecutive pairs" },
        { pattern: "123 456 789 DD", points: "25", description: "Three consecutive runs plus dragon pair" }
      ]
    },

    // Winds and Dragons
    {
      category: "Winds & Dragons",
      description: "Hands using wind and dragon tiles",
      hands: [
        { pattern: "EEEE SSSS WWWW", points: "25", description: "Winds only - East, South, West quads" },
        { pattern: "RRR GGG WWW DD", points: "30", description: "All dragons plus any pair" },
        { pattern: "NEWS NEWS FF", points: "25", description: "Two identical wind sequences plus flower pair" }
      ]
    },

    // Singles and Pairs
    {
      category: "Singles & Pairs",
      description: "Mixed single tiles and pairs",
      hands: [
        { pattern: "11 33 55 77 99 NN FF", points: "25", description: "Odd number pairs plus North and Flower pairs" },
        { pattern: "2 4 6 8 2 4 6 8 RR", points: "30", description: "Two sets of even numbers plus Red dragon pair" },
        { pattern: "AA BB CC DD EE FF GG", points: "35", description: "Seven different pairs" }
      ]
    }
  ];

  const comparisonData = [
    {
      aspect: "Tiles Used",
      american: "152 tiles total (4 of each regular tile + jokers + flowers/seasons)",
      riichi: "136 tiles total (4 of each tile, no jokers or extras)"
    },
    {
      aspect: "Jokers",
      american: "8 jokers that can substitute for most tiles",
      riichi: "No jokers - must use actual tiles"
    },
    {
      aspect: "Hand Requirements",
      american: "Must match specific patterns on the yearly card exactly",
      riichi: "Form 4 groups + 1 pair in any valid combination"
    },
    {
      aspect: "Scoring",
      american: "Fixed points based on hand category (25, 30, 35, etc.)",
      riichi: "Variable points based on yaku (special patterns) and han"
    },
    {
      aspect: "Charleston",
      american: "Pass tiles to other players before the game starts",
      riichi: "No tile passing - play with dealt tiles"
    },
    {
      aspect: "Calling",
      american: "Can call for any discarded tile to complete your hand",
      riichi: "Specific rules for Chi (sequences), Pon (triplets), and Kan (quads)"
    },
    {
      aspect: "Strategy Focus",
      american: "Pattern matching and joker management",
      riichi: "Efficiency, defense, and reading opponents"
    }
  ];

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-2xl max-w-6xl w-full mx-4 max-h-[90vh] overflow-hidden flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200 bg-red-50">
          <div className="flex items-center space-x-2">
            <Flag className="w-6 h-6 text-red-600" />
            <h2 className="text-xl font-bold text-gray-900">American Mahjong Reference</h2>
          </div>
          <button
            onClick={onClose}
            className="p-1 hover:bg-red-100 rounded-full transition-colors"
          >
            <X className="w-6 h-6 text-gray-500" />
          </button>
        </div>

        {/* Tab Navigation */}
        <div className="flex border-b border-gray-200 bg-gray-50">
          <button
            onClick={() => setSelectedSection('comparison')}
            className={`flex-1 py-3 px-4 text-sm font-medium transition-colors ${
              selectedSection === 'comparison'
                ? 'bg-white text-blue-600 border-b-2 border-blue-600'
                : 'text-gray-700 hover:text-gray-900 hover:bg-gray-100'
            }`}
          >
            🆚 American vs Riichi
          </button>
          <button
            onClick={() => setSelectedSection('hands')}
            className={`flex-1 py-3 px-4 text-sm font-medium transition-colors ${
              selectedSection === 'hands'
                ? 'bg-white text-blue-600 border-b-2 border-blue-600'
                : 'text-gray-700 hover:text-gray-900 hover:bg-gray-100'
            }`}
          >
            🀄 Sample Hands
          </button>
          <button
            onClick={() => setSelectedSection('tips')}
            className={`flex-1 py-3 px-4 text-sm font-medium transition-colors ${
              selectedSection === 'tips'
                ? 'bg-white text-blue-600 border-b-2 border-blue-600'
                : 'text-gray-700 hover:text-gray-900 hover:bg-gray-100'
            }`}
          >
            💡 Transition Tips
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-auto p-6">
          {selectedSection === 'comparison' && (
            <div className="space-y-6">
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <h3 className="font-semibold text-blue-900 mb-2">🔍 Key Differences Overview</h3>
                <p className="text-blue-800 text-sm">
                  If you're familiar with American Mahjong, think of Riichi Mahjong as the "original" 
                  version - simpler rules, no jokers, more strategic depth, but the same core concept 
                  of collecting tiles to form winning combinations.
                </p>
              </div>

              <div className="grid gap-4">
                {comparisonData.map((item, index) => (
                  <div key={index} className="bg-gray-50 rounded-lg p-4">
                    <h4 className="font-semibold text-gray-900 mb-3">{item.aspect}</h4>
                    <div className="grid md:grid-cols-2 gap-4">
                      <div className="bg-red-50 border border-red-200 rounded p-3">
                        <div className="font-medium text-red-800 mb-1 flex items-center">
                          <Flag className="w-4 h-4 mr-1" />
                          American Mahjong
                        </div>
                        <div className="text-red-700 text-sm">{item.american}</div>
                      </div>
                      <div className="bg-green-50 border border-green-200 rounded p-3">
                        <div className="font-medium text-green-800 mb-1 flex items-center">
                          <Star className="w-4 h-4 mr-1" />
                          Riichi Mahjong
                        </div>
                        <div className="text-green-700 text-sm">{item.riichi}</div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {selectedSection === 'hands' && (
            <div className="space-y-6">
              <div className="bg-orange-50 border border-orange-200 rounded-lg p-4">
                <h3 className="font-semibold text-orange-900 mb-2">📋 Sample American Mahjong Hands</h3>
                <p className="text-orange-800 text-sm">
                  These are examples of the structured patterns from American Mahjong cards. 
                  Notice how specific they are compared to Riichi's flexible "4 groups + 1 pair" rule.
                </p>
              </div>

              <div className="grid gap-6">
                {americanHands.map((section, index) => (
                  <div key={index} className="bg-gray-50 rounded-lg p-4">
                    <h4 className="font-semibold text-gray-900 mb-2">{section.category}</h4>
                    <p className="text-gray-600 text-sm mb-4">{section.description}</p>
                    
                    <div className="space-y-3">
                      {section.hands.map((hand, handIndex) => (
                        <div key={handIndex} className="bg-white rounded border p-3">
                          <div className="flex justify-between items-start mb-2">
                            <div className="font-mono text-lg text-blue-600">{hand.pattern}</div>
                            <div className="bg-yellow-100 text-yellow-800 px-2 py-1 rounded text-sm font-semibold">
                              {hand.points} pts
                            </div>
                          </div>
                          <div className="text-gray-700 text-sm">{hand.description}</div>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {selectedSection === 'tips' && (
            <div className="space-y-6">
              <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                <h3 className="font-semibold text-green-900 mb-2">🚀 Making the Transition</h3>
                <p className="text-green-800 text-sm">
                  Coming from American Mahjong? Here's how to adapt your skills to Riichi Mahjong.
                </p>
              </div>

              <div className="grid md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <h4 className="font-semibold text-gray-900">✅ What Transfers Over</h4>
                  
                  <div className="space-y-3">
                    <div className="bg-green-50 border border-green-200 rounded p-3">
                      <div className="font-medium text-green-800">Tile Recognition</div>
                      <div className="text-green-700 text-sm">You already know dots, bamboo, characters, winds, and dragons!</div>
                    </div>
                    
                    <div className="bg-green-50 border border-green-200 rounded p-3">
                      <div className="font-medium text-green-800">Pattern Awareness</div>
                      <div className="text-green-700 text-sm">Your eye for sequences and sets will serve you well.</div>
                    </div>
                    
                    <div className="bg-green-50 border border-green-200 rounded p-3">
                      <div className="font-medium text-green-800">Game Flow</div>
                      <div className="text-green-700 text-sm">Draw, discard, watch opponents - the rhythm is similar.</div>
                    </div>
                  </div>
                </div>

                <div className="space-y-4">
                  <h4 className="font-semibold text-gray-900">🔄 What to Adjust</h4>
                  
                  <div className="space-y-3">
                    <div className="bg-orange-50 border border-orange-200 rounded p-3">
                      <div className="font-medium text-orange-800">No More Jokers</div>
                      <div className="text-orange-700 text-sm">Learn to work with only the tiles you're dealt - no wild cards!</div>
                    </div>
                    
                    <div className="bg-orange-50 border border-orange-200 rounded p-3">
                      <div className="font-medium text-orange-800">Flexible Patterns</div>
                      <div className="text-orange-700 text-sm">Instead of fixed card patterns, any 4 groups + 1 pair works.</div>
                    </div>
                    
                    <div className="bg-orange-50 border border-orange-200 rounded p-3">
                      <div className="font-medium text-orange-800">Defense Matters</div>
                      <div className="text-orange-700 text-sm">Watch what you discard - opponents can win off your tiles!</div>
                    </div>
                  </div>
                </div>
              </div>

              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <h4 className="font-semibold text-blue-900 mb-3">🎯 Your Learning Strategy</h4>
                <div className="space-y-2 text-blue-800 text-sm">
                  <div className="flex items-center"><span className="mr-2">1️⃣</span> Start by ignoring scoring (yaku) - just focus on making any winning hand</div>
                  <div className="flex items-center"><span className="mr-2">2️⃣</span> Practice basic sequences and triplets without relying on jokers</div>
                  <div className="flex items-center"><span className="mr-2">3️⃣</span> Use the analysis panel as your "card" - it shows what you should aim for</div>
                  <div className="flex items-center"><span className="mr-2">4️⃣</span> Gradually learn defensive play - when NOT to discard certain tiles</div>
                  <div className="flex items-center"><span className="mr-2">5️⃣</span> Once comfortable, start learning about yaku (scoring patterns)</div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};