import { collection, query, where, getDocs, doc, updateDoc } from "firebase/firestore";
import { db } from "@/lib/firebase";

export const updateAdminPassword = async (uid: string, updatedData: Record<string, unknown>) => {
  try {
    // Create a reference to the `adminProfiles` collection
    const adminProfilesRef = collection(db, 'adminProfiles');
    
    // Query to find the document with the matching UID reference
    const q = query(adminProfilesRef, where('uid', '==', `users/${uid}`)); // Use the full path for the UID
    
    const querySnapshot = await getDocs(q);

    if (querySnapshot.empty) {
      throw new Error(`No admin profile found with UID: ${uid}`);
    }

    // Update the user document in the `/users` collection 
      const userDocRef = doc(db, 'users', uid); // Use the UID to get the user document reference

      // Update the user document
      await updateDoc(userDocRef, updatedData);  
  } catch (error) {
    console.error('Error updating user:', error);
    throw error;
  }
};
