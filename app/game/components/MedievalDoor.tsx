"use client";

import * as THREE from "three";

export function createMedievalDoorGeometry(): THREE.Group {
  const doorGroup = new THREE.Group();

  // Materials
  const woodMaterial = new THREE.MeshStandardMaterial({
    color: 0x8b4513, // Saddle brown
    roughness: 0.8,
    metalness: 0.1,
    normalScale: new THREE.Vector2(0.5, 0.5),
  });

  const darkWoodMaterial = new THREE.MeshStandardMaterial({
    color: 0x654321, // Dark brown
    roughness: 0.9,
    metalness: 0.05,
  });

  const ironMaterial = new THREE.MeshStandardMaterial({
    color: 0x2f2f2f, // Dark gray/iron
    roughness: 0.4,
    metalness: 0.9,
  });

  const rustIronMaterial = new THREE.MeshStandardMaterial({
    color: 0x8b4513, // Rusty brown
    roughness: 0.6,
    metalness: 0.7,
  });

  // Main door planks (vertical wooden boards)
  const plankWidth = 0.4;
  const plankHeight = 3.0;
  const plankDepth = 0.08;
  const numPlanks = 7;
  const totalWidth = numPlanks * plankWidth;

  for (let i = 0; i < numPlanks; i++) {
    const plankGeometry = new THREE.BoxGeometry(
      plankWidth,
      plankHeight,
      plankDepth
    );
    const plank = new THREE.Mesh(
      plankGeometry,
      i % 2 === 0 ? woodMaterial : darkWoodMaterial
    );
    plank.position.x = (i - numPlanks / 2) * plankWidth + plankWidth / 2;
    plank.position.y = 0;
    plank.position.z = 0;
    doorGroup.add(plank);
  }

  // Horizontal reinforcement beams
  const beamPositions = [-1.0, 0, 1.0]; // Top, middle, bottom
  beamPositions.forEach((yPos) => {
    const beamGeometry = new THREE.BoxGeometry(totalWidth + 0.2, 0.15, 0.12);
    const beam = new THREE.Mesh(beamGeometry, darkWoodMaterial);
    beam.position.set(0, yPos, 0.06);
    doorGroup.add(beam);
  });

  // Iron reinforcement bands
  const bandPositions = [-1.2, -0.4, 0.4, 1.2];
  bandPositions.forEach((yPos) => {
    const bandGeometry = new THREE.BoxGeometry(totalWidth + 0.1, 0.08, 0.02);
    const band = new THREE.Mesh(bandGeometry, ironMaterial);
    band.position.set(0, yPos, 0.13);
    doorGroup.add(band);
  });

  // Iron studs/rivets on the bands
  bandPositions.forEach((yPos) => {
    for (let x = -1.2; x <= 1.2; x += 0.4) {
      const studGeometry = new THREE.CylinderGeometry(0.03, 0.03, 0.04, 8);
      const stud = new THREE.Mesh(studGeometry, rustIronMaterial);
      stud.position.set(x, yPos, 0.15);
      stud.rotation.x = Math.PI / 2;
      doorGroup.add(stud);
    }
  });

  // Door handle/ring
  const handleRingGeometry = new THREE.TorusGeometry(0.12, 0.02, 8, 16);
  const handleRing = new THREE.Mesh(handleRingGeometry, ironMaterial);
  handleRing.position.set(0.8, 0.2, 0.15);
  doorGroup.add(handleRing);

  // Handle mounting plate
  const handlePlateGeometry = new THREE.CylinderGeometry(0.08, 0.08, 0.02, 8);
  const handlePlate = new THREE.Mesh(handlePlateGeometry, rustIronMaterial);
  handlePlate.position.set(0.8, 0.2, 0.14);
  handlePlate.rotation.x = Math.PI / 2;
  doorGroup.add(handlePlate);

  // Corner reinforcements (L-shaped iron brackets)
  const cornerPositions = [
    { x: -totalWidth / 2 + 0.1, y: plankHeight / 2 - 0.1 },
    { x: totalWidth / 2 - 0.1, y: plankHeight / 2 - 0.1 },
    { x: -totalWidth / 2 + 0.1, y: -plankHeight / 2 + 0.1 },
    { x: totalWidth / 2 - 0.1, y: -plankHeight / 2 + 0.1 },
  ];

  cornerPositions.forEach((pos) => {
    // Vertical part of L-bracket
    const vBracketGeometry = new THREE.BoxGeometry(0.06, 0.3, 0.02);
    const vBracket = new THREE.Mesh(vBracketGeometry, ironMaterial);
    vBracket.position.set(pos.x, pos.y, 0.13);
    doorGroup.add(vBracket);

    // Horizontal part of L-bracket
    const hBracketGeometry = new THREE.BoxGeometry(0.3, 0.06, 0.02);
    const hBracket = new THREE.Mesh(hBracketGeometry, ironMaterial);
    hBracket.position.set(pos.x, pos.y, 0.13);
    doorGroup.add(hBracket);
  });

  // Central decorative iron cross
  const crossVerticalGeometry = new THREE.BoxGeometry(0.08, 0.8, 0.02);
  const crossVertical = new THREE.Mesh(crossVerticalGeometry, rustIronMaterial);
  crossVertical.position.set(0, 0, 0.13);
  doorGroup.add(crossVertical);

  const crossHorizontalGeometry = new THREE.BoxGeometry(0.6, 0.08, 0.02);
  const crossHorizontal = new THREE.Mesh(
    crossHorizontalGeometry,
    rustIronMaterial
  );
  crossHorizontal.position.set(0, 0, 0.13);
  doorGroup.add(crossHorizontal);

  // Lock mechanism (keyhole plate)
  const lockPlateGeometry = new THREE.BoxGeometry(0.2, 0.3, 0.03);
  const lockPlate = new THREE.Mesh(lockPlateGeometry, ironMaterial);
  lockPlate.position.set(0.6, -0.1, 0.14);
  doorGroup.add(lockPlate);

  // Keyhole
  const keyholeGeometry = new THREE.CylinderGeometry(0.02, 0.02, 0.04, 8);
  const keyhole = new THREE.Mesh(
    keyholeGeometry,
    new THREE.MeshStandardMaterial({ color: 0x000000 })
  );
  keyhole.position.set(0.6, -0.05, 0.16);
  keyhole.rotation.x = Math.PI / 2;
  doorGroup.add(keyhole);

  // Keyhole slot (vertical slot below the round hole)
  const slotGeometry = new THREE.BoxGeometry(0.01, 0.08, 0.04);
  const slot = new THREE.Mesh(
    slotGeometry,
    new THREE.MeshStandardMaterial({ color: 0x000000 })
  );
  slot.position.set(0.6, -0.09, 0.16);
  doorGroup.add(slot);

  // Add some wear and aging details (small scratches/dents)
  for (let i = 0; i < 8; i++) {
    const scratchGeometry = new THREE.BoxGeometry(
      0.02,
      Math.random() * 0.1 + 0.05,
      0.005
    );
    const scratch = new THREE.Mesh(scratchGeometry, darkWoodMaterial);
    scratch.position.set(
      (Math.random() - 0.5) * totalWidth * 0.8,
      (Math.random() - 0.5) * plankHeight * 0.8,
      0.08
    );
    scratch.rotation.z = Math.random() * Math.PI;
    doorGroup.add(scratch);
  }

  return doorGroup;
}

// Hook for easy integration into Three.js scenes
export function useMedievalDoor(
  scene: THREE.Scene,
  position: THREE.Vector3,
  rotation?: THREE.Euler,
  scale = 1
) {
  const doorGroup = createMedievalDoorGeometry();
  doorGroup.position.copy(position);
  if (rotation) doorGroup.rotation.copy(rotation);
  doorGroup.scale.setScalar(scale);

  scene.add(doorGroup);

  const cleanup = () => {
    scene.remove(doorGroup);
    doorGroup.traverse((child) => {
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

  return { doorGroup, cleanup };
}
