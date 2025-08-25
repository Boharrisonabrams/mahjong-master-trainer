import React, { useState } from 'react';
import { X, ChevronLeft, ChevronRight, BookOpen } from 'lucide-react';

interface TutorialStep {
  title: string;
  content: string;
  image?: string;
}

interface TutorialModalProps {
  onClose: () => void;
}

export const TutorialModal: React.FC<TutorialModalProps> = ({ onClose }) => {
  const [currentStep, setCurrentStep] = useState(0);

  const tutorialSteps: TutorialStep[] = [
    {
      title: "Welcome to Mahjong! 🀄",
      content: "Never played Mahjong before? Don't worry! Think of it like Rummy - you're collecting sets of tiles to win. This tutorial will teach you everything you need to know, starting from absolute basics."
    },
    {
      title: "What IS Mahjong? 🤔",
      content: "Mahjong is like a mix of Rummy and Poker played with beautiful tiles instead of cards. Your goal: Be the first to collect a 'winning hand' - that's 4 groups of 3 tiles + 1 pair (2 matching tiles). It's easier than it sounds!"
    },
    {
      title: "Meet Your Tiles 🀙🀐🀇",
      content: "Imagine poker cards, but with pretty symbols! There are only 3 types to remember: DOTS (circles), BAMBOO (sticks), and CHARACTERS (Chinese numbers). Plus some special 'honor' tiles. Each type has numbers 1-9."
    },
    {
      title: "What's a Winning Hand? 🏆",
      content: "Super simple: Get 4 groups of 3 tiles + 1 pair. Groups can be: (1) Three identical tiles (like 3-3-3), or (2) Three in sequence (like 4-5-6 of same suit). The pair is just two identical tiles. That's it!"
    },
    {
      title: "How Do You Play? 🎮",
      content: "It's like musical chairs with tiles! Players take turns: (1) Draw a tile from the pile, (2) Discard a tile you don't want. Keep doing this until someone gets a winning hand. You can also 'steal' tiles others discard if they help you!"
    },
    {
      title: "Your First Move 👆",
      content: "When it's your turn: Click any tile in your hand to SELECT it (it'll light up blue), then click it again to DISCARD it. The game will automatically draw new tiles for you. Don't worry about strategy yet - just get comfortable clicking!"
    },
    {
      title: "Understanding the Analysis Panel 📊",
      content: "See that box on the left? It's your personal coach! 'Efficiency' shows how close you are to winning. 'Safety' warns if your discards might help opponents. 'Waiting For' shows which tiles you need. Ignore the numbers at first - just read the text!"
    },
    {
      title: "Your Learning Journey 🚀",
      content: "Ready to try? Don't worry about winning your first game - focus on: (1) Getting comfortable clicking tiles, (2) Reading what the analysis panel says, (3) Watching what the AI players do. You'll improve naturally!"
    },
    {
      title: "Common Beginner Questions 💡",
      content: "Q: What if I don't know which tile to discard? A: Check the analysis panel - it gives suggestions! Q: How do I know if I'm winning? A: Your efficiency percentage will go up! Q: What if I make mistakes? A: Perfect! That's how you learn. The AI will show you better moves."
    },
    {
      title: "American Mahjong Players Note 🇺🇸",
      content: "If you know American Mahjong, this is different! No jokers, no 'hands' card, simpler rules. Think of it as the original, elegant version. The basic concept is the same - collect groups - but the details are simpler."
    }
  ];

  const nextStep = () => {
    if (currentStep < tutorialSteps.length - 1) {
      setCurrentStep(currentStep + 1);
    }
  };

  const prevStep = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  const step = tutorialSteps[currentStep];

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-2xl max-w-2xl w-full mx-4 max-h-[90vh] overflow-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <div className="flex items-center space-x-2">
            <BookOpen className="w-6 h-6 text-blue-600" />
            <h2 className="text-xl font-bold text-gray-900">Mahjong Tutorial</h2>
          </div>
          <button
            onClick={onClose}
            className="p-1 hover:bg-gray-100 rounded-full transition-colors"
          >
            <X className="w-6 h-6 text-gray-500" />
          </button>
        </div>

        {/* Progress bar */}
        <div className="px-6 pt-4">
          <div className="flex justify-between text-xs text-gray-500 mb-2">
            <span>Step {currentStep + 1} of {tutorialSteps.length}</span>
            <span>{Math.round(((currentStep + 1) / tutorialSteps.length) * 100)}% Complete</span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div 
              className="bg-blue-600 h-2 rounded-full transition-all duration-300"
              style={{ width: `${((currentStep + 1) / tutorialSteps.length) * 100}%` }}
            ></div>
          </div>
        </div>

        {/* Content */}
        <div className="p-6">
          <h3 className="text-lg font-semibold mb-4 text-gray-900">
            {step.title}
          </h3>
          
          <div className="text-gray-700 leading-relaxed mb-6">
            {step.content}
          </div>

          {/* Visual examples for each step */}
          {currentStep === 2 && (
            <div className="bg-green-50 border border-green-200 p-4 rounded-lg mb-4">
              <div className="text-sm font-semibold mb-2 text-green-800">Think of it like Rummy:</div>
              <div className="text-sm text-green-700">
                <strong>Rummy:</strong> Collect 3-of-a-kind or runs (like 4♠-5♠-6♠)<br/>
                <strong>Mahjong:</strong> Collect 3-of-a-kind or runs (like 4🀙-5🀚-6🀛)
              </div>
            </div>
          )}

          {currentStep === 3 && (
            <div className="bg-blue-50 border border-blue-200 p-4 rounded-lg mb-4">
              <div className="grid grid-cols-3 gap-4 text-center">
                <div className="bg-white p-3 rounded">
                  <div className="text-3xl mb-2">🀙🀚🀛</div>
                  <div className="text-sm font-semibold text-blue-800">DOTS</div>
                  <div className="text-xs text-blue-600">(Like ⚫⚫⚫)</div>
                </div>
                <div className="bg-white p-3 rounded">
                  <div className="text-3xl mb-2">🀐🀑🀒</div>
                  <div className="text-sm font-semibold text-green-800">BAMBOO</div>
                  <div className="text-xs text-green-600">(Like 🎋🎋🎋)</div>
                </div>
                <div className="bg-white p-3 rounded">
                  <div className="text-3xl mb-2">🀇🀈🀉</div>
                  <div className="text-sm font-semibold text-red-800">CHARACTERS</div>
                  <div className="text-xs text-red-600">(Chinese 1-2-3)</div>
                </div>
              </div>
              <div className="text-center mt-3 text-sm text-gray-600">
                Plus some special tiles (winds & dragons) - don't worry about these yet!
              </div>
            </div>
          )}

          {currentStep === 4 && (
            <div className="bg-yellow-50 border border-yellow-200 p-4 rounded-lg mb-4">
              <div className="text-sm font-semibold mb-3 text-yellow-800">Winning Hand = 4 Groups + 1 Pair</div>
              <div className="space-y-2">
                <div className="bg-white p-2 rounded text-center">
                  <div className="text-lg">🀇🀇🀇 + 🀙🀚🀛 + 🀐🀑🀒 + 🀆🀆🀆 + 🀄🀄</div>
                  <div className="text-xs text-gray-600 mt-1">
                    Group 1 + Group 2 + Group 3 + Group 4 + Pair = WIN!
                  </div>
                </div>
                <div className="text-xs text-yellow-700">
                  <strong>Groups:</strong> Either 3 identical (🀇🀇🀇) or 3 in sequence (🀙🀚🀛)<br/>
                  <strong>Pair:</strong> Just 2 identical tiles (🀄🀄)
                </div>
              </div>
            </div>
          )}

          {currentStep === 5 && (
            <div className="bg-purple-50 border border-purple-200 p-4 rounded-lg mb-4">
              <div className="text-sm font-semibold mb-2 text-purple-800">The Turn Cycle:</div>
              <div className="space-y-2 text-sm text-purple-700">
                <div className="flex items-center"><span className="text-lg mr-2">1️⃣</span> Draw a tile from the wall</div>
                <div className="flex items-center"><span className="text-lg mr-2">2️⃣</span> Discard a tile you don't want</div>
                <div className="flex items-center"><span className="text-lg mr-2">3️⃣</span> Next player's turn</div>
                <div className="flex items-center"><span className="text-lg mr-2">🔄</span> Repeat until someone wins!</div>
              </div>
            </div>
          )}

          {currentStep === 6 && (
            <div className="bg-blue-50 border border-blue-200 p-4 rounded-lg mb-4">
              <div className="text-sm font-semibold mb-2 text-blue-800">Your First Moves:</div>
              <div className="space-y-3">
                <div className="bg-white p-3 rounded flex items-center">
                  <div className="text-2xl mr-3">👆</div>
                  <div>
                    <div className="font-semibold text-blue-800">Click once = SELECT</div>
                    <div className="text-xs text-blue-600">Tile will light up blue</div>
                  </div>
                </div>
                <div className="bg-white p-3 rounded flex items-center">
                  <div className="text-2xl mr-3">👆👆</div>
                  <div>
                    <div className="font-semibold text-blue-800">Click again = DISCARD</div>
                    <div className="text-xs text-blue-600">Tile goes to discard pile</div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {currentStep === 7 && (
            <div className="bg-green-50 border border-green-200 p-4 rounded-lg mb-4">
              <div className="text-sm font-semibold mb-2 text-green-800">Your Analysis Coach:</div>
              <div className="space-y-2 text-sm text-green-700">
                <div><strong>📈 Efficiency:</strong> "How close am I to winning?" (Higher = closer!)</div>
                <div><strong>🛡️ Safety:</strong> "Is my discard dangerous?" (Higher = safer!)</div>
                <div><strong>🎯 Waiting For:</strong> "Which tiles do I need?" (Your target tiles!)</div>
                <div><strong>💡 Recommendation:</strong> "What should I do?" (Your best move!)</div>
              </div>
            </div>
          )}

          {currentStep === 8 && (
            <div className="bg-orange-50 border border-orange-200 p-4 rounded-lg mb-4">
              <div className="text-sm font-semibold mb-2 text-orange-800">Your Learning Goals:</div>
              <div className="space-y-2">
                <div className="flex items-center text-sm text-orange-700">
                  <span className="mr-2">🎯</span> Get comfortable clicking tiles
                </div>
                <div className="flex items-center text-sm text-orange-700">
                  <span className="mr-2">📖</span> Read the analysis panel suggestions
                </div>
                <div className="flex items-center text-sm text-orange-700">
                  <span className="mr-2">👀</span> Watch what the AI players do
                </div>
                <div className="flex items-center text-sm text-orange-700">
                  <span className="mr-2">🚀</span> Have fun learning!
                </div>
              </div>
            </div>
          )}

          {currentStep === 9 && (
            <div className="bg-red-50 border border-red-200 p-4 rounded-lg mb-4">
              <div className="text-sm font-semibold mb-2 text-red-800">Quick Help:</div>
              <div className="space-y-2 text-sm text-red-700">
                <div><strong>❓ Lost?</strong> Read the "Recommendation" in the analysis panel</div>
                <div><strong>🤔 Confused?</strong> Try discarding your highest single tile first</div>
                <div><strong>😰 Overwhelmed?</strong> Focus on just collecting pairs and sequences</div>
                <div><strong>🎉 Having fun?</strong> You're doing it right!</div>
              </div>
            </div>
          )}
        </div>

        {/* Navigation */}
        <div className="flex items-center justify-between p-6 border-t border-gray-200">
          <button
            onClick={prevStep}
            disabled={currentStep === 0}
            className="flex items-center space-x-2 px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            <ChevronLeft className="w-4 h-4" />
            <span>Previous</span>
          </button>

          <div className="flex space-x-2">
            {tutorialSteps.map((_, index) => (
              <button
                key={index}
                onClick={() => setCurrentStep(index)}
                className={`w-3 h-3 rounded-full transition-colors ${
                  index === currentStep ? 'bg-blue-600' : 'bg-gray-300'
                }`}
              />
            ))}
          </div>

          {currentStep < tutorialSteps.length - 1 ? (
            <button
              onClick={nextStep}
              className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              <span>Next</span>
              <ChevronRight className="w-4 h-4" />
            </button>
          ) : (
            <button
              onClick={onClose}
              className="px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
            >
              Start Playing!
            </button>
          )}
        </div>
      </div>
    </div>
  );
};