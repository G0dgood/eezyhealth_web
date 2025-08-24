import { collection, getDocs } from "firebase/firestore";
import { db } from "@/lib/firebase";

export const getUsers = async () => {
  try {
    const UsersCollectionRef = collection(db, 'users');
    const snapshot = await getDocs(UsersCollectionRef);
    
    // Map over the user data and fetch bookings for each user
    const UsersData = await Promise.all(snapshot.docs.map(async (doc) => {
      const userData = doc.data();
      const userId = doc.id;

      // Assuming there's a 'bookings' sub-collection for each user
      const bookingsCollectionRef = collection(db, `users/${userId}/bookings`);
      const bookingsSnapshot = await getDocs(bookingsCollectionRef);

      // Add the total bookings count to the user data
      return {
        ...userData,
        bookingsCount: bookingsSnapshot.size // Count the number of bookings
      };
    }));

    return UsersData;
  } catch (error) {
    console.error('Error fetching Users collection:', error);
    throw error;
  }
};

