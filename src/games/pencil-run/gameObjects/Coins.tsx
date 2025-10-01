import React, { useRef } from "react";
import { useFrame } from "@react-three/fiber";
import { useGLTF } from "@react-three/drei";
import { Group } from "three";

const Coins: React.FC = () => {
  const { scene } = useGLTF("/assets/pencil-run-gltf/coin.glb") as any;
  const coinRef = useRef<Group>(null);

  // Clone the scene to avoid shared reference
  const coin = scene.clone();

  useFrame((_, delta) => {
    if (coinRef.current) {
      coinRef.current.rotation.y += delta; // rotate slowly around Y axis
    }
  });

  return (
    <group ref={coinRef} scale={2}>
      <primitive object={coin} />
    </group>
  );
};

// Preload for performance
useGLTF.preload("/assets/pencil-run-gltf/coin.glb");

export default Coins;
