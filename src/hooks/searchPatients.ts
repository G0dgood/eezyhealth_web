import { collection, query, where, getDocs, orderBy, limit, startAfter, QueryDocumentSnapshot, type QueryConstraint } from 'firebase/firestore';
import { db } from "@/lib/firebase";

export interface PatientSearchFilters {
  name?: string;
  email?: string;
  phone?: string;
  status?: 'ACTIVE' | 'INACTIVE' | 'SUSPENDED';
  gender?: 'male' | 'female';
  ageRange?: {
    min: number;
    max: number;
  };
  bloodType?: string;
  limit?: number;
}

export interface PatientSearchResult {
  id: string;
  name: string;
  email: string;
  phone: string;
  dateOfBirth: string;
  gender: 'male' | 'female';
  status: string;
  age: number;
  bloodType?: string;
  createdAt: Date;
  lastConsultation?: string;
}

export const searchPatients = async (
  filters: PatientSearchFilters = {},
  lastDoc?: QueryDocumentSnapshot
): Promise<{ patients: PatientSearchResult[]; lastDoc: QueryDocumentSnapshot | null }> => {
  try {
    const usersCollectionRef = collection(db, 'users');
    const constraints: QueryConstraint[] = [where('role', '==', 'patient'), where('isActive', '==', true)];
    
    // Add filters
    if (filters.name) {
      constraints.push(where('name', '>=', filters.name));
      constraints.push(where('name', '<=', filters.name + '\uf8ff'));
    }
    
    if (filters.email) {
      constraints.push(where('email', '==', filters.email));
    }
    
    if (filters.phone) {
      constraints.push(where('phone', '==', filters.phone));
    }
    
    if (filters.status) {
      constraints.push(where('status', '==', filters.status));
    }
    
    if (filters.gender) {
      constraints.push(where('gender', '==', filters.gender));
    }
    
    if (filters.bloodType) {
      constraints.push(where('bloodType', '==', filters.bloodType));
    }
    
    // Add pagination
    if (lastDoc) {
      constraints.push(startAfter(lastDoc));
    }
    
    constraints.push(orderBy('name', 'asc'));
    constraints.push(limit(filters.limit || 20));
    
    const q = query(usersCollectionRef, ...constraints);
    const snapshot = await getDocs(q);
    
    const patients: PatientSearchResult[] = [];
    
    snapshot.forEach((doc) => {
      const data = doc.data();
      const birthDate = new Date(data.dateOfBirth);
      const age = Math.floor((Date.now() - birthDate.getTime()) / (1000 * 60 * 60 * 24 * 365.25));
      
      patients.push({
        id: doc.id,
        name: data.name || '',
        email: data.email || '',
        phone: data.phone || '',
        dateOfBirth: data.dateOfBirth || '',
        gender: data.gender || 'male',
        status: data.status || 'ACTIVE',
        age,
        bloodType: data.bloodType,
        createdAt: data.createdAt?.toDate() || new Date(),
        lastConsultation: data.lastConsultation,
      });
    });
    
    const lastVisible = snapshot.docs[snapshot.docs.length - 1] || null;
    
    return {
      patients,
      lastDoc: lastVisible,
    };
  } catch (error) {
    console.error('Error searching patients:', error);
    throw error;
  }
};

// Get patients with pagination
export const getPatientsPaginated = async (
  page: number = 1,
  pageSize: number = 20,
  filters: PatientSearchFilters = {}
) => {
  try {
    const result = await searchPatients(filters, undefined);
    const totalPatients = result.patients.length;
    const totalPages = Math.ceil(totalPatients / pageSize);
    
    return {
      patients: result.patients,
      pagination: {
        currentPage: page,
        totalPages,
        totalPatients,
        hasNextPage: page < totalPages,
        hasPreviousPage: page > 1,
      },
    };
  } catch (error) {
    console.error('Error getting paginated patients:', error);
    throw error;
  }
};

