import { Howl } from "howler";
import * as THREE from "three";
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader.js";

export interface AssetLoadProgress {
  type: "audio" | "model" | "texture" | "complete";
  loaded: number;
  total: number;
  percentage: number;
  currentAsset?: string;
  status: string;
}

export interface LoadedAssets {
  audio: Map<string, Howl>;
  models: Map<string, THREE.Group>;
  textures: Map<string, THREE.Texture>;
}

export class AssetLoader {
  private loadedAssets: LoadedAssets = {
    audio: new Map(),
    models: new Map(),
    textures: new Map(),
  };

  private totalAssets = 0;
  private loadedAssetCount = 0;
  private onProgress?: (progress: AssetLoadProgress) => void;

  // Asset definitions
  private readonly assetManifest = {
    audio: {
      // Background Music
      "medieval-ambient": [
        "/audio/music/medieval-ambient.mp3",
        "/audio/music/medieval-ambient.ogg",
      ],
      "happy-birthday": [
        "/audio/music/happy-birthday.mp3",
        "/audio/music/happy-birthday.ogg",
      ],

      // Sound Effects
      "key-pickup": ["/audio/sfx/key-pickup.mp3", "/audio/sfx/key-pickup.ogg"],
      "riddle-success": [
        "/audio/sfx/riddle-success.mp3",
        "/audio/sfx/riddle-success.ogg",
      ],
      "door-unlock": [
        "/audio/sfx/door-unlock.mp3",
        "/audio/sfx/door-unlock.ogg",
      ],
      "door-creak": ["/audio/sfx/door-creak.mp3", "/audio/sfx/door-creak.ogg"],
      "chest-open": ["/audio/sfx/chest-open.mp3", "/audio/sfx/chest-open.ogg"],
      footsteps: ["/audio/sfx/footsteps.mp3", "/audio/sfx/footsteps.ogg"],
      "torch-crackle": [
        "/audio/sfx/torch-crackle.mp3",
        "/audio/sfx/torch-crackle.ogg",
      ],
      "button-click": [
        "/audio/sfx/button-click.mp3",
        "/audio/sfx/button-click.ogg",
      ],
      "parchment-unfurl": [
        "/audio/sfx/parchment-unfurl.mp3",
        "/audio/sfx/parchment-unfurl.ogg",
      ],
      "error-buzz": ["/audio/sfx/error-buzz.mp3", "/audio/sfx/error-buzz.ogg"],
      "party-horn": ["/audio/sfx/party-horn.mp3", "/audio/sfx/party-horn.ogg"],
      "magical-sparkle": [
        "/audio/sfx/magical-sparkle.mp3",
        "/audio/sfx/magical-sparkle.ogg",
      ],
    },
    models: {
      character: "/models/character.glb",
      "character-walking": "/models/character-walking.glb",
    },
    textures: {
      // Add any texture files here if needed
    },
  };

  constructor(onProgress?: (progress: AssetLoadProgress) => void) {
    this.onProgress = onProgress;
    this.calculateTotalAssets();
  }

  private calculateTotalAssets() {
    this.totalAssets =
      Object.keys(this.assetManifest.audio).length +
      Object.keys(this.assetManifest.models).length +
      Object.keys(this.assetManifest.textures).length;
  }

  private updateProgress(
    type: AssetLoadProgress["type"],
    currentAsset?: string,
    status?: string
  ) {
    const percentage = Math.round(
      (this.loadedAssetCount / this.totalAssets) * 100
    );

    const progress: AssetLoadProgress = {
      type,
      loaded: this.loadedAssetCount,
      total: this.totalAssets,
      percentage,
      currentAsset,
      status: status || `Loading ${type} assets...`,
    };

    this.onProgress?.(progress);
  }

  private loadAudioAsset(key: string, urls: string[]): Promise<Howl> {
    return new Promise((resolve, _reject) => {
      this.updateProgress("audio", key, `Loading audio: ${key}`);

      const sound = new Howl({
        src: urls,
        preload: true,
        onload: () => {
          this.loadedAssetCount++;
          this.loadedAssets.audio.set(key, sound);
          this.updateProgress("audio", key, `Loaded audio: ${key}`);
          resolve(sound);
        },
        onloaderror: (id, error) => {
          console.warn(`Failed to load audio: ${key}`, error);
          this.loadedAssetCount++; // Still count as "processed" to maintain progress
          this.updateProgress("audio", key, `Failed to load audio: ${key}`);

          // Create a silent fallback sound
          const silentSound = new Howl({
            src: [
              "data:audio/wav;base64,UklGRigAAABXQVZFZm10IBIAAAABAAEARKwAAIhYAQACABAAAABkYXRhAgAAAAEA",
            ],
            volume: 0,
          });
          this.loadedAssets.audio.set(key, silentSound);
          resolve(silentSound);
        },
      });
    });
  }

  private loadModelAsset(key: string, url: string): Promise<THREE.Group> {
    return new Promise((resolve, _reject) => {
      this.updateProgress("model", key, `Loading model: ${key}`);

      const loader = new GLTFLoader();

      loader.load(
        url,
        (gltf) => {
          this.loadedAssetCount++;
          const model = gltf.scene.clone();
          this.loadedAssets.models.set(key, model);
          this.updateProgress("model", key, `Loaded model: ${key}`);
          resolve(model);
        },
        (_progress) => {
          // Optional: Could update sub-progress here
        },
        (error) => {
          console.warn(`Failed to load model: ${key}`, error);
          this.loadedAssetCount++; // Still count as "processed"
          this.updateProgress("model", key, `Failed to load model: ${key}`);

          // Create a simple fallback geometry
          const fallbackGeometry = new THREE.BoxGeometry(1, 1, 1);
          const fallbackMaterial = new THREE.MeshStandardMaterial({
            color: 0xff0000,
          });
          const fallbackModel = new THREE.Mesh(
            fallbackGeometry,
            fallbackMaterial
          );
          const fallbackGroup = new THREE.Group();
          fallbackGroup.add(fallbackModel);

          this.loadedAssets.models.set(key, fallbackGroup);
          resolve(fallbackGroup);
        }
      );
    });
  }

  private loadTextureAsset(key: string, url: string): Promise<THREE.Texture> {
    return new Promise((resolve, _reject) => {
      this.updateProgress("texture", key, `Loading texture: ${key}`);

      const loader = new THREE.TextureLoader();

      loader.load(
        url,
        (texture) => {
          this.loadedAssetCount++;
          this.loadedAssets.textures.set(key, texture);
          this.updateProgress("texture", key, `Loaded texture: ${key}`);
          resolve(texture);
        },
        undefined,
        (error) => {
          console.warn(`Failed to load texture: ${key}`, error);
          this.loadedAssetCount++; // Still count as "processed"
          this.updateProgress("texture", key, `Failed to load texture: ${key}`);

          // Create a fallback texture
          const canvas = document.createElement("canvas");
          canvas.width = canvas.height = 64;
          const context = canvas.getContext("2d")!;
          context.fillStyle = "#ff0000";
          context.fillRect(0, 0, 64, 64);

          const fallbackTexture = new THREE.CanvasTexture(canvas);
          this.loadedAssets.textures.set(key, fallbackTexture);
          resolve(fallbackTexture);
        }
      );
    });
  }

  async loadAllAssets(): Promise<LoadedAssets> {
    this.loadedAssetCount = 0;
    this.updateProgress("audio", undefined, "Starting asset loading...");

    try {
      // Load all audio assets
      const audioPromises = Object.entries(this.assetManifest.audio).map(
        ([key, urls]) => this.loadAudioAsset(key, urls)
      );

      // Load all model assets
      const modelPromises = Object.entries(this.assetManifest.models).map(
        ([key, url]) => this.loadModelAsset(key, url)
      );

      // Load all texture assets
      const texturePromises = Object.entries(this.assetManifest.textures).map(
        ([key, url]) => this.loadTextureAsset(key, url as string)
      );

      // Wait for all assets to load (or fail gracefully)
      await Promise.all([
        ...audioPromises,
        ...modelPromises,
        ...texturePromises,
      ]);

      this.updateProgress(
        "complete",
        undefined,
        "All assets loaded successfully!"
      );

      return this.loadedAssets;
    } catch (error) {
      console.error("Asset loading failed:", error);
      throw error;
    }
  }

  // Retry failed assets
  async retryFailedAssets(): Promise<LoadedAssets> {
    // Reset and try again
    this.loadedAssets = {
      audio: new Map(),
      models: new Map(),
      textures: new Map(),
    };

    return this.loadAllAssets();
  }

  // Get loaded assets
  getLoadedAssets(): LoadedAssets {
    return this.loadedAssets;
  }

  // Get specific asset
  getAudio(key: string): Howl | undefined {
    return this.loadedAssets.audio.get(key);
  }

  getModel(key: string): THREE.Group | undefined {
    return this.loadedAssets.models.get(key);
  }

  getTexture(key: string): THREE.Texture | undefined {
    return this.loadedAssets.textures.get(key);
  }

  // Cleanup
  dispose() {
    // Dispose audio
    this.loadedAssets.audio.forEach((sound) => {
      sound.unload();
    });

    // Dispose models
    this.loadedAssets.models.forEach((model) => {
      model.traverse((child) => {
        if (child instanceof THREE.Mesh) {
          if (child.geometry) child.geometry.dispose();
          if (child.material) {
            if (Array.isArray(child.material)) {
              child.material.forEach((mat) => mat.dispose());
            } else {
              child.material.dispose();
            }
          }
        }
      });
    });

    // Dispose textures
    this.loadedAssets.textures.forEach((texture) => {
      texture.dispose();
    });

    // Clear all maps
    this.loadedAssets.audio.clear();
    this.loadedAssets.models.clear();
    this.loadedAssets.textures.clear();
  }
}
