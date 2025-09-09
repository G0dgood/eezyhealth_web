// Payment related types
export interface Payment {
  transactionId: string;
  patient: string;
  doctor: string;
  date: string;
  amount: string;
  method: string;
  status: string;
}

// Doctor Payment types
export interface DoctorPayment {
  id?: string;
  amount: number;
  bookingDate: string;
  channel: string;
  createdAt: string;
  currency: string;
  doctorId: string;
  patientId: string;
  patientName: string;
  paymentDate: string;
  paymentMethod: string;
  paymentReference: {
    message: string;
    redirecturl: string;
    reference: string;
    status: string;
    trans: string;
    transaction: string;
    trxref: string;
  };
  paymentStatus: string;
  reason: string;
  slot: string;
  transactionId: {
    message: string;
    redirecturl: string;
    reference: string;
    status: string;
    trans: string;
    transaction: string;
    trxref: string;
  };
  updatedAt: string;
}

export interface PaymentFilterData {
  dateRange: string;
  paymentStatus: DoctorPaymentStatus | "";
}

export type DoctorPaymentStatus = "Completed" | "Pending" | "Failed" | "Refunded";

// Doctor Appointment types
export interface DoctorAppointment {
  id: string;
  patientName: string;
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
}

export type AppointmentStatus = "pending" | "completed" | "cancelled";
export type AppointmentChannel = "videoCall" | "chat" | "voiceCall";

// User related types
export interface User {
  id: string;
  name: string;
  email: string;
  role: string;
  status: string;
}

// Doctor related types
export interface Doctor {
  id: string;
  name: string;
  specialization: string;
  email: string;
  phone: string;
  status: string;
}

// Patient related types
export interface Patient {
  id: string;
  name: string;
  email: string;
  phone: string;
  dateOfBirth: string;
  status: string;
}

// Appointment related types
export interface Appointment {
  id: string;
  patientName: string;
  doctorName: string;
  date: string;
  time: string;
  status: string;
  type: string;
}

// Booking cancellation types
export interface BookingCancellation {
  doctor: string;
  patientName: string;
  userId: string;
  date: string;
  status: string;
}

// Vital signs types
export interface VitalSigns {
  id: string;
  patientName: string;
  temperature: string;
  bloodPressure: string;
  heartRate: string;
  respiratoryRate: string;
  date: string;
}

// Table column types
export interface TableColumn<T = unknown> {
  key: string;
  label: string;
  render?: (value: string | number, row: T) => React.ReactNode;
}

// Breadcrumb item type
export interface BreadcrumbItem {
  label: string;
  href?: string;
}

// Modal props type
export interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  size?: 'sm' | 'md' | 'lg' | 'xl';
  children: React.ReactNode;
}

// Form input types
export interface FormInputProps {
  label: string;
  value: string;
  onChange: (value: string) => void;
  type?: string;
  placeholder?: string;
  required?: boolean;
  error?: string;
}

// Status types
export type StatusType = 'pending' | 'approved' | 'rejected' | 'completed' | 'failed';

// Payment method types
export type PaymentMethod = 'Credit Card' | 'Bank Transfer' | 'Cash' | 'Mobile Money';

// User role types
export type UserRole = 'admin' | 'doctor' | 'nurse' | 'patient';

// Define the Firebase data structure for booking cancellations
export interface FirebaseBookingCancellation {
  id: string;
  bookingChannel?: string;
  bookingDate?: string; // ISO date string from Firebase
  bookingId?: string;
  bookingStatus?: string;
  comments?: unknown[];
  doctorId?: string;
  doctorName?: string;
  doctorPhotoUrl?: string;
  hospital?: string;
  patientAddress?: string;
  patientName?: string;
  paymentStatus?: string;
  photo_url?: string;
  slot?: string;
  specialization?: string;
  userId?: string;
  cancellationRequest?: {
    status?: string;
    reason?: string;
    requestedAt?: string; // ISO date string from Firebase
    adminResponse?: string;
    respondedAt?: string; // ISO date string from Firebase
    respondedBy?: string;
  };
}

export interface AppointmentData {
  patientName: string;
  date: string;
  time: string;
  reason: string;
}

// ===== ERROR HANDLING TYPES =====

// Base error interface
export interface AppError {
  message: string;
  code?: string;
  status?: number | string;
  details?: unknown;
}

// API error types
export interface ApiError extends AppError {
  status: number;
  endpoint?: string;
  method?: string;
  timestamp?: string;
}

// Firebase error types
export interface FirebaseError extends AppError {
  code: string;
  path?: string;
  operation?: string;
}

// Network error types
export interface NetworkError extends AppError {
  isNetworkError: boolean;
  retryable: boolean;
}

// Validation error types
export interface ValidationError extends AppError {
  field: string;
  value: unknown;
  rule: string;
}

// Generic error handler function type
export type ErrorHandler = (error: unknown) => void;

// Error with context
export interface ErrorWithContext extends AppError {
  context: {
    component?: string;
    action?: string;
    userId?: string;
    timestamp: string;
  };
}

// RTK Query error types
export interface RTKQueryError extends AppError {
  status: number | string; // Override the base status to allow both number and string
  data?: unknown;
  originalStatus?: number;
}

// ===== ERROR UTILITY TYPES =====

// Type guard for checking if value is an error
export function isError(value: unknown): value is AppError {
  return (
    typeof value === 'object' &&
    value !== null &&
    'message' in value &&
    typeof (value as AppError).message === 'string'
  );
}

// Type guard for checking if value is an API error
export function isApiError(value: unknown): value is ApiError {
  return isError(value) && 'status' in value && typeof (value as ApiError).status === 'number';
}

// Type guard for checking if value is a Firebase error
export function isFirebaseError(value: unknown): value is FirebaseError {
  return isError(value) && 'code' in value && typeof (value as FirebaseError).code === 'string';
}

// Type guard for checking if value is a network error
export function isNetworkError(value: unknown): value is NetworkError {
  return isError(value) && 'isNetworkError' in value && (value as NetworkError).isNetworkError === true;
}

// Type guard for checking if value is a validation error
export function isValidationError(value: unknown): value is ValidationError {
  return isError(value) && 'field' in value && typeof (value as ValidationError).field === 'string';
}

// Type guard for checking if value is an RTK Query error
export function isRTKQueryError(value: unknown): value is RTKQueryError {
  return isError(value) && 'status' in value;
}

// ===== ERROR MESSAGE EXTRACTORS =====

// Extract error message from any error type
export function getErrorMessage(error: unknown): string {
  if (isError(error)) {
    return error.message;
  }
  
  if (typeof error === 'string') {
    return error;
  }
  
  if (error instanceof Error) {
    return error.message;
  }
  
  if (typeof error === 'object' && error !== null) {
    // Try to extract message from common error objects
    const errorObj = error as Record<string, unknown>;
    
    if ('message' in errorObj && typeof errorObj.message === 'string') {
      return errorObj.message;
    }
    
    if ('error' in errorObj && typeof errorObj.error === 'string') {
      return errorObj.error;
    }
    
    if ('msg' in errorObj && typeof errorObj.msg === 'string') {
      return errorObj.msg;
    }
  }
  
  return 'An unexpected error occurred';
}

// Extract error code from any error type
export function getErrorCode(error: unknown): string | undefined {
  if (isError(error) && error.code) {
    return error.code;
  }
  
  if (error instanceof Error && 'code' in error) {
    const errorWithCode = error as Error & { code: unknown };
    return typeof errorWithCode.code === 'string' ? errorWithCode.code : String(errorWithCode.code);
  }
  
  if (typeof error === 'object' && error !== null && 'code' in error) {
    const errorObj = error as Record<string, unknown>;
    return String(errorObj.code);
  }
  
  return undefined;
}

// Extract error status from any error type
export function getErrorStatus(error: unknown): number | undefined {
  if (isApiError(error)) {
    return error.status;
  }
  
  if (error instanceof Error && 'status' in error) {
    const errorWithStatus = error as Error & { status: unknown };
    return typeof errorWithStatus.status === 'number' ? errorWithStatus.status : undefined;
  }
  
  if (typeof error === 'object' && error !== null && 'status' in error) {
    const errorObj = error as Record<string, unknown>;
    const status = errorObj.status;
    return typeof status === 'number' ? status : undefined;
  }
  
  return undefined;
}