"use client";

import { useState, useEffect } from "react";
import { useAudio } from "@/lib/useAudio";

export default function AudioControls() {
  const {
    isInitialized,
    isEnabled,
    toggleAudio,
    setMasterVolume,
    setBackgroundVolume,
    setSfxVolume,
    playBackgroundMusic,
    stopBackgroundMusic,
  } = useAudio();

  const [showControls, setShowControls] = useState(false);
  const [volumes, setVolumes] = useState({
    master: 70,
    background: 30,
    sfx: 60,
  });

  const handleToggleAudio = () => {
    const newState = toggleAudio();
    if (newState) {
      playBackgroundMusic("medieval-ambient");
    } else {
      stopBackgroundMusic();
    }
  };

  const handleVolumeChange = (
    type: "master" | "background" | "sfx",
    value: number
  ) => {
    const normalizedValue = value / 100;
    setVolumes((prev) => ({ ...prev, [type]: value }));

    switch (type) {
      case "master":
        setMasterVolume(normalizedValue);
        break;
      case "background":
        setBackgroundVolume(normalizedValue);
        break;
      case "sfx":
        setSfxVolume(normalizedValue);
        break;
    }
  };

  if (!isInitialized) return null;

  return (
    <div className="fixed top-4 right-4 z-40">
      {/* Audio Toggle Button */}
      <button
        onClick={() => setShowControls(!showControls)}
        className={`w-12 h-12 rounded-full border-2 border-white/30 backdrop-blur-sm transition-all duration-300 ${
          isEnabled
            ? "bg-green-600/80 hover:bg-green-500/80 text-white"
            : "bg-red-600/80 hover:bg-red-500/80 text-white"
        }`}
        title={isEnabled ? "Audio On" : "Audio Off"}
      >
        {isEnabled ? "🔊" : "🔇"}
      </button>

      {/* Volume Controls Panel */}
      {showControls && (
        <div className="absolute top-14 right-0 w-64 bg-black/80 backdrop-blur-sm border border-white/20 rounded-lg p-4 text-white">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-bold">Audio Settings</h3>
            <button
              onClick={handleToggleAudio}
              className={`px-3 py-1 rounded text-sm ${
                isEnabled
                  ? "bg-green-600 hover:bg-green-500"
                  : "bg-red-600 hover:bg-red-500"
              }`}
            >
              {isEnabled ? "ON" : "OFF"}
            </button>
          </div>

          {isEnabled && (
            <div className="space-y-3">
              <div>
                <label className="block text-sm mb-1">Master Volume</label>
                <input
                  type="range"
                  min="0"
                  max="100"
                  value={volumes.master}
                  onChange={(e) =>
                    handleVolumeChange("master", parseInt(e.target.value))
                  }
                  className="w-full h-2 bg-gray-600 rounded-lg appearance-none cursor-pointer slider"
                />
                <div className="text-xs text-gray-300 mt-1">
                  {volumes.master}%
                </div>
              </div>

              <div>
                <label className="block text-sm mb-1">Background Music</label>
                <input
                  type="range"
                  min="0"
                  max="100"
                  value={volumes.background}
                  onChange={(e) =>
                    handleVolumeChange("background", parseInt(e.target.value))
                  }
                  className="w-full h-2 bg-gray-600 rounded-lg appearance-none cursor-pointer slider"
                />
                <div className="text-xs text-gray-300 mt-1">
                  {volumes.background}%
                </div>
              </div>

              <div>
                <label className="block text-sm mb-1">Sound Effects</label>
                <input
                  type="range"
                  min="0"
                  max="100"
                  value={volumes.sfx}
                  onChange={(e) =>
                    handleVolumeChange("sfx", parseInt(e.target.value))
                  }
                  className="w-full h-2 bg-gray-600 rounded-lg appearance-none cursor-pointer slider"
                />
                <div className="text-xs text-gray-300 mt-1">{volumes.sfx}%</div>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
