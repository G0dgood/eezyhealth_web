import { doc, updateDoc, setDoc, collection, where, query, getDocs } from 'firebase/firestore';
import { db } from './firebase'; // Import Firestore db instance

export const saveAvailability = async (doctorId: string, selectedSlots: Record<string, unknown>) => {
  try {
    // Reference the doctorProfiles collection
    const doctorCollectionRef = collection(db, 'doctorProfiles');

    // Query the collection for the document where doctorId matches the passed doctorId
    const q = query(doctorCollectionRef, where('doctorId', '==', doctorId));

    // Execute the query and get the matching documents
    const querySnapshot = await getDocs(q);

    // Check if any document exists
    if (!querySnapshot.empty) {
      // Get the document ID of the matching doctor profile
      const doctorDocRef = doc(db, 'doctorProfiles', querySnapshot.docs[0].id);

      // Update the availability for the existing document
      await updateDoc(doctorDocRef, { availability: selectedSlots });
    } else {
      // If no document exists, create a new one with the provided doctorId and availability
      const newDoctorDocRef = doc(doctorCollectionRef); // This creates a new document reference
      await setDoc(newDoctorDocRef, {
        doctorId: doctorId,
        availability: selectedSlots,
      });
    }
  } catch (error) {
    console.error('Error saving availability: ', error);
    throw new Error('Failed to save availability.');
  }
};

export const getDoctorDetails = async (doctorId: string) => {
  try {
    const doctorCollectionRef = collection(db, 'doctorProfiles');
    const q = query(doctorCollectionRef, where('doctorId', '==', doctorId));
    const querySnapshot = await getDocs(q);

    if (!querySnapshot.empty) {
      const doc = querySnapshot.docs[0];
      const data = doc.data();
      
      // Serialize the data to handle Firestore Timestamps
      const serializedData = Object.entries(data).reduce((acc, [key, value]) => {
        if (value && typeof value === 'object' && 'toDate' in value && typeof value.toDate === 'function') {
          acc[key] = value.toDate().toISOString();
        } else {
          acc[key] = value;
        }
        return acc;
      }, {} as Record<string, unknown>);
      
      return { id: doc.id, ...serializedData };
    } else {
      throw new Error('Doctor profile not found');
    }
  } catch (error) {
    console.error('Error fetching doctor details: ', error);
    throw new Error('Failed to fetch doctor details.');
  }
};
