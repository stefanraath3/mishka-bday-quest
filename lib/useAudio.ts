import { useEffect, useRef, useState, useCallback } from "react";
import { audioManager } from "./audioManager";

export function useAudio() {
  const [isInitialized, setIsInitialized] = useState(false);
  const [isEnabled, setIsEnabled] = useState(audioManager.enabled);
  const initializeAudio = useCallback(async () => {
    if (isInitialized) return true;
    await audioManager.initialize();
    setIsInitialized(true);
    return true;
  }, [isInitialized]);

  const playSound = useCallback(
    (soundKey: string, options?: { volume?: number; fade?: number }) => {
      if (isInitialized && isEnabled) {
        // Map the sound keys to AudioManager keys
        const soundMap: Record<string, string> = {
          "key-pickup": "keyCollected",
          "riddle-success": "riddleSolved",
          "door-unlock": "doorUnlock",
          "door-creak": "doorOpen",
          "chest-open": "chestOpen",
          footsteps: "footsteps",
          "torch-crackle": "torchFlicker",
          "button-click": "buttonClick",
          "parchment-unfurl": "scrollUnfurl",
          "error-buzz": "wrongAnswer",
          "party-horn": "confetti",
          "magical-sparkle": "magicalSparkle",
        };

        const mappedKey = soundMap[soundKey] || soundKey;
        return audioManager.play(mappedKey, options);
      }
    },
    [isInitialized, isEnabled]
  );

  const stopSound = useCallback((soundKey: string, id?: number) => {
    audioManager.stop(soundKey, id);
  }, []);

  const toggleAudio = useCallback(() => {
    const newState = audioManager.toggle();
    setIsEnabled(newState);
    return newState;
  }, []);

  const playBackgroundMusic = useCallback(
    (trackKey: string = "medieval-ambient") => {
      if (!isInitialized) return;

      // Map the track keys to AudioManager keys
      const trackMap: Record<string, string> = {
        "medieval-ambient": "ambientMusic",
        "happy-birthday": "celebrationMusic",
      };

      const mappedKey = trackMap[trackKey] || trackKey;
      audioManager.playBackgroundMusic(mappedKey);
    },
    [isInitialized]
  );

  const stopBackgroundMusic = useCallback(() => {
    audioManager.stopBackgroundMusic();
  }, []);

  return {
    initializeAudio,
    playSound,
    stopSound,
    playBackgroundMusic,
    stopBackgroundMusic,
    setMasterVolume: audioManager.setMasterVolume.bind(audioManager),
    setBackgroundVolume: audioManager.setBackgroundVolume.bind(audioManager),
    setSfxVolume: audioManager.setSfxVolume.bind(audioManager),
    toggleAudio,
    isInitialized,
    isEnabled,
  };
}
