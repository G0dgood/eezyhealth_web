import { collection, getDocs, query } from 'firebase/firestore';
import { db } from "@/lib/firebase";  
  // Assuming db is your Firebase Firestore database instance

export const getDoctorOfTheMonth = async () => {
  try {
			const doctorOfTheMonthCollectionRef = collection(db, 'DoctorOfTheMonth');
			  const q = query(doctorOfTheMonthCollectionRef );
    const snapshot = await getDocs(q);
    const doctorsMonth = snapshot.docs.map(doc => doc.data()); 
			

    return doctorsMonth;
  } catch (error) {
    console.error('Error fetching Doctor Of The Month collection:', error);
    throw error; // You can handle the error further up the call stack if needed
  }
};

 
