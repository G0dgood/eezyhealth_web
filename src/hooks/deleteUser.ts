import { collection, query, where, getDocs, doc, deleteDoc, getDoc } from "firebase/firestore";
import { db } from "@/lib/firebase";

export const deleteUser = async (uid: string): Promise<void> => { 
  try {
    // 1. Try to find by Document ID directly
    const userDocRef = doc(db, 'users', uid);
    const userDocSnap = await getDoc(userDocRef);

    if (userDocSnap.exists()) {
     
       await deleteDoc(userDocRef);
       return;
    }

    // 2. If not found by ID, query by 'uid' field
    
    const userCollectionRef = collection(db, 'users');
    const q = query(userCollectionRef, where('uid', '==', uid));

    // Execute the query
    const querySnapshot = await getDocs(q);

    if (querySnapshot.empty) {
      console.error(`No user found with UID: ${uid}`);
      throw new Error(`No user found with UID: ${uid}`);
    }

    // Delete the user document(s)
    const deletePromises = querySnapshot.docs.map((docSnapshot) => {
       
       return deleteDoc(doc(db, 'users', docSnapshot.id));
    });
    
    await Promise.all(deletePromises);

  } catch (error) { 
    console.error("Error in deleteUser:", error);
    throw error;
  }
};
