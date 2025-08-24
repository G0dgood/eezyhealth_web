import { collection, getDocs } from 'firebase/firestore';
import { db } from "@/lib/firebase";

// Assuming db is your Firebase Firestore database instance

export const getSpecializationCollection = async () => {
  const specializationCollectionRef = collection(db, 'specialization');
  const snapshot = await getDocs(specializationCollectionRef);
  const specializationData = snapshot.docs.map(doc => ({
    id: doc.id,        // Include the document ID
    ...doc.data()      // Include the rest of the document data
  }));
  return specializationData;
};

// Usage example:
getSpecializationCollection()
  .then(data => {  
  })
  .catch(error => {
    console.error('Error fetching specialization collection:', error);
  });
