import { collection, addDoc, serverTimestamp } from 'firebase/firestore';
import { db } from "@/lib/firebase";

export interface CreatePatientData {
  name: string;
  email: string;
  phone: string;
  dateOfBirth: string;
  gender: 'male' | 'female';
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
}

export const createPatient = async (patientData: CreatePatientData) => {
  try {
    const usersCollectionRef = collection(db, 'users');
    
    const patientDoc = {
      ...patientData,
      role: 'PATIENT',
      status: 'ACTIVE',
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
      isActive: true,
      // Generate a unique patient ID
      patientId: `P${Date.now()}`,
    };

    const docRef = await addDoc(usersCollectionRef, patientDoc);
    
    return {
      id: docRef.id,
      ...patientDoc,
      createdAt: new Date(),
      updatedAt: new Date(),
    };
  } catch (error) {
    console.error('Error creating patient:', error);
    throw error;
  }
};

 

