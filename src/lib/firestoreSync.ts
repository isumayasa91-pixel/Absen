import {
  collection,
  doc,
  setDoc,
  deleteDoc,
  getDoc,
  getDocs,
  onSnapshot,
  writeBatch,
} from 'firebase/firestore';
import { db } from './firebase';

const cleanData = (obj: any): any => {
  if (obj === null || obj === undefined) return null;
  if (Array.isArray(obj)) return obj.map(cleanData);
  if (typeof obj === 'object') {
    const res: any = {};
    for (const key of Object.keys(obj)) {
      if (obj[key] !== undefined) {
        res[key] = cleanData(obj[key]);
      }
    }
    return res;
  }
  return obj;
};

// Generic single document sync
export const syncSingleDoc = <T extends Record<string, any>>(
  colName: string,
  docId: string,
  data: T
) => {
  try {
    const cleaned = cleanData(data);
    setDoc(doc(db, colName, docId), cleaned, { merge: true }).catch((err) =>
      console.error(`Error saving ${colName}/${docId} to Firestore:`, err)
    );
  } catch (err) {
    console.error(`Firestore sync error for ${colName}/${docId}:`, err);
  }
};

// Save a list item to a collection
export const saveCollectionItem = <T extends { id: string }>(
  colName: string,
  item: T
) => {
  try {
    const cleaned = cleanData(item);
    setDoc(doc(db, colName, item.id), cleaned, { merge: true }).catch((err) =>
      console.error(`Error saving item to ${colName}:`, err)
    );
  } catch (err) {
    console.error(`Firestore save error for ${colName}:`, err);
  }
};

// Batch save items to a collection
export const saveCollectionItemsBatch = async <T extends { id: string }>(
  colName: string,
  items: T[]
) => {
  try {
    if (items.length === 0) return;
    const batch = writeBatch(db);
    items.forEach((item) => {
      const ref = doc(db, colName, item.id);
      batch.set(ref, cleanData(item), { merge: true });
    });
    await batch.commit();
  } catch (err) {
    console.error(`Error batch saving ${colName}:`, err);
  }
};

// Delete an item from a collection
export const deleteCollectionItem = (colName: string, itemId: string) => {
  try {
    deleteDoc(doc(db, colName, itemId)).catch((err) =>
      console.error(`Error deleting ${itemId} from ${colName}:`, err)
    );
  } catch (err) {
    console.error(`Firestore delete error for ${colName}:`, err);
  }
};

// Delete all items in a collection batch given array
export const clearCollectionBatch = async <T extends { id: string }>(
  colName: string,
  items: T[]
) => {
  try {
    if (items.length === 0) return;
    const batch = writeBatch(db);
    items.forEach((item) => {
      const ref = doc(db, colName, item.id);
      batch.delete(ref);
    });
    await batch.commit();
  } catch (err) {
    console.error(`Error clearing ${colName}:`, err);
  }
};

// Clear entire collection directly from Firestore
export const clearEntireCollectionInFirestore = async (colName: string) => {
  try {
    const colRef = collection(db, colName);
    const snapshot = await getDocs(colRef);
    if (snapshot.empty) return;

    const docs = snapshot.docs;
    for (let i = 0; i < docs.length; i += 400) {
      const batch = writeBatch(db);
      const chunk = docs.slice(i, i + 400);
      chunk.forEach((docSnap) => {
        batch.delete(docSnap.ref);
      });
      await batch.commit();
    }
  } catch (err) {
    console.error(`Error clearing entire collection ${colName}:`, err);
  }
};

// Single check for system seed initialization
let metaChecked = false;
let isMetaInitialized = false;

const checkMetaInitialized = async (): Promise<boolean> => {
  if (metaChecked) return isMetaInitialized;
  try {
    const metaRef = doc(db, '_meta', 'system');
    const snap = await getDoc(metaRef);
    if (snap.exists()) {
      isMetaInitialized = true;
    }
    metaChecked = true;
    return isMetaInitialized;
  } catch (e) {
    return false;
  }
};

const markMetaInitialized = async () => {
  try {
    const metaRef = doc(db, '_meta', 'system');
    await setDoc(metaRef, { initialized: true, seededAt: new Date().toISOString() }, { merge: true });
    isMetaInitialized = true;
    metaChecked = true;
  } catch (e) {
    console.error('Error marking meta system initialized:', e);
  }
};

// Listen to collection changes with initial seed fallback ONLY on fresh app setup
export const listenCollection = <T extends { id: string }>(
  colName: string,
  initialFallback: T[],
  onUpdate: (data: T[]) => void
) => {
  const colRef = collection(db, colName);
  return onSnapshot(
    colRef,
    async (snapshot) => {
      if (snapshot.empty) {
        const initialized = await checkMetaInitialized();
        if (!initialized && initialFallback.length > 0) {
          // First time launching app on fresh empty DB -> seed initial data ONCE
          await saveCollectionItemsBatch(colName, initialFallback);
          await markMetaInitialized();
          onUpdate(initialFallback);
        } else {
          // Data was deleted or dataset is empty -> STAY EMPTY!
          onUpdate([]);
        }
      } else {
        // We have documents in Firestore -> mark system initialized so future empty states won't re-seed
        if (!isMetaInitialized) {
          markMetaInitialized();
        }
        const list: T[] = [];
        snapshot.forEach((docSnap) => {
          list.push({ id: docSnap.id, ...docSnap.data() } as T);
        });
        onUpdate(list);
      }
    },
    (err) => {
      console.error(`Error listening to collection ${colName}:`, err);
    }
  );
};

// Listen to single document changes
export const listenSingleDoc = <T extends Record<string, any>>(
  colName: string,
  docId: string,
  initialFallback: T,
  onUpdate: (data: T) => void
) => {
  const docRef = doc(db, colName, docId);
  return onSnapshot(
    docRef,
    (snapshot) => {
      if (!snapshot.exists()) {
        syncSingleDoc(colName, docId, initialFallback);
        onUpdate(initialFallback);
      } else {
        onUpdate(snapshot.data() as T);
      }
    },
    (err) => {
      console.error(`Error listening to doc ${colName}/${docId}:`, err);
    }
  );
};

