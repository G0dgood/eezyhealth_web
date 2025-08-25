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
  id: string;
  patientName: string;
  appointmentDate: string;
  serviceType: string;
  amount: number;
  paymentMethod: PaymentMethod;
  status: DoctorPaymentStatus;
  transactionId: string;
  doctorName: string;
  specialization: string;
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
