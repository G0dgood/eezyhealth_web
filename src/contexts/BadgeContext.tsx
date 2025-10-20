"use client";

import React, { createContext, useContext, useEffect, useState } from "react";
import { 
  useGetFirebasePatientsQuery,
  useGetFirebaseDoctorsQuery,
  useGetFirebaseNurseProfilesQuery,
  useGetFirebaseBookingsQuery,
  useGetBookingCancellationsQuery,
  useGetPaymentsQuery,
  useGetUsersByRoleQuery
} from "@/store/api";

interface BadgeCounts {
  // Users
  allUsers: number;
  doctors: number;
  nurses: number;
  
  // Bookings
  totalBookings: number;
  pendingBookings: number;
  cancelledBookings: number;
  
  // Payments
  totalPayments: number;
  pendingPayments: number;
  
  // Documents
  pendingDocuments: number;
  
  // Messages/Notifications
  unreadMessages: number;
  notifications: number;
}

interface BadgeContextType {
  badgeCounts: BadgeCounts;
  loading: boolean;
  error: string | null;
  refreshBadges: () => Promise<void>;
  updateBadgeCount: (key: keyof BadgeCounts, count: number) => void;
}

const BadgeContext = createContext<BadgeContextType | undefined>(undefined);

export function BadgeProvider({ children }: { children: React.ReactNode }) {
  const [badgeCounts, setBadgeCounts] = useState<BadgeCounts>({
    allUsers: 0,
    doctors: 0,
    nurses: 0,
    totalBookings: 0,
    pendingBookings: 0,
    cancelledBookings: 0,
    totalPayments: 0,
    pendingPayments: 0,
    pendingDocuments: 0,
    unreadMessages: 0,
    notifications: 0,
  });
  
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Real API calls using RTK Query hooks
  const { 
    data: patientsData, 
    isLoading: patientsLoading, 
    error: patientsError 
  } = useGetFirebasePatientsQuery({});
  
  const { 
    data: doctorsData, 
    isLoading: doctorsLoading, 
    error: doctorsError 
  } = useGetFirebaseDoctorsQuery({});
  
  const { 
    data: bookingsData, 
    isLoading: bookingsLoading, 
    error: bookingsError 
  } = useGetFirebaseBookingsQuery({});
  
  const { 
    data: cancellationsData, 
    isLoading: cancellationsLoading, 
    error: cancellationsError 
  } = useGetBookingCancellationsQuery({});
  
  const { 
    data: paymentsData, 
    isLoading: paymentsLoading, 
    error: paymentsError 
  } = useGetPaymentsQuery({ limit: 1000 });
  
  const { 
    data: nursesData, 
    isLoading: nursesLoading, 
    error: nursesError 
  } = useGetFirebaseNurseProfilesQuery({});

  // Calculate badge counts from real data
  useEffect(() => {
    const calculateBadgeCounts = () => {
      try {
        // Calculate user counts
        const allUsers = (patientsData?.length || 0) + (doctorsData?.length || 0) + (nursesData?.length || 0);
        const doctors = doctorsData?.length || 0;
        const nurses = Array.isArray(nursesData) ? nursesData.length : 0;
        
        // Calculate booking counts
        const totalBookings = bookingsData?.length || 0;
        const pendingBookings = bookingsData?.filter((booking: any) => 
          booking.status === 'pending' || booking.status === 'confirmed'
        ).length || 0;
        const cancelledBookings = cancellationsData?.length || 0;
        
        // Calculate payment counts
        const totalPayments = paymentsData?.length || 0;
        const pendingPayments = paymentsData?.filter((payment: any) => 
          payment.status === 'pending'
        ).length || 0;
        
        // Set badge counts
        setBadgeCounts({
          allUsers,
          doctors,
          nurses,
          totalBookings,
          pendingBookings,
          cancelledBookings,
          totalPayments,
          pendingPayments,
          pendingDocuments: 0, // Add document count when available
          unreadMessages: 0, // Add message count when available
          notifications: 0, // Add notification count when available
        });
        
        setError(null);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to calculate badge counts');
        console.error('Error calculating badge counts:', err);
      }
    };

    // Check if any API calls are still loading
    const isLoading = patientsLoading || doctorsLoading || nursesLoading || bookingsLoading || 
                     cancellationsLoading || paymentsLoading;
    
    setLoading(isLoading);
    
    // Calculate counts when data is available
    if (!isLoading) {
      calculateBadgeCounts();
    }
  }, [
    patientsData, doctorsData, nursesData, bookingsData, cancellationsData, paymentsData,
    patientsLoading, doctorsLoading, nursesLoading, bookingsLoading, cancellationsLoading, paymentsLoading
  ]);

  const refreshBadges = async () => {
    // RTK Query automatically handles refetching when components re-render
    // This function is kept for compatibility but doesn't need to do anything
    console.log('Badge refresh requested - RTK Query handles automatic refetching');
  };

  const updateBadgeCount = (key: keyof BadgeCounts, count: number) => {
    setBadgeCounts(prev => ({
      ...prev,
      [key]: count,
    }));
  };

  // RTK Query handles automatic caching and refetching
  // No need for manual refresh intervals as RTK Query manages this

  return (
    <BadgeContext.Provider value={{
      badgeCounts,
      loading,
      error,
      refreshBadges,
      updateBadgeCount,
    }}>
      {children}
    </BadgeContext.Provider>
  );
}

export function useBadges() {
  const context = useContext(BadgeContext);
  if (context === undefined) {
    throw new Error('useBadges must be used within a BadgeProvider');
  }
  return context;
}

// Helper function to get badge count for a specific navigation item
export const getBadgeCount = (badgeCounts: BadgeCounts, itemId: string, subItemId?: string): number => {
  if (subItemId) {
    // Handle sub-items
    switch (subItemId) {
      case 'all-users':
        return badgeCounts.allUsers;
      case 'doctors':
        return badgeCounts.doctors;
      case 'nurses':
        return badgeCounts.nurses;
      default:
        return 0;
    }
  }
  
  // Handle main items
  switch (itemId) {
    case 'bookings':
      return badgeCounts.totalBookings;
    case 'booking-cancellation':
      return badgeCounts.cancelledBookings;
    case 'payment':
      return badgeCounts.totalPayments;
    case 'document':
      return badgeCounts.pendingDocuments;
    case 'message':
      return badgeCounts.unreadMessages;
    case 'notifications':
      return badgeCounts.notifications;
    default:
      return 0;
  }
};
