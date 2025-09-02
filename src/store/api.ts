import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react'; 

export const api = createApi({
  reducerPath: 'api',
  baseQuery: fetchBaseQuery({
   baseUrl: process.env.NODE_ENV === 'development' 
     ? '/api'  // Use local proxy in development
     : process.env.NEXT_PUBLIC_FIREBASE_CLOUD_FUNCTIONS_URL,
    prepareHeaders: (headers) => {
      const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;
      if (token) {
        headers.set('authorization', `Bearer ${token}`);
      }
      return headers;
    },
  }),
  tagTypes: ['Booking', 'Appointment', 'Patient', 'Payment', 'User', 'Doctor', 'Upload', 'Survey', 'BookingCancellation', 'DoctorOfTheMonth', 'Specialization'],
  endpoints: (builder) => ({
    // ===== AUTHENTICATION & USER MANAGEMENT =====
    generateTokenForUser: builder.mutation({
      query: (credentials) => ({
        url: '/generateTokenForUser',
        method: 'POST',
        body: credentials,
      }),
    }),
    
    createUser: builder.mutation({
      query: (userData) => ({
        url: '/createUser',
        method: 'POST',
        body: userData,
      }),
      invalidatesTags: ['User'],
    }),
    
    getUserById: builder.query({
      query: (userId) => ({
        url: '/getUserById',
        params: { userId },
      }),
      providesTags: (result, error, userId) => [{ type: 'User', id: userId }],
    }),
    
    updateUser: builder.mutation({
      query: ({ userId, ...userData }) => ({
        url: '/updateUser',
        method: 'PUT',
        body: { userId, ...userData },
      }),
      invalidatesTags: (result, error, { userId }) => [{ type: 'User', id: userId }],
    }),
    
    getUsers: builder.query({
      query: (params) => ({
        url: '/getUsers',
        params,
      }),
      providesTags: ['User'],
    }),
    
    getUsersByRole: builder.query({
      query: (role) => ({
        url: '/getUsersByRole',
        params: { role },
      }),
      providesTags: ['User'],
    }),
    
    emailVerification: builder.mutation({
      query: (emailData) => ({
        url: '/emailVerification',
        method: 'POST',
        body: emailData,
      }),
    }),
    
    sendPasswordResetLink: builder.mutation({
      query: (emailData) => ({
        url: '/sendPasswordResetLink',
        method: 'POST',
        body: emailData,
      }),
    }),
    
    sendWelcomeEmail: builder.mutation({
      query: (emailData) => ({
        url: '/sendWelcomeEmail',
        method: 'POST',
        body: emailData,
      }),
    }),
    
    getProfileImageUrl: builder.query({
      query: (userId) => ({
        url: '/getProfileImageUrl',
        params: { userId },
      }),
      providesTags: (result, error, userId) => [{ type: 'User', id: userId }],
    }),

    // ===== DOCTOR MANAGEMENT =====
    createDoctor: builder.mutation({
      query: (doctorData) => ({
        url: '/createDoctor',
        method: 'POST',
        body: doctorData,
      }),
      invalidatesTags: ['Doctor'],
    }),
    
    getDoctorById: builder.query({
      query: (doctorId) => ({
        url: '/getDoctorById',
        params: { doctorId },
      }),
      providesTags: (result, error, doctorId) => [{ type: 'Doctor', id: doctorId }],
    }),
    
    updateDoctor: builder.mutation({
      query: ({ doctorId, ...doctorData }) => ({
        url: '/updateDoctor',
        method: 'PUT',
        body: { doctorId, ...doctorData },
      }),
      invalidatesTags: (result, error, { doctorId }) => [{ type: 'Doctor', id: doctorId }],
    }),
    
    getDoctors: builder.query({
      query: (params) => ({
        url: '/getDoctors',
        params,
      }),
      providesTags: ['Doctor'],
    }),
    
    getActiveDoctors: builder.query({
      query: (params) => ({
        url: '/getActiveDoctors',
        params,
      }),
      providesTags: ['Doctor'],
    }),
    
    getDoctorsBySpecialization: builder.query({
      query: (specialization) => ({
        url: '/getDoctorsBySpecialization',
        params: { specialization },
      }),
      providesTags: ['Doctor'],
    }),
    
    getDoctorsBySpecializationCount: builder.query({
      query: (params) => ({
        url: '/getDoctorsBySpecializationCount',
        params,
      }),
      providesTags: ['Doctor'],
    }),
    
    updateDoctorAvailability: builder.mutation({
      query: ({ doctorId, availability }) => ({
        url: '/updateDoctorAvailability',
        method: 'PUT',
        body: { doctorId, availability },
      }),
      invalidatesTags: (result, error, { doctorId }) => [{ type: 'Doctor', id: doctorId }],
    }),
    
    rateDoctor: builder.mutation({
      query: (ratingData) => ({
        url: '/rateDoctor',
        method: 'POST',
        body: ratingData,
      }),
      invalidatesTags: ['Doctor'],
    }),

    // ===== PATIENT MANAGEMENT =====
    createPatientProfile: builder.mutation({
      query: (patientData) => ({
        url: '/createPatientProfile',
        method: 'POST',
        body: patientData,
      }),
      invalidatesTags: ['Patient'],
    }),
    
    getPatientProfile: builder.query({
      query: (patientId) => ({
        url: '/getPatientProfile',
        params: { patientId },
      }),
      providesTags: (result, error, patientId) => [{ type: 'Patient', id: patientId }],
    }),
    
    updatePatientProfile: builder.mutation({
      query: ({ patientId, ...patientData }) => ({
        url: '/updatePatientProfile',
        method: 'PUT',
        body: { patientId, ...patientData },
      }),
      invalidatesTags: (result, error, { patientId }) => [{ type: 'Patient', id: patientId }],
    }),
    
    getAllPatientProfiles: builder.query({
      query: (params) => ({
        url: '/getAllPatientProfiles',
        params,
      }),
      providesTags: ['Patient'],
    }),
    
    getPatientVitalsByDoctorId: builder.query({
      query: (doctorId) => ({
        url: '/getPatientVitalsByDoctorId',
        params: { doctorId },
      }),
      providesTags: ['Patient'],
    }),

    // Firebase-powered patient query
    getFirebasePatients: builder.query({
      async queryFn() {
        try {
          const { createFirebaseQuery, firebaseConstraints } = await import('@/lib/firebase-rtk');
          
          const patientsData = await createFirebaseQuery('users', [
            firebaseConstraints.where('role', '==', 'PATIENT')
          ]);
          
          return { data: patientsData };
        } catch (error) {
          console.error('Error fetching Firebase patients:', error);
          return { 
            error: { 
              status: 'FETCH_ERROR', 
              error: error instanceof Error ? error.message : 'Unknown error occurred' 
            } 
          };
        }
      },
      providesTags: ['Patient'],
    }),

    // Firebase-powered doctors query
    getFirebaseDoctors: builder.query({
      async queryFn() {
        try {
          const { createFirebaseQuery, firebaseConstraints } = await import('@/lib/firebase-rtk');
          
          const doctorsData = await createFirebaseQuery('users', [
            firebaseConstraints.where('role', '==', 'DOCTOR'),
            firebaseConstraints.orderBy('rating', 'desc'),
            firebaseConstraints.limit(10)
          ]);
          
          return { data: doctorsData };
        } catch (error) {
          console.error('Error fetching Firebase doctors:', error);
          return { 
            error: { 
              status: 'FETCH_ERROR', 
              error: error instanceof Error ? error.message : 'Unknown error occurred' 
            } 
          };
        }
      },
      providesTags: ['Doctor'],
    }),

    // Firebase-powered doctor profiles query
    getFirebaseDoctorProfiles: builder.query({
      async queryFn() {
        try {
          const { createFirebaseQuery } = await import('@/lib/firebase-rtk');
          
          const doctorsData = await createFirebaseQuery('doctorProfiles');
          
          return { data: doctorsData };
        } catch (error) {
          console.error('Error fetching Firebase doctor profiles:', error);
          return { 
            error: { 
              status: 'FETCH_ERROR', 
              error: error instanceof Error ? error.message : 'Unknown error occurred' 
            } 
          };
        }
      },
      providesTags: ['Doctor'],
    }),

    // Firebase-powered single doctor profile query
    getFirebaseDoctorProfileById: builder.query({
      async queryFn(doctorId: string) {
        try {
          const { collection, query, where, getDocs } = await import('firebase/firestore');
          const { db } = await import('@/lib/firebase');
          
          const doctorCollectionRef = collection(db, 'doctorProfiles');
          const q = query(doctorCollectionRef, where("doctorId", "==", doctorId));
          const querySnapshot = await getDocs(q);
          
          if (!querySnapshot.empty) {
            // Get the first matching document
            const doc = querySnapshot.docs[0];
            const data = doc.data();
            // Serialize the data to handle Firestore Timestamps
            const serializedData = Object.entries(data).reduce((acc, [key, value]) => {
              if (value && typeof value === 'object' && 'toDate' in value && typeof value.toDate === 'function') {
                acc[key] = value.toDate().toISOString();
              } else {
                acc[key] = value;
              }
              return acc;
            }, {} as Record<string, unknown>);
            
            return { data: { id: doc.id, ...serializedData } };
          } else {
            return { 
              error: { 
                status: 404, 
                data: 'Doctor not found' 
              } 
            };
          }
        } catch (error) {
          console.error('Error fetching Firebase doctor profile:', error);
          return { 
            error: { 
              status: 'FETCH_ERROR', 
              data: error instanceof Error ? error.message : 'Unknown error occurred' 
            } 
          };
        }
      },
      providesTags: (result, error, doctorId) => [{ type: 'Doctor', id: doctorId }],
    }),

    // Firebase-powered doctor of the month query
    getFirebaseDoctorOfTheMonth: builder.query({
      async queryFn() {
        try {
          const { createFirebaseQuery, firebaseConstraints } = await import('@/lib/firebase-rtk');
          
          const currentMonth = new Date().toISOString().slice(0, 7); // YYYY-MM
          const doctorData = await createFirebaseQuery('doctors', [
            firebaseConstraints.where('awardMonth', '==', currentMonth),
            firebaseConstraints.where('isDoctorOfMonth', '==', true),
            firebaseConstraints.limit(1)
          ]);
          
          return { data: doctorData[0] || null };
        } catch (error) {
          console.error('Error fetching Firebase doctor of the month:', error);
          return { 
            error: { 
              status: 'FETCH_ERROR', 
              error: error instanceof Error ? error.message : 'Unknown error occurred' 
            } 
          };
        }
      },
      providesTags: ['DoctorOfTheMonth'],
    }),

    // Firebase-powered all bookings query
    getFirebaseBookings: builder.query({
      async queryFn() {
        try {
          const { createFirebaseQuery, firebaseConstraints } = await import('@/lib/firebase-rtk');
          
          const bookingsData = await createFirebaseQuery('Bookings', [
            firebaseConstraints.orderBy('createdTime', 'desc')
          ]);
          
          return { data: bookingsData };
        } catch (error) {
          console.error('Error fetching Firebase bookings:', error);
          return { 
            error: { 
              status: 'FETCH_ERROR', 
              data: error instanceof Error ? error.message : 'Unknown error occurred' 
            } 
          };
        }
      },
      providesTags: ['Booking'],
    }),

    // ===== BOOKING & APPOINTMENT MANAGEMENT =====
    bookDoctorAppointment: builder.mutation({
      query: (appointmentData) => ({
        url: '/bookDoctorAppointment',
        method: 'POST',
        body: appointmentData,
      }),
      invalidatesTags: ['Booking', 'Appointment'],
    }),
    
    getBookings: builder.query({
      query: (params) => ({
        url: '/getBookings',
        params,
      }),
      providesTags: ['Booking'],
    }),
    
    getBookingsByUserId: builder.query({
      query: (userId) => ({
        url: '/getBookingsByUserId',
        params: { userId },
      }),
      providesTags: ['Booking'],
    }),
    
    getBookingsByDoctorId: builder.query({
      query: (doctorId) => ({
        url: '/getBookingsByDoctorId',
        params: { doctorId },
      }),
      providesTags: ['Booking'],
    }),
    
    getBookingById: builder.query({
      query: (bookingId) => ({
        url: '/getBookingById',
        params: { bookingId },
      }),
      providesTags: (result, error, bookingId) => [{ type: 'Booking', id: bookingId }],
    }),
    
    getPendingBookings: builder.query({
      query: (params) => ({
        url: '/getPendingBookings',
        params,
      }),
      providesTags: ['Booking'],
    }),
    
    getCompletedBookings: builder.query({
      query: (params) => ({
        url: '/getCompletedBookings',
        params,
      }),
      providesTags: ['Booking'],
    }),
    
    updateBookingStatus: builder.mutation({
      query: ({ bookingId, status }) => ({
        url: '/updateBookingStatus',
        method: 'PUT',
        body: { bookingId, status },
      }),
      invalidatesTags: (result, error, { bookingId }) => [{ type: 'Booking', id: bookingId }],
    }),
    
    rescheduleBooking: builder.mutation({
      query: (rescheduleData) => ({
        url: '/rescheduleBooking',
        method: 'PUT',
        body: rescheduleData,
      }),
      invalidatesTags: ['Booking'],
    }),
    
    cancelAppointment: builder.mutation({
      query: (cancellationData) => ({
        url: '/cancelAppointment',
        method: 'PUT',
        body: cancellationData,
      }),
      invalidatesTags: ['Booking', 'Appointment'],
    }),
    
    respondToBooking: builder.mutation({
      query: (responseData) => ({
        url: '/respondToBooking',
        method: 'PUT',
        body: responseData,
      }),
      invalidatesTags: ['Booking'],
    }),
    
    checkBookingEligibility: builder.query({
      query: (params) => ({
        url: '/checkBookingEligibility',
        params,
      }),
    }),

    // Create doctor appointment booking
    createDoctorAppointment: builder.mutation({
      query: ({ patientId, doctorId, bookingData }) => ({
        url: `/bookDoctorAppointment/${patientId}/${doctorId}`,
        method: 'POST',
        body: bookingData,
      }),
      invalidatesTags: ['Booking', 'Appointment'],
    }),

    // ===== BOOKING CANCELLATION =====
    getBookingCancellations: builder.query({
      async queryFn() {
        try {
          const { collection, query, where, getDocs } = await import('firebase/firestore');
          const { db } = await import('@/lib/firebase');
          
          const bookingsCollectionRef = collection(db, 'Bookings');
          
          // Create a query to filter documents where: 
          // - cancellationRequest exists (not null)
          const bookingsQuery = query(
            bookingsCollectionRef, 
            where('cancellationRequest', '!=', null)
          ); 
          
          // Fetch the documents that match the query
          const snapshot = await getDocs(bookingsQuery);

          // Extract the data from the documents and convert Firestore Timestamps to ISO strings
          const bookingsData = snapshot.docs.map(doc => {
            const data = doc.data();
            
            // Convert Firestore Timestamps to ISO strings for Redux serialization
            const convertedData: Record<string, unknown> = { id: doc.id };
            
            for (const [key, value] of Object.entries(data)) {
              if (value && typeof value === 'object' && 'toDate' in value && typeof value.toDate === 'function') {
                // This is a Firestore Timestamp, convert to ISO string
                convertedData[key] = (value as { toDate(): Date }).toDate().toISOString();
              } else if (value && typeof value === 'object' && value !== null) {
                // Handle nested objects (like cancellationRequest)
                convertedData[key] = {};
                for (const [nestedKey, nestedValue] of Object.entries(value)) {
                  if (nestedValue && typeof nestedValue === 'object' && 'toDate' in nestedValue && typeof nestedValue.toDate === 'function') {
                    (convertedData[key] as Record<string, unknown>)[nestedKey] = (nestedValue as { toDate(): Date }).toDate().toISOString();
                  } else {
                    (convertedData[key] as Record<string, unknown>)[nestedKey] = nestedValue;
                  }
                }
              } else {
                convertedData[key] = value;
              }
            }
            
            return convertedData;
          });

          return { data: bookingsData };
        } catch (error) {
          console.error('Error fetching Firebase cancellation requests:', error);
          return { 
            error: { 
              status: 'FETCH_ERROR', 
              error: error instanceof Error ? error.message : 'Unknown error occurred' 
            } 
          };
        }
      },
      providesTags: ['BookingCancellation'],
    }),
    
    bookingCancellationRequest: builder.mutation({
      query: (cancellationRequest) => ({
        url: '/bookingCancellationRequest',
        method: 'POST',
        body: cancellationRequest,
      }),
      invalidatesTags: ['Booking', 'BookingCancellation'],
    }),
    
    respondToCancellationRequest: builder.mutation({
      async queryFn(responseData) {
        try {
          const { doc, updateDoc } = await import('firebase/firestore');
          const { db } = await import('@/lib/firebase');
          
          const { bookingId, status, adminResponse } = responseData;
          
          // Update the booking document with the admin response
          const bookingRef = doc(db, 'Bookings', bookingId);
          await updateDoc(bookingRef, {
            'cancellationRequest.status': status,
            'cancellationRequest.adminResponse': adminResponse,
            'cancellationRequest.respondedAt': new Date().toISOString(),
            'cancellationRequest.respondedBy': 'admin' // You can get this from auth context
          });

          return { data: { success: true, bookingId, status } };
        } catch (error) {
          console.error('Error responding to cancellation request:', error);
          return { 
            error: { 
              status: 'FETCH_ERROR', 
              error: error instanceof Error ? error.message : 'Unknown error occurred' 
            } 
          };
        }
      },
      invalidatesTags: ['Booking', 'BookingCancellation'],
    }),



    // ===== SURVEYS & COMMENTS =====
    submitSurvey: builder.mutation({
      query: (surveyData) => ({
        url: '/submitSurvey',
        method: 'POST',
        body: surveyData,
      }),
      invalidatesTags: ['Survey'],
    }),
    
    makeComment: builder.mutation({
      query: (commentData) => ({
        url: '/makeComment',
        method: 'POST',
        body: commentData,
      }),
    }),

    // ===== DOCUMENT & UPLOAD MANAGEMENT =====
    getUploads: builder.query({
      query: (params) => ({
        url: '/getUploads',
        params,
      }),
      providesTags: ['Upload'],
    }),

    // ===== ADMIN DASHBOARD =====
    getAdminDashboard: builder.query({
      query: (params) => ({
        url: '/getAdminDashboard',
        params,
      }),
    }),

    // ===== DOCTOR OF THE MONTH =====
    triggerDoctorOfTheMonth: builder.mutation({
      query: () => ({
        url: '/triggerDoctorOfTheMonth',
        method: 'POST',
      }),
      invalidatesTags: ['Doctor'],
    }),

    // ===== TRIGGERED FUNCTIONS =====
    triggerSendAppointmentReminder: builder.mutation({
      query: () => ({
        url: '/triggerSendAppointmentReminder',
        method: 'POST',
      }),
    }),

    // ===== SPECIALIZATION MANAGEMENT =====
    getSpecializations: builder.query({
      async queryFn() {
        try {
          const { createFirebaseQuery } = await import('@/lib/firebase-rtk');
          
          const specializationsData = await createFirebaseQuery('specialization');
          
          return { data: specializationsData };
        } catch (error) {
          console.error('Error fetching Firebase specializations:', error);
          return { 
            error: { 
              status: 'FETCH_ERROR', 
              error: error instanceof Error ? error.message : 'Unknown error occurred' 
            } 
          };
        }
      },
      providesTags: ['Specialization'],
    }),

    createSpecialization: builder.mutation({
      async queryFn(specializationData) {
        try {
          const { createFirebaseDocument } = await import('@/lib/firebase-rtk');
          
          const result = await createFirebaseDocument('specialization', specializationData);
          
          return { data: result };
        } catch (error) {
          console.error('Error creating specialization:', error);
          return { 
            error: { 
              status: 'FETCH_ERROR', 
              error: error instanceof Error ? error.message : 'Unknown error occurred' 
            } 
          };
        }
      },
      invalidatesTags: ['Specialization'],
    }),

    updateSpecialization: builder.mutation({
      async queryFn({ id, ...specializationData }) {
        try {
          const { updateFirebaseDocument } = await import('@/lib/firebase-rtk');
          
          await updateFirebaseDocument('specialization', id, specializationData);
          
          return { data: { id, ...specializationData } };
        } catch (error) {
          console.error('Error updating specialization:', error);
          return { 
            error: { 
              status: 'FETCH_ERROR', 
              error: error instanceof Error ? error.message : 'Unknown error occurred' 
            } 
          };
        }
      },
      invalidatesTags: ['Specialization'],
    }),

    deleteSpecialization: builder.mutation({
      async queryFn(id) {
        try {
          const { deleteFirebaseDocument } = await import('@/lib/firebase-rtk');
          
          await deleteFirebaseDocument('specialization', id);
          
          return { data: { id } };
        } catch (error) {
          console.error('Error deleting specialization:', error);
          return { 
            error: { 
              status: 'FETCH_ERROR', 
              error: error instanceof Error ? error.message : 'Unknown error occurred' 
            } 
          };
        }
      },
      invalidatesTags: ['Specialization'],
    }),

    // ===== PAYMENTS MANAGEMENT =====
    getPayments: builder.query({
      async queryFn({ limit: limitCount = 10 }) {
        try {
          const { createFirebaseQuery, firebaseConstraints } = await import('@/lib/firebase-rtk');
          
          const paymentsData = await createFirebaseQuery('payments', [
            firebaseConstraints.limit(limitCount)
          ]);
          
          return { data: paymentsData };
        } catch (error) {
          console.error('Error fetching Firebase payments:', error);
          return { 
            error: { 
              status: 'FETCH_ERROR', 
              error: error instanceof Error ? error.message : 'Unknown error occurred' 
            } 
          };
        }
      },
      providesTags: ['Payment'],
    }),

    createPayment: builder.mutation({
      async queryFn(paymentData) {
        try {
          const { createFirebaseDocument } = await import('@/lib/firebase-rtk');
          
          const result = await createFirebaseDocument('payments', paymentData);
          
          return { data: result };
        } catch (error) {
          console.error('Error creating payment:', error);
          return { 
            error: { 
              status: 'FETCH_ERROR', 
              error: error instanceof Error ? error.message : 'Unknown error occurred' 
            } 
          };
        }
      },
      invalidatesTags: ['Payment'],
    }),

    updatePayment: builder.mutation({
      async queryFn({ id, ...paymentData }) {
        try {
          const { updateFirebaseDocument } = await import('@/lib/firebase-rtk');
          await updateFirebaseDocument('payments', id, paymentData);
          return { data: { id, ...paymentData } };
        } catch (error) {
          console.error('Error updating payment:', error);
          return { 
            error: { 
              status: 'FETCH_ERROR', 
              error: error instanceof Error ? error.message : 'Unknown error occurred' 
            } 
          };
        }
      },
      invalidatesTags: ['Payment'],
    }),

    deletePayment: builder.mutation({
      async queryFn(id) {
        try {
          const { deleteFirebaseDocument } = await import('@/lib/firebase-rtk');
          await deleteFirebaseDocument('payments', id);
          return { data: { id } };
        } catch (error) {
          console.error('Error deleting payment:', error);
          return { 
            error: { 
              status: 'FETCH_ERROR', 
              error: error instanceof Error ? error.message : 'Unknown error occurred' 
            } 
          };
        }
      },
      invalidatesTags: ['Payment'],
    }),

  }),
});

// Export all hooks
export const {
  // Authentication & User Management
  useGenerateTokenForUserMutation,
  useCreateUserMutation,
  useGetUserByIdQuery,
  useUpdateUserMutation,
  useGetUsersQuery,
  useGetUsersByRoleQuery,
  useEmailVerificationMutation,
  useSendPasswordResetLinkMutation,
  useSendWelcomeEmailMutation,
  useGetProfileImageUrlQuery,
  
  // Doctor Management
  useCreateDoctorMutation,
  useGetDoctorByIdQuery,
  useUpdateDoctorMutation,
  useGetDoctorsQuery,
  useGetActiveDoctorsQuery,
  useGetDoctorsBySpecializationQuery,
  useGetDoctorsBySpecializationCountQuery,
  useUpdateDoctorAvailabilityMutation,
  useRateDoctorMutation,
  
  // Patient Management
  useCreatePatientProfileMutation,
  useGetPatientProfileQuery,
  useUpdatePatientProfileMutation,
  useGetAllPatientProfilesQuery,
  useGetPatientVitalsByDoctorIdQuery,
  useGetFirebasePatientsQuery,
  useGetFirebaseDoctorsQuery,
  useGetFirebaseDoctorProfilesQuery,
  useGetFirebaseDoctorProfileByIdQuery,
  useGetFirebaseDoctorOfTheMonthQuery,
  useGetFirebaseBookingsQuery,
  
  // Booking & Appointment Management
  useBookDoctorAppointmentMutation,
  useGetBookingsQuery,
  useGetBookingsByUserIdQuery,
  useGetBookingsByDoctorIdQuery,
  useGetBookingByIdQuery,
  useGetPendingBookingsQuery,
  useGetCompletedBookingsQuery,
  useUpdateBookingStatusMutation,
  useRescheduleBookingMutation,
  useCancelAppointmentMutation,
  useRespondToBookingMutation,
  useCheckBookingEligibilityQuery,
  useCreateDoctorAppointmentMutation,
  
  // Booking Cancellation
  useGetBookingCancellationsQuery,
  useBookingCancellationRequestMutation,
  useRespondToCancellationRequestMutation,
  
  // Payment Management
  useGetPaymentsQuery,
  useCreatePaymentMutation,
  useUpdatePaymentMutation,
  useDeletePaymentMutation,
  
  // Surveys & Comments
  useSubmitSurveyMutation,
  useMakeCommentMutation,
  
  // Document & Upload Management
  useGetUploadsQuery,
  
  // Admin Dashboard
  useGetAdminDashboardQuery,
  
  // Doctor of the Month
  useTriggerDoctorOfTheMonthMutation,
  
  // Triggered Functions
  useTriggerSendAppointmentReminderMutation,
  
  // Specialization Management
  useGetSpecializationsQuery,
  useCreateSpecializationMutation,
  useUpdateSpecializationMutation,
  useDeleteSpecializationMutation,
} = api;
