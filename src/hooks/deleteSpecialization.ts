import { doc, deleteDoc } from 'firebase/firestore';
import { db } from "@/lib/firebase";

export const deleteSpecialization = async (id: string) => {
  const specializationDocRef = doc(db, 'specialization', id);
  await deleteDoc(specializationDocRef);
};
