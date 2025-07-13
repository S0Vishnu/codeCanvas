import React from 'react';
import { v4 as uuidv4 } from 'uuid';
import { useAssetStore } from '../store/useAssetStore';
import { saveGLTFToIndexedDB } from '../utils/indexedDb';

const AssetUploader = () => {
  const { addAsset } = useAssetStore();

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = async () => {
      const buffer = reader.result as ArrayBuffer;
      const url = URL.createObjectURL(file);

      const id = uuidv4();
      await saveGLTFToIndexedDB(id, buffer, file.name);

      addAsset({
        id,
        name: file.name,
        url,
        transform: {
          position: { x: 0, y: 0, z: 0 },
          rotation: { x: 0, y: 0, z: 0 },
          scale: { x: 1, y: 1, z: 1 }
        },
        animations: [] // Add parsed animations if needed
      });
    };
    reader.readAsArrayBuffer(file);
  };

  return <input type="file" accept=".glb,.gltf" onChange={handleUpload} />;
};

export default AssetUploader;
