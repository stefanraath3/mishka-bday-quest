"use client";

import { useEffect, useRef, useState } from "react";
import * as THREE from "three";
import {
  GLTFLoader,
  type GLTF,
} from "three/examples/jsm/loaders/GLTFLoader.js";
import { createOrnateKeyGeometry } from "./components/OrnateFloatingKey";
import { createMedievalDoorGeometry } from "./components/MedievalDoor";
import { createWallTorchGeometry, animateTorch } from "./components/WallTorch";
import AncientScroll from "./components/AncientScroll";
import DoorLockPuzzle from "./components/DoorLockPuzzle";
import BirthdayMessage from "./components/BirthdayMessage";
import AudioControls from "./components/AudioControls";
import { useAudio } from "@/lib/useAudio";

const riddles = [
  {
    id: "key1",
    position: new THREE.Vector3(10, 1.2, 10),
    riddle: {
      title: "Riddle of Repentance",
      text: `A night of confession, but not in a pew,
             Where laughter and mischief are part of the view.
             We twist the old word for a cheeky affair,
             What’s the nickname for ‘repentance’ we share?`,
      hint: "Think about a special event you all attended... What did you call it among yourselves? 🎭",
    },
    answer: "REPENNY",
  },
  {
    id: "key2",
    position: new THREE.Vector3(-8, 1.2, -9), // Behind a pillar
    riddle: {
      title: "Riddle of Strength",
      text: `I have no joints, but I am hard to break.
             Engineers love me for the structures they make.
             I stand firm against stress and strain.
             What am I, solid and plain?`,
      hint: "It's a quality of being strong and well-built.",
    },
    answer: "ROBUST",
  },
  {
    id: "key3",
    position: new THREE.Vector3(8, 1.2, -9), // Behind a pillar
    riddle: {
      title: "Riddle of the Unspoken",
      text: `I am a sound, a breath, a fleeting expression,
             Often embarrassing, a social transgression.
             Though sometimes silent, I make my presence known.
             What am I, a puff down under that is quickly blown?`,
      hint: "A humorous, sometimes vulgar term for a certain bodily function.",
    },
    answer: "QUEEF",
  },
  {
    id: "key4",
    position: new THREE.Vector3(-8, 1.2, 9), // Behind a pillar
    riddle: {
      title: "Riddle of Congestion",
      text: `I am a point where progress becomes slow,
             A narrow passage where things cease to flow.
             In traffic, production, or a story's plot,
             I am the frustrating, constricted spot.`,
      hint: "Think of a narrow part of a bottle.",
    },
    answer: "BOTTLENECK",
  },
];

type InputState = {
  forward: boolean;
  backward: boolean;
  left: boolean;
  right: boolean;
};

type AabbCollider = {
  id: string;
  box: THREE.Box3;
  mesh?: THREE.Mesh | THREE.Group;
  active: boolean;
};

function makeAabb(center: THREE.Vector3, size: THREE.Vector3): THREE.Box3 {
  const half = size.clone().multiplyScalar(0.5);
  return new THREE.Box3(center.clone().sub(half), center.clone().add(half));
}

function resolveSphereAabb(
  center: THREE.Vector3,
  radius: number,
  aabb: THREE.Box3
): THREE.Vector3 {
  // Return a correction vector to push the sphere outside the AABB if intersecting
  const clamped = new THREE.Vector3(
    THREE.MathUtils.clamp(center.x, aabb.min.x, aabb.max.x),
    THREE.MathUtils.clamp(center.y, aabb.min.y, aabb.max.y),
    THREE.MathUtils.clamp(center.z, aabb.min.z, aabb.max.z)
  );
  const delta = center.clone().sub(clamped);
  const distSq = delta.lengthSq();
  if (distSq > 0) {
    const dist = Math.sqrt(distSq);
    if (dist < radius) {
      const correctionMagnitude = radius - dist;
      return delta.multiplyScalar(correctionMagnitude / dist);
    }
    return new THREE.Vector3(0, 0, 0);
  }
  // Center is inside the box: push out along the nearest face
  const distances = [
    center.x - aabb.min.x, // to minX face
    aabb.max.x - center.x, // to maxX face
    center.y - aabb.min.y, // to minY face
    aabb.max.y - center.y, // to maxY face
    center.z - aabb.min.z, // to minZ face
    aabb.max.z - center.z, // to maxZ face
  ];
  let minVal = distances[0];
  let minIdx = 0;
  for (let i = 1; i < distances.length; i++) {
    if (distances[i] < minVal) {
      minVal = distances[i];
      minIdx = i;
    }
  }
  const correction = new THREE.Vector3();
  switch (minIdx) {
    case 0: // minX
      correction.set(aabb.min.x - radius - center.x, 0, 0);
      break;
    case 1: // maxX
      correction.set(aabb.max.x + radius - center.x, 0, 0);
      break;
    case 2: // minY
      correction.set(0, aabb.min.y - radius - center.y, 0);
      break;
    case 3: // maxY
      correction.set(0, aabb.max.y + radius - center.y, 0);
      break;
    case 4: // minZ
      correction.set(0, 0, aabb.min.z - radius - center.z);
      break;
    case 5: // maxZ
      correction.set(0, 0, aabb.max.z + radius - center.z);
      break;
  }
  return correction;
}

interface GameProps {
  loadedAssets?: import("@/lib/assetLoader").LoadedAssets | null;
  onBackToMenu?: () => void;
}

export default function Game({ loadedAssets, onBackToMenu }: GameProps = {}) {
  const mountRef = useRef<HTMLDivElement | null>(null);
  const sceneRef = useRef<THREE.Scene | null>(null);
  const gameStateRef = useRef({
    collectedKeys: new Set<string>(),
    collectedWords: new Set<string>(),
    doorOpen: false,
  });
  const [collectedKeys, setCollectedKeys] = useState(new Set<string>());
  const [collectedWords, setCollectedWords] = useState(new Set<string>());
  const [doorOpen, setDoorOpen] = useState(false);
  const [cameraRotateLeft, setCameraRotateLeft] = useState(false);
  const [cameraRotateRight, setCameraRotateRight] = useState(false);
  const [activeRiddle, setActiveRiddle] = useState<(typeof riddles)[0] | null>(
    null
  );
  const [showDoorPuzzle, setShowDoorPuzzle] = useState(false);
  const [showBirthdayMessage, setShowBirthdayMessage] = useState(false);

  // Audio system integration
  const {
    playSound,
    playBackgroundMusic,
    stopBackgroundMusic,
    stopSound,
    isInitialized: audioInitialized,
    isEnabled: audioEnabled,
  } = useAudio();

  // Track if user has interacted with the game
  const [hasUserInteracted, setHasUserInteracted] = useState(false);
  // Track footsteps sound state
  const footstepsIdRef = useRef<number | undefined>(undefined);
  const isPlayingFootsteps = useRef(false);

  // Log audio system state on mount and changes
  useEffect(() => {
    console.log(`[Game] Audio state changed:`, {
      audioInitialized,
      audioEnabled,
      audioManagerDirectly: {
        initialized: (window as any).audioManager?.initialized,
        enabled: (window as any).audioManager?.enabled,
      },
      playSound: typeof playSound,
      playBackgroundMusic: typeof playBackgroundMusic,
    });
  }, [audioInitialized, audioEnabled]);

  useEffect(() => {
    // Use the ref for game state
    const gameState = gameStateRef.current;
    const container = mountRef.current;
    if (!container) return;

    // Renderer with shadows enabled
    const renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.setSize(container.clientWidth, container.clientHeight);
    renderer.outputColorSpace = THREE.SRGBColorSpace;
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 2.1; // Increased for better overall visibility
    container.appendChild(renderer.domElement);

    // Scene
    const scene = new THREE.Scene();
    sceneRef.current = scene;
    scene.background = new THREE.Color(0x0a0a0a); // Very dark grey background for better contrast

    // Camera
    const camera = new THREE.PerspectiveCamera(
      75,
      container.clientWidth / container.clientHeight,
      0.1,
      100
    );
    camera.position.set(0, 1.6, 4);

    // Dramatic, localized lighting system
    const ambientLight = new THREE.AmbientLight(0x606060, 0.4); // Brighter ambient for better visibility
    scene.add(ambientLight);

    // Dim overhead light - just enough to give shape, no shadows
    const mainLight = new THREE.DirectionalLight(0xffffff, 0.3); // Increased for better visibility
    mainLight.position.set(0, 10, 5);
    mainLight.castShadow = false; // Turn off shadows for the main light
    scene.add(mainLight);

    // Wall torches with flickering lights - positioned for larger room
    const torchPositions = [
      // Entrance wall (positive Z)
      {
        pos: new THREE.Vector3(-6, 3.5, 14.5),
        rot: new THREE.Euler(0, 0, 0),
      },
      {
        pos: new THREE.Vector3(6, 3.5, 14.5),
        rot: new THREE.Euler(0, 0, 0),
      },
      // Far wall (negative Z)
      {
        pos: new THREE.Vector3(-10, 3.5, -14.5),
        rot: new THREE.Euler(0, Math.PI, 0),
      },
      {
        pos: new THREE.Vector3(10, 3.5, -14.5),
        rot: new THREE.Euler(0, Math.PI, 0),
      },
      // Left wall (negative X)
      {
        pos: new THREE.Vector3(-14.5, 3.5, -5),
        rot: new THREE.Euler(0, Math.PI / 2, 0),
      },
      {
        pos: new THREE.Vector3(-14.5, 3.5, 5),
        rot: new THREE.Euler(0, Math.PI / 2, 0),
      },
      // Right wall (positive X)
      {
        pos: new THREE.Vector3(14.5, 3.5, -5),
        rot: new THREE.Euler(0, -Math.PI / 2, 0),
      },
      {
        pos: new THREE.Vector3(14.5, 3.5, 5),
        rot: new THREE.Euler(0, -Math.PI / 2, 0),
      },
    ];

    const torches: THREE.Group[] = [];
    const torchLights: THREE.PointLight[] = [];

    torchPositions.forEach((torch) => {
      // Create torch geometry
      const torchGroup = createWallTorchGeometry();
      torchGroup.position.copy(torch.pos);
      torchGroup.rotation.copy(torch.rot);
      torchGroup.scale.setScalar(1.5); // Increase torch size
      scene.add(torchGroup);
      torches.push(torchGroup);

      // Add bright, fiery point light for each torch
      const torchLight = new THREE.PointLight(0xff8844, 25, 25); // Less orange, brighter for better illumination
      torchLight.position.copy(torch.pos);
      const lightOffset = 0.8; // How far the light is from the wall
      if (torch.rot.y === 0) torchLight.position.z -= lightOffset;
      else if (torch.rot.y === Math.PI) torchLight.position.z += lightOffset;
      else if (torch.rot.y > 0) torchLight.position.x += lightOffset;
      else torchLight.position.x -= lightOffset;

      torchLight.castShadow = true;
      torchLight.shadow.mapSize.width = 1024;
      torchLight.shadow.mapSize.height = 1024;
      torchLight.shadow.camera.near = 0.5;
      torchLight.shadow.camera.far = 25;
      torchLight.shadow.bias = -0.005; // Adjusted bias for point light shadows
      scene.add(torchLight);
      torchLights.push(torchLight);
    });

    // Magical key light (more subtle now)
    const keyLight = new THREE.PointLight(0xffd700, 3, 8);
    keyLight.position.set(10, 1.5, 10);
    scene.add(keyLight);

    // Enhanced floor with dark, detailed stone texture
    const floorSize = 30;
    const floorGeo = new THREE.PlaneGeometry(floorSize, floorSize);
    const floorMat = new THREE.MeshStandardMaterial({
      color: 0x6a6a6a, // Lighter stone grey for better visibility
      roughness: 0.8,
      metalness: 0.1,
    });

    // Create dark, detailed stone floor texture
    const canvas = document.createElement("canvas");
    canvas.width = 512;
    canvas.height = 512;
    const ctx = canvas.getContext("2d")!;

    // Base stone color - lighter grey
    ctx.fillStyle = "#6a6a6a";
    ctx.fillRect(0, 0, 512, 512);

    // Add large stone tiles (8x8 grid)
    ctx.strokeStyle = "#3a3a3a";
    ctx.lineWidth = 2;
    for (let i = 0; i <= 8; i++) {
      const pos = (i * 512) / 8;
      ctx.beginPath();
      ctx.moveTo(pos, 0);
      ctx.lineTo(pos, 512);
      ctx.stroke();
      ctx.beginPath();
      ctx.moveTo(0, pos);
      ctx.lineTo(512, pos);
      ctx.stroke();
    }

    // Add subtle stone variations within tiles (more detail)
    for (let y = 0; y < 8; y++) {
      for (let x = 0; x < 8; x++) {
        const tileX = x * 64;
        const tileY = y * 64;

        // Add some darker spots/cracks
        for (let i = 0; i < 8; i++) {
          ctx.fillStyle = `rgba(0,0,0,${Math.random() * 0.1 + 0.05})`;
          ctx.beginPath();
          ctx.rect(
            tileX + Math.random() * 60,
            tileY + Math.random() * 60,
            Math.random() * 15 + 2,
            Math.random() * 15 + 2
          );
          ctx.fill();
        }

        // Add some lighter spots/weathering
        for (let i = 0; i < 5; i++) {
          ctx.fillStyle = `rgba(255,255,255,${Math.random() * 0.08 + 0.02})`;
          ctx.beginPath();
          ctx.rect(
            tileX + Math.random() * 60,
            tileY + Math.random() * 60,
            Math.random() * 12 + 4,
            Math.random() * 12 + 4
          );
          ctx.fill();
        }
      }
    }

    const floorTexture = new THREE.CanvasTexture(canvas);
    floorTexture.wrapS = floorTexture.wrapT = THREE.RepeatWrapping;
    floorTexture.repeat.set(12, 12); // More repetitions for finer detail
    floorMat.map = floorTexture;

    const floor = new THREE.Mesh(floorGeo, floorMat);
    floor.rotation.x = -Math.PI / 2;
    floor.receiveShadow = true;
    scene.add(floor);

    // Walls and chamber with enhanced stone material
    const wallHeight = 7;
    const wallThickness = 0.5;
    const roomHalf = floorSize / 2;
    const wallMat = new THREE.MeshStandardMaterial({
      color: 0x7a7a7a, // Lighter grey walls for better visibility
      roughness: 0.85,
      metalness: 0.1,
    });

    // Create stone wall texture
    const wallCanvas = document.createElement("canvas");
    wallCanvas.width = 512;
    wallCanvas.height = 512;
    const wallCtx = wallCanvas.getContext("2d")!;

    // Base stone color
    wallCtx.fillStyle = "#7a7a7a";
    wallCtx.fillRect(0, 0, 512, 512);

    // Add stone block pattern
    wallCtx.strokeStyle = "#383838";
    wallCtx.lineWidth = 1.5;
    for (let y = 0; y < 512; y += 48) {
      for (let x = 0; x < 512; x += 96) {
        const offset = (y / 48) % 2 === 0 ? 0 : 48;
        wallCtx.strokeRect(x + offset, y, 96, 48);
      }
    }

    // Add weathering (no more moss)
    for (let i = 0; i < 150; i++) {
      wallCtx.fillStyle =
        Math.random() > 0.5
          ? `rgba(0,0,0,${Math.random() * 0.1 + 0.05})`
          : `rgba(255,255,255,${Math.random() * 0.08 + 0.02})`; // Darker or lighter grey spots
      wallCtx.fillRect(
        Math.random() * 512,
        Math.random() * 512,
        Math.random() * 12 + 3,
        Math.random() * 12 + 3
      );
    }

    const wallTexture = new THREE.CanvasTexture(wallCanvas);
    wallTexture.wrapS = wallTexture.wrapT = THREE.RepeatWrapping;
    wallTexture.repeat.set(8, 2);
    wallMat.map = wallTexture;
    const colliders: AabbCollider[] = [];
    const wallMeshes: THREE.Mesh[] = [];

    function addWall(center: THREE.Vector3, size: THREE.Vector3, id: string) {
      const mesh = new THREE.Mesh(
        new THREE.BoxGeometry(size.x, size.y, size.z),
        wallMat
      );
      mesh.position.copy(center);
      mesh.castShadow = true;
      mesh.receiveShadow = true;
      scene.add(mesh);
      wallMeshes.push(mesh);
      colliders.push({ id, box: makeAabb(center, size), mesh, active: true });
    }

    // Perimeter walls (front/back/left/right), leave a doorway on the far wall (positive Z)
    addWall(
      new THREE.Vector3(0, wallHeight / 2, -roomHalf + wallThickness / 2),
      new THREE.Vector3(floorSize, wallHeight, wallThickness),
      "wall-back"
    );
    addWall(
      new THREE.Vector3(-roomHalf + wallThickness / 2, wallHeight / 2, 0),
      new THREE.Vector3(wallThickness, wallHeight, floorSize),
      "wall-left"
    );
    addWall(
      new THREE.Vector3(roomHalf - wallThickness / 2, wallHeight / 2, 0),
      new THREE.Vector3(wallThickness, wallHeight, floorSize),
      "wall-right"
    );

    // Far wall split into two segments to form a doorway at Z = roomHalf - t/2
    const doorWidth = 4;
    const sideWidth = (floorSize - doorWidth) / 2;
    const farZ = roomHalf - wallThickness / 2;
    addWall(
      new THREE.Vector3(-doorWidth / 2 - sideWidth / 2, wallHeight / 2, farZ),
      new THREE.Vector3(sideWidth, wallHeight, wallThickness),
      "wall-far-left"
    );
    addWall(
      new THREE.Vector3(doorWidth / 2 + sideWidth / 2, wallHeight / 2, farZ),
      new THREE.Vector3(sideWidth, wallHeight, wallThickness),
      "wall-far-right"
    );

    // Grand stone pillars
    const pillarRadius = 1;
    const pillarHeight = wallHeight;
    const pillarPositions = [
      new THREE.Vector3(-8, pillarHeight / 2, -8),
      new THREE.Vector3(8, pillarHeight / 2, -8),
      new THREE.Vector3(-8, pillarHeight / 2, 8),
      new THREE.Vector3(8, pillarHeight / 2, 8),
    ];

    pillarPositions.forEach((pos, i) => {
      const pillarGeo = new THREE.CylinderGeometry(
        pillarRadius,
        pillarRadius,
        pillarHeight,
        16
      );
      const pillar = new THREE.Mesh(pillarGeo, wallMat);
      pillar.position.copy(pos);
      pillar.castShadow = true;
      pillar.receiveShadow = true;
      scene.add(pillar);
      wallMeshes.push(pillar);
      colliders.push({
        id: `pillar-${i}`,
        box: makeAabb(pos, new THREE.Vector3(2, pillarHeight, 2)),
        mesh: pillar,
        active: true,
      });
    });

    // Medieval door initially closed in the doorway
    const doorSize = new THREE.Vector3(doorWidth, wallHeight, wallThickness);
    const doorCenter = new THREE.Vector3(0, wallHeight / 2, farZ);
    const doorMesh = createMedievalDoorGeometry();
    doorMesh.position.copy(doorCenter);
    doorMesh.scale.set(1.2, 2.3, 1.0); // Increase door height to fill the entire doorway
    scene.add(doorMesh);
    const doorCollider: AabbCollider = {
      id: "door",
      box: makeAabb(doorCenter, doorSize),
      mesh: doorMesh,
      active: true,
    };
    colliders.push(doorCollider);

    // Dungeon ceiling - creates intimate enclosed feeling
    const ceilingGeo = new THREE.PlaneGeometry(floorSize, floorSize);
    const ceilingMat = new THREE.MeshStandardMaterial({
      color: 0x4a4a4a, // Lighter ceiling for better contrast
      roughness: 0.9,
      metalness: 0.1,
    });

    // Add stone ceiling texture
    const ceilingCanvas = document.createElement("canvas");
    ceilingCanvas.width = 512;
    ceilingCanvas.height = 512;
    const ceilingCtx = ceilingCanvas.getContext("2d")!;

    // Stone ceiling
    ceilingCtx.fillStyle = "#4a4a4a";
    ceilingCtx.fillRect(0, 0, 512, 512);

    // Add ceiling beams/supports
    ceilingCtx.strokeStyle = "#1a1a1a";
    ceilingCtx.lineWidth = 8;
    for (let i = 0; i < 512; i += 128) {
      ceilingCtx.beginPath();
      ceilingCtx.moveTo(i, 0);
      ceilingCtx.lineTo(i, 512);
      ceilingCtx.stroke();
    }

    // Add some weathering/stains
    for (let i = 0; i < 30; i++) {
      ceilingCtx.fillStyle = "#1f1f1f";
      ceilingCtx.fillRect(
        Math.random() * 512,
        Math.random() * 512,
        Math.random() * 40 + 10,
        Math.random() * 40 + 10
      );
    }

    const ceilingTexture = new THREE.CanvasTexture(ceilingCanvas);
    ceilingTexture.wrapS = ceilingTexture.wrapT = THREE.RepeatWrapping;
    ceilingTexture.repeat.set(6, 6);
    ceilingMat.map = ceilingTexture;

    const ceiling = new THREE.Mesh(ceilingGeo, ceilingMat);
    ceiling.rotation.x = Math.PI / 2; // Face downward
    ceiling.position.y = wallHeight;
    ceiling.receiveShadow = true;
    scene.add(ceiling);

    // Large wooden ceiling beams
    const beamMaterial = new THREE.MeshStandardMaterial({
      color: 0x3d2b1f, // Dark wood color
      roughness: 0.9,
      metalness: 0.1,
    });
    const beamSize = new THREE.Vector3(0.5, 0.8, floorSize);
    for (let x = -10; x <= 10; x += 10) {
      if (x === 0) continue;
      const beam = new THREE.Mesh(
        new THREE.BoxGeometry(beamSize.x, beamSize.y, beamSize.z),
        beamMaterial
      );
      beam.position.set(x, wallHeight - beamSize.y / 2, 0);
      beam.castShadow = true;
      beam.receiveShadow = true;
      scene.add(beam);
      wallMeshes.push(beam); // Add to dispose list
    }

    // Second chamber walls beyond the door (simple short chamber)
    const chamberDepth = 12;
    const chamberWallMat = new THREE.MeshStandardMaterial({
      color: 0x2d2d2d, // Darker, more mysterious color
      roughness: 0.7,
      metalness: 0.2,
    });

    addWall(
      new THREE.Vector3(0, wallHeight / 2, farZ + chamberDepth),
      new THREE.Vector3(floorSize, wallHeight, wallThickness),
      "chamber-back"
    );
    addWall(
      new THREE.Vector3(
        -roomHalf + wallThickness / 2,
        wallHeight / 2,
        farZ + chamberDepth / 2
      ),
      new THREE.Vector3(wallThickness, wallHeight, chamberDepth),
      "chamber-left"
    );
    addWall(
      new THREE.Vector3(
        roomHalf - wallThickness / 2,
        wallHeight / 2,
        farZ + chamberDepth / 2
      ),
      new THREE.Vector3(wallThickness, wallHeight, chamberDepth),
      "chamber-right"
    );

    // Glowing magical chest in the final chamber
    const chestSize = 1.2;
    const chestGeo = new THREE.BoxGeometry(chestSize, chestSize, chestSize);
    const chestMat = new THREE.MeshStandardMaterial({
      color: 0xffd700,
      emissive: 0xffd700,
      emissiveIntensity: 0, // Initially not glowing
      metalness: 0.8,
      roughness: 0.3,
    });
    const magicalChest = new THREE.Mesh(chestGeo, chestMat);
    magicalChest.position.set(0, chestSize / 2, farZ + chamberDepth - 3);
    magicalChest.castShadow = true;
    scene.add(magicalChest);

    // Point light for the chest's glow
    const chestLight = new THREE.PointLight(0xffd700, 0, 10);
    chestLight.position.copy(magicalChest.position);
    scene.add(chestLight);

    // Key (puzzle item) in the first room - ornate floating key
    const keyMeshes: { [id: string]: THREE.Group } = {};
    riddles.forEach((riddleData) => {
      const keyMesh = createOrnateKeyGeometry();
      keyMesh.position.copy(riddleData.position);
      keyMesh.scale.setScalar(1.2); // Scale it appropriately for the scene
      keyMesh.name = riddleData.id; // Assign name for later lookup
      scene.add(keyMesh);
      keyMeshes[riddleData.id] = keyMesh;
    });

    // Player
    const playerGroup = new THREE.Group();
    scene.add(playerGroup);
    const playerRadius = 0.45;
    const playerHeight = 1.7;
    const playerY = playerRadius + 0.1; // keep above floor
    playerGroup.position.set(0, playerY, 8);

    // Character animation system
    let mixer: THREE.AnimationMixer | null = null;
    let walkAction: THREE.AnimationAction | null = null;
    let idleAction: THREE.AnimationAction | null = null;
    let isWalking = false;

    // Attempt to load a GLB character; fallback to a capsule if missing
    const bodyMat = new THREE.MeshStandardMaterial({ color: 0x82aaff });
    const loader = new GLTFLoader();
    loader.load(
      "/models/character-walking.glb",
      (gltf: GLTF) => {
        const model = gltf.scene;
        model.scale.setScalar(1);
        model.position.set(0, -playerY, 0);

        // Enable shadows on character
        model.traverse((child) => {
          if (child instanceof THREE.Mesh) {
            child.castShadow = true;
            child.receiveShadow = true;
          }
        });

        playerGroup.add(model);

        // Setup animation mixer
        if (gltf.animations && gltf.animations.length > 0) {
          mixer = new THREE.AnimationMixer(model);

          // Look for walk and idle animations
          gltf.animations.forEach((clip, index) => {
            const action = mixer!.clipAction(clip);

            // Try to identify animation types by name or use first two
            const name = clip.name.toLowerCase();
            if (name.includes("walk") || name.includes("run") || index === 0) {
              walkAction = action;
              walkAction.setLoop(THREE.LoopRepeat, Infinity);
            } else if (
              name.includes("idle") ||
              name.includes("stand") ||
              index === 1
            ) {
              idleAction = action;
              idleAction.setLoop(THREE.LoopRepeat, Infinity);
            }
          });

          // Start with idle animation
          if (idleAction) {
            idleAction.play();
          } else if (walkAction) {
            walkAction.play();
            walkAction.paused = true;
          }
        }
      },
      undefined,
      () => {
        // Fallback capsule
        const capsule = new THREE.Mesh(
          new THREE.CapsuleGeometry(
            playerRadius,
            Math.max(0.1, playerHeight - playerRadius * 2),
            4,
            8
          ),
          bodyMat
        );
        capsule.castShadow = true;
        capsule.receiveShadow = true;
        capsule.position.set(0, 0, 0);
        capsule.rotation.y = Math.PI;
        playerGroup.add(capsule);
      }
    );

    // Input and camera state
    const input: InputState = {
      forward: false,
      backward: false,
      left: false,
      right: false,
    };
    let yaw = 0;
    let pitch = 0.12; // slight downward look
    const maxPitch = THREE.MathUtils.degToRad(75);
    const moveSpeed = 4.2; // m/s
    const cameraRotateSpeed = 2.0; // radians per second
    const cameraOffset = new THREE.Vector3(0, 1.6, 4.5); // third-person offset (relative to player, rotated by yaw)
    let cameraRotatingLeft = false;
    let cameraRotatingRight = false;

    function onKeyDown(e: KeyboardEvent) {
      // Mark that user has interacted on first key press
      if (!hasUserInteracted) {
        setHasUserInteracted(true);
      }

      switch (e.code) {
        case "KeyW":
          input.forward = true;
          break;
        case "KeyS":
          input.backward = true;
          break;
        case "KeyA":
          input.left = true;
          break;
        case "KeyD":
          input.right = true;
          break;
        case "ArrowLeft":
          cameraRotatingLeft = true;
          setCameraRotateLeft(true);
          break;
        case "ArrowRight":
          cameraRotatingRight = true;
          setCameraRotateRight(true);
          break;
        case "ArrowUp":
          pitch = Math.min(pitch + 0.1, maxPitch);
          break;
        case "ArrowDown":
          pitch = Math.max(pitch - 0.1, -maxPitch);
          break;
      }
    }
    function onKeyUp(e: KeyboardEvent) {
      switch (e.code) {
        case "KeyW":
          input.forward = false;
          break;
        case "KeyS":
          input.backward = false;
          break;
        case "KeyA":
          input.left = false;
          break;
        case "KeyD":
          input.right = false;
          break;
        case "ArrowLeft":
          cameraRotatingLeft = false;
          setCameraRotateLeft(false);
          break;
        case "ArrowRight":
          cameraRotatingRight = false;
          setCameraRotateRight(false);
          break;
      }
    }

    // Add mouse click handler for user interaction
    function onMouseClick() {
      if (!hasUserInteracted) {
        setHasUserInteracted(true);
      }
    }

    window.addEventListener("keydown", onKeyDown);
    window.addEventListener("keyup", onKeyUp);
    renderer.domElement.addEventListener("click", onMouseClick);

    // Resize handling
    function onResize() {
      if (!container) return;
      const { clientWidth, clientHeight } = container;
      renderer.setSize(clientWidth, clientHeight);
      camera.aspect = clientWidth / clientHeight;
      camera.updateProjectionMatrix();
    }
    window.addEventListener("resize", onResize);

    // Animation loop
    const clock = new THREE.Clock();
    let rafId = 0;

    async function update(delta: number) {
      // Update animation mixer
      if (mixer) {
        mixer.update(delta);
      }

      // Animate torches
      const time = Date.now() * 0.001;
      torches.forEach((torch, index) => {
        animateTorch(torch, time + index * 0.5); // Offset each torch slightly

        // Flicker torch lights (bright and fiery)
        const baseIntensity = 25.0;
        const flicker =
          Math.sin(time * 10 + index) * 4.0 + Math.sin(time * 18 + index) * 2.5;
        torchLights[index].intensity = baseIntensity + flicker;
      });

      // Camera rotation with arrow keys
      if (cameraRotatingLeft) {
        yaw += cameraRotateSpeed * delta;
      }
      if (cameraRotatingRight) {
        yaw -= cameraRotateSpeed * delta;
      }

      // Movement vector in local (XZ) space
      const dir = new THREE.Vector3(0, 0, 0);
      if (input.forward) dir.z -= 1;
      if (input.backward) dir.z += 1;
      if (input.left) dir.x -= 1;
      if (input.right) dir.x += 1;
      if (dir.lengthSq() > 0) dir.normalize();

      // Handle animation state changes and footsteps sound
      const shouldWalk = dir.lengthSq() > 0.0001;
      if (shouldWalk !== isWalking) {
        console.log(`[Game] Walking state changed:`, {
          shouldWalk,
          isWalking,
          audioInitialized,
          audioEnabled,
          isPlayingFootsteps: isPlayingFootsteps.current,
        });
        isWalking = shouldWalk;

        if (isWalking) {
          // Switch to walk animation
          if (idleAction) {
            idleAction.fadeOut(0.2);
          }
          if (walkAction) {
            walkAction.reset().fadeIn(0.2).play();
          }
          // Start footsteps sound
          if (audioInitialized && audioEnabled && !isPlayingFootsteps.current) {
            console.log(`[Game] Starting footsteps sound`);
            playSound("footsteps", { volume: 0.4 }).then((id) => {
              console.log(`[Game] Footsteps started with ID:`, id);
              footstepsIdRef.current = id;
              isPlayingFootsteps.current = true;
            });
          }
        } else {
          // Switch to idle animation
          if (walkAction) {
            walkAction.fadeOut(0.2);
          }
          if (idleAction) {
            idleAction.reset().fadeIn(0.2).play();
          }
          // Stop footsteps sound
          if (isPlayingFootsteps.current) {
            console.log(
              `[Game] Stopping footsteps sound, ID:`,
              footstepsIdRef.current
            );
            stopSound("footsteps", footstepsIdRef.current);
            isPlayingFootsteps.current = false;
            footstepsIdRef.current = undefined;
          }
        }
      }

      // Rotate by yaw
      const cos = Math.cos(yaw);
      const sin = Math.sin(yaw);
      const worldMove = new THREE.Vector3(
        dir.x * cos - dir.z * sin,
        0,
        dir.x * sin + dir.z * cos
      ).multiplyScalar(moveSpeed * delta);

      // Attempted new position
      const next = playerGroup.position.clone().add(worldMove);

      // Collisions against active colliders
      const corrected = next.clone();
      for (const c of colliders) {
        if (!c.active) continue;
        const correction = resolveSphereAabb(corrected, playerRadius, c.box);
        corrected.add(correction);
      }

      // Stay above floor
      corrected.y = playerY;
      playerGroup.position.copy(corrected);

      // Rotate player to face move direction (if moving)
      if (dir.lengthSq() > 0.0001) {
        playerGroup.rotation.y = Math.atan2(worldMove.x, worldMove.z);
      }

      // Camera follow (third-person)
      const rotatedOffset = new THREE.Vector3(
        cameraOffset.x * Math.cos(yaw) - cameraOffset.z * Math.sin(yaw),
        cameraOffset.y + 0.6,
        cameraOffset.x * Math.sin(yaw) + cameraOffset.z * Math.cos(yaw)
      );
      camera.position.copy(playerGroup.position.clone().add(rotatedOffset));
      camera.lookAt(
        playerGroup.position.x,
        playerGroup.position.y + 0.9 + Math.sin(pitch) * 0.2,
        playerGroup.position.z
      );

      // Key interaction - triggers crossword puzzle
      for (const riddleData of riddles) {
        if (!gameState.collectedKeys.has(riddleData.id)) {
          const keyMesh = keyMeshes[riddleData.id];
          const distToKey = playerGroup.position.distanceTo(keyMesh.position);

          // Play magical sparkle sound when approaching key (use a flag to avoid repeated plays)
          if (distToKey < 2.5 && distToKey > 2.0) {
            // Track if we've played this sound recently
            if (!keyMesh.userData.sparklePlayedRecently) {
              console.log(`[Game] Sparkle trigger for key ${riddleData.id}:`, {
                distToKey,
                audioInitialized,
                audioEnabled,
                sparklePlayedRecently: keyMesh.userData.sparklePlayedRecently,
              });
              if (audioInitialized && audioEnabled) {
                console.log(
                  `[Game] Playing magical sparkle for key ${riddleData.id}`
                );
                playSound("magical-sparkle", { volume: 0.4 });
                keyMesh.userData.sparklePlayedRecently = true;
                setTimeout(() => {
                  keyMesh.userData.sparklePlayedRecently = false;
                }, 3000); // Reset after 3 seconds
              }
            }
          }

          if (distToKey < 1.5 && !activeRiddle) {
            console.log(`[Game] Riddle trigger for key ${riddleData.id}:`, {
              distToKey,
              audioInitialized,
              audioEnabled,
              activeRiddle: !!activeRiddle,
            });
            // Play parchment unfurl sound when opening riddle
            if (audioInitialized && audioEnabled) {
              console.log(
                `[Game] Playing parchment unfurl for key ${riddleData.id}`
              );
              playSound("parchment-unfurl", { volume: 0.7 });
            }
            setActiveRiddle(riddleData);
          }

          // Continue key animation
          keyMesh.rotation.y += delta * 1.0;
          keyMesh.rotation.z = Math.sin(Date.now() * 0.002) * 0.1;
          keyMesh.position.y = 1.2 + Math.sin(Date.now() * 0.003) * 0.15;
        }
      }

      // Door interaction
      if (
        gameState.collectedKeys.size === riddles.length &&
        !gameState.doorOpen
      ) {
        const distToDoor = playerGroup.position.distanceTo(
          new THREE.Vector3(0, playerHeight / 2, 14)
        );
        if (distToDoor < 2.5 && !showDoorPuzzle) {
          setShowDoorPuzzle(true);
        }
      }

      // Door opening animation
      if (gameState.doorOpen) {
        const targetY = wallHeight + 0.1;
        const previousY = doorMesh.position.y;
        doorMesh.position.y = THREE.MathUtils.damp(
          doorMesh.position.y,
          targetY,
          6,
          delta
        );

        // Play door creak sound when door starts moving
        if (previousY < targetY - 0.5 && !doorMesh.userData.doorSoundPlayed) {
          console.log(`[Game] Door animation trigger:`, {
            previousY,
            targetY,
            audioInitialized,
            audioEnabled,
            doorSoundPlayed: doorMesh.userData.doorSoundPlayed,
          });
          if (audioInitialized && audioEnabled) {
            console.log(`[Game] Playing door-creak sound`);
            playSound("door-creak", { volume: 0.8 });
            doorMesh.userData.doorSoundPlayed = true;
          }
        }

        // Update collider box position; deactivate once sufficiently open
        doorCollider.box = makeAabb(doorMesh.position, doorSize);
        if (doorMesh.position.y > wallHeight - 0.2) {
          doorCollider.active = false;
        }

        // Chest glow effect
        const glowIntensity = (Math.sin(time * 2) + 1) / 2; // Pulsing effect
        chestMat.emissiveIntensity = glowIntensity * 1.5;
        chestLight.intensity = glowIntensity * 20;
      }

      // Chest interaction
      if (
        gameState.doorOpen &&
        playerGroup.position.distanceTo(magicalChest.position) < 2.0 &&
        !showBirthdayMessage
      ) {
        console.log(`[Game] Chest interaction trigger:`, {
          doorOpen: gameState.doorOpen,
          distToChest: playerGroup.position.distanceTo(magicalChest.position),
          showBirthdayMessage,
          audioInitialized,
          audioEnabled,
        });
        // Play chest opening sound and switch to celebration music
        if (audioInitialized && audioEnabled) {
          console.log(`[Game] Playing chest-open and party-horn sounds`);
          playSound("chest-open", { volume: 0.8 });
          playSound("party-horn", { volume: 0.9 }); // Add party horn for extra celebration
          setTimeout(() => {
            console.log(`[Game] Switching to happy-birthday music`);
            playBackgroundMusic("happy-birthday");
          }, 1000);
        }
        setShowBirthdayMessage(true);
      }
    }

    function loop() {
      const delta = clock.getDelta();
      update(delta);
      renderer.render(scene, camera);
      rafId = requestAnimationFrame(loop);
    }
    rafId = requestAnimationFrame(loop);

    // Clean up
    return () => {
      cancelAnimationFrame(rafId);
      window.removeEventListener("resize", onResize);
      window.removeEventListener("keydown", onKeyDown);
      window.removeEventListener("keyup", onKeyUp);
      renderer.domElement.removeEventListener("click", onMouseClick);
      renderer.dispose();
      container.removeChild(renderer.domElement);
      // dispose geometries/materials
      [floor, ...wallMeshes].forEach((m) => {
        if (!m) return;
        if (m.geometry) m.geometry.dispose();
        const material = m.material as THREE.Material | THREE.Material[];
        if (material) {
          if (Array.isArray(material)) {
            material.forEach((mat) => mat.dispose());
          } else {
            material.dispose();
          }
        }
      });

      // Dispose ornate key group
      Object.values(keyMeshes).forEach((keyMesh) => {
        if (keyMesh) {
          keyMesh.traverse((child) => {
            if (child instanceof THREE.Mesh) {
              if (child.geometry) child.geometry.dispose();
              if (child.material) {
                const material = child.material as
                  | THREE.Material
                  | THREE.Material[];
                if (Array.isArray(material)) {
                  material.forEach((mat) => mat.dispose());
                } else {
                  material.dispose();
                }
              }
            }
          });
        }
      });

      // Dispose medieval door group
      if (doorMesh) {
        doorMesh.traverse((child) => {
          if (child instanceof THREE.Mesh) {
            if (child.geometry) child.geometry.dispose();
            if (child.material) {
              const material = child.material as
                | THREE.Material
                | THREE.Material[];
              if (Array.isArray(material)) {
                material.forEach((mat) => mat.dispose());
              } else {
                material.dispose();
              }
            }
          }
        });
      }

      // Dispose torches
      torches.forEach((torch) => {
        torch.traverse((child) => {
          if (child instanceof THREE.Mesh) {
            if (child.geometry) child.geometry.dispose();
            if (child.material) {
              const material = child.material as
                | THREE.Material
                | THREE.Material[];
              if (Array.isArray(material)) {
                material.forEach((mat) => mat.dispose());
              } else {
                material.dispose();
              }
            }
          }
        });
      });
    };
  }, []);

  const handlePuzzleSolved = () => {
    console.log(`[Game] handlePuzzleSolved called`, {
      activeRiddle,
      audioInitialized,
      audioEnabled,
    });

    if (!activeRiddle) return;

    const scene = sceneRef.current;
    if (!scene) return;

    // Play key collection sound and riddle success sound
    console.log(`[Game] Puzzle solved, playing success sounds`);
    if (audioInitialized && audioEnabled) {
      console.log(`[Game] Playing riddle-success sound`);
      playSound("riddle-success", { volume: 0.8 });
      setTimeout(() => {
        console.log(`[Game] Playing key-pickup sound`);
        playSound("key-pickup", { volume: 0.8 });
      }, 500);
    } else {
      console.warn(`[Game] Cannot play puzzle sounds - audio not ready`, {
        audioInitialized,
        audioEnabled,
      });
    }

    // Update game state ref
    gameStateRef.current.collectedKeys.add(activeRiddle.id);
    gameStateRef.current.collectedWords.add(activeRiddle.answer);

    // Update React state to trigger re-render and UI updates
    setCollectedKeys(new Set(gameStateRef.current.collectedKeys));
    setCollectedWords(new Set(gameStateRef.current.collectedWords));

    // Hide the key in the scene
    const keyMesh = scene.getObjectByName(activeRiddle.id);
    if (keyMesh) {
      keyMesh.visible = false;
    }

    setActiveRiddle(null);
  };

  const handleCloseCrossword = () => {
    setActiveRiddle(null);
  };

  const handleDoorPuzzleSolved = () => {
    console.log(`[Game] handleDoorPuzzleSolved called`, {
      audioInitialized,
      audioEnabled,
    });
    // Play door unlock sound
    if (audioInitialized && audioEnabled) {
      console.log(`[Game] Playing door-unlock sound`);
      playSound("door-unlock", { volume: 0.9 });
    } else {
      console.warn(`[Game] Cannot play door-unlock sound - audio not ready`);
    }

    gameStateRef.current.doorOpen = true;
    setDoorOpen(true);
    setShowDoorPuzzle(false);
  };

  return (
    <div className="relative w-full h-[100svh] select-none">
      <div ref={mountRef} className="absolute inset-0" />

      {/* Audio Controls */}
      <AudioControls />

      {/* Game UI */}
      <div className="pointer-events-none absolute left-4 top-4 z-10 space-y-2 text-white/90">
        <div className="rounded bg-black/40 px-3 py-2 text-xs sm:text-sm">
          <div className="font-semibold">Controls</div>
          <div>WASD to move • Arrow keys to look around</div>
        </div>
        <div className="rounded bg-black/40 px-3 py-2 text-xs sm:text-sm">
          <div>
            Keys: {collectedKeys.size} / {riddles.length}
          </div>
          <div className="mt-1">
            Words:{" "}
            {Array.from(collectedWords).map((word, i) => (
              <span
                key={i}
                className="mr-1.5 inline-block rounded bg-amber-500/50 px-1.5 py-0.5 text-xs font-semibold"
              >
                {word}
              </span>
            ))}
          </div>
          <div>Door: {doorOpen ? "open" : "closed"}</div>
          {!hasUserInteracted && (
            <div className="opacity-80">Press any key or click to start</div>
          )}
          {hasUserInteracted && !activeRiddle && !showDoorPuzzle && (
            <div className="opacity-80">Arrow keys to look • WASD to move</div>
          )}
        </div>
        <div className="rounded bg-amber-600/80 px-3 py-2 text-xs sm:text-sm">
          <div className="font-semibold">Quest:</div>
          {collectedKeys.size < riddles.length
            ? "Find and solve the riddles of the golden keys."
            : "Use the collected words to unlock the great door."}
        </div>
      </div>

      {/* Ancient Scroll Puzzle Modal */}
      {activeRiddle && (
        <AncientScroll
          isVisible={!!activeRiddle}
          onSolved={handlePuzzleSolved}
          onClose={handleCloseCrossword}
          riddle={activeRiddle.riddle}
          answer={activeRiddle.answer}
        />
      )}

      <DoorLockPuzzle
        isVisible={showDoorPuzzle}
        words={Array.from(collectedWords)}
        onSolved={handleDoorPuzzleSolved}
        onClose={() => setShowDoorPuzzle(false)}
      />

      <BirthdayMessage
        isVisible={showBirthdayMessage}
        onClose={() => setShowBirthdayMessage(false)}
      />
    </div>
  );
}
