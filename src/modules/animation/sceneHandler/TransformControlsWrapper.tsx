import { TransformControls } from "@react-three/drei";
import { useThree } from "@react-three/fiber";
import { useEffect, useRef } from "react";
import { Group } from "three";
import { useAssetStore } from "../store/useAssetStore"; // 👈 import your store hook

const TransformControlsWrapper = ({
  object,
  mode = "translate",
  assetId,
}: {
  object: Group;
  assetId: string;
  mode?: "translate" | "rotate" | "scale";
}) => {
  const { camera, gl } = useThree();
  const controlsRef = useRef<any>(null);
  const { updateAsset } = useAssetStore(); // 👈 assume your store exposes this

  useEffect(() => {
    const controls = controlsRef.current;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (!controls) return;
      if (e.key === "r") controls.setMode("rotate");
      if (e.key === "s") controls.setMode("scale");
      if (e.key === "g") controls.setMode("translate");
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => {
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, []);

  const handleObjectChange = () => {
    if (!object) return;
    updateAsset(assetId, {
      transform: {
        position: {
          x: object.position.x,
          y: object.position.y,
          z: object.position.z,
        },
        rotation: {
          x: object.rotation.x,
          y: object.rotation.y,
          z: object.rotation.z,
        },
        scale: {
          x: object.scale.x,
          y: object.scale.y,
          z: object.scale.z,
        },
      },
    });
  };

  return (
    <TransformControls
      ref={controlsRef}
      object={object}
      mode={mode}
      camera={camera}
      domElement={gl.domElement}
      onObjectChange={handleObjectChange}
    />
  );
};

export default TransformControlsWrapper;
