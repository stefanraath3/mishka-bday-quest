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
      return audioManager.play(soundKey, options);
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

  return {
    playSound,
    stopSound,
    playBackgroundMusic: audioManager.playBackgroundMusic.bind(audioManager),
    stopBackgroundMusic: audioManager.stopBackgroundMusic.bind(audioManager),
    setMasterVolume: audioManager.setMasterVolume.bind(audioManager),
    setBackgroundVolume: audioManager.setBackgroundVolume.bind(audioManager),
    setSfxVolume: audioManager.setSfxVolume.bind(audioManager),
    toggleAudio,
    isInitialized,
    isEnabled,
  };
}
