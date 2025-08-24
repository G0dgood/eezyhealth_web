import { collection, getDocs, query, where } from "firebase/firestore";
import { db } from "@/lib/firebase";

export const getPatientsCount = async () => {
  try {
    const usersCollectionRef = collection(db, 'users'); 
    const q = query(usersCollectionRef, where('role', '==', 'PATIENT'));
    const snapshot = await getDocs(q);
    const patientsData = snapshot.docs.map(doc => doc.data());
    
    return patientsData.length; // Return the length of the patients data array
  } catch (error) {
    console.error('Error fetching patients:', error);
    throw error; // You can handle the error further up the call stack if needed
  }
};

// Usage example:
getPatientsCount()
  .then(count => {
    console.log(`Number of patients: ${count}`);
  })
  .catch(error => {
    console.error('Error fetching patients count:', error);
  });
