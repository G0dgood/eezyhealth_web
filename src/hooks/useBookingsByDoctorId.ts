import { useState, useEffect, useCallback } from "react";
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
  slot?: string;
  bookingStatus?: string;
  channel?: string;
  reason?: string;
  consultationReason?: string;
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

export const useBookingsByDoctorId = (
  doctorId: string | null,
): UseBookingsByDoctorIdReturn => {
  const [data, setData] = useState<BookingData[] | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchBookings = useCallback(async () => {
    if (!doctorId) {
      setData(null);
      setError(null);
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      // Try 'Bookings' first
      let bookingsCollectionRef = collection(db, "Bookings");
      let q = query(bookingsCollectionRef, where("doctorId", "==", doctorId));
      let snapshot = await getDocs(q);

      // If empty, try 'bookings'
      if (snapshot.empty) {
        bookingsCollectionRef = collection(db, "bookings");
        q = query(bookingsCollectionRef, where("doctorId", "==", doctorId));
        snapshot = await getDocs(q);
      }

      // Map the results to an array of booking data with proper serialization
      const bookingsData: BookingData[] = snapshot.docs.map((doc) => {
        const docData = doc.data();
        const serializedData = serializeFirebaseData(docData) as Record<
          string,
          unknown
        >;

        return {
          id: doc.id,
          userId: (serializedData.userId as string) || (serializedData.patientId as string),
          patientId: (serializedData.patientId as string) || (serializedData.userId as string),
          bookingId: doc.id,
          
          // Patient Details
          patientName: (serializedData.patientFullName || serializedData.patientName || serializedData.patientDisplayName) as string,
          first_name: (serializedData.patientFirstName || serializedData.first_name) as string,
          photo_url: (serializedData.patientPhotoUrl || serializedData.photo_url) as string,
          contactNumber: (serializedData.patientPhone || serializedData.contactNumber) as string,
          
          // Doctor Details
          doctorId: serializedData.doctorId as string,
          doctorName: serializedData.doctorName as string,
          specialization: serializedData.specialization as string,
          
          // Booking Details
          bookingDate: serializedData.bookingDate as string,
          bookingTime: serializedData.bookingTime as string,
          slot: serializedData.slot as string,
          bookingStatus: serializedData.bookingStatus as string,
          channel: (serializedData.bookingChannel || serializedData.channel) as string,
          
          // Message/Reason
          consultationReason: (serializedData.consultationReason || serializedData.reason || "") as string,
          reason: (serializedData.reason || serializedData.consultationReason || "") as string,
          lastMessage: (serializedData.consultationReason || serializedData.reason || serializedData.lastMessage || "") as string,
          
          // Meta
          createdTime: (serializedData.createdTime || serializedData.createdAt) as string,
          updatedTime: (serializedData.updatedTime || serializedData.updatedAt) as string,
          timestamp: (serializedData.bookingDate || serializedData.timestamp) as string,
          isOnline: serializedData.isOnline as boolean,
          
          // Legacy/Other
          cancellationRequest: serializedData.cancellationRequest as any,
          consultationNote: (serializedData.consultationNote || serializedData.doctorComment) as string,
          doctorRecommendation: serializedData.doctorRecommendation as string,
          diagnosis: serializedData.diagnosis as string,
          prescriptions: serializedData.prescriptions as string[],
        };
      });

      setData(bookingsData);
    } catch (err) {
      console.error("Error fetching Firebase bookings by doctor ID:", err);
      setError(err instanceof Error ? err.message : "Unknown error");
    } finally {
      setIsLoading(false);
    }
  }, [doctorId]);

  useEffect(() => {
    fetchBookings();
  }, [fetchBookings]);

  const refetch = async () => {
    await fetchBookings();
  };

  return {
    data,
    isLoading,
    error,
    refetch,
  };
};
