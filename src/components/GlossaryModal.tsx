import React, { useState } from 'react';
import { X, Search, HelpCircle } from 'lucide-react';

interface GlossaryTerm {
  term: string;
  definition: string;
  example?: string;
  category: 'basic' | 'advanced' | 'tiles' | 'actions';
}

interface GlossaryModalProps {
  onClose: () => void;
}

export const GlossaryModal: React.FC<GlossaryModalProps> = ({ onClose }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');

  const glossaryTerms: GlossaryTerm[] = [
    // Basic Terms
    {
      term: "Hand",
      definition: "The 13 or 14 tiles you hold. Your goal is to form a winning hand.",
      example: "Your hand: 🀇🀈🀉🀙🀚🀛🀐🀑🀒🀆🀆🀆🀄🀄",
      category: "basic"
    },
    {
      term: "Discard",
      definition: "A tile you don't want that you put in the center. Other players can see and potentially use it.",
      example: "Click a tile twice to discard it",
      category: "basic"
    },
    {
      term: "Wall",
      definition: "The pile of tiles players draw from. Like a deck of cards.",
      example: "When the wall runs out, the game ends in a draw",
      category: "basic"
    },
    {
      term: "Set/Group",
      definition: "Three tiles that go together - either identical or in sequence.",
      example: "🀇🀇🀇 (triplet) or 🀙🀚🀛 (sequence)",
      category: "basic"
    },
    {
      term: "Pair",
      definition: "Two identical tiles. You need exactly one pair to win.",
      example: "🀄🀄 (Red Dragon pair)",
      category: "basic"
    },

    // Tile Types
    {
      term: "Dots/Circles",
      definition: "One of the three number suits. Has tiles 1-9 with circle symbols.",
      example: "🀙🀚🀛🀜🀝🀞🀟🀠🀡 (1-9 dots)",
      category: "tiles"
    },
    {
      term: "Bamboo/Sticks",
      definition: "One of the three number suits. Has tiles 1-9 with bamboo symbols.",
      example: "🀐🀑🀒🀓🀔🀕🀖🀗🀘 (1-9 bamboo)",
      category: "tiles"
    },
    {
      term: "Characters/Numbers",
      definition: "One of the three number suits. Has tiles 1-9 with Chinese characters.",
      example: "🀇🀈🀉🀊🀋🀌🀍🀎🀏 (1-9 characters)",
      category: "tiles"
    },
    {
      term: "Honor Tiles",
      definition: "Special tiles: Four winds (East/South/West/North) and three dragons (Red/Green/White).",
      example: "🀀🀁🀂🀃🀄🀅🀆 (winds and dragons)",
      category: "tiles"
    },

    // Actions
    {
      term: "Ron",
      definition: "Winning by taking someone else's discarded tile.",
      example: "You need 🀄 to win, someone discards it - you call 'Ron!'",
      category: "actions"
    },
    {
      term: "Tsumo",
      definition: "Winning by drawing the winning tile yourself.",
      example: "You draw exactly the tile you need from the wall",
      category: "actions"
    },
    {
      term: "Chi",
      definition: "Taking the previous player's discard to make a sequence.",
      example: "You have 🀙🀛, previous player discards 🀚 - you can Chi!",
      category: "actions"
    },
    {
      term: "Pon",
      definition: "Taking any player's discard to make a triplet.",
      example: "You have 🀇🀇, someone discards 🀇 - you can Pon!",
      category: "actions"
    },

    // Advanced Terms
    {
      term: "Riichi",
      definition: "Declaring you're one tile away from winning. Advanced strategy - don't worry about this yet!",
      example: "Call 'Riichi' when you're waiting for exactly one tile to win",
      category: "advanced"
    },
    {
      term: "Yaku",
      definition: "Special patterns that make your hand worth points. Like poker hands.",
      example: "All the same suit, or all sequences, etc.",
      category: "advanced"
    },
    {
      term: "Dora",
      definition: "Bonus tiles that give extra points. Advanced concept.",
      example: "The revealed tile next to the wall shows the dora",
      category: "advanced"
    },
    {
      term: "Furiten",
      definition: "A rule that prevents you from winning. Don't worry about this as a beginner.",
      example: "If you discard a tile you could win with, you enter furiten",
      category: "advanced"
    }
  ];

  const categories = [
    { id: 'all', name: 'All Terms', icon: '📚' },
    { id: 'basic', name: 'Basic', icon: '🔤' },
    { id: 'tiles', name: 'Tiles', icon: '🀄' },
    { id: 'actions', name: 'Actions', icon: '⚡' },
    { id: 'advanced', name: 'Advanced', icon: '🎓' }
  ];

  const filteredTerms = glossaryTerms.filter(term => {
    const matchesSearch = term.term.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         term.definition.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = selectedCategory === 'all' || term.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-2xl max-w-4xl w-full mx-4 max-h-[90vh] overflow-hidden flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <div className="flex items-center space-x-2">
            <HelpCircle className="w-6 h-6 text-blue-600" />
            <h2 className="text-xl font-bold text-gray-900">Mahjong Glossary</h2>
          </div>
          <button
            onClick={onClose}
            className="p-1 hover:bg-gray-100 rounded-full transition-colors"
          >
            <X className="w-6 h-6 text-gray-500" />
          </button>
        </div>

        {/* Search and Filter */}
        <div className="p-6 border-b border-gray-200 bg-gray-50">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input
                type="text"
                placeholder="Search terms..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
            <div className="flex gap-2 overflow-x-auto">
              {categories.map(category => (
                <button
                  key={category.id}
                  onClick={() => setSelectedCategory(category.id)}
                  className={`flex items-center space-x-2 px-4 py-2 rounded-lg whitespace-nowrap transition-colors ${
                    selectedCategory === category.id
                      ? 'bg-blue-600 text-white'
                      : 'bg-white text-gray-700 hover:bg-gray-100'
                  }`}
                >
                  <span>{category.icon}</span>
                  <span className="text-sm font-medium">{category.name}</span>
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Terms List */}
        <div className="flex-1 overflow-auto p-6">
          <div className="grid gap-4 md:grid-cols-2">
            {filteredTerms.map((term, index) => (
              <div key={index} className="bg-gray-50 rounded-lg p-4 hover:bg-gray-100 transition-colors">
                <div className="flex items-start justify-between mb-2">
                  <h3 className="font-semibold text-lg text-gray-900">{term.term}</h3>
                  <span className="text-xs px-2 py-1 bg-blue-100 text-blue-600 rounded-full capitalize">
                    {term.category}
                  </span>
                </div>
                <p className="text-gray-700 text-sm mb-2 leading-relaxed">
                  {term.definition}
                </p>
                {term.example && (
                  <div className="bg-blue-50 border border-blue-200 rounded p-2 text-sm">
                    <div className="font-medium text-blue-800 mb-1">Example:</div>
                    <div className="text-blue-700">{term.example}</div>
                  </div>
                )}
              </div>
            ))}
          </div>
          
          {filteredTerms.length === 0 && (
            <div className="text-center py-8 text-gray-500">
              <HelpCircle className="w-12 h-12 mx-auto mb-3 text-gray-300" />
              <p>No terms found matching your search.</p>
              <p className="text-sm">Try searching for something else or select a different category.</p>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-gray-200 bg-gray-50">
          <div className="text-sm text-gray-600 text-center">
            💡 <strong>Tip:</strong> Don't try to memorize everything at once! Focus on the basics first, then gradually learn advanced terms as you play.
          </div>
        </div>
      </div>
    </div>
  );
};