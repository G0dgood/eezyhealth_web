import { collection, query, where, getDocs, doc, deleteDoc } from "firebase/firestore";
import { db } from "@/lib/firebase";

export const deleteUser = async (uid: string): Promise<void> => {
  try {
    const userCollectionRef = collection(db, 'users');
    const q = query(userCollectionRef, where('uid', '==', uid));

    // Execute the query
    const querySnapshot = await getDocs(q);

    if (querySnapshot.empty) {
      throw new Error(`No user found with UID: ${uid}`);
    }

    // Delete the user document
    querySnapshot.forEach(async (docSnapshot) => {
      const userDocRef = doc(db, 'users', docSnapshot.id);
      await deleteDoc(userDocRef); 
    });
  } catch (error) { 
    throw error;
  }
};
