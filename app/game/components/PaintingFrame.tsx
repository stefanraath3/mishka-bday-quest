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
  scale = 1
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

  // Use CSG to create frame with cutout (simplified approach)
  frameGroup.add(outerFrame);

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
  const canvasMaterial = new THREE.MeshStandardMaterial({
    color: 0xf5f5dc, // Canvas color
    roughness: 0.9,
    metalness: 0.0,
  });

  // Load photo texture asynchronously
  const textureLoader = new THREE.TextureLoader();
  textureLoader.load(
    photo.imagePath,
    (texture) => {
      // Successfully loaded photo
      texture.wrapS = THREE.ClampToEdgeWrapping;
      texture.wrapT = THREE.ClampToEdgeWrapping;
      texture.minFilter = THREE.LinearFilter;
      texture.magFilter = THREE.LinearFilter;

      const photoMaterial = new THREE.MeshStandardMaterial({
        map: texture,
        roughness: 0.7,
        metalness: 0.0,
      });

      canvas.material = photoMaterial;
      console.log(
        `[PaintingFrame] Successfully loaded photo: ${photo.imagePath}`
      );
    },
    undefined,
    (error) => {
      console.error(
        `[PaintingFrame] Failed to load photo: ${photo.imagePath}`,
        error
      );
      // Keep canvas material as fallback
    }
  );

  const canvas = new THREE.Mesh(canvasGeo, canvasMaterial);
  canvas.position.z = frameDepth / 2 - 0.01; // Slightly inset from frame
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
  glass.position.z = frameDepth / 2 + 0.005; // In front of photo
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
