import { useState, useEffect } from 'react';
import { collection, query, where, getDocs } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { serializeFirebaseData } from "@/lib/firebase-rtk";

interface BookingData {
  userId: string;
  patientName?: string;
  first_name?: string;
  photo_url?: string;
  timestamp?: string;
  lastMessage?: string;
  isOnline?: boolean;
  date?: string;
  id?: string;
  patientId?: string;
  doctorId?: string;
  doctorName?: string;
  specialization?: string;
  bookingDate?: string;
  bookingTime?: string;
  bookingStatus?: string;
  channel?: string;
  reason?: string;
  contactNumber?: string;
  createdTime?: string;
  updatedTime?: string;
  cancellationRequest?: {
    reason: string;
    status: string;
    requestedAt: string;
    adminResponse?: string;
  };
  [key: string]: unknown;
}

interface UseBookingsByDoctorIdReturn {
  data: BookingData[] | null;
  isLoading: boolean;
  error: string | null;
  refetch: () => Promise<void>;
}

export const useBookingsByDoctorId = (doctorId: string | null): UseBookingsByDoctorIdReturn => {
  const [data, setData] = useState<BookingData[] | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchBookings = async () => {
    if (!doctorId) {
      setData(null);
      setError(null);
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const bookingsCollectionRef = collection(db, 'Bookings');
      
      // Create a query to filter by doctorId
      const q = query(bookingsCollectionRef, where("doctorId", "==", doctorId));
      
      // Execute the query
      const snapshot = await getDocs(q);
      
      // Map the results to an array of booking data with proper serialization
      const bookingsData: BookingData[] = snapshot.docs.map(doc => {
        const docData = doc.data();
        const serializedData = serializeFirebaseData(docData) as Record<string, unknown>;
        
        return {
          id: doc.id,
          userId: serializedData.userId as string || serializedData.patientId as string || doc.id,
          patientName: serializedData.patientName as string,
          first_name: serializedData.first_name as string,
          photo_url: serializedData.photo_url as string,
          timestamp: serializedData.timestamp as string,
          lastMessage: serializedData.lastMessage as string,
          isOnline: serializedData.isOnline as boolean,
          date: serializedData.date as string,
          patientId: serializedData.patientId as string,
          doctorId: serializedData.doctorId as string,
          doctorName: serializedData.doctorName as string,
          specialization: serializedData.specialization as string,
          bookingDate: serializedData.bookingDate as string,
          bookingTime: serializedData.bookingTime as string,
          bookingStatus: serializedData.bookingStatus as string,
          channel: serializedData.channel as string,
          reason: serializedData.reason as string,
          contactNumber: serializedData.contactNumber as string,
          createdTime: serializedData.createdTime as string,
          updatedTime: serializedData.updatedTime as string,
          cancellationRequest: serializedData.cancellationRequest as {
            reason: string;
            status: string;
            requestedAt: string;
            adminResponse?: string;
          } | undefined,
        };
      });
      
      setData(bookingsData);
    } catch (err) {
      console.error('Error fetching Firebase bookings by doctor ID:', err);
      setError(err instanceof Error ? err.message : 'Unknown error');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchBookings();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [doctorId]);

  const refetch = async () => {
    await fetchBookings();
  };

  return {
    data,
    isLoading,
    error,
    refetch
  };
};

