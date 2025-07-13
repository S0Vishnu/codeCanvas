import { TransformControls } from "@react-three/drei";
import { useThree } from "@react-three/fiber";
import { useEffect, useRef } from "react";
import { Group } from "three";

const TransformControlsWrapper = ({
  object,
  mode = "translate",
}: {
  object: Group;
  mode?: "translate" | "rotate" | "scale";
}) => {
  const { camera, gl } = useThree();
  const controlsRef = useRef<any>(null);

  useEffect(() => {
    const controls = controlsRef.current;
    const domElement = gl.domElement;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (!controls) return;
      if (e.key === "r") controls.setMode("rotate");
      if (e.key === "s") controls.setMode("scale");
      if (e.key === "g") controls.setMode("translate");
    };

    domElement.addEventListener("keydown", handleKeyDown);
    return () => {
      domElement.removeEventListener("keydown", handleKeyDown);
    };
  }, [gl]);

  return (
    <TransformControls
      ref={controlsRef}
      object={object}
      mode={mode}
      camera={camera}
      domElement={gl.domElement}
    />
  );
};

export default TransformControlsWrapper;
