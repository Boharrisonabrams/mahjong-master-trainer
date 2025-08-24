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
      title: "Welcome to Mahjong Trainer!",
      content: "This interactive trainer will teach you Riichi Mahjong from basics to advanced strategy. You'll play against AI opponents while learning optimal moves and reading opponent hands."
    },
    {
      title: "The Goal of Mahjong",
      content: "Form a complete hand of 14 tiles using 4 sets (3-tile groups) plus 1 pair (2 identical tiles). Sets can be sequences (1-2-3) in the same suit or triplets (three identical tiles)."
    },
    {
      title: "Tile Types",
      content: "There are 4 suits: Dots (⚬), Bamboo (🎋), Characters (漢), and Honors (風). Number tiles go 1-9 in each suit. Honors include winds (East/South/West/North) and dragons (Red/Green/White)."
    },
    {
      title: "Basic Gameplay",
      content: "Players take turns drawing and discarding tiles. You can claim discarded tiles to form sets (Chi/Pon/Kan). The first player to form a complete hand wins the round."
    },
    {
      title: "Reading the Board",
      content: "Watch your opponents' discards and declared sets. This tells you what they're collecting and what's safe to discard. The analysis panel will help you understand these patterns."
    },
    {
      title: "Strategy Basics",
      content: "Balance speed (completing your hand quickly) with safety (avoiding dangerous discards) and value (collecting yaku for bonus points). The AI will show you optimal plays."
    },
    {
      title: "Using the Analysis Panel",
      content: "The analysis panel shows your hand efficiency, safety rating, and winning probability. It highlights which tiles you're waiting for and warns about opponent threats."
    },
    {
      title: "Learning Through Play",
      content: "Start playing! The AI opponents will make realistic moves and the analysis will explain why certain plays are better. Post-game analysis will review your key decisions."
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

          {/* Visual examples for certain steps */}
          {currentStep === 1 && (
            <div className="bg-gray-50 p-4 rounded-lg mb-4">
              <div className="text-sm font-semibold mb-2">Example Winning Hand:</div>
              <div className="text-lg font-mono">
                123m 456p 789s 111z 22z
              </div>
              <div className="text-xs text-gray-600 mt-1">
                (3 sequences + 1 triplet + 1 pair)
              </div>
            </div>
          )}

          {currentStep === 2 && (
            <div className="bg-gray-50 p-4 rounded-lg mb-4">
              <div className="grid grid-cols-4 gap-4 text-center">
                <div>
                  <div className="text-2xl mb-1">🀙🀚🀛</div>
                  <div className="text-xs">Dots (Pin)</div>
                </div>
                <div>
                  <div className="text-2xl mb-1">🀐🀑🀒</div>
                  <div className="text-xs">Bamboo (Sou)</div>
                </div>
                <div>
                  <div className="text-2xl mb-1">🀇🀈🀉</div>
                  <div className="text-xs">Characters (Man)</div>
                </div>
                <div>
                  <div className="text-2xl mb-1">🀀🀁🀄</div>
                  <div className="text-xs">Honors</div>
                </div>
              </div>
            </div>
          )}

          {currentStep === 6 && (
            <div className="bg-blue-50 border border-blue-200 p-4 rounded-lg mb-4">
              <div className="text-sm font-semibold mb-2 text-blue-800">
                Analysis Panel Features:
              </div>
              <ul className="text-sm text-blue-700 space-y-1">
                <li>• <strong>Efficiency:</strong> How close you are to winning</li>
                <li>• <strong>Safety:</strong> Risk level of your discards</li>
                <li>• <strong>Waiting Tiles:</strong> Which tiles complete your hand</li>
                <li>• <strong>Threats:</strong> Opponent danger warnings</li>
                <li>• <strong>Recommendations:</strong> AI-suggested best plays</li>
              </ul>
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