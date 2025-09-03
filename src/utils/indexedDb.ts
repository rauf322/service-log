import { ServiceLog, Draft } from "@/types/serviceLog";

const DB_NAME = "ServiceLogDB";
const DB_VERSION = 2;
const STORE_NAME = "serviceLogs";
const DRAFT_STORE_NAME = "drafts";

const initDB = (): Promise<IDBDatabase> => {
  return new Promise((res, rej) => {
    const request = indexedDB.open(DB_NAME, DB_VERSION);
    request.onerror = () => rej(request.error);
    request.onsuccess = () => res(request.result);
    request.onupgradeneeded = (e) => {
      const db = (e.target as IDBOpenDBRequest).result;
      if (!db.objectStoreNames.contains(STORE_NAME)) {
        const store = db.createObjectStore(STORE_NAME, {
          keyPath: "id",
          autoIncrement: true,
        });
        store.createIndex("carId", "carId", { unique: false });
      }
      if (!db.objectStoreNames.contains(DRAFT_STORE_NAME)) {
        const draftStore = db.createObjectStore(DRAFT_STORE_NAME, {
          keyPath: "id",
        });
        draftStore.createIndex("title", "title", { unique: false });
        draftStore.createIndex("createdAt", "createdAt", { unique: false });
      }
    };
  });
};

export const saveServiceLogsToDB = async (
  logs: ServiceLog[],
): Promise<void> => {
  const db = await initDB();
  const transaction = db.transaction([STORE_NAME], "readwrite");
  const store = transaction.objectStore(STORE_NAME);
  await store.clear();
  for (const log of logs) {
    await store.add(log);
  }
};
export const loadServiceLogsFromDB = async (): Promise<ServiceLog[]> => {
  try {
    const db = await initDB();
    const transaction = db.transaction([STORE_NAME], "readonly");
    const store = transaction.objectStore(STORE_NAME);

    return new Promise((resolve, reject) => {
      const request = store.getAll();
      request.onerror = () => reject(request.error);
      request.onsuccess = () => resolve(request.result);
    });
  } catch (error) {
    console.error("Error loading from IndexedDB:", error);
    return [];
  }
};

export const addServiceLogToDB = async (log: ServiceLog): Promise<void> => {
  const db = await initDB();
  const transaction = db.transaction([STORE_NAME], "readwrite");
  const store = transaction.objectStore(STORE_NAME);
  await store.add(log);
};

export const updateServiceLogInDB = async (log: ServiceLog): Promise<void> => {
  const db = await initDB();
  const transaction = db.transaction([STORE_NAME], "readwrite");
  const store = transaction.objectStore(STORE_NAME);
  await store.put(log);
};

export const deleteServiceLogFromDB = async (id: number): Promise<void> => {
  const db = await initDB();
  const transaction = db.transaction([STORE_NAME], "readwrite");
  const store = transaction.objectStore(STORE_NAME);
  await store.delete(id);
};

export const saveDraftToDb = async (draft: Draft): Promise<void> => {
  const db = await initDB();
  const transaction = db.transaction([DRAFT_STORE_NAME], "readwrite");
  const store = transaction.objectStore(DRAFT_STORE_NAME);
  await store.put(draft);
};

export const loadDraftsFromDb = async (): Promise<Draft[]> => {
  try {
    const db = await initDB();
    const transaction = db.transaction([DRAFT_STORE_NAME], "readonly");
    const store = transaction.objectStore(DRAFT_STORE_NAME);

    return new Promise((resolve, reject) => {
      const request = store.getAll();
      request.onerror = () => reject(request.error);
      request.onsuccess = () => resolve(request.result);
    });
  } catch (error) {
    console.error("Error loading drafts from IndexedDB:", error);
    return [];
  }
};

export const deleteDraftFromDb = async (id: string): Promise<void> => {
  const db = await initDB();
  const transaction = db.transaction([DRAFT_STORE_NAME], "readwrite");
  const store = transaction.objectStore(DRAFT_STORE_NAME);
  await store.delete(id);
};

export const deleteAllDraftsFromDb = async (): Promise<void> => {
  const db = await initDB();
  const transaction = db.transaction([DRAFT_STORE_NAME], "readwrite");
  const store = transaction.objectStore(DRAFT_STORE_NAME);
  await store.clear();
};
