import { collection, getDocs, query, limit, addDoc, updateDoc, deleteDoc, doc } from 'firebase/firestore';
import { db } from './firebase';

export interface Payment {
  id: string;
  amount: number;
  currency: string;
  status: 'pending' | 'completed' | 'failed' | 'cancelled';
  paymentMethod: string;
  patientId?: string;
  doctorId?: string;
  bookingId?: string;
  description?: string;
  transactionId?: string;
  createdAt?: Date;
  updatedAt?: Date;
}

// Get payments with limit
export const getPaymentsCollection = async (limits: number = 10): Promise<Payment[]> => {
  try {
    const paymentsCollectionRef = collection(db, 'payments');
    const paymentsQuery = query(paymentsCollectionRef, limit(limits));

    const snapshot = await getDocs(paymentsQuery);
    const paymentsData = snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));

    return paymentsData;
  } catch (error) {
    console.error('Error fetching payments collection:', error);
    throw error;
  }
};

// Get all payments
export const getAllPayments = async (): Promise<Payment[]> => {
  try {
    const paymentsCollectionRef = collection(db, 'payments');
    const snapshot = await getDocs(paymentsCollectionRef);
    const paymentsData = snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));

    return paymentsData;
  } catch (error) {
    console.error('Error fetching all payments:', error);
    throw error;
  }
};

// Create a new payment
export const createPayment = async (data: Omit<Payment, 'id'>): Promise<Payment> => {
  try {
    const paymentsCollectionRef = collection(db, 'payments');
    const docRef = await addDoc(paymentsCollectionRef, {
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
    console.error('Error creating payment:', error);
    throw error;
  }
};

// Update a payment
export const updatePayment = async (id: string, data: Partial<Omit<Payment, 'id'>>): Promise<void> => {
  try {
    const paymentDocRef = doc(db, 'payments', id);
    await updateDoc(paymentDocRef, {
      ...data,
      updatedAt: new Date()
    });
  } catch (error) {
    console.error('Error updating payment:', error);
    throw error;
  }
};

// Delete a payment
export const deletePayment = async (id: string): Promise<void> => {
  try {
    const paymentDocRef = doc(db, 'payments', id);
    await deleteDoc(paymentDocRef);
  } catch (error) {
    console.error('Error deleting payment:', error);
    throw error;
  }
};

// Get payments by status
export const getPaymentsByStatus = async (status: Payment['status']): Promise<Payment[]> => {
  try {
    const paymentsCollectionRef = collection(db, 'payments');
    const snapshot = await getDocs(paymentsCollectionRef);
    const paymentsData = snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    })) as Payment[];

    return paymentsData.filter(payment => payment.status === status);
  } catch (error) {
    console.error('Error fetching payments by status:', error);
    throw error;
  }
};

// Get payments by patient ID
export const getPaymentsByPatientId = async (patientId: string): Promise<Payment[]> => {
  try {
    const paymentsCollectionRef = collection(db, 'payments');
    const snapshot = await getDocs(paymentsCollectionRef);
    const paymentsData = snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    })) as Payment[];

    return paymentsData.filter(payment => payment.patientId === patientId);
  } catch (error) {
    console.error('Error fetching payments by patient ID:', error);
    throw error;
  }
};

// Get payments by doctor ID
export const getPaymentsByDoctorId = async (doctorId: string): Promise<Payment[]> => {
  try {
    const paymentsCollectionRef = collection(db, 'payments');
    const snapshot = await getDocs(paymentsCollectionRef);
    const paymentsData = snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    })) as Payment[];

    return paymentsData.filter(payment => payment.doctorId === doctorId);
  } catch (error) {
    console.error('Error fetching payments by doctor ID:', error);
    throw error;
  }
};
