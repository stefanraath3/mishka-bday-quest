import { Howl, Howler } from "howler";

export interface SoundConfig {
  src: string[];
  volume?: number;
  loop?: boolean;
  autoplay?: boolean;
  preload?: boolean;
}

export class AudioManager {
  private sounds: Map<string, Howl> = new Map();
  private isEnabled = true;
  private masterVolume = 0.7;
  private backgroundMusicVolume = 0.3;
  private sfxVolume = 0.6;
  private isInitialized = false;

  // Define all our sound effects and music
  private readonly soundConfigs: Record<string, SoundConfig> = {
    // Background Music
    ambientMusic: {
      src: [
        "/audio/music/medieval-ambient.mp3",
        "/audio/music/medieval-ambient.ogg",
      ],
      volume: this.backgroundMusicVolume,
      loop: true,
      preload: true,
    },
    celebrationMusic: {
      src: [
        "/audio/music/happy-birthday.mp3",
        "/audio/music/happy-birthday.ogg",
      ],
      volume: this.backgroundMusicVolume * 1.2,
      loop: true,
      preload: true,
    },

    // UI & Interaction Sounds
    keyCollected: {
      src: ["/audio/sfx/key-pickup.mp3", "/audio/sfx/key-pickup.ogg"],
      volume: this.sfxVolume,
      preload: true,
    },
    riddleSolved: {
      src: ["/audio/sfx/riddle-success.mp3", "/audio/sfx/riddle-success.ogg"],
      volume: this.sfxVolume,
      preload: true,
    },
    doorUnlock: {
      src: ["/audio/sfx/door-unlock.mp3", "/audio/sfx/door-unlock.ogg"],
      volume: this.sfxVolume,
      preload: true,
    },
    doorOpen: {
      src: ["/audio/sfx/door-creak.mp3", "/audio/sfx/door-creak.ogg"],
      volume: this.sfxVolume * 0.8,
      preload: true,
    },
    chestOpen: {
      src: ["/audio/sfx/chest-open.mp3", "/audio/sfx/chest-open.ogg"],
      volume: this.sfxVolume,
      preload: true,
    },
    footsteps: {
      src: ["/audio/sfx/footsteps.mp3", "/audio/sfx/footsteps.ogg"],
      volume: this.sfxVolume * 0.4,
      loop: true,
      preload: true,
    },

    // Ambient Sounds
    torchFlicker: {
      src: ["/audio/sfx/torch-crackle.mp3", "/audio/sfx/torch-crackle.ogg"],
      volume: this.sfxVolume * 0.3,
      loop: true,
      preload: true,
    },

    // UI Feedback
    buttonClick: {
      src: ["/audio/sfx/button-click.mp3", "/audio/sfx/button-click.ogg"],
      volume: this.sfxVolume * 0.8,
      preload: true,
    },
    scrollUnfurl: {
      src: [
        "/audio/sfx/parchment-unfurl.mp3",
        "/audio/sfx/parchment-unfurl.ogg",
      ],
      volume: this.sfxVolume,
      preload: true,
    },
    wrongAnswer: {
      src: ["/audio/sfx/error-buzz.mp3", "/audio/sfx/error-buzz.ogg"],
      volume: this.sfxVolume * 0.7,
      preload: true,
    },

    // Special Effects
    confetti: {
      src: ["/audio/sfx/party-horn.mp3", "/audio/sfx/party-horn.ogg"],
      volume: this.sfxVolume,
      preload: true,
    },
    magicalSparkle: {
      src: ["/audio/sfx/magical-sparkle.mp3", "/audio/sfx/magical-sparkle.ogg"],
      volume: this.sfxVolume * 0.8,
      preload: true,
    },
  };

  constructor() {
    this.setupHowler();
  }

  private setupHowler() {
    // Set global volume
    Howler.volume(this.masterVolume);

    // Handle browser autoplay policies
    Howler.autoUnlock = true;
    Howler.html5PoolSize = 10;
  }

  async initialize(): Promise<void> {
    if (this.isInitialized) return;

    try {
      // Load all sounds
      const loadPromises = Object.entries(this.soundConfigs).map(
        ([key, config]) => {
          return new Promise<void>((resolve, reject) => {
            const sound = new Howl({
              ...config,
              onload: () => resolve(),
              onloaderror: () => {
                console.warn(`Failed to load sound: ${key}`);
                resolve(); // Continue even if some sounds fail
              },
            });

            this.sounds.set(key, sound);
          });
        }
      );

      await Promise.all(loadPromises);
      this.isInitialized = true;
      console.log("Audio system initialized successfully");
    } catch (error) {
      console.error("Failed to initialize audio system:", error);
    }
  }

  // Play sound effect
  play(
    soundKey: string,
    options?: { volume?: number; fade?: number }
  ): number | undefined {
    if (!this.isEnabled || !this.sounds.has(soundKey)) {
      console.warn(`Sound not found or audio disabled: ${soundKey}`);
      return;
    }

    const sound = this.sounds.get(soundKey)!;
    const playId = sound.play();

    if (options?.volume !== undefined) {
      sound.volume(options.volume, playId);
    }

    if (options?.fade) {
      sound.fade(0, sound.volume(), options.fade, playId);
    }

    return playId;
  }

  // Stop sound
  stop(soundKey: string, id?: number) {
    const sound = this.sounds.get(soundKey);
    if (sound) {
      sound.stop(id);
    }
  }

  // Fade in background music
  playBackgroundMusic(trackKey: string = "ambientMusic") {
    this.stop("ambientMusic");
    this.stop("celebrationMusic");

    const playId = this.play(trackKey);
    if (playId !== undefined) {
      const sound = this.sounds.get(trackKey)!;
      sound.fade(0, this.backgroundMusicVolume, 2000, playId);
    }
  }

  // Fade out background music
  stopBackgroundMusic(fadeTime = 1000) {
    ["ambientMusic", "celebrationMusic"].forEach((trackKey) => {
      const sound = this.sounds.get(trackKey);
      if (sound && sound.playing()) {
        sound.fade(sound.volume(), 0, fadeTime);
        setTimeout(() => sound.stop(), fadeTime);
      }
    });
  }

  // Volume controls
  setMasterVolume(volume: number) {
    this.masterVolume = Math.max(0, Math.min(1, volume));
    Howler.volume(this.masterVolume);
  }

  setBackgroundVolume(volume: number) {
    this.backgroundMusicVolume = Math.max(0, Math.min(1, volume));
    ["ambientMusic", "celebrationMusic"].forEach((key) => {
      const sound = this.sounds.get(key);
      if (sound) sound.volume(this.backgroundMusicVolume);
    });
  }

  setSfxVolume(volume: number) {
    this.sfxVolume = Math.max(0, Math.min(1, volume));
  }

  // Enable/disable audio
  toggle() {
    this.isEnabled = !this.isEnabled;
    if (!this.isEnabled) {
      Howler.stop();
    }
    return this.isEnabled;
  }

  // Cleanup
  destroy() {
    this.sounds.forEach((sound) => {
      sound.stop();
      sound.unload();
    });
    this.sounds.clear();
  }

  // Getters
  get enabled() {
    return this.isEnabled;
  }
  get initialized() {
    return this.isInitialized;
  }
}

// Create singleton instance
export const audioManager = new AudioManager();
