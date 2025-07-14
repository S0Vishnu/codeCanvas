import { openDB } from 'idb';

const DB_NAME = 'GLTFStorage';
const STORE_NAME = 'gltfModels';

export const getDB = async () => {
  return await openDB(DB_NAME, 1, {
    upgrade(db) {
      if (!db.objectStoreNames.contains(STORE_NAME)) {
        db.createObjectStore(STORE_NAME, { keyPath: 'id' });
      }
    }
  });
};

export const saveGLTFToIndexedDB = async (id: string, buffer: ArrayBuffer, name: string) => {
  const db = await getDB();
  await db.put(STORE_NAME, { id, buffer, name });
};

export const getAllGLTFs = async () => {
  const db = await getDB();
  return await db.getAll(STORE_NAME);
};

export const getGLTFById = async (id: string) => {
  const db = await getDB();
  return await db.get(STORE_NAME, id);
};

export const getGLTFFromIndexedDB = async (id: string) => {
  const db = await getDB();
  const gltf = await db.get(STORE_NAME, id);
  if (!gltf) throw new Error(`GLTF with id ${id} not found`);
  return gltf;
};

export const deleteGLTFFromIndexedDB = async (id: string) => {
  const db = await getDB();
  await db.delete(STORE_NAME, id);
};