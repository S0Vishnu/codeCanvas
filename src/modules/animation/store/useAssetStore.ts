import { create } from "zustand";
import { persist } from "zustand/middleware";
import { immer } from "zustand/middleware/immer";
import { deleteGLTFFromIndexedDB } from "../utils/indexedDb";
import { LOCAL_STORAGE_KEY } from "../utils/constants";
import { Group, Scene } from "three";

type Vector3 = { x: number; y: number; z: number };
type Transform = {
  position: Vector3;
  rotation: Vector3;
  scale: Vector3;
};

export type Asset = {
  id: string;
  name: string;
  url?: string; // Added for direct URL reference
  buffer?: ArrayBuffer; // Added for IndexedDB storage
  transform: Transform;
  animations?: { name: string }[];
  sceneRef?: React.RefObject<Group>; // Reference to the scene object
};

type AssetStore = {
  assets: Asset[];
  selectedAssets: string[];
  lastSelectedAsset: string | null;
  sceneRef: React.RefObject<Scene> | null;

  // Actions
  setAssets: (assets: Asset[]) => void;
  addAsset: (asset: Omit<Asset, 'id'>, buffer?: ArrayBuffer) => Promise<Asset>;
  deleteAsset: (id: string) => Promise<void>;
  updateAsset: (id: string, updated: Partial<Asset>) => void;
  updateAssetTransform: (id: string, key: keyof Transform, value: Vector3) => void;
  syncSceneTransforms: () => void;

  // Selection
  setSelectedAssets: (ids: string[]) => void;
  handleAssetSelection: (id: string, shiftKey: boolean) => void;
  clearSelectedAssets: () => void;
  setSceneRef: (ref: React.RefObject<Scene>) => void;
};

export const useAssetStore = create<AssetStore>()(
  persist(
    immer((set, get) => ({
      assets: [],
      selectedAssets: [],
      lastSelectedAsset: null,
      sceneRef: null,

      setAssets: (assets) => {
        set({ assets });
        localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(assets));
      },

      addAsset: async (asset, buffer) => {
        const newAsset = {
          ...asset,
          id: crypto.randomUUID(),
          buffer,
          url: buffer ? URL.createObjectURL(new Blob([buffer])) : undefined,
        };

        set((state) => {
          state.assets.push(newAsset);
          localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(state.assets));
        });

        return newAsset;
      },

      deleteAsset: async (id) => {
        try {
          await deleteGLTFFromIndexedDB(id);
          set((state) => {
            state.assets = state.assets.filter((a) => a.id !== id);
            state.selectedAssets = state.selectedAssets.filter(
              (selectedId) => selectedId !== id
            );
            if (state.lastSelectedAsset === id) {
              state.lastSelectedAsset = null;
            }
            localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(state.assets));
          });
        } catch (error) {
          console.error('Failed to delete asset:', error);
          throw error;
        }
      },

      updateAsset: (id, updated) => {
        set((state) => {
          const asset = state.assets.find((a) => a.id === id);
          if (asset) {
            Object.assign(asset, updated);
            localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(state.assets));

            // Sync with scene if available
            if (state.sceneRef?.current) {
              state.sceneRef.current.traverse((obj) => {
                if (obj.userData?.id === id) {
                  if (updated.transform) {
                    obj.position.set(
                      updated.transform.position.x,
                      updated.transform.position.y,
                      updated.transform.position.z
                    );
                    obj.rotation.set(
                      updated.transform.rotation.x,
                      updated.transform.rotation.y,
                      updated.transform.rotation.z
                    );
                    obj.scale.set(
                      updated.transform.scale.x,
                      updated.transform.scale.y,
                      updated.transform.scale.z
                    );
                  }
                  if (updated.name) {
                    obj.userData.name = updated.name;
                  }
                }
              });
            }
          }
        });
      },

      updateAssetTransform: (id, key, value) => {
        set((state) => {
          const asset = state.assets.find((a) => a.id === id);
          if (asset) {
            asset.transform[key] = value;
            localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(state.assets));

            // Update in scene immediately
            if (state.sceneRef?.current) {
              state.sceneRef.current.traverse((obj) => {
                if (obj.userData?.id === id) {
                  console.log('obj.userData?.id === id: ', obj.userData?.id === id);
                  if (key === 'position') {
                    obj.position.set(value.x, value.y, value.z);
                  } else if (key === 'rotation') {
                    obj.rotation.set(value.x, value.y, value.z);
                  } else if (key === 'scale') {
                    obj.scale.set(value.x, value.y, value.z);
                  }
                }
              });
            }
          }
        });
      },

      syncSceneTransforms: () => {
        const { assets, sceneRef } = get();
        if (!sceneRef?.current) return;

        sceneRef.current.traverse((obj) => {
          const assetId = obj.userData?.id;
          if (assetId) {
            const asset = assets.find((a) => a.id === assetId);
            if (asset) {
              obj.position.set(
                asset.transform.position.x,
                asset.transform.position.y,
                asset.transform.position.z
              );
              obj.rotation.set(
                asset.transform.rotation.x,
                asset.transform.rotation.y,
                asset.transform.rotation.z
              );
              obj.scale.set(
                asset.transform.scale.x,
                asset.transform.scale.y,
                asset.transform.scale.z
              );
            }
          }
        });
      },

      setSelectedAssets: (ids) => {
        set((state) => {
          state.selectedAssets = ids;
          state.lastSelectedAsset = ids[0] || null;
        });
      },

      handleAssetSelection: (id, shiftKey) => {
        set((state) => {
          if (shiftKey && state.lastSelectedAsset) {
            const allAssets = state.assets.map(a => a.id);
            const lastIndex = allAssets.indexOf(state.lastSelectedAsset);
            const currentIndex = allAssets.indexOf(id);

            if (lastIndex !== -1 && currentIndex !== -1) {
              const start = Math.min(lastIndex, currentIndex);
              const end = Math.max(lastIndex, currentIndex);
              const newSelection = allAssets.slice(start, end + 1);
              state.selectedAssets = [...new Set([...state.selectedAssets, ...newSelection])];
            }
          } else {
            state.selectedAssets = [id];
          }
          state.lastSelectedAsset = id;
        });
      },

      clearSelectedAssets: () => {
        set({ selectedAssets: [], lastSelectedAsset: null });
      },

      setSceneRef: (ref) => {
        set({ sceneRef: ref });
      },
    })),
    {
      name: "asset-storage",
      partialize: (state) => ({ assets: state.assets }),
    }
  )
);
