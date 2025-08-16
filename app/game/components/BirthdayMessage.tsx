"use client";

import { useEffect, useState } from "react";
import confetti from "canvas-confetti";

interface BirthdayMessageProps {
  isVisible: boolean;
  onClose: () => void;
}

const celebrationMessages = [
  {
    title: "🎉 Happy Birthday Mishka! 🎉",
    content: "Today marks another amazing year of your incredible journey!",
    emoji: "🎂",
    background: "from-purple-900/90 to-blue-900/90",
  },
  {
    title: "✨ You've Unlocked Adventure! ✨",
    content:
      "Just like you conquered this medieval quest, you continue to conquer life with grace and determination!",
    emoji: "🏰",
    background: "from-amber-900/90 to-orange-900/90",
  },
  {
    title: "🥂 Special Invitation 🥂",
    content:
      "Please join us for a celebration at our house where we will pop champagne, share stories, feast together, and create unforgettable memories!",
    emoji: "🏡",
    background: "from-emerald-900/90 to-teal-900/90",
  },
  {
    title: "🎊 Let's Celebrate You! 🎊",
    content:
      "Your presence brings light to every room and joy to every heart. Here's to another year of being absolutely wonderful!",
    emoji: "💫",
    background: "from-rose-900/90 to-pink-900/90",
  },
  {
    title: "🌟 Grand Finale 🌟",
    content:
      "May this new year bring you endless adventures, boundless joy, and all the happiness your heart can hold!",
    emoji: "🎈",
    background: "from-indigo-900/90 to-purple-900/90",
  },
];

export default function BirthdayMessage({
  isVisible,
  onClose,
}: BirthdayMessageProps) {
  const [currentStep, setCurrentStep] = useState(0);
  const [showContent, setShowContent] = useState(false);

  useEffect(() => {
    if (isVisible) {
      setCurrentStep(0);
      setShowContent(false);

      // Start content animation after a brief delay
      setTimeout(() => setShowContent(true), 300);

      // Confetti throughout the entire sequence
      const startConfetti = () => {
        const duration = 15 * 1000; // Extended duration
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

          const particleCount = 30 * (timeLeft / duration);

          // Multiple confetti bursts from different positions
          confetti({
            ...defaults,
            particleCount,
            origin: { x: randomInRange(0.1, 0.3), y: Math.random() - 0.2 },
            colors: ["#FFD700", "#FF69B4", "#00CED1", "#FF6347", "#32CD32"],
          });
          confetti({
            ...defaults,
            particleCount,
            origin: { x: randomInRange(0.7, 0.9), y: Math.random() - 0.2 },
            colors: ["#9370DB", "#FF1493", "#00FA9A", "#FFB6C1", "#87CEEB"],
          });

          // Central burst occasionally
          if (Math.random() < 0.3) {
            confetti({
              ...defaults,
              particleCount: particleCount * 2,
              origin: { x: 0.5, y: 0.3 },
              colors: ["#FF4500", "#DAA520", "#DC143C", "#4169E1", "#228B22"],
            });
          }
        }, 300);
      };

      startConfetti();
    } else {
      setCurrentStep(0);
      setShowContent(false);
    }
  }, [isVisible]);

  const nextStep = () => {
    if (currentStep < celebrationMessages.length - 1) {
      setShowContent(false);
      setTimeout(() => {
        setCurrentStep((prev) => prev + 1);
        setShowContent(true);
      }, 300);
    } else {
      // Final celebration burst
      confetti({
        particleCount: 100,
        spread: 70,
        origin: { y: 0.6 },
      });
      setTimeout(onClose, 2000);
    }
  };

  const currentMessage = celebrationMessages[currentStep];

  return (
    <div
      className={`fixed inset-0 z-50 flex items-center justify-center transition-opacity duration-500 ${
        isVisible ? "opacity-100" : "opacity-0 pointer-events-none"
      }`}
    >
      <div
        className={`relative w-full max-w-3xl mx-4 transform rounded-2xl border-4 border-yellow-400 bg-gradient-to-br ${currentMessage.background} p-8 text-center text-white shadow-2xl backdrop-blur-sm transition-all duration-700`}
        style={{ transform: isVisible ? "scale(1)" : "scale(0.8)" }}
      >
        <button
          onClick={onClose}
          className="absolute right-4 top-4 text-3xl font-bold text-yellow-300 hover:text-white transition-colors z-10"
        >
          ×
        </button>

        <div
          className={`transition-all duration-500 ${
            showContent
              ? "opacity-100 translate-y-0"
              : "opacity-0 translate-y-4"
          }`}
        >
          {/* Large decorative emoji */}
          <div className="text-8xl mb-4 animate-bounce">
            {currentMessage.emoji}
          </div>

          {/* Main title */}
          <h1 className="mb-6 text-5xl md:text-6xl font-bold text-yellow-300 drop-shadow-[0_0_20px_rgba(252,211,77,0.8)] animate-pulse">
            {currentMessage.title}
          </h1>

          {/* Message content */}
          <p className="text-xl md:text-2xl leading-relaxed text-gray-100 mb-8 max-w-2xl mx-auto">
            {currentMessage.content}
          </p>

          {/* Progress indicators */}
          <div className="flex justify-center space-x-2 mb-6">
            {celebrationMessages.map((_, index) => (
              <div
                key={index}
                className={`w-3 h-3 rounded-full transition-all duration-300 ${
                  index === currentStep
                    ? "bg-yellow-300 scale-125"
                    : index < currentStep
                    ? "bg-green-400"
                    : "bg-gray-500"
                }`}
              />
            ))}
          </div>

          {/* Action button */}
          <button
            onClick={nextStep}
            className="px-8 py-4 rounded-full font-bold text-xl transition-all duration-300 bg-yellow-500 hover:bg-yellow-400 text-gray-900 shadow-lg hover:shadow-xl transform hover:scale-105 animate-pulse"
          >
            {currentStep < celebrationMessages.length - 1
              ? "Continue Celebration! 🎉"
              : "Let's Party! 🥳"}
          </button>

          {/* Step counter */}
          <p className="mt-4 text-sm text-gray-300">
            Step {currentStep + 1} of {celebrationMessages.length}
          </p>
        </div>

        {/* Decorative sparkles */}
        <div className="absolute top-4 left-4 text-2xl animate-spin text-yellow-300">
          ✨
        </div>
        <div className="absolute top-8 right-12 text-xl animate-bounce text-pink-300">
          🎈
        </div>
        <div className="absolute bottom-8 left-8 text-2xl animate-pulse text-blue-300">
          🎊
        </div>
        <div className="absolute bottom-4 right-8 text-xl animate-spin text-green-300">
          🌟
        </div>
      </div>
    </div>
  );
}
