import { Canvas } from "@react-three/fiber";
import SceneAssets from "./assetsHandler/SceneAssets";
import EnvironmentAndLights from "./sceneHandler/EnvironmentAndLights";
import { useEffect, useRef, useState } from "react";
import type { Group } from "three";
import BoxSelectHelper from "./sceneHandler/BoxSelectHelper";
import BoxSelectOverlay from "./sceneHandler/BoxSelectOverlay";
import TransformControlsWrapper from "./sceneHandler/TransformControlsWrapper";
import { setupDeleteKeyHandler } from "./utils/setupDeleteKeyHandler";
import { useAssetStore } from "./store/useAssetStore";

const Scene = () => {
  const { deleteAsset } = useAssetStore();
  const [selected, setSelected] = useState<string[]>([]);
  const selectedRefs = useRef<Group[]>([]);
  const [selectionBox, setSelectionBox] = useState<DOMRect | null>(null);

  useEffect(() => {
    const cleanup = setupDeleteKeyHandler(() => selected, deleteAsset);
    return cleanup;
  }, [selected, deleteAsset]);

  const clickStart = useRef<{ x: number; y: number } | null>(null);

  const handleMouseDown = (e: MouseEvent) => {
    clickStart.current = { x: e.clientX, y: e.clientY };
  };

  const handleMouseUp = (e: MouseEvent) => {
    if (!clickStart.current) return;

    const dx = Math.abs(e.clientX - clickStart.current.x);
    const dy = Math.abs(e.clientY - clickStart.current.y);
    const isClick = dx < 2 && dy < 2;

    if (isClick) {
      setSelected([]);
    }

    clickStart.current = null;
  };

  useEffect(() => {
    window.addEventListener("mousedown", handleMouseDown);
    window.addEventListener("mouseup", handleMouseUp);
    return () => {
      window.removeEventListener("mousedown", handleMouseDown);
      window.removeEventListener("mouseup", handleMouseUp);
    };
  }, []);

  return (
    <div style={{ width: "100%", height: "100%" }}>
      <Canvas camera={{ position: [0, 2, 5], fov: 50 }} shadows>
        <EnvironmentAndLights />
        <SceneAssets selected={selected} selectedRefs={selectedRefs} />
        <BoxSelectHelper domRect={selectionBox} onSelect={setSelected} />
        {selectedRefs.current.length > 0 && (
          <TransformControlsWrapper object={selectedRefs.current[0]} />
        )}
      </Canvas>
      <BoxSelectOverlay onBoxSelect={setSelectionBox} />
    </div>
  );
};

export default Scene;
