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
