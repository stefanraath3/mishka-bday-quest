"use client";

import { useRef, useEffect } from "react";
import * as THREE from "three";

interface OrnateFloatingKeyProps {
  position: THREE.Vector3;
  onCollect?: () => void;
  collected?: boolean;
  scale?: number;
}

export function createOrnateKeyGeometry(): THREE.Group {
  const keyGroup = new THREE.Group();

  // Materials
  const goldMaterial = new THREE.MeshStandardMaterial({
    color: 0xffd700,
    metalness: 0.8,
    roughness: 0.2,
    emissive: 0x332200,
    emissiveIntensity: 0.1,
  });

  const darkGoldMaterial = new THREE.MeshStandardMaterial({
    color: 0xb8860b,
    metalness: 0.9,
    roughness: 0.3,
  });

  // Key shaft (main body)
  const shaftGeometry = new THREE.CylinderGeometry(0.08, 0.08, 1.2, 8);
  const shaft = new THREE.Mesh(shaftGeometry, goldMaterial);
  shaft.rotation.z = Math.PI / 2; // Make it horizontal
  keyGroup.add(shaft);

  // Key head (circular top)
  const headGeometry = new THREE.TorusGeometry(0.25, 0.06, 8, 16);
  const head = new THREE.Mesh(headGeometry, goldMaterial);
  head.position.x = -0.6;
  keyGroup.add(head);

  // Inner circle of head
  const innerCircleGeometry = new THREE.TorusGeometry(0.15, 0.04, 6, 12);
  const innerCircle = new THREE.Mesh(innerCircleGeometry, darkGoldMaterial);
  innerCircle.position.x = -0.6;
  keyGroup.add(innerCircle);

  // Key teeth (the business end)
  const teethPositions = [
    { x: 0.4, y: -0.12, width: 0.15, height: 0.08 },
    { x: 0.5, y: -0.12, width: 0.12, height: 0.06 },
    { x: 0.3, y: -0.12, width: 0.18, height: 0.1 },
  ];

  teethPositions.forEach((tooth) => {
    const toothGeometry = new THREE.BoxGeometry(
      tooth.width,
      tooth.height,
      0.08
    );
    const toothMesh = new THREE.Mesh(toothGeometry, darkGoldMaterial);
    toothMesh.position.set(tooth.x, tooth.y, 0);
    keyGroup.add(toothMesh);
  });

  // Decorative elements on the head
  for (let i = 0; i < 6; i++) {
    const angle = (i / 6) * Math.PI * 2;
    const decorGeometry = new THREE.SphereGeometry(0.02, 6, 6);
    const decor = new THREE.Mesh(decorGeometry, darkGoldMaterial);
    decor.position.set(-0.6 + Math.cos(angle) * 0.2, Math.sin(angle) * 0.2, 0);
    keyGroup.add(decor);
  }

  // Central gem
  const gemGeometry = new THREE.OctahedronGeometry(0.04);
  const gemMaterial = new THREE.MeshStandardMaterial({
    color: 0xff4444,
    metalness: 0.1,
    roughness: 0.1,
    transparent: true,
    opacity: 0.8,
    emissive: 0x220000,
    emissiveIntensity: 0.3,
  });
  const gem = new THREE.Mesh(gemGeometry, gemMaterial);
  gem.position.x = -0.6;
  keyGroup.add(gem);

  return keyGroup;
}

export default function OrnateFloatingKey({
  position,
  onCollect,
  collected = false,
  scale = 1,
}: OrnateFloatingKeyProps) {
  const keyRef = useRef<THREE.Group | null>(null);
  const mountRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (!mountRef.current || collected) return;

    // Create a mini scene just for this key component
    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(50, 1, 0.1, 10);
    const renderer = new THREE.WebGLRenderer({
      antialias: true,
      alpha: true, // Transparent background
    });

    renderer.setSize(100, 100); // Small preview size
    renderer.setClearColor(0x000000, 0); // Transparent
    mountRef.current.appendChild(renderer.domElement);

    // Create the key
    const keyGroup = createOrnateKeyGeometry();
    keyGroup.scale.setScalar(scale * 0.5); // Scale for preview
    scene.add(keyGroup);
    keyRef.current = keyGroup;

    // Lighting for preview
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.6);
    scene.add(ambientLight);
    const directionalLight = new THREE.DirectionalLight(0xffffff, 0.8);
    directionalLight.position.set(2, 2, 2);
    scene.add(directionalLight);

    // Position camera
    camera.position.set(1, 0.5, 1);
    camera.lookAt(0, 0, 0);

    // Animation
    let animationId: number;
    const animate = () => {
      if (keyRef.current && !collected) {
        // Floating motion
        keyRef.current.position.y = Math.sin(Date.now() * 0.003) * 0.1;
        // Rotation
        keyRef.current.rotation.y += 0.02;
        keyRef.current.rotation.z = Math.sin(Date.now() * 0.002) * 0.1;
      }

      renderer.render(scene, camera);
      animationId = requestAnimationFrame(animate);
    };
    animate();

    return () => {
      cancelAnimationFrame(animationId);
      if (mountRef.current && renderer.domElement) {
        mountRef.current.removeChild(renderer.domElement);
      }
      renderer.dispose();
    };
  }, [collected, scale]);

  if (collected) return null;

  return (
    <div
      ref={mountRef}
      className="absolute pointer-events-none"
      style={{
        left: `${position.x}px`,
        top: `${position.y}px`,
        zIndex: 10,
      }}
    />
  );
}

// Hook to use the key in a Three.js scene
export function useOrnateKey(
  scene: THREE.Scene,
  position: THREE.Vector3,
  scale = 1
) {
  const keyRef = useRef<THREE.Group | null>(null);

  useEffect(() => {
    const keyGroup = createOrnateKeyGeometry();
    keyGroup.position.copy(position);
    keyGroup.scale.setScalar(scale);
    scene.add(keyGroup);
    keyRef.current = keyGroup;

    return () => {
      scene.remove(keyGroup);
      // Dispose geometries and materials
      keyGroup.traverse((child) => {
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
    };
  }, [scene, position, scale]);

  return keyRef;
}
