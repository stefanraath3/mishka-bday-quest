import * as THREE from "three";
import { Howl, Howler } from "howler";

type HowlerWithCtx = typeof Howler & { ctx?: AudioContext };

type TorchSound = {
  howl: Howl;
  position: THREE.Vector3;
};

class SoundManager {
  private initialized = false;
  private ambient?: Howl;
  private doorCreak?: Howl;
  private keyChime?: Howl;
  private footsteps: Howl[] = [];
  private uiOpen?: Howl;
  private uiClose?: Howl;
  private uiWrong?: Howl;
  private uiCorrect?: Howl;

  private torches: TorchSound[] = [];
  private ambientStarted = false;

  init() {
    if (this.initialized) return;
    this.initialized = true;

    // Global master volume a bit low by default; caller can override
    Howler.volume(0.6);

    // Core sounds (these paths should exist under public/audio)
    this.ambient = new Howl({
      src: ["/audio/ambient-cavern.mp3", "/audio/ambient-cavern.ogg"],
      loop: true,
      volume: 0.35,
      preload: true,
      onloaderror: () => {},
    });

    this.doorCreak = new Howl({
      src: ["/audio/door-creak.mp3", "/audio/door-creak.ogg"],
      volume: 0.9,
      preload: true,
      onloaderror: () => {},
    });

    this.keyChime = new Howl({
      src: ["/audio/key-chime.mp3", "/audio/key-chime.ogg"],
      volume: 0.8,
      preload: true,
      onloaderror: () => {},
    });

    // Small bank of footstep variations (stone floor)
    const footstepFiles = [
      ["/audio/footstep-stone-1.mp3", "/audio/footstep-stone-1.ogg"],
      ["/audio/footstep-stone-2.mp3", "/audio/footstep-stone-2.ogg"],
      ["/audio/footstep-stone-3.mp3", "/audio/footstep-stone-3.ogg"],
    ];
    this.footerload(footstepFiles);

    // UI sounds
    this.uiOpen = new Howl({
      src: ["/audio/ui-open.mp3", "/audio/ui-open.ogg"],
      volume: 0.5,
      preload: true,
      onloaderror: () => {},
    });
    this.uiClose = new Howl({
      src: ["/audio/ui-close.mp3", "/audio/ui-close.ogg"],
      volume: 0.5,
      preload: true,
      onloaderror: () => {},
    });
    this.uiWrong = new Howl({
      src: ["/audio/ui-wrong.mp3", "/audio/ui-wrong.ogg"],
      volume: 0.5,
      preload: true,
      onloaderror: () => {},
    });
    this.uiCorrect = new Howl({
      src: ["/audio/ui-correct.mp3", "/audio/ui-correct.ogg"],
      volume: 0.6,
      preload: true,
      onloaderror: () => {},
    });
  }

  private footerload(files: string[][]) {
    this.footsteps = files.map(
      (sources) =>
        new Howl({
          src: sources,
          volume: 0.4,
          preload: true,
          onloaderror: () => {},
        })
    );
  }

  resumeAudioContext() {
    // Some browsers require a user gesture to start audio
    const howlerGlobal = Howler as unknown as HowlerWithCtx;
    const ctx = howlerGlobal.ctx;
    if (ctx && ctx.state !== "running") {
      ctx.resume().catch(() => {});
    }
    if (!this.ambientStarted && this.ambient) {
      this.ambient.play();
      this.ambientStarted = true;
    }
  }

  updateListener(
    position: THREE.Vector3,
    forward: THREE.Vector3,
    up: THREE.Vector3
  ) {
    Howler.pos(position.x, position.y, position.z);
    Howler.orientation(forward.x, forward.y, forward.z, up.x, up.y, up.z);
  }

  createTorchAt(position: THREE.Vector3, volume = 0.25) {
    const howl = new Howl({
      src: ["/audio/torch-crackle.mp3", "/audio/torch-crackle.ogg"],
      loop: true,
      volume,
      preload: true,
      onloaderror: () => {},
    });
    // 3D position
    howl.pos(position.x, position.y, position.z);
    howl.play();
    this.torches.push({ howl, position: position.clone() });
  }

  clearTorches() {
    this.torches.forEach(({ howl }) => {
      try {
        howl.stop();
        howl.unload();
      } catch {}
    });
    this.torches = [];
  }

  playFootstep() {
    if (this.footsteps.length === 0) return;
    const idx = Math.floor(Math.random() * this.footsteps.length);
    const s = this.footsteps[idx];
    // Small random pitch variance
    s.rate(0.95 + Math.random() * 0.1);
    s.play();
  }

  playDoorCreak() {
    this.doorCreak?.play();
  }

  playKeyChime() {
    this.keyChime?.play();
  }

  // UI convenience
  playUiOpen() {
    this.uiOpen?.play();
  }
  playUiClose() {
    this.uiClose?.play();
  }
  playUiWrong() {
    this.uiWrong?.play();
  }
  playUiCorrect() {
    this.uiCorrect?.play();
  }

  disposeAll() {
    // Stop everything (use when fully leaving the game)
    try {
      this.ambient?.stop();
      this.ambient?.unload();
    } catch {}

    try {
      this.doorCreak?.unload();
      this.keyChime?.unload();
    } catch {}

    this.footsteps.forEach((h) => {
      try {
        h.unload();
      } catch {}
    });
    this.footsteps = [];
    this.clearTorches();
    try {
      this.uiOpen?.unload();
      this.uiClose?.unload();
      this.uiWrong?.unload();
      this.uiCorrect?.unload();
    } catch {}
    this.initialized = false;
    this.ambientStarted = false;
  }
}

const sound = new SoundManager();
export default sound;
