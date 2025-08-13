"use client";

import * as THREE from "three";

export function createWallTorchGeometry(): THREE.Group {
  const torchGroup = new THREE.Group();

  // Materials
  const ironMaterial = new THREE.MeshStandardMaterial({
    color: 0x2f2f2f,
    roughness: 0.8,
    metalness: 0.9,
  });

  const woodMaterial = new THREE.MeshStandardMaterial({
    color: 0x4a3728,
    roughness: 0.9,
    metalness: 0.1,
  });

  const flameMaterial = new THREE.MeshStandardMaterial({
    color: 0xff3300,
    emissive: 0xff4400,
    emissiveIntensity: 1.5,
    transparent: true,
    opacity: 0.95,
  });

  // Wall mount bracket
  const bracketGeometry = new THREE.CylinderGeometry(0.05, 0.08, 0.3, 8);
  const bracket = new THREE.Mesh(bracketGeometry, ironMaterial);
  bracket.rotation.z = Math.PI / 2;
  bracket.position.set(0.15, 0, 0);
  torchGroup.add(bracket);

  // Torch handle (wooden shaft)
  const handleGeometry = new THREE.CylinderGeometry(0.03, 0.04, 0.6, 8);
  const handle = new THREE.Mesh(handleGeometry, woodMaterial);
  handle.rotation.z = -Math.PI / 6; // Slight angle
  handle.position.set(0.25, 0.1, 0);
  torchGroup.add(handle);

  // Metal torch head
  const headGeometry = new THREE.CylinderGeometry(0.08, 0.06, 0.15, 8);
  const head = new THREE.Mesh(headGeometry, ironMaterial);
  head.position.set(0.4, 0.25, 0);
  torchGroup.add(head);

  // Flame (animated) - larger for more impact
  const flameGeometry = new THREE.ConeGeometry(0.09, 0.3, 6);
  const flame = new THREE.Mesh(flameGeometry, flameMaterial);
  flame.position.set(0.4, 0.45, 0);
  torchGroup.add(flame);

  // Inner flame glow - brighter and more intense
  const glowGeometry = new THREE.ConeGeometry(0.07, 0.25, 6);
  const glowMaterial = new THREE.MeshStandardMaterial({
    color: 0xffdd00,
    emissive: 0xff8800,
    emissiveIntensity: 2.0,
    transparent: true,
    opacity: 0.85,
  });
  const glow = new THREE.Mesh(glowGeometry, glowMaterial);
  glow.position.set(0.4, 0.42, 0);
  torchGroup.add(glow);

  // Store flame references for animation
  (
    torchGroup as THREE.Group & { flame?: THREE.Mesh; glow?: THREE.Mesh }
  ).flame = flame;
  (torchGroup as THREE.Group & { flame?: THREE.Mesh; glow?: THREE.Mesh }).glow =
    glow;

  return torchGroup;
}

export function animateTorch(torchGroup: THREE.Group, time: number) {
  const flame = (
    torchGroup as THREE.Group & { flame?: THREE.Mesh; glow?: THREE.Mesh }
  ).flame;
  const glow = (
    torchGroup as THREE.Group & { flame?: THREE.Mesh; glow?: THREE.Mesh }
  ).glow;

  if (flame && glow) {
    // Flickering animation
    const flicker = Math.sin(time * 8) * 0.1 + Math.sin(time * 12) * 0.05;
    flame.scale.y = 1 + flicker;
    glow.scale.y = 1 + flicker * 0.8;

    // Subtle swaying
    const sway = Math.sin(time * 3) * 0.05;
    flame.rotation.z = sway;
    glow.rotation.z = sway * 0.8;
  }
}

// Hook for easy integration
export function useWallTorch(
  scene: THREE.Scene,
  position: THREE.Vector3,
  rotation?: THREE.Euler,
  scale = 1
) {
  const torchGroup = createWallTorchGeometry();
  torchGroup.position.copy(position);
  if (rotation) torchGroup.rotation.copy(rotation);
  torchGroup.scale.setScalar(scale);

  scene.add(torchGroup);

  const cleanup = () => {
    scene.remove(torchGroup);
    torchGroup.traverse((child) => {
      if (child instanceof THREE.Mesh) {
        if (child.geometry) child.geometry.dispose();
        if (child.material) {
          const material = child.material as THREE.Material | THREE.Material[];
          if (Array.isArray(material)) {
            material.forEach((mat) => mat.dispose());
          } else {
            material.dispose();
          }
        }
      }
    });
  };

  return { torchGroup, cleanup };
}
