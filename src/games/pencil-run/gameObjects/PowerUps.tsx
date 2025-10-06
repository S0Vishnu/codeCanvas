import { useGLTF } from "@react-three/drei";

const PowerUps = () => {
  const gltf = useGLTF("/assets/pencil-run-gltf/mushroom.glb", true);

  // Clone the scene so each instance is independent
  const mushroom = gltf.scene.clone();

  return <primitive object={mushroom} scale={1.2} />;
};

// Preload the GLTF for performance
useGLTF.preload("/assets/pencil-run-gltf/mushroom.glb");

export default PowerUps;
