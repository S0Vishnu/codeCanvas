import React, { useMemo } from "react";
import { useGLTF } from "@react-three/drei";
import {
  MeshStandardMaterial,
  Color,
  Euler,
  Vector3,
  Mesh,
  Object3D,
} from "three";

const Obstacles: React.FC = () => {
  const { nodes } = useGLTF("/assets/gltf/sharpner.glb");

  // Random material only once per render
  const randomMaterial = useMemo(() => {
    return new MeshStandardMaterial({
      color: new Color(Math.random(), Math.random(), Math.random()),
    });
  }, []);

  return (
    <group
      dispose={null}
      rotation={new Euler(0, -Math.PI / 2, 0)} // Rotate 90° around X axis
      scale={new Vector3(2.5, 2.5, 2.5)} // Scale up uniformly
    >
      {Object.entries(nodes).map(([key, node]) => {
        // Narrow type: only handle Mesh objects
        if ((node as Object3D).type === "Mesh") {
          const meshNode = node as Mesh;
          const originalMaterial = meshNode.material as MeshStandardMaterial;

          // If material name is "002" or "005", swap with randomMaterial
          const material =
            originalMaterial?.name.includes("002") || originalMaterial?.name.includes("005")
              ? randomMaterial
              : originalMaterial;

          return (
            <mesh
              key={key}
              geometry={meshNode.geometry}
              material={material}
              castShadow
              receiveShadow
            />
          );
        }
        return null;
      })}
    </group>
  );
};

export default Obstacles;

// Preload for performance
useGLTF.preload("/assets/gltf/sharpner.glb");
