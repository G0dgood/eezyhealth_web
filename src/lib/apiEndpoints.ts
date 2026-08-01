// Firebase Cloud Functions Base URL
export const FIREBASE_CLOUD_FUNCTIONS_BASE = process.env.NEXT_PUBLIC_FIREBASE_CLOUD_FUNCTIONS_URL;

// API Endpoints Configuration
export const API_ENDPOINTS = {
  // Authentication & User Management
  generateTokenForUser: `${FIREBASE_CLOUD_FUNCTIONS_BASE}/generateTokenForUser`,
  createUser: `${FIREBASE_CLOUD_FUNCTIONS_BASE}/createUser`,
  getUserById: `${FIREBASE_CLOUD_FUNCTIONS_BASE}/getUserById`,
  updateUser: `${FIREBASE_CLOUD_FUNCTIONS_BASE}/updateUser`,
  getUsers: `${FIREBASE_CLOUD_FUNCTIONS_BASE}/getUsers`,
  getUsersByRole: `${FIREBASE_CLOUD_FUNCTIONS_BASE}/getUsersByRole`,
  emailVerification: `${FIREBASE_CLOUD_FUNCTIONS_BASE}/emailVerification`,
  sendPasswordResetLink: `${FIREBASE_CLOUD_FUNCTIONS_BASE}/sendPasswordResetLink`,
  sendWelcomeEmail: `${FIREBASE_CLOUD_FUNCTIONS_BASE}/sendWelcomeEmail`,
  getProfileImageUrl: `${FIREBASE_CLOUD_FUNCTIONS_BASE}/getProfileImageUrl`,

  // Doctor Management
  createDoctor: `${FIREBASE_CLOUD_FUNCTIONS_BASE}/createDoctor`,
  getDoctorById: `${FIREBASE_CLOUD_FUNCTIONS_BASE}/getDoctorById`,
  updateDoctor: `${FIREBASE_CLOUD_FUNCTIONS_BASE}/updateDoctor`,
  getDoctors: `${FIREBASE_CLOUD_FUNCTIONS_BASE}/getDoctors`,
  getActiveDoctors: `${FIREBASE_CLOUD_FUNCTIONS_BASE}/getActiveDoctors`,
  getDoctorsBySpecialization: `${FIREBASE_CLOUD_FUNCTIONS_BASE}/getDoctorsBySpecialization`,
  getDoctorsBySpecializationCount: `${FIREBASE_CLOUD_FUNCTIONS_BASE}/getDoctorsBySpecializationCount`,
  updateDoctorAvailability: `${FIREBASE_CLOUD_FUNCTIONS_BASE}/updateDoctorAvailability`,
  rateDoctor: `${FIREBASE_CLOUD_FUNCTIONS_BASE}/rateDoctor`,

  // Patient Management
  createPatientProfile: `${FIREBASE_CLOUD_FUNCTIONS_BASE}/createPatientProfile`,
  getPatientProfile: `${FIREBASE_CLOUD_FUNCTIONS_BASE}/getPatientProfile`,
  updatePatientProfile: `${FIREBASE_CLOUD_FUNCTIONS_BASE}/updatePatientProfile`,
  getAllPatientProfiles: `${FIREBASE_CLOUD_FUNCTIONS_BASE}/getAllPatientProfiles`,
  getPatientVitalsByDoctorId: `${FIREBASE_CLOUD_FUNCTIONS_BASE}/getPatientVitalsByDoctorId`,

  // Booking & Appointment Management
  bookDoctorAppointment: `${FIREBASE_CLOUD_FUNCTIONS_BASE}/bookDoctorAppointment`,
  getBookings: `${FIREBASE_CLOUD_FUNCTIONS_BASE}/getBookings`,
  getBookingsByUserId: `${FIREBASE_CLOUD_FUNCTIONS_BASE}/getBookingsByUserId`,
  getBookingsByDoctorId: `${FIREBASE_CLOUD_FUNCTIONS_BASE}/getBookingsByDoctorId`,
  getBookingById: `${FIREBASE_CLOUD_FUNCTIONS_BASE}/getBookingById`,
  getPendingBookings: `${FIREBASE_CLOUD_FUNCTIONS_BASE}/getPendingBookings`,
  getCompletedBookings: `${FIREBASE_CLOUD_FUNCTIONS_BASE}/getCompletedBookings`,
  updateBookingStatus: `${FIREBASE_CLOUD_FUNCTIONS_BASE}/updateBookingStatus`,
  rescheduleBooking: `${FIREBASE_CLOUD_FUNCTIONS_BASE}/rescheduleBooking`,
  cancelAppointment: `${FIREBASE_CLOUD_FUNCTIONS_BASE}/cancelAppointment`,
  respondToBooking: `${FIREBASE_CLOUD_FUNCTIONS_BASE}/respondToBooking`,
  checkBookingEligibility: `${FIREBASE_CLOUD_FUNCTIONS_BASE}/checkBookingEligibility`,

  // Booking Cancellation
  bookingCancellationRequest: `${FIREBASE_CLOUD_FUNCTIONS_BASE}/bookingCancellationRequest`,
  respondToCancellationRequest: `${FIREBASE_CLOUD_FUNCTIONS_BASE}/respondToCancellationRequest`,

  // Payment Management
  getPayments: `${FIREBASE_CLOUD_FUNCTIONS_BASE}/getPayments`,
  getPayment: `${FIREBASE_CLOUD_FUNCTIONS_BASE}/getPayment`,
  getPaymentById: `${FIREBASE_CLOUD_FUNCTIONS_BASE}/getPaymentById`,
  updatePaymentStatus: `${FIREBASE_CLOUD_FUNCTIONS_BASE}/updatePaymentStatus`,
  handlePaymentConfirmation: `${FIREBASE_CLOUD_FUNCTIONS_BASE}/handlePaymentConfirmation`,

  // Surveys & Comments
  submitSurvey: `${FIREBASE_CLOUD_FUNCTIONS_BASE}/submitSurvey`,
  makeComment: `${FIREBASE_CLOUD_FUNCTIONS_BASE}/makeComment`,

  // Document & Upload Management
  getUploads: `${FIREBASE_CLOUD_FUNCTIONS_BASE}/getUploads`,

  // Admin Dashboard
  getAdminDashboard: `${FIREBASE_CLOUD_FUNCTIONS_BASE}/getAdminDashboard`,

  // Doctor of the Month
  triggerDoctorOfTheMonth: `${FIREBASE_CLOUD_FUNCTIONS_BASE}/triggerDoctorOfTheMonth`,

  // Scheduled Functions (No direct routes)
  // sendAppointmentReminder - Scheduled every 5 mins
  // triggerSendAppointmentReminder - Triggered function
};

// API Helper Functions
export const apiHelpers = {
  // Generate full URL with query parameters
  buildUrl: (endpoint: string, params?: Record<string, string | number>) => {
    if (!params) return endpoint;
    
    const url = new URL(endpoint);
    Object.entries(params).forEach(([key, value]) => {
      url.searchParams.append(key, String(value));
    });
    return url.toString();
  },

  // Add authentication headers
  getAuthHeaders: (token?: string) => {
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
    };
    
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }
    
    return headers;
  },

  // Handle API responses
  handleResponse: async (response: Response) => {
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.message || `HTTP error! status: ${response.status}`);
    }
    return response.json();
  },
};

// Export individual endpoints for direct use
export const {
  generateTokenForUser,
  updatePaymentStatus,
  updateDoctor,
  getPatientVitalsByDoctorId,
  triggerDoctorOfTheMonth,
  getBookingsByUserId,
  getBookings,
  getPaymentById,
  bookingCancellationRequest,
  emailVerification,
  getBookingsByDoctorId,
  rescheduleBooking,
  submitSurvey,
  updateBookingStatus,
  rateDoctor,
  bookDoctorAppointment,
  getUsers,
  getProfileImageUrl,
  getPendingBookings,
  getUploads,
  createPatientProfile,
  getPayments,
  getActiveDoctors,
  checkBookingEligibility,
  sendWelcomeEmail,
  updatePatientProfile,
  getAdminDashboard,
  getBookingById,
  updateDoctorAvailability,
  updateUser,
  sendPasswordResetLink,
  getPayment,
  getDoctors,
  getAllPatientProfiles,
  getPatientProfile,
  createUser,
  getDoctorsBySpecializationCount,
  getUserById,
  getCompletedBookings,
  respondToCancellationRequest,
  getUsersByRole,
  getDoctorsBySpecialization,
  createDoctor,
  respondToBooking,
  cancelAppointment,
  getDoctorById,
  handlePaymentConfirmation,
  makeComment,
} = API_ENDPOINTS;
