"use client";

import { useState, useEffect, useMemo } from "react";
import { useAudio } from "@/lib/useAudio";

interface AncientScrollProps {
  isVisible: boolean;
  onSolved: () => void;
  onClose: () => void;
  riddle: {
    title: string;
    text: string;
    hint: string;
  };
  answer: string;
}

export default function AncientScroll({
  isVisible,
  onSolved,
  onClose,
  riddle,
  answer,
}: AncientScrollProps) {
  const [currentInput, setCurrentInput] = useState("");
  const [isCorrect, setIsCorrect] = useState(false);
  const [showHint, setShowHint] = useState(false);
  const [attempts, setAttempts] = useState(0);

  const {
    playSound,
    isInitialized: audioInitialized,
    isEnabled: audioEnabled,
  } = useAudio();

  const correctAnswer = useMemo(() => answer.toUpperCase(), [answer]);
  const maxLength = correctAnswer.length;

  useEffect(() => {
    if (!isVisible) {
      // Reset state when component becomes hidden
      setTimeout(() => {
        setCurrentInput("");
        setIsCorrect(false);
        setShowHint(false);
        setAttempts(0);
      }, 500); // Delay reset to allow fade-out animation
    } else {
      // Autofocus when the modal becomes visible
      const inputElement = document.getElementById("riddle-input");
      if (inputElement) {
        setTimeout(() => inputElement.focus(), 500); // Delay to allow transition
      }
    }
  }, [isVisible]);

  useEffect(() => {
    if (
      currentInput.toUpperCase() === correctAnswer &&
      correctAnswer.length > 0 &&
      currentInput.length === correctAnswer.length
    ) {
      setIsCorrect(true);
      setTimeout(() => {
        onSolved();
      }, 1500);
    }
  }, [currentInput, correctAnswer, onSolved]);

  const handleInputChange = (value: string) => {
    if (value.length <= maxLength && !isCorrect) {
      setCurrentInput(value.toUpperCase());
    }
  };

  const handleSubmit = () => {
    if (currentInput.toUpperCase() !== correctAnswer) {
      // Play error buzz sound for wrong answers
      if (audioInitialized && audioEnabled) {
        console.log(
          `[AncientScroll] Playing error-buzz sound for wrong answer`
        );
        playSound("error-buzz", { volume: 0.5 });
      }
      setAttempts((prev) => prev + 1);
      if (attempts >= 1) {
        setShowHint(true);
      }
      // Shake animation for wrong answer
      const grid = document.getElementById("crossword-grid");
      if (grid) {
        grid.classList.add("animate-head-shake");
        setTimeout(() => grid.classList.remove("animate-head-shake"), 800);
      }
    }
  };

  const gridStyle = {
    display: "grid",
    gridTemplateColumns: `repeat(${maxLength}, minmax(0, 1fr))`,
    gap: "0.25rem",
  };

  const renderGrid = () => {
    const cells = [];
    for (let i = 0; i < maxLength; i++) {
      const letter = currentInput[i] || "";
      const isCorrectLetter = isCorrect && correctAnswer[i] === letter;

      cells.push(
        <div
          key={i}
          className={`
            w-10 h-10 sm:w-12 sm:h-12 border-2 border-amber-600 bg-amber-50
            flex items-center justify-center text-xl font-bold
            transition-all duration-300
            ${isCorrectLetter ? "bg-green-200 border-green-500" : ""}
            ${letter ? "text-amber-900" : "text-gray-400"}
          `}
        >
          {letter}
        </div>
      );
    }
    return cells;
  };

  const riddleLines = riddle.text
    .split("\n")
    .map((line) => line.trim())
    .filter((line) => line);

  return (
    <div
      className={`
        fixed inset-0 z-50 flex items-center justify-center transition-opacity duration-500
        ${isVisible ? "opacity-100" : "opacity-0 pointer-events-none"}
      `}
    >
      <div
        className={`
          relative w-full max-w-lg mx-4 transition-transform duration-700 ease-in-out
          ${isVisible ? "transform-none" : "-translate-y-full"}
        `}
      >
        {/* Scroll Background */}
        <div
          className="relative bg-amber-100 border-4 border-amber-800 rounded-lg p-8 shadow-2xl overflow-hidden"
          style={{
            backgroundImage: `
              radial-gradient(circle at 20% 50%, rgba(139, 69, 19, 0.1) 0%, transparent 50%),
              radial-gradient(circle at 80% 20%, rgba(160, 82, 45, 0.1) 0%, transparent 50%),
              radial-gradient(circle at 40% 80%, rgba(139, 69, 19, 0.1) 0%, transparent 50%)
            `,
            clipPath: "inset(0 0 0 0)",
          }}
        >
          {/* Scroll unfurl animation */}
          <div
            className={`
              absolute inset-0 bg-amber-100 transition-transform duration-700 ease-in-out
              ${isVisible ? "transform-none" : "translate-y-full"}
            `}
            style={{
              backgroundImage: "inherit",
              transformOrigin: "bottom",
            }}
          ></div>

          <div className="relative z-10">
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
                {riddle.title}
              </h2>
              <div className="w-24 h-0.5 bg-amber-600 mx-auto"></div>
            </div>

            {/* Riddle Text */}
            <div className="text-center mb-6">
              <p className="text-amber-800 text-lg italic leading-relaxed">
                {riddleLines.map((line, index) => (
                  <span key={index}>
                    {line}
                    {index < riddleLines.length - 1 && <br />}
                  </span>
                ))}
              </p>
            </div>

            {/* Crossword Grid */}
            <div
              id="crossword-grid"
              className="flex justify-center mb-6 transition-all"
            >
              <div style={gridStyle}>{renderGrid()}</div>
            </div>

            {/* Input Field */}
            <div className="mb-6">
              <input
                id="riddle-input"
                type="text"
                value={currentInput}
                onChange={(e) => handleInputChange(e.target.value)}
                onKeyPress={(e) => e.key === "Enter" && handleSubmit()}
                placeholder="Enter your answer..."
                className="w-full p-3 border-2 border-amber-600 rounded bg-amber-50 text-amber-900 text-center text-lg font-semibold placeholder-amber-500 focus:outline-none focus:ring-2 focus:ring-amber-400"
                maxLength={maxLength}
                disabled={isCorrect}
              />
            </div>

            {/* Hint */}
            {showHint && !isCorrect && (
              <div className="mb-4 p-3 bg-amber-200 border border-amber-400 rounded text-amber-800 text-sm">
                <strong>Hint:</strong> {riddle.hint}
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
                ✨ Key collected! The word is yours! ✨
              </div>
            )}

            {/* Attempts Counter */}
            {attempts > 0 && !isCorrect && (
              <div className="text-center text-amber-700 text-sm">
                Attempts: {attempts}
                {attempts === 2 && !isCorrect ? " (Hint unlocked!)" : ""}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
