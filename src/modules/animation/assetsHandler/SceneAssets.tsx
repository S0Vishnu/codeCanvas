import { useAssetStore } from "../store/useAssetStore";
import GLTFModel from "./GLTFModel";
import { Group } from "three";
import { useEffect } from "react";
import { useAssetRefs } from "../hooks/useAssetRefs";
import BoundingBox from "./BoxHelper";

const SceneAssets = ({
  selected,
  selectedRefs,
}: {
  selected: string[];
  selectedRefs: React.RefObject<Group[]>;
}) => {
  const { assets } = useAssetStore();
  const refMap = useAssetRefs(assets);

  // Collect only selected refs
  useEffect(() => {
    selectedRefs.current = selected
      .map((id) => refMap[id]?.current)
      .filter((ref): ref is Group => !!ref);
  }, [selected, assets]);

  return (
    <>
      {assets.map((asset) => {
        const isSelected = selected.includes(asset.id);
        return (
          <GLTFModel
            key={asset.id}
            asset={asset}
            isSelected={isSelected}
            ref={refMap[asset.id]}
          />
        );
      })}

      {/* Optional bounding box helpers */}
      {selected.map((id) =>
        refMap[id]?.current ? (
          <BoundingBox key={`bbox-${id}`} object={refMap[id]!.current!} />
        ) : null
      )}
    </>
  );
};

export default SceneAssets;
