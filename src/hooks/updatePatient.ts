import { doc, serverTimestamp, updateDoc } from 'firebase/firestore';
import { db } from "@/lib/firebase";

export interface UpdatePatientData {
  name?: string;
  email?: string;
  phone?: string;
  dateOfBirth?: string;
  gender?: 'male' | 'female';
  address?: string;
  emergencyContact?: {
    name: string;
    phone: string;
    relationship: string;
  };
  medicalHistory?: string[];
  allergies?: string[];
  bloodType?: string;
  height?: number;
  weight?: number;
  status?: 'ACTIVE' | 'INACTIVE' | 'SUSPENDED';
}

export const updatePatient = async (patientId: string, updateData: UpdatePatientData) => {
  try {
    const userDocRef = doc(db, 'users', patientId);
    
    const updateDataWithTimestamp = {
      ...updateData,
      updatedAt: serverTimestamp(),
    };

    await updateDoc(userDocRef, updateDataWithTimestamp);
    
    return {
      id: patientId,
      ...updateData,
      updatedAt: new Date(),
    };
  } catch (error) {
    console.error('Error updating patient:', error);
    throw error;
  }
};
