import { doc, updateDoc } from 'firebase/firestore';
import { db } from "@/lib/firebase";

export const updateSpecialization = async (id: string, updatedData: Record<string, unknown>) => {
  const specializationDocRef = doc(db, 'specialization', id);
  await updateDoc(specializationDocRef, updatedData);
};
