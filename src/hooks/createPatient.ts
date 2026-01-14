import { collection, addDoc, serverTimestamp } from 'firebase/firestore';
import { db } from "@/lib/firebase";

export interface CreatePatientData {
  name: string;
  email: string;
  phone: string;
  dateOfBirth: string;
  gender: "male" | "female";
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
    const usersCollectionRef = collection(db, "users");

    const patientDoc = {
      ...patientData,
      role: "patient",
      status: "ACTIVE",
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
      isActive: true,
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
    console.error("Error creating patient:", error);
    throw error;
  }
};

export interface CreateNurseData {
  first_name: string;
  last_name: string;
  email: string;
  phone_number: string;
  specialization?: string;
  hospital?: string;
  experience_yrs?: string;
  address?: string;
  about?: string;
}

export const createNurse = async (nurseData: CreateNurseData) => {
  try {
    const usersCollectionRef = collection(db, "users");

    const displayName = `${nurseData.first_name} ${nurseData.last_name}`.trim();

    const nurseDoc = {
      ...nurseData,
      display_name: displayName,
      role: "nurse" as const,
      status: "ACTIVE",
      isActive: true,
      createdTime: serverTimestamp(),
      updatedAt: serverTimestamp(),
      nurseId: `N${Date.now()}`,
    };

    const docRef = await addDoc(usersCollectionRef, nurseDoc);

    return {
      id: docRef.id,
      ...nurseDoc,
      createdTime: new Date().toISOString(),
      updatedAt: new Date(),
    };
  } catch (error) {
    console.error("Error creating nurse:", error);
    throw error;
  }
};

