import { collection, query, where, getDocs } from "firebase/firestore";
import { db } from "@/lib/firebase";

// Function to get pending cancellation requests
export const getCancellationRequest = async () => {
  try {
    const bookingsCollectionRef = collection(db, 'Bookings');
    
    // Create a query to filter documents where: 
    // - cancellationRequest.status is 'pending' 
    const bookingsQuery = query(
      bookingsCollectionRef, 
      where('cancellationRequest.status', '==', 'pending'), 
    ); 
    // Fetch the documents that match the query
    const snapshot = await getDocs(bookingsQuery);

    // Extract the data from the documents
    const bookingsData = snapshot.docs.map(doc => ({
      id: doc.id, // Get the document ID
      ...doc.data() // Spread the document data into the object
    }));

    return bookingsData;
  } catch (error) {
    console.error('Error fetching bookings collection:', error);
    throw error; // You can handle the error further up the call stack if needed
  }
};

// Usage example:
getCancellationRequest()
  .then(data => {
    console.log('Pending cancellation requests:', data);
  })
  .catch(error => {
    console.error('Error fetching bookings collection:', error);
  });
