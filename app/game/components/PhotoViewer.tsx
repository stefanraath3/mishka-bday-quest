"use client";

import { useEffect, useState } from "react";
import { MemoryPhoto } from "./PaintingFrame";
import { useAudio } from "@/lib/useAudio";

interface PhotoViewerProps {
  isVisible: boolean;
  photo: MemoryPhoto | null;
  onClose: () => void;
}

export default function PhotoViewer({
  isVisible,
  photo,
  onClose,
}: PhotoViewerProps) {
  const [showContent, setShowContent] = useState(false);
  const [imageLoaded, setImageLoaded] = useState(false);

  // Audio system integration
  const {
    playSound,
    isInitialized: audioInitialized,
    isEnabled: audioEnabled,
  } = useAudio();

  useEffect(() => {
    if (isVisible && photo) {
      setShowContent(false);
      setImageLoaded(false);

      // Start content animation after a brief delay
      setTimeout(() => setShowContent(true), 200);

      // Play gentle camera shutter sound when opening photo viewer
      if (audioInitialized && audioEnabled) {
        console.log(`[PhotoViewer] Opening photo: ${photo.title}`);
        playSound("camera-shutter", { volume: 0.4 });
      }
    } else {
      setShowContent(false);
      setImageLoaded(false);
    }
  }, [isVisible, photo, audioInitialized, audioEnabled, playSound]);

  const handleClose = () => {
    // Play photo flip sound when closing
    if (audioInitialized && audioEnabled) {
      playSound("photo-flip", { volume: 0.6 });
    }
    onClose();
  };

  const handleImageLoad = () => {
    setImageLoaded(true);
  };

  const handleImageError = () => {
    console.error(`[PhotoViewer] Failed to load image: ${photo?.imagePath}`);
    setImageLoaded(false);
  };

  if (!photo) return null;

  return (
    <div
      className={`fixed inset-0 z-50 flex items-center justify-center p-4 transition-all duration-500 ${
        isVisible
          ? "opacity-100 backdrop-blur-sm"
          : "opacity-0 pointer-events-none"
      }`}
      style={{
        backgroundColor: isVisible ? "rgba(0, 0, 0, 0.85)" : "rgba(0, 0, 0, 0)",
      }}
    >
      <div
        className={`relative max-w-5xl w-full bg-gradient-to-br from-amber-50 to-yellow-50 rounded-2xl shadow-2xl border-4 border-yellow-600 overflow-hidden transform transition-all duration-700 ${
          isVisible ? "scale-100 rotate-0" : "scale-90 rotate-1"
        }`}
        style={{
          maxHeight: "90vh",
        }}
      >
        {/* Decorative corners */}
        <div className="absolute top-2 left-2 w-8 h-8 border-l-4 border-t-4 border-yellow-700 opacity-60"></div>
        <div className="absolute top-2 right-2 w-8 h-8 border-r-4 border-t-4 border-yellow-700 opacity-60"></div>
        <div className="absolute bottom-2 left-2 w-8 h-8 border-l-4 border-b-4 border-yellow-700 opacity-60"></div>
        <div className="absolute bottom-2 right-2 w-8 h-8 border-r-4 border-b-4 border-yellow-700 opacity-60"></div>

        {/* Close button */}
        <button
          onClick={handleClose}
          className="absolute right-4 top-4 z-10 w-10 h-10 rounded-full bg-red-600 hover:bg-red-700 text-white font-bold text-xl transition-colors duration-200 shadow-lg hover:shadow-xl"
          aria-label="Close photo"
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
          {/* Header with title */}
          <div className="bg-gradient-to-r from-yellow-600 to-amber-600 text-white p-6">
            <h1 className="text-3xl md:text-4xl font-bold text-center drop-shadow-md">
              {photo.title}
            </h1>
            {photo.date && (
              <p className="text-center mt-2 text-yellow-100 text-lg">
                {photo.date}
              </p>
            )}
            {photo.location && (
              <p className="text-center mt-1 text-yellow-200 text-md">
                📍 {photo.location}
              </p>
            )}
          </div>

          <div className="p-6">
            <div className="grid md:grid-cols-2 gap-6">
              {/* Photo section */}
              <div className="space-y-4">
                <div className="relative bg-white p-4 rounded-lg shadow-lg">
                  {/* Loading placeholder */}
                  {!imageLoaded && (
                    <div className="aspect-[4/3] bg-gray-200 rounded flex items-center justify-center">
                      <div className="text-gray-500 text-center">
                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-yellow-600 mx-auto mb-2"></div>
                        <p>Loading photo...</p>
                      </div>
                    </div>
                  )}

                  {/* Actual photo */}
                  <img
                    src={photo.imagePath}
                    alt={photo.title}
                    onLoad={handleImageLoad}
                    onError={handleImageError}
                    className={`w-full h-auto rounded shadow-md transition-opacity duration-300 ${
                      imageLoaded ? "opacity-100" : "opacity-0 absolute inset-4"
                    }`}
                    style={{ maxHeight: "400px", objectFit: "contain" }}
                  />
                </div>

                {/* People tags */}
                {photo.people && photo.people.length > 0 && (
                  <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
                    <h3 className="font-semibold text-blue-800 mb-2 flex items-center">
                      <span className="mr-2">👥</span>
                      In this photo:
                    </h3>
                    <div className="flex flex-wrap gap-2">
                      {photo.people.map((person, index) => (
                        <span
                          key={index}
                          className="inline-block bg-blue-600 text-white px-3 py-1 rounded-full text-sm font-medium"
                        >
                          {person}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {/* Memory/description section */}
              <div className="space-y-4">
                <div className="bg-amber-50 p-6 rounded-lg border-l-4 border-amber-500">
                  <h2 className="text-2xl font-semibold text-amber-800 mb-4 flex items-center">
                    <span className="mr-3 text-3xl">💭</span>
                    Memory
                  </h2>
                  <p className="text-amber-900 leading-relaxed text-lg">
                    {photo.description}
                  </p>
                </div>

                {/* Interactive elements */}
                <div className="bg-purple-50 p-4 rounded-lg border border-purple-200">
                  <h3 className="font-semibold text-purple-800 mb-3 flex items-center">
                    <span className="mr-2">✨</span>
                    Memory Palace
                  </h3>
                  <p className="text-purple-700 text-sm mb-3">
                    This photo is part of your personal memory palace. Each
                    painting holds a special moment in time.
                  </p>
                  <div className="flex gap-2">
                    <button
                      onClick={() => {
                        if (audioInitialized && audioEnabled) {
                          playSound("camera-shutter", { volume: 0.5 });
                        }
                        // Could add favorite functionality here
                      }}
                      className="px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-full text-sm font-medium transition-colors duration-200"
                    >
                      ⭐ Favorite
                    </button>
                    <button
                      onClick={() => {
                        if (audioInitialized && audioEnabled) {
                          playSound("camera-shutter", { volume: 0.4 });
                        }
                        // Could add share functionality here
                      }}
                      className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-full text-sm font-medium transition-colors duration-200"
                    >
                      🔗 Share Memory
                    </button>
                  </div>
                </div>

                {/* Navigation hint */}
                <div className="text-center text-gray-600 text-sm bg-gray-50 p-3 rounded">
                  <p>
                    🎮 Continue exploring the memory palace to discover more
                    photos and memories!
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Footer */}
          <div className="bg-gradient-to-r from-amber-100 to-yellow-100 p-4 text-center">
            <p className="text-amber-800 font-medium">
              🎂 A special moment preserved in your birthday memory palace 🏰
            </p>
          </div>
        </div>

        {/* Decorative sparkles */}
        <div className="absolute top-16 left-8 text-2xl animate-pulse text-yellow-500 opacity-70">
          ✨
        </div>
        <div className="absolute top-20 right-16 text-xl animate-bounce text-amber-400 opacity-60">
          🌟
        </div>
        <div className="absolute bottom-16 left-12 text-lg animate-ping text-yellow-600 opacity-50">
          💫
        </div>
        <div className="absolute bottom-20 right-8 text-2xl animate-pulse text-amber-500 opacity-70">
          ⭐
        </div>
      </div>
    </div>
  );
}
