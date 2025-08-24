import { collection, query, where, getDocs } from "firebase/firestore";
import { db } from "@/lib/firebase";

export const getBookingsByDoctorId = async (doctorId: unknown) => {
  try {
    const bookingsCollectionRef = collection(db, 'Bookings');
    
    // Create a query to filter by doctorId
    const q = query(bookingsCollectionRef, where("doctorId", "==", doctorId));
    
    // Execute the query
    const snapshot = await getDocs(q);
    
    // Map the results to an array of booking data
    const bookingsData = snapshot.docs.map(doc => doc.data());
    
    return bookingsData;
  } catch (error) {
    console.error('Error fetching bookings by doctorId:', error);
    throw error;
  }
};

 