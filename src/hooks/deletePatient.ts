import { doc, updateDoc, serverTimestamp } from 'firebase/firestore';
import { db } from "@/lib/firebase";

export const deletePatient = async (patientId: string) => {
  try {
    const userDocRef = doc(db, 'users', patientId);
    
    // Soft delete - mark as inactive instead of actually deleting
    await updateDoc(userDocRef, {
      isActive: false,
      status: 'INACTIVE',
      deletedAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    });
    
    return {
      id: patientId,
      deleted: true,
      deletedAt: new Date(),
    };
  } catch (error) {
    console.error('Error deleting patient:', error);
    throw error;
  }
};

// Hard delete version (use with caution)
export const hardDeletePatient = async (patientId: string) => {
  try {
    const userDocRef = doc(db, 'users', patientId);
    
    // Import deleteDoc from firebase/firestore
    const { deleteDoc } = await import('firebase/firestore');
    await deleteDoc(userDocRef);
    
    return {
      id: patientId,
      deleted: true,
    };
  } catch (error) {
    console.error('Error hard deleting patient:', error);
    throw error;
  }
};

