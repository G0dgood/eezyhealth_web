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
  description?: string;
  contactNumber?: string;
  patient?: {
    age?: number;
    phone?: string;
    name?: string;
  };
}

export type AppointmentStatus = "pending" | "completed" | "cancelled";
export type AppointmentChannel = "videoCall" | "chat" | "voiceCall";

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
