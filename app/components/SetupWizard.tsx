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

  if (!isVisible) return null;

  const handleEnableAudio = async () => {
    if (!userUnlockedAudio) {
      await initializeAudio();
      if (!isEnabled) {
        // This first toggle unlocks the audio context
        await toggleAudio();
      }
      setUserUnlockedAudio(true);
    } else {
      // The second click will play the music
      if (isEnabled) {
        await playBackgroundMusic("medieval-ambient");
      }
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

  return (
    <div className="fixed inset-0 z-50 bg-gradient-to-b from-gray-900 via-purple-900 to-black flex items-center justify-center">
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
                className={`px-4 py-2 rounded-lg font-semibold ${
                  isEnabled
                    ? "bg-green-600 text-white"
                    : "bg-green-700 text-white"
                }`}
              >
                {isEnabled ? (userUnlockedAudio ? "Play" : "ON") : "Enable"}
              </button>
              <button
                onClick={handleDisableAudio}
                className="px-4 py-2 rounded-lg font-semibold bg-gray-700 text-white"
              >
                Disable
              </button>
            </div>
          </div>

          <div className="bg-amber-100 border border-amber-300 rounded-lg p-4 space-y-3">
            <div>
              <label className="block text-sm text-amber-900 mb-1">
                Master
              </label>
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
            onClick={onContinue}
            className="px-8 py-3 rounded-xl font-bold bg-gradient-to-r from-amber-600 to-yellow-600 text-white shadow-lg"
          >
            Enter the Castle
          </button>
          <div className="text-xs text-amber-700 mt-2">
            Tip: If you don't hear anything, click "Enable & Play" to satisfy
            browser audio policies.
          </div>
        </div>
      </div>
    </div>
  );
}
