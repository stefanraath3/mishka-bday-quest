import { useEffect, useRef, useState } from "react";
import { audioManager } from "./audioManager";

export function useAudio() {
  const [isInitialized, setIsInitialized] = useState(false);
  const [isEnabled, setIsEnabled] = useState(true);
  const initializeOnce = useRef(false);

  useEffect(() => {
    const initAudio = async () => {
      if (!initializeOnce.current) {
        initializeOnce.current = true;
        await audioManager.initialize();
        setIsInitialized(true);
      }
    };

    // Initialize on first user interaction (required by browsers)
    const handleUserInteraction = () => {
      initAudio();
      document.removeEventListener("click", handleUserInteraction);
      document.removeEventListener("keydown", handleUserInteraction);
      document.removeEventListener("touchstart", handleUserInteraction);
    };

    document.addEventListener("click", handleUserInteraction, { once: true });
    document.addEventListener("keydown", handleUserInteraction, { once: true });
    document.addEventListener("touchstart", handleUserInteraction, {
      once: true,
    });

    return () => {
      document.removeEventListener("click", handleUserInteraction);
      document.removeEventListener("keydown", handleUserInteraction);
      document.removeEventListener("touchstart", handleUserInteraction);
    };
  }, []);

  const playSound = (
    soundKey: string,
    options?: { volume?: number; fade?: number }
  ) => {
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
  };

  const stopSound = (soundKey: string, id?: number) => {
    audioManager.stop(soundKey, id);
  };

  const toggleAudio = () => {
    const newState = audioManager.toggle();
    setIsEnabled(newState);
    return newState;
  };

  const playBackgroundMusic = (trackKey: string = "medieval-ambient") => {
    if (!isInitialized) return;

    // Map the track keys to AudioManager keys
    const trackMap: Record<string, string> = {
      "medieval-ambient": "ambientMusic",
      "happy-birthday": "celebrationMusic",
    };

    const mappedKey = trackMap[trackKey] || trackKey;
    audioManager.playBackgroundMusic(mappedKey);
  };

  return {
    playSound,
    stopSound,
    playBackgroundMusic,
    stopBackgroundMusic: audioManager.stopBackgroundMusic.bind(audioManager),
    setMasterVolume: audioManager.setMasterVolume.bind(audioManager),
    setBackgroundVolume: audioManager.setBackgroundVolume.bind(audioManager),
    setSfxVolume: audioManager.setSfxVolume.bind(audioManager),
    toggleAudio,
    isInitialized,
    isEnabled,
  };
}
