import { collection, getDocs } from "firebase/firestore";
import { db } from "@/lib/firebase";

 

export const getBookingsCollection = async () => {
  try {   
			
			   const bookingsCollectionRef = collection(db, 'Bookings');
    const snapshot = await getDocs(bookingsCollectionRef);
    const bookingsData = snapshot.docs.map(doc => doc.data());
   

    return bookingsData;
  } catch (error) {
    console.error('Error fetching bookings collection:', error);
    throw error; // You can handle the error further up the call stack if needed
  }
};

// Usage example:
getBookingsCollection()
  .then(data => {  })
  .catch(error => {
    console.error('Error fetching bookings collection:', error);
  });

 

