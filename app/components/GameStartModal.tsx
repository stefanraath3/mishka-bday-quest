"use client";

import { useState, useEffect } from "react";

interface GameStartModalProps {
  isVisible: boolean;
  onStartGame: () => void;
  onToggleAudio?: () => void;
  audioEnabled?: boolean;
}

export default function GameStartModal({
  isVisible,
  onStartGame,
  onToggleAudio,
  audioEnabled = true,
}: GameStartModalProps) {
  const [showContent, setShowContent] = useState(false);
  const [selectedButton, setSelectedButton] = useState<string | null>(null);

  // Animate content in when modal becomes visible
  useEffect(() => {
    if (isVisible) {
      const timer = setTimeout(() => {
        setShowContent(true);
      }, 300);
      return () => clearTimeout(timer);
    } else {
      setShowContent(false);
    }
  }, [isVisible]);

  const handleStartGame = () => {
    setSelectedButton("start");
    // Brief delay for visual feedback before starting
    setTimeout(() => {
      onStartGame();
    }, 300);
  };

  if (!isVisible) return null;

  return (
    <div className="fixed inset-0 z-50 bg-gradient-to-b from-gray-900 via-purple-900 to-black flex items-center justify-center">
      {/* Animated background elements */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute top-1/4 left-1/4 w-32 h-32 bg-yellow-600/10 rounded-full animate-pulse"></div>
        <div
          className="absolute bottom-1/3 right-1/3 w-24 h-24 bg-amber-500/10 rounded-full animate-pulse"
          style={{ animationDelay: "1s" }}
        ></div>
        <div
          className="absolute top-1/2 right-1/4 w-16 h-16 bg-orange-600/10 rounded-full animate-pulse"
          style={{ animationDelay: "2s" }}
        ></div>

        {/* Floating sparkles */}
        <div
          className="absolute top-20 left-20 text-2xl animate-bounce"
          style={{ animationDelay: "0.5s" }}
        >
          ✨
        </div>
        <div
          className="absolute bottom-32 right-24 text-xl animate-bounce"
          style={{ animationDelay: "1.5s" }}
        >
          ⭐
        </div>
        <div
          className="absolute top-1/3 right-1/5 text-lg animate-bounce"
          style={{ animationDelay: "2.5s" }}
        >
          💫
        </div>
        <div
          className="absolute bottom-1/4 left-1/4 text-2xl animate-bounce"
          style={{ animationDelay: "3s" }}
        >
          🌟
        </div>
      </div>

      {/* Main content container */}
      <div
        className={`relative w-full max-w-3xl mx-4 my-4 max-h-[95vh] overflow-y-auto transition-all duration-1000 ${
          showContent
            ? "opacity-100 translate-y-0 scale-100"
            : "opacity-0 translate-y-12 scale-95"
        }`}
      >
        {/* Medieval scroll/parchment container */}
        <div
          className="relative bg-gradient-to-b from-amber-50 to-amber-100 border-4 border-amber-800 rounded-2xl p-6 md:p-8 shadow-2xl"
          style={{
            backgroundImage: `
              radial-gradient(circle at 30% 20%, rgba(139, 69, 19, 0.08) 0%, transparent 50%),
              radial-gradient(circle at 70% 80%, rgba(160, 82, 45, 0.08) 0%, transparent 50%),
              radial-gradient(circle at 20% 70%, rgba(101, 67, 33, 0.05) 0%, transparent 50%)
            `,
          }}
        >
          {/* Decorative medieval corners */}
          <div className="absolute top-6 left-6 w-8 h-8">
            <div className="absolute inset-0 border-l-4 border-t-4 border-amber-800 rounded-tl-lg"></div>
            <div className="absolute top-1 left-1 w-3 h-3 border-l-2 border-t-2 border-amber-600"></div>
          </div>
          <div className="absolute top-6 right-6 w-8 h-8">
            <div className="absolute inset-0 border-r-4 border-t-4 border-amber-800 rounded-tr-lg"></div>
            <div className="absolute top-1 right-1 w-3 h-3 border-r-2 border-t-2 border-amber-600"></div>
          </div>
          <div className="absolute bottom-6 left-6 w-8 h-8">
            <div className="absolute inset-0 border-l-4 border-b-4 border-amber-800 rounded-bl-lg"></div>
            <div className="absolute bottom-1 left-1 w-3 h-3 border-l-2 border-b-2 border-amber-600"></div>
          </div>
          <div className="absolute bottom-6 right-6 w-8 h-8">
            <div className="absolute inset-0 border-r-4 border-b-4 border-amber-800 rounded-br-lg"></div>
            <div className="absolute bottom-1 right-1 w-3 h-3 border-r-2 border-b-2 border-amber-600"></div>
          </div>

          {/* Main title */}
          <div className="text-center mb-6 md:mb-8">
            <div className="mb-3 text-4xl md:text-5xl animate-pulse">⚔️</div>
            <h1 className="text-3xl md:text-5xl font-bold text-amber-900 mb-2 drop-shadow-lg tracking-wide">
              Medieval Quest
            </h1>
            <h2 className="text-lg md:text-2xl font-semibold text-amber-800 mb-4">
              🎂 A Birthday Adventure 🎂
            </h2>

            {/* Decorative line */}
            <div className="flex items-center justify-center mb-4">
              <div className="w-12 h-1 bg-amber-600"></div>
              <div className="mx-3 text-xl text-amber-700">⚜️</div>
              <div className="w-12 h-1 bg-amber-600"></div>
            </div>
          </div>

          {/* Game description */}
          <div className="text-center mb-6">
            <p className="text-base md:text-lg text-amber-800 leading-relaxed max-w-xl mx-auto mb-3">
              Embark on a mystical journey through an ancient castle filled with
              riddles, hidden keys, and magical surprises. Your quest awaits,
              brave adventurer!
            </p>
            <p className="text-sm md:text-base text-amber-700 italic">
              Solve puzzles • Collect keys • Unlock secrets • Discover the
              birthday treasure
            </p>
          </div>

          {/* Controls info */}
          <div className="bg-amber-100/60 border-2 border-amber-300 rounded-lg p-4 mb-6 max-w-2xl mx-auto">
            <h3 className="text-lg font-bold text-amber-900 mb-3 text-center">
              🎮 Adventure Controls
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-2 md:gap-3 text-amber-800 text-sm">
              <div className="flex items-center">
                <div className="bg-amber-200 px-2 py-1 rounded font-mono text-xs mr-2 min-w-[60px] text-center">
                  WASD
                </div>
                <span>Move around the castle</span>
              </div>
              <div className="flex items-center">
                <div className="bg-amber-200 px-2 py-1 rounded font-mono text-xs mr-2 min-w-[60px] text-center">
                  Arrows
                </div>
                <span>Look around (camera)</span>
              </div>
              <div className="flex items-center">
                <div className="bg-amber-200 px-2 py-1 rounded font-mono text-xs mr-2 min-w-[60px] text-center">
                  Mouse
                </div>
                <span>Click on objects</span>
              </div>
              <div className="flex items-center">
                <div className="bg-amber-200 px-2 py-1 rounded font-mono text-xs mr-2 min-w-[60px] text-center">
                  ESC
                </div>
                <span>Pause menu</span>
              </div>
            </div>
          </div>

          {/* Audio controls */}
          {onToggleAudio && (
            <div className="flex justify-center mb-4">
              <button
                onClick={onToggleAudio}
                className={`flex items-center px-4 py-2 rounded-lg font-semibold transition-all duration-300 ${
                  audioEnabled
                    ? "bg-green-600 hover:bg-green-700 text-white"
                    : "bg-gray-600 hover:bg-gray-700 text-white"
                } shadow-lg hover:shadow-xl transform hover:scale-105`}
              >
                <span className="text-lg mr-2">
                  {audioEnabled ? "🔊" : "🔇"}
                </span>
                Audio: {audioEnabled ? "ON" : "OFF"}
              </button>
            </div>
          )}

          {/* Start game button */}
          <div className="text-center">
            <button
              onClick={handleStartGame}
              className={`group relative px-8 py-4 rounded-xl font-bold text-xl transition-all duration-300 transform ${
                selectedButton === "start"
                  ? "scale-95 bg-amber-600"
                  : "hover:scale-105 bg-gradient-to-r from-amber-600 via-yellow-600 to-amber-600"
              } text-white shadow-2xl hover:shadow-amber-500/50 active:scale-95`}
            >
              {/* Button glow effect */}
              <div className="absolute inset-0 bg-gradient-to-r from-yellow-400 via-amber-400 to-yellow-400 rounded-xl opacity-20 group-hover:opacity-40 transition-opacity duration-300"></div>

              {/* Button content */}
              <div className="relative flex items-center justify-center">
                <span className="mr-2 text-2xl">⚔️</span>
                <span>Start Adventure</span>
                <span className="ml-2 text-2xl">⚔️</span>
              </div>
            </button>

            {/* Subtitle */}
            <p className="mt-3 text-sm text-amber-700 italic">
              Click when ready to begin your quest...
            </p>
          </div>

          {/* Floating medieval elements */}
          <div className="absolute top-6 left-1/4 text-xl animate-spin-slow opacity-30">
            ⚜️
          </div>
          <div
            className="absolute bottom-8 right-1/4 text-lg animate-spin-slow opacity-30"
            style={{ animationDelay: "2s" }}
          >
            🛡️
          </div>
        </div>
      </div>

      {/* Custom animations */}
      <style jsx>{`
        @keyframes spin-slow {
          from {
            transform: rotate(0deg);
          }
          to {
            transform: rotate(360deg);
          }
        }

        .animate-spin-slow {
          animation: spin-slow 10s linear infinite;
        }
      `}</style>
    </div>
  );
}
