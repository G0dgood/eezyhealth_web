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
  tagTypes: ['Booking', 'Appointment', 'Patient', 'Payment', 'User', 'Doctor', 'Upload', 'Survey', 'BookingCancellation', 'DoctorOfTheMonth'],
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

    // ===== BOOKING CANCELLATION =====
    getBookingCancellations: builder.query({
      query: (params) => ({
        url: '/getBookingCancellations',
        params,
      }),
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
      query: (responseData) => ({
        url: '/respondToCancellationRequest',
        method: 'PUT',
        body: responseData,
      }),
      invalidatesTags: ['Booking', 'BookingCancellation'],
    }),

    // ===== PAYMENT MANAGEMENT =====
    getPayments: builder.query({
      query: (params) => ({
        url: '/getPayments',
        params,
      }),
      providesTags: ['Payment'],
    }),
    
    getPayment: builder.query({
      query: (paymentId) => ({
        url: '/getPayment',
        params: { paymentId },
      }),
      providesTags: (result, error, paymentId) => [{ type: 'Payment', id: paymentId }],
    }),
    
    getPaymentById: builder.query({
      query: (paymentId) => ({
        url: '/getPaymentById',
        params: { paymentId },
      }),
      providesTags: (result, error, paymentId) => [{ type: 'Payment', id: paymentId }],
    }),
    
    updatePaymentStatus: builder.mutation({
      query: ({ paymentId, status }) => ({
        url: '/updatePaymentStatus',
        method: 'PUT',
        body: { paymentId, status },
      }),
      invalidatesTags: (result, error, { paymentId }) => [{ type: 'Payment', id: paymentId }],
    }),
    
    handlePaymentConfirmation: builder.mutation({
      query: (confirmationData) => ({
        url: '/handlePaymentConfirmation',
        method: 'POST',
        body: confirmationData,
      }),
      invalidatesTags: ['Payment'],
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
  useGetFirebaseDoctorOfTheMonthQuery,
  
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
  
  // Booking Cancellation
  useGetBookingCancellationsQuery,
  useBookingCancellationRequestMutation,
  useRespondToCancellationRequestMutation,
  
  // Payment Management
  useGetPaymentsQuery,
  useGetPaymentQuery,
  useGetPaymentByIdQuery,
  useUpdatePaymentStatusMutation,
  useHandlePaymentConfirmationMutation,
  
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
} = api;
