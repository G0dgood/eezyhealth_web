import { collection, getDocs, doc, getDoc } from 'firebase/firestore';
import { db } from "@/lib/firebase";
  // Assuming db is your Firebase Firestore database instance

export const getDoctorsCollection = async () => {
  try {
    const doctorsCollectionRef = collection(db, 'doctorProfiles');
    const snapshot = await getDocs(doctorsCollectionRef);
    const doctorsData = snapshot.docs.map(doc => doc.data());
    return doctorsData;
  } catch (error) {
    console.error('Error fetching doctors collection:', error);
    throw error; // You can handle the error further up the call stack if needed
  }
};

export const getDoctorById = async (doctorId: string) => {
  try {
    const doctorDocRef = doc(db, 'doctorProfiles', doctorId);
    const doctorSnapshot = await getDoc(doctorDocRef);
    
    if (doctorSnapshot.exists()) {
      return { id: doctorSnapshot.id, ...doctorSnapshot.data() };
    } else {
      throw new Error('Doctor not found');
    }
  } catch (error) {
    console.error('Error fetching doctor by ID:', error);
    throw error;
  }
};

// Usage example:
getDoctorsCollection()
  .then(data => {  })
  .catch(error => {
    console.error('Error fetching doctors collection:', error);
  });
