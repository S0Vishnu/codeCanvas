import React, { useRef } from "react";
import { useFrame } from "@react-three/fiber";
import { useGLTF } from "@react-three/drei";
import { Group } from "three";

const Coins: React.FC = () => {
  const { scene } = useGLTF("/assets/pencil-run-gltf/coin.glb");
  const coinRef = useRef<Group>(null);
  const ROTATION_SPEED = 2;

  // Clone the scene to avoid shared reference
  const coin = scene.clone();

  useFrame((_, delta) => {
    if (coinRef.current) {
      coinRef.current.rotation.y += delta * ROTATION_SPEED; // rotate slowly around Y axis
    }
  });

  return (
    <group ref={coinRef} scale={2.5}>
      <primitive object={coin} />
    </group>
  );
};

// Preload for performance
useGLTF.preload("/assets/pencil-run-gltf/coin.glb");

export default Coins;
