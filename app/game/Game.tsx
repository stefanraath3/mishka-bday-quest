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

export default function Game() {
  const mountRef = useRef<HTMLDivElement | null>(null);
  const gameStateRef = useRef({
    keyCollected: false,
    doorOpen: false,
    puzzleSolved: false,
  });
  const [keyCollected, setKeyCollected] = useState(false);
  const [doorOpen, setDoorOpen] = useState(false);
  const [pointerLocked, setPointerLocked] = useState(false);
  const [showCrossword, setShowCrossword] = useState(false);
  const [puzzleSolved, setPuzzleSolved] = useState(false);

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
    renderer.toneMappingExposure = 1.2;
    container.appendChild(renderer.domElement);

    // Scene
    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0x000000); // Pitch black background

    // Camera
    const camera = new THREE.PerspectiveCamera(
      75,
      container.clientWidth / container.clientHeight,
      0.1,
      100
    );
    camera.position.set(0, 1.6, 4);

    // Dramatic, localized lighting system
    const ambientLight = new THREE.AmbientLight(0x404040, 0.25); // Slightly brighter ambient
    scene.add(ambientLight);

    // Dim overhead light - just enough to give shape, no shadows
    const mainLight = new THREE.DirectionalLight(0xffffff, 0.15); // Slightly brighter
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
      const torchLight = new THREE.PointLight(0xff6600, 22, 22); // Brighter, larger radius
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
      color: 0x4a4a4a, // Darker stone grey
      roughness: 0.8,
      metalness: 0.1,
    });

    // Create dark, detailed stone floor texture
    const canvas = document.createElement("canvas");
    canvas.width = 512;
    canvas.height = 512;
    const ctx = canvas.getContext("2d")!;

    // Base stone color - dark grey
    ctx.fillStyle = "#4a4a4a";
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
      color: 0x5a5a5a, // Darker grey walls
      roughness: 0.85,
      metalness: 0.1,
    });

    // Create stone wall texture
    const wallCanvas = document.createElement("canvas");
    wallCanvas.width = 512;
    wallCanvas.height = 512;
    const wallCtx = wallCanvas.getContext("2d")!;

    // Base stone color
    wallCtx.fillStyle = "#4a4a4a";
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
    doorMesh.scale.set(1.2, 1.1, 1.0); // Increase door size to be more prominent
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
      color: 0x2a2a2a,
      roughness: 0.9,
      metalness: 0.1,
    });

    // Add stone ceiling texture
    const ceilingCanvas = document.createElement("canvas");
    ceilingCanvas.width = 512;
    ceilingCanvas.height = 512;
    const ceilingCtx = ceilingCanvas.getContext("2d")!;

    // Dark stone ceiling
    ceilingCtx.fillStyle = "#2a2a2a";
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

    // Key (puzzle item) in the first room - ornate floating key
    const keyMesh = createOrnateKeyGeometry();
    keyMesh.position.set(10, 1.2, 10);
    keyMesh.scale.setScalar(1.2); // Scale it appropriately for the scene
    scene.add(keyMesh);

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
    const turnSensitivity = 0.0025;
    const cameraOffset = new THREE.Vector3(0, 1.6, 4.5); // third-person offset (relative to player, rotated by yaw)

    function onKeyDown(e: KeyboardEvent) {
      switch (e.code) {
        case "KeyW":
        case "ArrowUp":
          input.forward = true;
          break;
        case "KeyS":
        case "ArrowDown":
          input.backward = true;
          break;
        case "KeyA":
        case "ArrowLeft":
          input.left = true;
          break;
        case "KeyD":
        case "ArrowRight":
          input.right = true;
          break;
      }
    }
    function onKeyUp(e: KeyboardEvent) {
      switch (e.code) {
        case "KeyW":
        case "ArrowUp":
          input.forward = false;
          break;
        case "KeyS":
        case "ArrowDown":
          input.backward = false;
          break;
        case "KeyA":
        case "ArrowLeft":
          input.left = false;
          break;
        case "KeyD":
        case "ArrowRight":
          input.right = false;
          break;
      }
    }

    function onMouseMove(e: MouseEvent) {
      if (document.pointerLockElement !== renderer.domElement) return;
      yaw -= e.movementX * turnSensitivity;
      pitch -= e.movementY * turnSensitivity;
      pitch = THREE.MathUtils.clamp(pitch, -maxPitch, maxPitch);
      setPointerLocked(true);
    }

    function requestLock() {
      renderer.domElement.requestPointerLock();
    }
    function onPointerLockChange() {
      const locked = document.pointerLockElement === renderer.domElement;
      setPointerLocked(locked);
    }

    window.addEventListener("keydown", onKeyDown);
    window.addEventListener("keyup", onKeyUp);
    window.addEventListener("mousemove", onMouseMove);
    document.addEventListener("pointerlockchange", onPointerLockChange);
    renderer.domElement.addEventListener("click", requestLock);

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

    function update(delta: number) {
      // Update animation mixer
      if (mixer) {
        mixer.update(delta);
      }

      // Animate torches
      const time = Date.now() * 0.001;
      torches.forEach((torch, index) => {
        animateTorch(torch, time + index * 0.5); // Offset each torch slightly

        // Flicker torch lights (bright and fiery)
        const baseIntensity = 22.0;
        const flicker =
          Math.sin(time * 10 + index) * 3.5 + Math.sin(time * 18 + index) * 2;
        torchLights[index].intensity = baseIntensity + flicker;
      });

      // Movement vector in local (XZ) space
      const dir = new THREE.Vector3(0, 0, 0);
      if (input.forward) dir.z -= 1;
      if (input.backward) dir.z += 1;
      if (input.left) dir.x -= 1;
      if (input.right) dir.x += 1;
      if (dir.lengthSq() > 0) dir.normalize();

      // Handle animation state changes
      const shouldWalk = dir.lengthSq() > 0.0001;
      if (shouldWalk !== isWalking) {
        isWalking = shouldWalk;

        if (isWalking) {
          // Switch to walk animation
          if (idleAction) {
            idleAction.fadeOut(0.2);
          }
          if (walkAction) {
            walkAction.reset().fadeIn(0.2).play();
          }
        } else {
          // Switch to idle animation
          if (walkAction) {
            walkAction.fadeOut(0.2);
          }
          if (idleAction) {
            idleAction.reset().fadeIn(0.2).play();
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
      if (!gameState.puzzleSolved) {
        const distToKey = playerGroup.position.distanceTo(keyMesh.position);
        if (distToKey < 1.0 && !showCrossword) {
          // Show crossword puzzle instead of immediately collecting key
          setShowCrossword(true);
          // Pause pointer lock when puzzle opens
          if (document.pointerLockElement) {
            document.exitPointerLock();
          }
        }

        // Continue key animation until puzzle is solved
        keyMesh.rotation.y += delta * 1.0;
        keyMesh.rotation.z = Math.sin(Date.now() * 0.002) * 0.1;
        keyMesh.position.y = 1.2 + Math.sin(Date.now() * 0.003) * 0.15;
      } else if (!gameState.keyCollected) {
        // Puzzle solved - collect the key
        gameState.keyCollected = true;
        keyMesh.visible = false;
        setKeyCollected(true);
      }

      // Open door if key collected
      if (gameState.keyCollected && !gameState.doorOpen) {
        const targetY = wallHeight + 0.1;
        doorMesh.position.y = THREE.MathUtils.damp(
          doorMesh.position.y,
          targetY,
          6,
          delta
        );
        // Update collider box position; deactivate once sufficiently open
        doorCollider.box = makeAabb(doorMesh.position, doorSize);
        if (doorMesh.position.y > wallHeight - 0.2) {
          doorCollider.active = false;
          gameState.doorOpen = true;
          setDoorOpen(true); // Update React state for UI
        }
      } else if (!gameState.keyCollected) {
        // Keep collider synced if door closed
        doorCollider.box = makeAabb(doorMesh.position, doorSize);
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
      window.removeEventListener("mousemove", onMouseMove);
      document.removeEventListener("pointerlockchange", onPointerLockChange);
      renderer.domElement.removeEventListener("click", requestLock);
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
    setPuzzleSolved(true);
    setShowCrossword(false);
    // Update game state ref
    gameStateRef.current.puzzleSolved = true;
  };

  const handleCloseCrossword = () => {
    setShowCrossword(false);
  };

  return (
    <div className="relative w-full h-[100svh] select-none">
      <div ref={mountRef} className="absolute inset-0" />

      {/* Game UI */}
      <div className="pointer-events-none absolute left-4 top-4 z-10 space-y-2 text-white/90">
        <div className="rounded bg-black/40 px-3 py-2 text-xs sm:text-sm">
          <div className="font-semibold">Controls</div>
          <div>Click to lock mouse • WASD to move</div>
        </div>
        <div className="rounded bg-black/40 px-3 py-2 text-xs sm:text-sm">
          <div>Puzzle: {puzzleSolved ? "solved ✓" : "unsolved"}</div>
          <div>Key: {keyCollected ? "collected ✓" : "find the key"}</div>
          <div>Door: {doorOpen ? "open" : "closed"}</div>
          {!pointerLocked && !showCrossword && (
            <div className="opacity-80">Click the scene to start</div>
          )}
        </div>
        {!puzzleSolved && (
          <div className="rounded bg-amber-600/80 px-3 py-2 text-xs sm:text-sm">
            <div className="font-semibold">Quest:</div>
            <div>Find and solve the riddle of the golden key</div>
          </div>
        )}
      </div>

      {/* Ancient Scroll Puzzle Modal */}
      <AncientScroll
        isVisible={showCrossword}
        onSolved={handlePuzzleSolved}
        onClose={handleCloseCrossword}
      />
    </div>
  );
}
