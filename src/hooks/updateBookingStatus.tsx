import { collection, getDocs, doc, updateDoc } from "firebase/firestore";
import { db } from "@/lib/firebase";

// Function to get all bookings
export const getBookingsCollection = async () => {
	try {
		const bookingsCollectionRef = collection(db, 'Bookings');
		const snapshot = await getDocs(bookingsCollectionRef);
		const bookingsData = snapshot.docs.map(doc => ({
			id: doc.id, // Add the document ID
			...doc.data(),
		}));

		return bookingsData;
	} catch (error) {
		console.error('Error fetching bookings collection:', error);
		throw error; // Handle the error up the call stack if needed
	}
};

// Function to update booking status
export const updateBookingStatus = async (bookingId: string, newStatus: string) => {
	try {
		const bookingRef = doc(db, 'Bookings', bookingId);
		await updateDoc(bookingRef, {
			'cancellationRequest.status': newStatus,
			bookingStatus: newStatus === "approved" ? "Approved" : "Declined"
		});
		console.log(`Booking ${bookingId} updated to ${newStatus}`);
	} catch (error) {
		console.error(`Error updating booking status:`, error);
		throw error;
	}
};

// Usage example
getBookingsCollection()
	.then(data => {
		console.log('Bookings fetched:', data);
	})
	.catch(error => {
		console.error('Error fetching bookings collection:', error);
	});
