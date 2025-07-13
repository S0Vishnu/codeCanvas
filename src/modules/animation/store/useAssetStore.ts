import { create } from "zustand";
import { produce } from "immer";

type Vector3 = { x: number; y: number; z: number };
type Transform = {
  position: Vector3;
  rotation: Vector3;
  scale: Vector3;
};

export type Asset = {
  id: string;
  name: string;
  url: string;
  transform: Transform;
  animations?: { name: string }[];
};

type AssetStore = {
  assets: Asset[];

  // Bulk and individual asset control
  setAssets: (assets: Asset[]) => void;
  addAsset: (asset: Asset) => void;
  deleteAsset: (id: string) => void;
  updateAsset: (id: string, updated: Partial<Asset>) => void;

  // Specific transform update
  updateAssetTransform: (
    id: string,
    key: keyof Transform,
    value: Vector3
  ) => void;
};

export const useAssetStore = create<AssetStore>((set) => ({
  assets: [],

  setAssets: (assets) => set({ assets }),

  addAsset: (asset) =>
    set(
      produce((state: AssetStore) => {
        state.assets.push(asset);
      })
    ),

  deleteAsset: (id) =>
    set(
      produce((state: AssetStore) => {
        state.assets = state.assets.filter((a) => a.id !== id);
      })
    ),

  updateAsset: (id, updated) =>
    set(
      produce((state: AssetStore) => {
        const asset = state.assets.find((a) => a.id === id);
        if (asset) {
          Object.assign(asset, updated);
        }
      })
    ),

  updateAssetTransform: (id, key, value) =>
    set(
      produce((state: AssetStore) => {
        const asset = state.assets.find((a) => a.id === id);
        if (asset) {
          asset.transform[key] = value;
        }
      })
    ),
}));
