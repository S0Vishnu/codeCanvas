import React from "react";
import { v4 as uuidv4 } from "uuid";
import { useAssetStore } from "../store/useAssetStore";
import { saveGLTFToIndexedDB } from "../utils/indexedDb";

const AssetUploader = () => {
  const { addAsset } = useAssetStore();

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = async () => {
      const buffer = reader.result as ArrayBuffer;
      const id = uuidv4();

      // Save to IndexedDB first
      await saveGLTFToIndexedDB(id, buffer, file.name);

      addAsset({
        name: file.name,
        transform: {
          position: { x: 0, y: 0, z: 0 },
          rotation: { x: 0, y: 0, z: 0 },
          scale: { x: 1, y: 1, z: 1 },
        },
        animations: [],
      });
    };
    reader.readAsArrayBuffer(file);
  };

  return (
    <div className="upload-container">
      <label className="upload-button button">
        Upload GLTF/GLB
        <input
          type="file"
          accept=".glb,.gltf"
          onChange={handleUpload}
          style={{ display: "none" }}
        />
      </label>
    </div>
  );
};

export default AssetUploader;
