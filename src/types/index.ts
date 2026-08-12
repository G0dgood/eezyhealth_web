export interface StandardBookingData {
  userId: string;
  patientName: string;
  doctorId: string;
  doctorName: string;
  specialization: string;
  doctorPhotoUrl: string | null;
  hospital: string;
  photo_url: string;
  bookingDate: {
    _seconds: number;
    _nanoseconds: number;
  };
  slot: string;
  bookingChannel: string;
  bookingStatus: string;
  paymentStatus: string;
  comments: unknown[];
  patientAddress: string;
  bookingId: string;
  updatedAt?: string;
  patientAge?: number;
  reason?: string;
  consultationReason?: string;
  contactNumber?: string;
}

export interface RawBookingData {
  userId: string;
  patientName: string;
  doctorId: string;
  doctorName: string;
  specialization: string;
  doctorPhotoUrl?: string | null;
  hospital: string;
  photo_url: string;
  bookingDate: string | { _seconds: number; _nanoseconds: number };
  slot: string;
  bookingChannel: string;
  bookingStatus: string;
  paymentStatus: string;
  comments: unknown[];
  patientAddress: string;
  bookingId: string;
  updatedAt?: string;
  patientAge?: number | string;
  reason?: string;
  consultationReason?: string;
  description?: string;
  contactNumber?: string;
  patient?: {
    age?: number;
    phone?: string;
    name?: string;
  };
}

export type AppointmentStatus =
  | "pending"
  | "confirmed"
  | "rescheduled"
  | "completed"
  | "cancelled";
export type AppointmentChannel = "videoCall" | "chat" | "voiceCall" | "physical";

export interface DoctorAppointment {
  id: string;
  patientName: string;
  patientId: string;
  date: string;
  time: string;
  channel: AppointmentChannel;
  status: AppointmentStatus;
  patientAge: number;
  temperature: string;
  weight: string;
  bloodPressure: string;
  heartRate: string;
  reason: string;
  consultationNote: string;
  doctorRecommendation: string;
  diagnosis: string;
  prescriptions: string[];
}

export interface FirebaseBookingCancellation {
  id: string;
  bookingId?: string;
  doctorName?: string;
  patientName?: string;
  userId?: string;
  bookingDate?: string | { seconds: number; nanoseconds: number };
  bookingStatus?: string;
  hospital?: string;
  specialization?: string;
  cancellationRequest?: {
    status: string;
    reason?: string;
    adminResponse?: string;
    respondedAt?: string;
    respondedBy?: string;
  };
  [key: string]: unknown;
}

export type DoctorPaymentStatus = "Completed" | "Pending" | "Failed" | "Refunded";

export interface DoctorPayment {
  id: string;
  patientName: string;
  amount: number;
  paymentMethod: string;
  paymentStatus: DoctorPaymentStatus;
  transactionId: {
    reference: string;
  };
  paymentReference: {
    reference: string;
  };
  slot: string;
  date?: string;
}

export interface PaymentFilterData {
  dateRange: string;
  paymentStatus: DoctorPaymentStatus | "";
}

export interface TableColumn<T = any> {
  key: string;
  label: string;
  render?: (value: any, row: T) => any;
}

export interface AppointmentData {
  patientName: string;
  date: string;
  time: string;
  reason: string;
}

// Error Handling Types
export interface AppError extends Error {
  code?: string;
  status?: number | string;
  data?: unknown;
  details?: unknown;
}

export interface ApiError extends AppError {
  status: number;
  data?: unknown;
}

export interface FirebaseError extends AppError {
  code: string;
  message: string;
  name: string;
}

export interface NetworkError extends AppError {
  isNetworkError: true;
  retryable: boolean;
}

// Type Guards
export function isAppError(error: unknown): error is AppError {
  return error instanceof Error;
}

export function isApiError(error: unknown): error is ApiError {
  return isAppError(error) && typeof (error as ApiError).status === 'number';
}

export function isFirebaseError(error: unknown): error is FirebaseError {
  return (
    typeof error === 'object' &&
    error !== null &&
    'code' in error &&
    typeof (error as FirebaseError).code === 'string' &&
    (error as FirebaseError).code.startsWith('auth/') ||
    (error as FirebaseError).code.startsWith('firestore/') ||
    (error as FirebaseError).code.startsWith('storage/')
  );
}

export function isNetworkError(error: unknown): error is NetworkError {
  return isAppError(error) && 'isNetworkError' in error && (error as NetworkError).isNetworkError === true;
}

export function isValidationError(error: unknown): boolean {
  return isAppError(error) && error.message.toLowerCase().includes('validation');
}

export function isRTKQueryError(error: unknown): error is { status: number | string; data: unknown } {
  return (
    typeof error === 'object' &&
    error !== null &&
    'status' in error
  );
}

export function isError(error: unknown): error is Error {
  return error instanceof Error;
}

// Error Helpers
export function getErrorMessage(error: unknown): string {
  if (typeof error === 'string') return error;
  if (isAppError(error)) return error.message;
  if (isRTKQueryError(error)) {
    if (typeof error.data === 'string') return error.data;
    if (typeof error.data === 'object' && error.data !== null && 'message' in error.data) {
      return (error.data as { message: string }).message;
    }
    return 'An unknown error occurred';
  }
  return 'An unexpected error occurred';
}

export function getErrorCode(error: unknown): string | undefined {
  if (isFirebaseError(error)) return error.code;
  if (isAppError(error)) return error.code;
  return undefined;
}

export function getErrorStatus(error: unknown): number | string | undefined {
  if (isApiError(error)) return error.status;
  if (isRTKQueryError(error)) return error.status;
  if (isAppError(error)) return error.status;
  return undefined;
}
