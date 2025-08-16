"use client";

import { useState } from "react";
import { useAudio } from "@/lib/useAudio";

interface SetupWizardProps {
  isVisible: boolean;
  onContinue: () => void;
}

export default function SetupWizard({
  isVisible,
  onContinue,
}: SetupWizardProps) {
  const {
    initializeAudio,
    isInitialized,
    isEnabled,
    toggleAudio,
    playBackgroundMusic,
    stopBackgroundMusic,
    setMasterVolume,
    setBackgroundVolume,
    setSfxVolume,
  } = useAudio();

  const [volMaster, setVolMaster] = useState(70);
  const [volBg, setVolBg] = useState(30);
  const [volSfx, setVolSfx] = useState(60);
  const [userUnlockedAudio, setUserUnlockedAudio] = useState(false);
  const [currentStep, setCurrentStep] = useState(1); // 1 = audio setup, 2 = game explanation

  if (!isVisible) return null;

  const handleEnableAudio = async () => {
    console.log(`[SetupWizard] handleEnableAudio called`, {
      userUnlockedAudio,
      isInitialized,
      isEnabled,
    });

    if (!userUnlockedAudio) {
      console.log(`[SetupWizard] Initializing audio...`);
      await initializeAudio();
      console.log(`[SetupWizard] Audio initialized`);

      if (!isEnabled) {
        // This first toggle unlocks the audio context
        console.log(`[SetupWizard] Toggling audio on...`);
        const result = await toggleAudio();
        console.log(`[SetupWizard] Audio toggle result:`, result);
      }
      setUserUnlockedAudio(true);
    } else {
      // The second click will play the music
      if (isEnabled) {
        console.log(`[SetupWizard] Starting background music...`);
        await playBackgroundMusic("medieval-ambient");
        console.log(`[SetupWizard] Background music started`);
      }
    }
  };

  const handleNextStep = () => {
    if (currentStep === 1) {
      setCurrentStep(2);
    } else {
      onContinue();
    }
  };

  const handleDisableAudio = async () => {
    if (isEnabled) await toggleAudio();
    stopBackgroundMusic();
    setUserUnlockedAudio(false);
  };

  const change = (which: "master" | "bg" | "sfx", value: number) => {
    const v = Math.max(0, Math.min(100, value));
    if (which === "master") {
      setVolMaster(v);
      setMasterVolume(v / 100);
    } else if (which === "bg") {
      setVolBg(v);
      setBackgroundVolume(v / 100);
    } else {
      setVolSfx(v);
      setSfxVolume(v / 100);
    }
  };

  // Step 1: Audio Setup
  const renderAudioSetup = () => (
    <div className="relative w-full max-w-2xl mx-4 rounded-2xl border-4 border-amber-700 bg-amber-50 p-6 shadow-2xl">
      <h1 className="text-3xl md:text-4xl font-extrabold text-amber-900 text-center mb-2">
        Prepare Your Quest
      </h1>
      <p className="text-center text-amber-800 mb-6">
        Configure audio before entering the castle. Enabling audio will start
        the ambient track immediately.
      </p>

      <div className="grid grid-cols-1 gap-4">
        <div className="flex items-center justify-between bg-amber-100 border border-amber-300 rounded-lg p-4">
          <div className="font-semibold text-amber-900">Audio</div>
          <div className="space-x-2">
            <button
              onClick={handleEnableAudio}
              className={`px-4 py-2 rounded-lg font-semibold transition-all duration-300 ${
                isEnabled && userUnlockedAudio
                  ? "bg-green-500 hover:bg-green-400 text-white shadow-lg transform hover:scale-110 animate-pulse border-2 border-green-300"
                  : isEnabled
                  ? "bg-green-600 text-white"
                  : "bg-green-700 hover:bg-green-600 text-white"
              }`}
            >
              {isEnabled
                ? userUnlockedAudio
                  ? "🎵 Click to Allow Audio"
                  : "ON"
                : "Enable"}
            </button>
            <button
              onClick={handleDisableAudio}
              className="px-4 py-2 rounded-lg font-semibold bg-gray-700 hover:bg-gray-600 text-white transition-colors"
            >
              Disable
            </button>
          </div>
        </div>

        <div className="bg-amber-100 border border-amber-300 rounded-lg p-4 space-y-3">
          <div>
            <label className="block text-sm text-amber-900 mb-1">Master</label>
            <input
              type="range"
              min={0}
              max={100}
              value={volMaster}
              onChange={(e) => change("master", parseInt(e.target.value))}
              className="w-full"
            />
            <div className="text-xs text-amber-700">{volMaster}%</div>
          </div>
          <div>
            <label className="block text-sm text-amber-900 mb-1">
              Background
            </label>
            <input
              type="range"
              min={0}
              max={100}
              value={volBg}
              onChange={(e) => change("bg", parseInt(e.target.value))}
              className="w-full"
            />
            <div className="text-xs text-amber-700">{volBg}%</div>
          </div>
          <div>
            <label className="block text-sm text-amber-900 mb-1">SFX</label>
            <input
              type="range"
              min={0}
              max={100}
              value={volSfx}
              onChange={(e) => change("sfx", parseInt(e.target.value))}
              className="w-full"
            />
            <div className="text-xs text-amber-700">{volSfx}%</div>
          </div>
        </div>
      </div>

      <div className="mt-6 text-center">
        <button
          onClick={handleNextStep}
          disabled={!isEnabled}
          className={`px-8 py-3 rounded-xl font-bold shadow-lg transition-all duration-300 ${
            isEnabled
              ? "bg-gradient-to-r from-amber-600 to-yellow-600 hover:from-amber-500 hover:to-yellow-500 text-white transform hover:scale-105"
              : "bg-gray-400 text-gray-600 cursor-not-allowed"
          }`}
        >
          Next: Learn the Quest
        </button>
        <div className="text-xs text-amber-700 mt-2">
          {!isEnabled
            ? "Enable audio to continue"
            : "Tip: If you don't hear anything, click 'Play Music!' to satisfy browser audio policies."}
        </div>
      </div>
    </div>
  );

  // Step 2: Game Explanation
  const renderGameExplanation = () => (
    <div className="relative w-full max-w-3xl mx-4 rounded-2xl border-4 border-amber-700 bg-amber-50 p-6 shadow-2xl">
      <h1 className="text-3xl md:text-4xl font-extrabold text-amber-900 text-center mb-2">
        🏰 Your Medieval Quest Awaits
      </h1>
      <p className="text-center text-amber-800 mb-6">
        Welcome, brave Queen Queef, first of her name, Mishka! Here's what
        awaits you in the ancient castle...
      </p>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
        <div className="bg-amber-100 border border-amber-300 rounded-lg p-4">
          <h3 className="font-bold text-amber-900 mb-2 flex items-center">
            🗝️ Find the Golden Keys
          </h3>
          <p className="text-sm text-amber-800">
            Scattered throughout the castle are <strong>4 magical keys</strong>.
            Approach them and press{" "}
            <kbd className="px-2 py-1 bg-amber-200 rounded">E</kbd> to unlock
            ancient riddles.
          </p>
        </div>

        <div className="bg-amber-100 border border-amber-300 rounded-lg p-4">
          <h3 className="font-bold text-amber-900 mb-2 flex items-center">
            📜 Solve Ancient Riddles
          </h3>
          <p className="text-sm text-amber-800">
            Each key holds a <strong>riddle</strong> that reveals a secret word.
            Use your wit and the hints provided to uncover all four words.
          </p>
        </div>

        <div className="bg-amber-100 border border-amber-300 rounded-lg p-4">
          <h3 className="font-bold text-amber-900 mb-2 flex items-center">
            🚪 Unlock the Great Door
          </h3>
          <p className="text-sm text-amber-800">
            Once you have all four words, approach the{" "}
            <strong>great door</strong> at the far end of the castle and arrange
            them in the correct order.
          </p>
        </div>

        <div className="bg-amber-100 border border-amber-300 rounded-lg p-4">
          <h3 className="font-bold text-amber-900 mb-2 flex items-center">
            🎁 Discover the Birthday Treasure
          </h3>
          <p className="text-sm text-amber-800">
            Beyond the door lies a <strong>magical chest</strong> containing a
            very special birthday surprise just for you!
          </p>
        </div>
      </div>

      <div className="bg-gradient-to-r from-blue-100 to-purple-100 border border-blue-300 rounded-lg p-4 mb-6">
        <h3 className="font-bold text-blue-900 mb-2">🎮 Controls</h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-sm text-blue-800">
          <div>
            <kbd className="px-2 py-1 bg-blue-200 rounded">WASD</kbd> Move
          </div>
          <div>
            <kbd className="px-2 py-1 bg-blue-200 rounded">Arrow Keys</kbd> Look
          </div>
          <div>
            <kbd className="px-2 py-1 bg-blue-200 rounded">E</kbd> Interact
          </div>
          <div>
            <kbd className="px-2 py-1 bg-blue-200 rounded">ESC</kbd> Pause
          </div>
        </div>
      </div>

      <div className="text-center">
        <button
          onClick={handleNextStep}
          className="px-8 py-4 rounded-xl font-bold text-xl bg-gradient-to-r from-purple-600 via-amber-600 to-orange-600 hover:from-purple-500 hover:via-amber-500 hover:to-orange-500 text-white shadow-xl transform hover:scale-105 transition-all duration-300"
        >
          ⚔️ Enter the Castle ⚔️
        </button>
        <div className="text-xs text-amber-700 mt-2">
          Your adventure begins now... Good luck, and happy birthday! 🎂
        </div>
      </div>
    </div>
  );

  return (
    <div className="fixed inset-0 z-50 bg-gradient-to-b from-gray-900 via-purple-900 to-black flex items-center justify-center">
      {currentStep === 1 ? renderAudioSetup() : renderGameExplanation()}
    </div>
  );
}
