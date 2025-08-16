"use client";

import * as THREE from "three";

export interface MemoryPhoto {
  id: string;
  imagePath: string;
  title: string;
  description: string;
  date?: string;
  location?: string;
  people?: string[];
}

export interface PaintingFrameProps {
  photo: MemoryPhoto;
  position: THREE.Vector3;
  rotation: THREE.Euler;
  scale?: number;
}

export function createPaintingFrameGeometry(
  photo: MemoryPhoto,
  scale = 1,
  wallRotation = 0 // Add rotation parameter to help with positioning
): THREE.Group {
  const frameGroup = new THREE.Group();
  frameGroup.name = photo.id;

  // Frame dimensions
  const frameWidth = 2.4 * scale;
  const frameHeight = 1.8 * scale;
  const frameDepth = 0.15 * scale;
  const frameThickness = 0.12 * scale;

  // Ornate frame material - rich golden wood
  const frameMaterial = new THREE.MeshStandardMaterial({
    color: 0x8b7355, // Rich brown wood
    roughness: 0.4,
    metalness: 0.1,
    emissive: 0x332211,
    emissiveIntensity: 0.1,
  });

  // Create frame border (outer rectangle)
  const outerFrameGeo = new THREE.BoxGeometry(
    frameWidth,
    frameHeight,
    frameDepth
  );
  const outerFrame = new THREE.Mesh(outerFrameGeo, frameMaterial);

  // Create inner cutout (for the photo)
  const photoWidth = frameWidth - frameThickness * 2;
  const photoHeight = frameHeight - frameThickness * 2;
  const innerFrameGeo = new THREE.BoxGeometry(
    photoWidth,
    photoHeight,
    frameDepth + 0.02
  );
  const innerFrame = new THREE.Mesh(innerFrameGeo, frameMaterial);

  // Create frame border by making the outer frame hollow
  // Instead of CSG, we'll create frame segments around the edges

  const frameSegments = [
    // Top border
    new THREE.Mesh(
      new THREE.BoxGeometry(frameWidth, frameThickness, frameDepth),
      frameMaterial
    ),
    // Bottom border
    new THREE.Mesh(
      new THREE.BoxGeometry(frameWidth, frameThickness, frameDepth),
      frameMaterial
    ),
    // Left border
    new THREE.Mesh(
      new THREE.BoxGeometry(frameThickness, photoHeight, frameDepth),
      frameMaterial
    ),
    // Right border
    new THREE.Mesh(
      new THREE.BoxGeometry(frameThickness, photoHeight, frameDepth),
      frameMaterial
    ),
  ];

  // Position frame segments
  frameSegments[0].position.y = frameHeight / 2 - frameThickness / 2; // Top
  frameSegments[1].position.y = -frameHeight / 2 + frameThickness / 2; // Bottom
  frameSegments[2].position.x = -frameWidth / 2 + frameThickness / 2; // Left
  frameSegments[3].position.x = frameWidth / 2 - frameThickness / 2; // Right

  frameSegments.forEach((segment) => frameGroup.add(segment));

  // Add decorative frame elements
  const decorMaterial = new THREE.MeshStandardMaterial({
    color: 0xffd700, // Gold accents
    roughness: 0.2,
    metalness: 0.8,
    emissive: 0x332200,
    emissiveIntensity: 0.15,
  });

  // Corner decorations
  const cornerDecorGeo = new THREE.SphereGeometry(0.08 * scale, 8, 6);
  const corners = [
    [-frameWidth / 2 + 0.15, frameHeight / 2 - 0.15, frameDepth / 2],
    [frameWidth / 2 - 0.15, frameHeight / 2 - 0.15, frameDepth / 2],
    [-frameWidth / 2 + 0.15, -frameHeight / 2 + 0.15, frameDepth / 2],
    [frameWidth / 2 - 0.15, -frameHeight / 2 + 0.15, frameDepth / 2],
  ];

  corners.forEach((pos) => {
    const cornerDecor = new THREE.Mesh(cornerDecorGeo, decorMaterial);
    cornerDecor.position.set(pos[0], pos[1], pos[2]);
    frameGroup.add(cornerDecor);
  });

  // Photo canvas/backing
  const canvasGeo = new THREE.PlaneGeometry(
    photoWidth * 0.95,
    photoHeight * 0.95
  );
  // Fallback material for when photo is loading or fails to load
  const canvasMaterial = new THREE.MeshStandardMaterial({
    color: 0xf5f5dc, // Canvas color - will be replaced by photo texture
    roughness: 0.9,
    metalness: 0.0,
  });

  // Load photo texture asynchronously with enhanced error handling
  const textureLoader = new THREE.TextureLoader();

  // Add loading manager for better debugging
  const loadingManager = new THREE.LoadingManager();
  textureLoader.manager = loadingManager;

  loadingManager.onLoad = () => {
    console.log(
      `[PaintingFrame] Photo texture loaded successfully: ${photo.imagePath}`
    );
  };

  loadingManager.onError = (url) => {
    console.error(`[PaintingFrame] Failed to load texture: ${url}`);
  };

  console.log(`[PaintingFrame] Attempting to load photo: ${photo.imagePath}`);

  textureLoader.load(
    photo.imagePath,
    (texture) => {
      // Successfully loaded photo
      console.log(
        `[PaintingFrame] Texture loaded, dimensions: ${texture.image.width}x${texture.image.height}`
      );

      texture.wrapS = THREE.ClampToEdgeWrapping;
      texture.wrapT = THREE.ClampToEdgeWrapping;
      texture.minFilter = THREE.LinearFilter;
      texture.magFilter = THREE.LinearFilter;
      texture.flipY = false; // Prevent image flipping
      texture.colorSpace = THREE.SRGBColorSpace; // Ensure correct color space

      const photoMaterial = new THREE.MeshStandardMaterial({
        map: texture,
        roughness: 0.7,
        metalness: 0.0,
        transparent: false,
        opacity: 1.0,
      });

      canvas.material.dispose(); // Clean up old material
      canvas.material = photoMaterial;
      console.log(
        `[PaintingFrame] Photo material applied successfully: ${photo.imagePath}`
      );
    },
    (progress) => {
      console.log(
        `[PaintingFrame] Loading progress for ${photo.imagePath}: ${
          (progress.loaded / progress.total) * 100
        }%`
      );
    },
    (error) => {
      console.error(
        `[PaintingFrame] Failed to load photo: ${photo.imagePath}`,
        error
      );
      console.log(
        `[PaintingFrame] Keeping fallback canvas material for: ${photo.id}`
      );

      // Create a debug texture with the photo title as fallback
      const canvas2D = document.createElement("canvas");
      canvas2D.width = 512;
      canvas2D.height = 384;
      const ctx = canvas2D.getContext("2d")!;

      // Create a simple colored background with text
      ctx.fillStyle = "#8b7355";
      ctx.fillRect(0, 0, 512, 384);
      ctx.fillStyle = "#ffffff";
      ctx.font = "24px Arial";
      ctx.textAlign = "center";
      ctx.fillText(photo.title, 256, 192);
      ctx.font = "16px Arial";
      ctx.fillText("Image not found", 256, 220);

      const debugTexture = new THREE.CanvasTexture(canvas2D);
      const debugMaterial = new THREE.MeshStandardMaterial({
        map: debugTexture,
        roughness: 0.7,
        metalness: 0.0,
      });

      canvas.material.dispose();
      canvas.material = debugMaterial;
    }
  );

  const canvas = new THREE.Mesh(canvasGeo, canvasMaterial);

  // Place the photo plane flush with the frame's front face in LOCAL space
  // The group rotation will orient it correctly for any wall.
  const canvasZ = frameDepth / 2 + 0.02;
  canvas.position.z = canvasZ;

  console.log(
    `[PaintingFrame] ${photo.id} - Wall rotation: ${wallRotation}, canvas Z: ${canvasZ}`
  );

  // Make sure canvas faces forward and is right-side up
  // Different rotations needed based on which wall the painting is on
  if (Math.abs(wallRotation - Math.PI) < 0.1) {
    // Back wall (rotation ≈ π): flip both Y and Z to face inward and be right-side up
    canvas.rotation.set(0, Math.PI, Math.PI);
  } else if (Math.abs(wallRotation - Math.PI / 2) < 0.1) {
    // Left wall (rotation ≈ π/2): just flip upside down
    canvas.rotation.set(0, 0, Math.PI);
  } else if (Math.abs(wallRotation + Math.PI / 2) < 0.1) {
    // Right wall (rotation ≈ -π/2): just flip upside down
    canvas.rotation.set(0, 0, Math.PI);
  } else {
    // Front-facing or center painting (rotation ≈ 0): just flip upside down
    canvas.rotation.set(0, 0, Math.PI);
  }

  // Log key positioning info
  console.log(`[PaintingFrame] ${photo.id} canvas positioned at z: ${canvasZ}`);

  frameGroup.add(canvas);

  // Add glass effect (optional)
  const glassGeo = new THREE.PlaneGeometry(
    photoWidth * 0.98,
    photoHeight * 0.98
  );
  const glassMaterial = new THREE.MeshStandardMaterial({
    transparent: true,
    opacity: 0.1,
    roughness: 0.0,
    metalness: 0.0,
    envMapIntensity: 0.8,
  });
  const glass = new THREE.Mesh(glassGeo, glassMaterial);
  // Ensure glass sits slightly in front of the photo plane
  glass.position.z = canvasZ + 0.003;
  frameGroup.add(glass);

  // Add subtle glow effect for interactivity
  const glowGeometry = new THREE.PlaneGeometry(
    frameWidth * 1.1,
    frameHeight * 1.1
  );
  const glowMaterial = new THREE.MeshStandardMaterial({
    color: 0xffd700,
    transparent: true,
    opacity: 0.0, // Initially invisible
    emissive: 0xffd700,
    emissiveIntensity: 0.0,
    side: THREE.DoubleSide,
  });
  const glowPlane = new THREE.Mesh(glowGeometry, glowMaterial);
  glowPlane.position.z = -frameDepth / 2 - 0.01; // Behind frame
  glowPlane.name = "glow";
  frameGroup.add(glowPlane);

  // Enable shadows
  frameGroup.traverse((child) => {
    if (child instanceof THREE.Mesh) {
      child.castShadow = true;
      child.receiveShadow = true;
    }
  });

  // Store photo data in userData
  frameGroup.userData = {
    photo,
    isInteractable: true,
    glowMaterial, // Store reference for animation
  };

  return frameGroup;
}

// Function to animate painting frame (glow effect when near)
export function animatePaintingFrame(
  frameGroup: THREE.Group,
  isNear: boolean,
  time: number,
  intensity = 1.0
) {
  const glowMaterial = frameGroup.userData
    .glowMaterial as THREE.MeshStandardMaterial;

  if (glowMaterial) {
    if (isNear) {
      // Pulsing glow when player is nearby
      const pulse = (Math.sin(time * 3) + 1) / 2; // 0 to 1
      glowMaterial.opacity = 0.15 + pulse * 0.1 * intensity;
      glowMaterial.emissiveIntensity = 0.2 + pulse * 0.15 * intensity;
    } else {
      // Fade out when not near
      glowMaterial.opacity = THREE.MathUtils.lerp(
        glowMaterial.opacity,
        0.0,
        0.02
      );
      glowMaterial.emissiveIntensity = THREE.MathUtils.lerp(
        glowMaterial.emissiveIntensity,
        0.0,
        0.02
      );
    }
  }

  // Add subtle frame rotation/breathing effect when near
  if (isNear) {
    const breathe = Math.sin(time * 1.5) * 0.002;
    frameGroup.rotation.z = breathe;
    frameGroup.scale.setScalar(1 + Math.sin(time * 2) * 0.005);
  } else {
    // Return to normal
    frameGroup.rotation.z = THREE.MathUtils.lerp(
      frameGroup.rotation.z,
      0,
      0.02
    );
    const currentScale = frameGroup.scale.x;
    const targetScale = 1.0;
    const newScale = THREE.MathUtils.lerp(currentScale, targetScale, 0.02);
    frameGroup.scale.setScalar(newScale);
  }
}

// React component wrapper (if needed for other uses)
export default function PaintingFrame({
  photo,
  position,
  rotation,
  scale = 1,
}: PaintingFrameProps) {
  // This component is mainly for the geometry function above
  // The actual rendering happens in Game.tsx using the createPaintingFrameGeometry function
  return null;
}
