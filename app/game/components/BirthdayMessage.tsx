"use client";

import { useEffect } from "react";
import confetti from "canvas-confetti";

interface BirthdayMessageProps {
  isVisible: boolean;
  onClose: () => void;
}

export default function BirthdayMessage({
  isVisible,
  onClose,
}: BirthdayMessageProps) {
  useEffect(() => {
    if (isVisible) {
      const duration = 5 * 1000;
      const animationEnd = Date.now() + duration;
      const defaults = {
        startVelocity: 30,
        spread: 360,
        ticks: 60,
        zIndex: 100,
      };

      function randomInRange(min: number, max: number) {
        return Math.random() * (max - min) + min;
      }

      const interval = setInterval(function () {
        const timeLeft = animationEnd - Date.now();

        if (timeLeft <= 0) {
          return clearInterval(interval);
        }

        const particleCount = 50 * (timeLeft / duration);
        // since particles fall down, start a bit higher than random
        confetti({
          ...defaults,
          particleCount,
          origin: { x: randomInRange(0.1, 0.3), y: Math.random() - 0.2 },
        });
        confetti({
          ...defaults,
          particleCount,
          origin: { x: randomInRange(0.7, 0.9), y: Math.random() - 0.2 },
        });
      }, 250);
    }
  }, [isVisible]);

  return (
    <div
      className={`fixed inset-0 z-50 flex items-center justify-center transition-opacity duration-500 ${
        isVisible ? "opacity-100" : "opacity-0 pointer-events-none"
      }`}
    >
      <div
        className="relative w-full max-w-2xl transform rounded-lg border-4 border-yellow-400 bg-gray-900/80 p-8 text-center text-white shadow-2xl backdrop-blur-sm transition-all duration-500"
        style={{ transform: isVisible ? "scale(1)" : "scale(0.5)" }}
      >
        <button
          onClick={onClose}
          className="absolute right-4 top-4 text-2xl font-bold text-yellow-300 hover:text-white"
        >
          ×
        </button>

        <h1 className="mb-4 text-6xl font-bold text-yellow-300 drop-shadow-[0_0_10px_rgba(252,211,77,0.8)]">
          Happy Birthday!
        </h1>

        <p className="text-2xl leading-relaxed text-gray-200">
          May your day be filled with joy, laughter, and lots of cake!
        </p>
        <p className="mt-6 text-lg text-gray-300">
          Wishing you all the best on your special day.
        </p>
      </div>
    </div>
  );
}
