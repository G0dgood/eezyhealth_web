import { collection, getDocs } from 'firebase/firestore';
import { db } from "@/lib/firebase";
  // Assuming db is your Firebase Firestore database instance

export const getUploadCertification = async () => {
  try {
    const uploadsCollectionRef = collection(db, 'uploads');
    const snapshot = await getDocs(uploadsCollectionRef);
    const uploadsData = snapshot.docs.map(doc => doc.data());
    return uploadsData;
  } catch (error) {
    console.error('Error fetching uploads collection:', error);
    throw error; // You can handle the error further up the call stack if needed
  }
};

// Usage example:
getUploadCertification()
  .then(data => {  })
  .catch(error => {
    console.error('Error fetching uploads collection:', error);
  });
