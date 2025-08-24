import { db } from './firebase';
import { 
  collection, 
  query, 
  where, 
  getDocs, 
  addDoc, 
  updateDoc, 
  deleteDoc, 
  doc,
  orderBy,
  limit,
  startAfter,
  onSnapshot,
  type QueryConstraint,
  type DocumentData,
  type QueryDocumentSnapshot,
  type WithFieldValue
} from 'firebase/firestore';

// Reusable Firebase instance getter
export const getFirebaseInstance = () => db;

// Reusable Firestore functions getter
export const getFirestoreInstance = () => ({
  collection,
  query,
  where,
  getDocs,
  addDoc,
  updateDoc,
  deleteDoc,
  doc,
  orderBy,
  limit,
  startAfter,
  onSnapshot
});

// Helper function to serialize Firebase data
// eslint-disable-next-line @typescript-eslint/no-explicit-any
const serializeFirebaseData = (data: unknown): unknown => {
  if (data === null || data === undefined) {
    return data;
  }
  
  if (typeof data === 'object') {
    // Handle Firestore Timestamp objects
    if (data && typeof data === 'object' && 'seconds' in data && 'nanoseconds' in data) {
      const timestamp = data as { seconds: number; nanoseconds: number };
      return new Date(timestamp.seconds * 1000).toISOString();
    }
    
    // Handle arrays
    if (Array.isArray(data)) {
      return data.map(serializeFirebaseData);
    }
    
    // Handle regular objects
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const serialized: Record<string, unknown> = {};
    for (const [key, value] of Object.entries(data as Record<string, unknown>)) {
      serialized[key] = serializeFirebaseData(value);
    }
    return serialized;
  }
  
  return data;
};

// Generic Firebase query helper
export const createFirebaseQuery = async <T = Record<string, unknown>>(
  collectionName: string,
  constraints: QueryConstraint[] = []
): Promise<(T & { id: string })[]> => {
  try {
    const { collection, query, getDocs } = getFirestoreInstance();
    const db = getFirebaseInstance();
    
    const collectionRef = collection(db, collectionName);
    const q = query(collectionRef, ...constraints);
    const snapshot = await getDocs(q);
    
    return snapshot.docs.map(doc => {
      const data = doc.data();
      const serializedData = serializeFirebaseData(data) as Record<string, unknown>;
      return {
        id: doc.id,
        ...serializedData
      };
    }) as (T & { id: string })[];
  } catch (error) {
    console.error(`Error fetching from ${collectionName}:`, error);
    throw error;
  }
};

// Generic Firebase document creator
export const createFirebaseDocument = async <T = Record<string, unknown>>(
  collectionName: string,
  data: T
): Promise<{ id: string; data: T }> => {
  try {
    const { collection, addDoc } = getFirestoreInstance();
    const db = getFirebaseInstance();
    
    const collectionRef = collection(db, collectionName);
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const docRef = await addDoc(collectionRef, data as any);
    
    return { id: docRef.id, data };
  } catch (error) {
    console.error(`Error creating document in ${collectionName}:`, error);
    throw error;
  }
};

// Generic Firebase document updater
export const updateFirebaseDocument = async <T = Record<string, unknown>>(
  collectionName: string,
  documentId: string,
  data: Partial<T>
): Promise<void> => {
  try {
    const { doc, updateDoc } = getFirestoreInstance();
    const db = getFirebaseInstance();
    
    const documentRef = doc(db, collectionName, documentId);
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    await updateDoc(documentRef, data as any);
  } catch (error) {
    console.error(`Error updating document in ${collectionName}:`, error);
    throw error;
  }
};

// Generic Firebase document deleter
export const deleteFirebaseDocument = async (
  collectionName: string,
  documentId: string
): Promise<void> => {
  try {
    const { doc, deleteDoc } = getFirestoreInstance();
    const db = getFirebaseInstance();
    
    const documentRef = doc(db, collectionName, documentId);
    await deleteDoc(documentRef);
  } catch (error) {
    console.error(`Error deleting document from ${collectionName}:`, error);
    throw error;
  }
};

// Reusable query constraints
export const firebaseConstraints = {
  where: (field: string, operator: string, value: string | number | boolean | Date | null) => 
    where(field, operator as '==' | '!=' | '<' | '<=' | '>' | '>=' | 'in' | 'not-in' | 'array-contains' | 'array-contains-any', value),
  orderBy: (field: string, direction: 'asc' | 'desc' = 'asc') => orderBy(field, direction),
  limit: (count: number) => limit(count),
  startAfter: (snapshot: QueryDocumentSnapshot) => startAfter(snapshot)
};
