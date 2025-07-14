import { useAssetStore } from "../store/useAssetStore";
import GLTFModel from "./GLTFModel";
import { Group } from "three";
import { useEffect, useState } from "react";
import { useAssetRefs } from "../hooks/useAssetRefs";
import BoundingBox from "./BoxHelper";
import { getAllGLTFs } from "../utils/indexedDb";
import { Html } from "@react-three/drei"; // Add this import
import { LOCAL_STORAGE_KEY } from "../utils/constants";

type StoredAsset = {
  id: string;
  name: string;
  url: string;
  transform: {
    position: { x: number; y: number; z: number };
    rotation: { x: number; y: number; z: number };
    scale: { x: number; y: number; z: number };
  };
  animations?: { name: string }[];
};

const SceneAssets = ({
  selected,
  selectedRefs,
}: {
  selected: string[];
  selectedRefs: React.RefObject<Group[]>;
}) => {
  const { assets, setAssets } = useAssetStore();
  const refMap = useAssetRefs(assets);
  const [isLoading, setIsLoading] = useState(true);
  const uniqueSelected = Array.from(new Set(selected));

  // Load assets from localStorage and IndexedDB on mount
  useEffect(() => {
    const loadAssets = async () => {
      try {
        setIsLoading(true);

        const localStorageData = localStorage.getItem(LOCAL_STORAGE_KEY);
        let parsedAssets: StoredAsset[] = [];

        if (localStorageData) {
          parsedAssets = JSON.parse(localStorageData) as StoredAsset[];
          if (parsedAssets.length > 0) {
            setAssets(parsedAssets);
          }
        }

        if (parsedAssets.length === 0) {
          const gltfs = await getAllGLTFs();
          if (gltfs.length > 0) {
            setAssets(
              gltfs.map((gltf) => ({
                id: gltf.id,
                name: gltf.name,
                transform: {
                  position: { x: 0, y: 0, z: 0 },
                  rotation: { x: 0, y: 0, z: 0 },
                  scale: { x: 1, y: 1, z: 1 },
                },
                animations: [],
              }))
            );
          }
        }
      } catch (error) {
        console.error("Failed to load assets:", error);
      } finally {
        setIsLoading(false);
      }
    };

    loadAssets();
  }, []);

  useEffect(() => {
    selectedRefs.current = selected
      .map((id) => refMap[id]?.current)
      .filter((ref): ref is Group => !!ref);
  }, [selected, assets]);

  if (isLoading) {
    return (
      <Html center>
        <div className="loading-message">Loading assets...</div>
      </Html>
    );
  }

  return (
    <>
      {assets.map((asset) => {
        return (
          <GLTFModel key={asset.id} asset={asset} ref={refMap[asset.id]} />
        );
      })}

      {uniqueSelected.map((id) =>
        refMap[id]?.current ? (
          <BoundingBox key={`bbox-${id}`} object={refMap[id]!.current!} />
        ) : null
      )}
    </>
  );
};

export default SceneAssets;
