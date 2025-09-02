import { collection, getDocs, addDoc, updateDoc, deleteDoc, doc } from 'firebase/firestore';
import { db } from './firebase';

export interface Specialization {
  id: string;
  name: string;
  description: string;
  doctorCount?: number;
  createdAt?: Date;
  updatedAt?: Date;
}

// Get all specializations
export const getSpecializationCollection = async (): Promise<Specialization[]> => {
  try {
    const specializationCollectionRef = collection(db, 'specialization');
    const snapshot = await getDocs(specializationCollectionRef);
    const specializationData = snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    })) as Specialization[];
    return specializationData;
  } catch (error) {
    console.error('Error fetching specialization collection:', error);
    throw error;
  }
};

// Create a new specialization
export const createSpecialization = async (data: Omit<Specialization, 'id'>): Promise<Specialization> => {
  try {
    const specializationCollectionRef = collection(db, 'specialization');
    const docRef = await addDoc(specializationCollectionRef, {
      ...data,
      createdAt: new Date(),
      updatedAt: new Date()
    });
    
    return {
      id: docRef.id,
      ...data,
      createdAt: new Date(),
      updatedAt: new Date()
    };
  } catch (error) {
    console.error('Error creating specialization:', error);
    throw error;
  }
};

// Update a specialization
export const updateSpecialization = async (id: string, data: Partial<Omit<Specialization, 'id'>>): Promise<void> => {
  try {
    const specializationDocRef = doc(db, 'specialization', id);
    await updateDoc(specializationDocRef, {
      ...data,
      updatedAt: new Date()
    });
  } catch (error) {
    console.error('Error updating specialization:', error);
    throw error;
  }
};

// Delete a specialization
export const deleteSpecialization = async (id: string): Promise<void> => {
  try {
    const specializationDocRef = doc(db, 'specialization', id);
    await deleteDoc(specializationDocRef);
  } catch (error) {
    console.error('Error deleting specialization:', error);
    throw error;
  }
};

// Get doctors count by specialization
export const getDoctorsBySpecializationCount = async (specializationId: string): Promise<number> => {
  try {
    const usersCollectionRef = collection(db, 'users');
    const snapshot = await getDocs(usersCollectionRef);
    const doctorsCount = snapshot.docs.filter(doc => {
      const userData = doc.data();
      return userData.role === 'DOCTOR' && userData.specializationId === specializationId;
    }).length;
    
    return doctorsCount;
  } catch (error) {
    console.error('Error getting doctors count by specialization:', error);
    throw error;
  }
};
