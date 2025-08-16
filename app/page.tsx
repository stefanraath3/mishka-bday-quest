"use client";

import { useState, useEffect, useRef } from "react";
import dynamic from "next/dynamic";
import LoaderScreen from "./components/LoaderScreen";
import GameStartModal from "./components/GameStartModal";
import SetupWizard from "./components/SetupWizard";
import {
  AssetLoader,
  AssetLoadProgress,
  LoadedAssets,
} from "@/lib/assetLoader";
import { useAudio } from "@/lib/useAudio";

// Dynamically import Game component to avoid SSR issues
const Game = dynamic(() => import("./game/Game"), { ssr: false });

enum GameState {
  LOADING = "loading",
  SETUP = "setup",
  PLAYING = "playing",
  ERROR = "error",
}

export default function Home() {
  // State management
  const [gameState, setGameState] = useState<GameState>(GameState.LOADING);
  const [loadProgress, setLoadProgress] = useState<AssetLoadProgress>({
    type: "audio",
    loaded: 0,
    total: 0,
    percentage: 0,
    status: "Initializing...",
  });
  const [loadError, setLoadError] = useState<string | null>(null);
  const [loadedAssets, setLoadedAssets] = useState<LoadedAssets | null>(null);

  // Audio system integration
  const {
    isInitialized: audioInitialized,
    isEnabled: audioEnabled,
    toggleAudio,
  } = useAudio();

  // Asset loader instance
  const assetLoaderRef = useRef<AssetLoader | null>(null);
  const loadingStarted = useRef(false);

  // Initialize asset loading
  useEffect(() => {
    if (!loadingStarted.current) {
      loadingStarted.current = true;
      startAssetLoading();
    }
  }, []);

  const startAssetLoading = async () => {
    try {
      setLoadError(null);
      setGameState(GameState.LOADING);

      // Create asset loader with progress callback
      const assetLoader = new AssetLoader((progress) => {
        setLoadProgress(progress);
      });
      assetLoaderRef.current = assetLoader;

      // Start loading all assets
      const assets = await assetLoader.loadAllAssets();
      setLoadedAssets(assets);

      // Small delay to show completion before transitioning
      setTimeout(() => {
        setGameState(GameState.SETUP);
      }, 1000);
    } catch (error) {
      console.error("Failed to load assets:", error);
      setLoadError(
        error instanceof Error
          ? error.message
          : "Unknown loading error occurred"
      );
      setGameState(GameState.ERROR);
    }
  };

  const handleRetryLoading = () => {
    loadingStarted.current = false;
    startAssetLoading();
  };

  const handleStartGame = () => {
    setGameState(GameState.PLAYING);
  };

  const handleBackToStart = () => {
    setGameState(GameState.SETUP);
  };

  // Cleanup asset loader on unmount
  useEffect(() => {
    return () => {
      if (assetLoaderRef.current) {
        assetLoaderRef.current.dispose();
      }
    };
  }, []);

  // Render based on current game state
  switch (gameState) {
    case GameState.LOADING:
      return (
        <LoaderScreen
          progress={loadProgress}
          isVisible={true}
          onRetry={handleRetryLoading}
          error={loadError}
        />
      );

    case GameState.SETUP:
      return <SetupWizard isVisible={true} onContinue={handleStartGame} />;

    case GameState.PLAYING:
      return (
        <div className="relative">
          <Game loadedAssets={loadedAssets} onBackToMenu={handleBackToStart} />
        </div>
      );

    case GameState.ERROR:
      return (
        <LoaderScreen
          progress={loadProgress}
          isVisible={true}
          onRetry={handleRetryLoading}
          error={loadError || "An unknown error occurred"}
        />
      );

    default:
      return (
        <div className="fixed inset-0 bg-black flex items-center justify-center">
          <div className="text-white text-xl">Loading...</div>
        </div>
      );
  }
}
