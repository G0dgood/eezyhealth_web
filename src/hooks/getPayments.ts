 
import { db } from '@/lib/firebase';
import { collection, getDocs, query, limit } from 'firebase/firestore';


export const getPaymentsCollection = async (limits: number,) => {
  try {
    const paymentsCollectionRef = collection(db, 'payments');
    const paymentsQuery = query(paymentsCollectionRef, limit(limits)); // Fetches the first 5 documents

    const snapshot = await getDocs(paymentsQuery);
    const paymentsData = snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));

 
    return paymentsData;
  } catch (error) {
    console.error('Error fetching payments collection:', error);
    throw error;
  }
};
