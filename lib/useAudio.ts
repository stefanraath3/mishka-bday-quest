import { useEffect, useState, useCallback } from "react";
import { audioManager } from "./audioManager";

export function useAudio() {
  // Check actual audioManager state instead of maintaining local state
  const [isInitialized, setIsInitialized] = useState(audioManager.initialized);
  const [isEnabled, setIsEnabled] = useState(audioManager.enabled);

  // Sync with audioManager's actual state on mount and updates
  useEffect(() => {
    const checkState = () => {
      setIsInitialized(audioManager.initialized);
      setIsEnabled(audioManager.enabled);
    };

    // Check immediately
    checkState();

    // Check periodically to stay in sync
    const interval = setInterval(checkState, 100);

    return () => clearInterval(interval);
  }, []);

  const initializeAudio = useCallback(async () => {
    if (audioManager.initialized) {
      setIsInitialized(true);
      return true;
    }
    await audioManager.initialize();
    setIsInitialized(true);
    return true;
  }, []);

  const playSound = useCallback(
    async (soundKey: string, options?: { volume?: number; fade?: number }) => {
      // Always check the actual audioManager state, not potentially stale React state
      const currentInitialized = audioManager.initialized;
      const currentEnabled = audioManager.enabled;

      console.log(`[useAudio] playSound called with:`, {
        soundKey,
        options,
        currentInitialized,
        currentEnabled,
        reactStateInitialized: isInitialized,
        reactStateEnabled: isEnabled,
      });

      if (!currentInitialized) {
        console.warn(
          `[useAudio] Audio not initialized, cannot play: ${soundKey}`
        );
        return;
      }

      if (!currentEnabled) {
        console.warn(`[useAudio] Audio not enabled, cannot play: ${soundKey}`);
        return;
      }

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
      console.log(`[useAudio] Mapped "${soundKey}" to "${mappedKey}"`);

      const result = await audioManager.play(mappedKey, options);
      console.log(`[useAudio] Play result for ${soundKey}:`, result);
      return result;
    },
    [] // No dependencies needed since we check audioManager directly
  );

  const stopSound = useCallback((soundKey: string, id?: number) => {
    audioManager.stop(soundKey, id);
  }, []);

  const toggleAudio = useCallback(() => {
    const newState = audioManager.toggle();
    setIsEnabled(newState);
    // Also ensure initialized state is synced
    setIsInitialized(audioManager.initialized);
    return newState;
  }, []);

  const playBackgroundMusic = useCallback(
    async (trackKey: string = "medieval-ambient") => {
      // Check actual audioManager state
      if (!audioManager.initialized) {
        console.warn(
          `[useAudio] Cannot play background music - audio not initialized`
        );
        return;
      }

      // Map the track keys to AudioManager keys
      const trackMap: Record<string, string> = {
        "medieval-ambient": "ambientMusic",
        "happy-birthday": "celebrationMusic",
      };

      const mappedKey = trackMap[trackKey] || trackKey;
      await audioManager.playBackgroundMusic(mappedKey);
    },
    [] // No dependencies needed since we check audioManager directly
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
