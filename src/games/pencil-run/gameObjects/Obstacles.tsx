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
  const { nodes } = useGLTF("/assets/pencil-run-gltf/sharpner.glb");

  // Random material only once per render
  const randomMaterial = useMemo(() => {
    return new MeshStandardMaterial({
      color: new Color(Math.random(), Math.random(), Math.random()),
    });
  }, []);

  const randomYRotation = useMemo(() => Math.random() * Math.PI * 2, []);
  const rotation = new Euler(0, -Math.PI / 2 + randomYRotation, 0);

  return (
    <group
      dispose={null}
      rotation={rotation}
      scale={new Vector3(2.5, 2.5, 2.5)}
    >
      {Object.entries(nodes).map(([key, node]) => {
        if ((node as Object3D).type === "Mesh") {
          const meshNode = node as Mesh;
          const originalMaterial = meshNode.material as MeshStandardMaterial;

          // Swap material if name is "002" or "005"
          const material =
            originalMaterial?.name.includes("002") ||
            originalMaterial?.name.includes("005")
              ? randomMaterial
              : originalMaterial;

          // Disable shadows if material name includes "emission"
          const isEmission = material?.name.toLowerCase().includes("outline");

          return (
            <mesh
              key={key}
              geometry={meshNode.geometry}
              material={material}
              castShadow={!isEmission}
              receiveShadow={!isEmission}
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
useGLTF.preload("/assets/pencil-run-gltf/sharpner.glb");
