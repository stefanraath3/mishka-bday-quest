"use client";

import { useEffect, useState } from "react";
import { AssetLoadProgress } from "@/lib/assetLoader";

interface LoaderScreenProps {
  progress: AssetLoadProgress;
  isVisible: boolean;
  onRetry?: () => void;
  error?: string | null;
}

export default function LoaderScreen({
  progress,
  isVisible,
  onRetry,
  error,
}: LoaderScreenProps) {
  const [animatedProgress, setAnimatedProgress] = useState(0);
  const [showProgress, setShowProgress] = useState(false);

  // Animate progress bar smoothly
  useEffect(() => {
    if (isVisible) {
      setShowProgress(true);
      const timer = setTimeout(() => {
        setAnimatedProgress(progress.percentage);
      }, 300);
      return () => clearTimeout(timer);
    } else {
      setShowProgress(false);
      setAnimatedProgress(0);
    }
  }, [progress.percentage, isVisible]);

  // Loading tips/lore text that rotates
  const loadingTips = [
    "Ancient scrolls contain the wisdom of ages...",
    "The medieval castle holds many secrets...",
    "Keys unlock more than just doors...",
    "Every riddle has its answer, patience reveals all...",
    "The torch flames dance with forgotten memories...",
    "Stone walls echo with tales of old...",
    "Magic sparkles in the most unexpected places...",
    "Adventure awaits those brave enough to seek it...",
  ];

  const [currentTip, setCurrentTip] = useState(0);

  useEffect(() => {
    if (!isVisible) return;

    const interval = setInterval(() => {
      setCurrentTip((prev) => (prev + 1) % loadingTips.length);
    }, 3000);

    return () => clearInterval(interval);
  }, [isVisible, loadingTips.length]);

  if (!isVisible) return null;

  return (
    <div className="fixed inset-0 z-50 bg-gradient-to-b from-gray-900 via-gray-800 to-black flex items-center justify-center">
      {/* Background decoration */}
      <div className="absolute inset-0 opacity-10">
        <div className="absolute top-20 left-20 w-16 h-16 border-2 border-yellow-600 rotate-45"></div>
        <div className="absolute bottom-32 right-24 w-12 h-12 border-2 border-yellow-600 rounded-full"></div>
        <div className="absolute top-1/3 right-1/4 w-8 h-8 border border-yellow-600"></div>
        <div className="absolute bottom-1/4 left-1/3 w-6 h-6 border border-yellow-600 rotate-45"></div>
      </div>

      {/* Main loading container */}
      <div
        className={`relative w-full max-w-2xl mx-4 transition-all duration-1000 ${
          showProgress ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"
        }`}
      >
        {/* Medieval parchment-style container */}
        <div
          className="relative bg-amber-50 border-4 border-amber-800 rounded-lg p-12 shadow-2xl"
          style={{
            backgroundImage: `
              radial-gradient(circle at 20% 30%, rgba(139, 69, 19, 0.05) 0%, transparent 50%),
              radial-gradient(circle at 80% 70%, rgba(160, 82, 45, 0.05) 0%, transparent 50%),
              radial-gradient(circle at 40% 80%, rgba(101, 67, 33, 0.05) 0%, transparent 50%)
            `,
          }}
        >
          {/* Decorative corners */}
          <div className="absolute top-4 left-4 w-6 h-6 border-l-4 border-t-4 border-amber-800"></div>
          <div className="absolute top-4 right-4 w-6 h-6 border-r-4 border-t-4 border-amber-800"></div>
          <div className="absolute bottom-4 left-4 w-6 h-6 border-l-4 border-b-4 border-amber-800"></div>
          <div className="absolute bottom-4 right-4 w-6 h-6 border-r-4 border-b-4 border-amber-800"></div>

          {/* Title */}
          <div className="text-center mb-8">
            <h1 className="text-4xl md:text-6xl font-bold text-amber-900 mb-4 drop-shadow-lg">
              ⚔️ Medieval Quest ⚔️
            </h1>
            <div className="w-32 h-1 bg-amber-600 mx-auto mb-2"></div>
            <div className="w-16 h-1 bg-amber-400 mx-auto"></div>
          </div>

          {/* Loading status */}
          <div className="text-center mb-8">
            <div className="text-2xl font-semibold text-amber-800 mb-2">
              {error ? "⚠️ Loading Failed" : "📜 Preparing Your Adventure"}
            </div>

            {!error && (
              <div className="text-lg text-amber-700 min-h-[1.5rem] transition-opacity duration-500">
                {progress.status || "Initializing..."}
              </div>
            )}
          </div>

          {/* Progress Bar */}
          {!error && (
            <div className="mb-8">
              {/* Progress bar container */}
              <div className="relative w-full h-6 bg-amber-200 border-2 border-amber-600 rounded-full overflow-hidden shadow-inner">
                {/* Animated progress fill */}
                <div
                  className="absolute top-0 left-0 h-full bg-gradient-to-r from-yellow-400 via-amber-500 to-yellow-600 rounded-full transition-all duration-700 ease-out shadow-lg"
                  style={{ width: `${animatedProgress}%` }}
                >
                  {/* Shimmer effect */}
                  <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent animate-pulse"></div>
                </div>

                {/* Progress text overlay */}
                <div className="absolute inset-0 flex items-center justify-center">
                  <span className="text-sm font-bold text-amber-900 drop-shadow-sm">
                    {animatedProgress}%
                  </span>
                </div>
              </div>

              {/* Progress details */}
              <div className="flex justify-between mt-2 text-sm text-amber-600">
                <span>
                  Assets Loaded: {progress.loaded} / {progress.total}
                </span>
                <span className="capitalize">
                  Loading {progress.type} files
                </span>
              </div>
            </div>
          )}

          {/* Current Asset */}
          {!error && progress.currentAsset && (
            <div className="text-center mb-6">
              <div className="inline-flex items-center px-4 py-2 bg-amber-100 border border-amber-300 rounded-lg">
                <div className="animate-spin mr-2">⚙️</div>
                <span className="text-amber-800 font-medium">
                  {progress.currentAsset}
                </span>
              </div>
            </div>
          )}

          {/* Error State */}
          {error && (
            <div className="text-center mb-6">
              <div className="bg-red-100 border-2 border-red-400 rounded-lg p-4 mb-4">
                <div className="text-red-800 font-semibold mb-2">
                  🛡️ A challenge blocks our path!
                </div>
                <div className="text-red-700 text-sm">
                  {error || "Failed to load some game assets"}
                </div>
              </div>

              {onRetry && (
                <button
                  onClick={onRetry}
                  className="px-6 py-3 bg-amber-600 hover:bg-amber-700 text-white font-bold rounded-lg shadow-lg transition-all duration-300 transform hover:scale-105"
                >
                  ⚔️ Retry Quest
                </button>
              )}
            </div>
          )}

          {/* Loading Tips */}
          {!error && (
            <div className="text-center">
              <div className="bg-amber-100/50 border border-amber-300 rounded-lg p-4">
                <div className="text-amber-800 font-medium mb-1">
                  📚 Ancient Wisdom
                </div>
                <div
                  key={currentTip}
                  className="text-amber-700 italic text-sm animate-fade-in"
                >
                  {loadingTips[currentTip]}
                </div>
              </div>
            </div>
          )}

          {/* Animated torches in corners */}
          <div className="absolute -top-2 -left-2 text-2xl animate-bounce">
            🔥
          </div>
          <div
            className="absolute -top-2 -right-2 text-2xl animate-bounce"
            style={{ animationDelay: "0.5s" }}
          >
            🔥
          </div>
        </div>
      </div>

      {/* Additional CSS for custom animations */}
      <style jsx>{`
        @keyframes fade-in {
          from {
            opacity: 0;
            transform: translateY(10px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        .animate-fade-in {
          animation: fade-in 0.5s ease-out forwards;
        }
      `}</style>
    </div>
  );
}
