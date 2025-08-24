import { collection, addDoc, query, getDocs, where } from 'firebase/firestore';
import { db } from "@/lib/firebase";

 // Function to create specialization
export const createSpecialization = async (name: string, description: string) => {
  const specializationCollectionRef = collection(db, 'specialization');

  // Query to check if the specialization already exists
  const q = query(specializationCollectionRef, where('name', '==', name));
  const querySnapshot = await getDocs(q);

  if (!querySnapshot.empty) {
    throw new Error('Specialization already exists');
  }

  // Add new specialization
  await addDoc(specializationCollectionRef, { name, description });
};