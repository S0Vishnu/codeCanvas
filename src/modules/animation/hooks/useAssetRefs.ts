import React, { useRef, useMemo } from "react";
import { Group } from "three";
import type { Asset } from "../store/useAssetStore";

export function useAssetRefs(assets: Asset[]) {
  // Store stable refMap
  const refMap = useRef<{ [id: string]: React.RefObject<Group | null> }>({});

  // Initialize refs only once per asset
  useMemo(() => {
    for (const asset of assets) {
      if (!refMap.current[asset.id]) {
        refMap.current[asset.id] = React.createRef<Group>();
      }
    }
  }, [assets]);

  return refMap.current;
}
