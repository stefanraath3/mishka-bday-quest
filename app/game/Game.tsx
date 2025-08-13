"use client";

import { useEffect, useRef, useState } from "react";
import * as THREE from "three";
import {
  GLTFLoader,
  type GLTF,
} from "three/examples/jsm/loaders/GLTFLoader.js";

type InputState = {
  forward: boolean;
  backward: boolean;
  left: boolean;
  right: boolean;
};

type AabbCollider = {
  id: string;
  box: THREE.Box3;
  mesh?: THREE.Mesh;
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
  const [keyCollected, setKeyCollected] = useState(false);
  const [doorOpen, setDoorOpen] = useState(false);
  const [pointerLocked, setPointerLocked] = useState(false);

  useEffect(() => {
    // Game state refs (for use inside animation loop)
    const gameState = {
      keyCollected: false,
      doorOpen: false,
    };
    const container = mountRef.current;
    if (!container) return;

    // Renderer
    const renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.setSize(container.clientWidth, container.clientHeight);
    renderer.outputColorSpace = THREE.SRGBColorSpace;
    container.appendChild(renderer.domElement);

    // Scene
    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0x101114);

    // Camera
    const camera = new THREE.PerspectiveCamera(
      75,
      container.clientWidth / container.clientHeight,
      0.1,
      100
    );
    camera.position.set(0, 1.6, 4);

    // Lights
    const hemi = new THREE.HemisphereLight(0xffffff, 0x444444, 0.6);
    hemi.position.set(0, 20, 0);
    scene.add(hemi);
    const dir = new THREE.DirectionalLight(0xffffff, 0.8);
    dir.position.set(5, 10, 5);
    dir.castShadow = false;
    scene.add(dir);

    // Floor
    const floorSize = 24;
    const floorGeo = new THREE.PlaneGeometry(floorSize, floorSize);
    const floorMat = new THREE.MeshStandardMaterial({ color: 0x2a2d34 });
    const floor = new THREE.Mesh(floorGeo, floorMat);
    floor.rotation.x = -Math.PI / 2;
    floor.receiveShadow = false;
    scene.add(floor);

    // Walls and chamber
    const wallHeight = 3;
    const wallThickness = 0.5;
    const roomHalf = floorSize / 2;
    const wallMat = new THREE.MeshStandardMaterial({ color: 0x3a3f47 });
    const colliders: AabbCollider[] = [];
    const wallMeshes: THREE.Mesh[] = [];

    function addWall(center: THREE.Vector3, size: THREE.Vector3, id: string) {
      const mesh = new THREE.Mesh(
        new THREE.BoxGeometry(size.x, size.y, size.z),
        wallMat
      );
      mesh.position.copy(center);
      mesh.castShadow = false;
      mesh.receiveShadow = false;
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
    const doorWidth = 3;
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

    // Door block initially closed in the doorway
    const doorSize = new THREE.Vector3(doorWidth, wallHeight, wallThickness);
    const doorCenter = new THREE.Vector3(0, wallHeight / 2, farZ);
    const doorMat = new THREE.MeshStandardMaterial({
      color: 0x6b8ba4,
      metalness: 0.1,
      roughness: 0.6,
    });
    const doorMesh = new THREE.Mesh(
      new THREE.BoxGeometry(doorSize.x, doorSize.y, doorSize.z),
      doorMat
    );
    doorMesh.position.copy(doorCenter);
    scene.add(doorMesh);
    const doorCollider: AabbCollider = {
      id: "door",
      box: makeAabb(doorCenter, doorSize),
      mesh: doorMesh,
      active: true,
    };
    colliders.push(doorCollider);

    // Second chamber walls beyond the door (simple short chamber)
    const chamberDepth = 8;
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

    // Key (puzzle item) in the first room
    const keyGeo = new THREE.IcosahedronGeometry(0.3, 1);
    const keyMat = new THREE.MeshStandardMaterial({
      color: 0xffd54a,
      emissive: 0x332200,
      emissiveIntensity: 0.4,
    });
    const keyMesh = new THREE.Mesh(keyGeo, keyMat);
    keyMesh.position.set(4, 0.6, 0);
    scene.add(keyMesh);

    // Player
    const playerGroup = new THREE.Group();
    scene.add(playerGroup);
    const playerRadius = 0.45;
    const playerHeight = 1.7;
    const playerY = playerRadius + 0.1; // keep above floor
    playerGroup.position.set(0, playerY, -4);

    // Attempt to load a GLB character; fallback to a capsule if missing
    const bodyMat = new THREE.MeshStandardMaterial({ color: 0x82aaff });
    const loader = new GLTFLoader();
    loader.load(
      "/models/character-walking.glb",
      (gltf: GLTF) => {
        const model = gltf.scene;
        model.scale.setScalar(1);
        model.position.set(0, -playerY, 0);
        playerGroup.add(model);
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
        capsule.castShadow = false;
        capsule.receiveShadow = false;
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
    const cameraOffset = new THREE.Vector3(0, 1.2, 3.5); // third-person offset (relative to player, rotated by yaw)

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
      // Movement vector in local (XZ) space
      const dir = new THREE.Vector3(0, 0, 0);
      if (input.forward) dir.z -= 1;
      if (input.backward) dir.z += 1;
      if (input.left) dir.x -= 1;
      if (input.right) dir.x += 1;
      if (dir.lengthSq() > 0) dir.normalize();

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

      // Key pickup
      if (!gameState.keyCollected) {
        const distToKey = playerGroup.position.distanceTo(keyMesh.position);
        if (distToKey < 1.0) {
          gameState.keyCollected = true;
          keyMesh.visible = false;
          setKeyCollected(true); // Update React state for UI
        } else {
          // idle spin
          keyMesh.rotation.y += delta * 1.0;
        }
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
      [floor, ...wallMeshes, doorMesh, keyMesh].forEach((m) => {
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
    };
  }, []);

  return (
    <div className="relative w-full h-[100svh] select-none">
      <div ref={mountRef} className="absolute inset-0" />
      <div className="pointer-events-none absolute left-4 top-4 z-10 space-y-2 text-white/90">
        <div className="rounded bg-black/40 px-3 py-2 text-xs sm:text-sm">
          <div className="font-semibold">Controls</div>
          <div>Click to lock mouse • WASD to move</div>
        </div>
        <div className="rounded bg-black/40 px-3 py-2 text-xs sm:text-sm">
          <div>Key: {keyCollected ? "collected ✓" : "not collected"}</div>
          <div>Door: {doorOpen ? "open" : "closed"}</div>
          {!pointerLocked && (
            <div className="opacity-80">Click the scene to start</div>
          )}
        </div>
      </div>
    </div>
  );
}
