"use client";

import { useState, useEffect } from "react";

interface CrosswordPuzzleProps {
  isVisible: boolean;
  onSolved: () => void;
  onClose: () => void;
}

export default function CrosswordPuzzle({
  isVisible,
  onSolved,
  onClose,
}: CrosswordPuzzleProps) {
  const [currentInput, setCurrentInput] = useState("");
  const [isCorrect, setIsCorrect] = useState(false);
  const [showHint, setShowHint] = useState(false);
  const [attempts, setAttempts] = useState(0);

  const correctAnswer = "REPENNY";
  const maxLength = 7;

  useEffect(() => {
    if (currentInput.toUpperCase() === correctAnswer) {
      setIsCorrect(true);
      setTimeout(() => {
        onSolved();
      }, 1500);
    }
  }, [currentInput, onSolved]);

  const handleInputChange = (value: string) => {
    if (value.length <= maxLength) {
      setCurrentInput(value.toUpperCase());
    }
  };

  const handleSubmit = () => {
    if (currentInput.toUpperCase() !== correctAnswer) {
      setAttempts((prev) => prev + 1);
      if (attempts >= 1) {
        setShowHint(true);
      }
      // Shake animation for wrong answer
      const grid = document.getElementById("crossword-grid");
      if (grid) {
        grid.classList.add("animate-pulse");
        setTimeout(() => grid.classList.remove("animate-pulse"), 500);
      }
    }
  };

  const renderGrid = () => {
    const cells = [];
    for (let i = 0; i < maxLength; i++) {
      const letter = currentInput[i] || "";
      const isCorrectPosition = isCorrect && correctAnswer[i] === letter;

      cells.push(
        <div
          key={i}
          className={`
            w-12 h-12 border-2 border-amber-600 bg-amber-50 
            flex items-center justify-center text-xl font-bold
            transition-all duration-300
            ${isCorrectPosition ? "bg-green-200 border-green-500" : ""}
            ${letter ? "text-amber-900" : "text-gray-400"}
          `}
        >
          {letter}
        </div>
      );
    }
    return cells;
  };

  if (!isVisible) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-75">
      <div className="relative max-w-md w-full mx-4">
        {/* Parchment Background */}
        <div
          className="relative bg-amber-100 border-4 border-amber-800 rounded-lg p-8 shadow-2xl"
          style={{
            backgroundImage: `
              radial-gradient(circle at 20% 50%, rgba(139, 69, 19, 0.1) 0%, transparent 50%),
              radial-gradient(circle at 80% 20%, rgba(160, 82, 45, 0.1) 0%, transparent 50%),
              radial-gradient(circle at 40% 80%, rgba(139, 69, 19, 0.1) 0%, transparent 50%)
            `,
          }}
        >
          {/* Decorative corners */}
          <div className="absolute top-2 left-2 w-4 h-4 border-l-2 border-t-2 border-amber-800"></div>
          <div className="absolute top-2 right-2 w-4 h-4 border-r-2 border-t-2 border-amber-800"></div>
          <div className="absolute bottom-2 left-2 w-4 h-4 border-l-2 border-b-2 border-amber-800"></div>
          <div className="absolute bottom-2 right-2 w-4 h-4 border-r-2 border-b-2 border-amber-800"></div>

          {/* Close button */}
          <button
            onClick={onClose}
            className="absolute top-4 right-4 text-amber-800 hover:text-amber-600 text-2xl font-bold"
          >
            ×
          </button>

          {/* Title */}
          <div className="text-center mb-6">
            <h2 className="text-2xl font-bold text-amber-900 mb-2">
              Ancient Riddle
            </h2>
            <div className="w-24 h-0.5 bg-amber-600 mx-auto"></div>
          </div>

          {/* Riddle Text */}
          <div className="text-center mb-6">
            <p className="text-amber-800 text-lg italic leading-relaxed">
              &ldquo;In chambers of reflection, where souls seek to mend,
              <br />
              A gathering of friends, where old ways transcend.
              <br />
              What word do you whisper, when the music grows loud,
              <br />A secret that bonds you, away from the crowd?&rdquo;
            </p>
          </div>

          {/* Crossword Grid */}
          <div id="crossword-grid" className="flex justify-center mb-6">
            <div className="grid grid-cols-7 gap-1">{renderGrid()}</div>
          </div>

          {/* Input Field */}
          <div className="mb-6">
            <input
              type="text"
              value={currentInput}
              onChange={(e) => handleInputChange(e.target.value)}
              onKeyPress={(e) => e.key === "Enter" && handleSubmit()}
              placeholder="Enter your answer..."
              className="w-full p-3 border-2 border-amber-600 rounded bg-amber-50 text-amber-900 text-center text-lg font-semibold placeholder-amber-500 focus:outline-none focus:ring-2 focus:ring-amber-400"
              maxLength={maxLength}
              autoFocus
            />
          </div>

          {/* Hint */}
          {showHint && (
            <div className="mb-4 p-3 bg-amber-200 border border-amber-400 rounded text-amber-800 text-sm">
              <strong>Hint:</strong> Think about that special event you all
              attended... What did you call it among yourselves? 🎭
            </div>
          )}

          {/* Submit Button */}
          <div className="text-center mb-4">
            <button
              onClick={handleSubmit}
              disabled={!currentInput || isCorrect}
              className={`
                px-6 py-3 rounded-lg font-bold text-lg transition-all duration-300
                ${
                  currentInput && !isCorrect
                    ? "bg-amber-600 hover:bg-amber-700 text-white shadow-lg hover:shadow-xl"
                    : "bg-gray-400 text-gray-600 cursor-not-allowed"
                }
              `}
            >
              {isCorrect ? "✨ Correct! ✨" : "Submit Answer"}
            </button>
          </div>

          {/* Success Message */}
          {isCorrect && (
            <div className="text-center text-green-700 font-bold text-lg animate-pulse">
              🎉 The ancient door creaks open... 🎉
            </div>
          )}

          {/* Attempts Counter */}
          {attempts > 0 && !isCorrect && (
            <div className="text-center text-amber-700 text-sm">
              Attempts: {attempts} {attempts === 1 ? "(Hint unlocked!)" : ""}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
