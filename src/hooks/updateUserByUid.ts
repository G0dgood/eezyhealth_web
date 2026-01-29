import { collection, query, where, getDocs, doc, updateDoc } from "firebase/firestore";
import { db } from "@/lib/firebase";

export const updateUserByUid = async (uid: string, updatedData: Record<string, unknown>) => {
  try {
    const userCollectionRef = collection(db, 'users');
    const q = query(userCollectionRef, where('uid', '==', uid));

    // Execute the query
    const querySnapshot = await getDocs(q);

    if (querySnapshot.empty) {
      throw new Error(`No user found with UID: ${uid}`);
    }

    // Assuming UID is unique, there should only be one document in the query snapshot
    querySnapshot.forEach(async (docSnapshot) => {
      const userDocRef = doc(db, 'users', docSnapshot.id);

      // Update the user document
      await updateDoc(userDocRef, updatedData); 
    });
  } catch (error) {
    console.error('Error updating user:', error);
    throw error;
  }
};
