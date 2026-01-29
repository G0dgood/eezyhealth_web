/**
 * Utility functions to convert and standardize booking data formats
 */

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

/**
 * Converts a date string to Firebase timestamp format
 * @param dateString - Date string in format "YYYY-MM-DD"
 * @returns Firebase timestamp object
 */
function convertDateStringToTimestamp(dateString: string): {
  _seconds: number;
  _nanoseconds: number;
} {
  const date = new Date(dateString);
  return {
    _seconds: Math.floor(date.getTime() / 1000),
    _nanoseconds: 0,
  };
}

/**
 * Converts raw booking data to standardized format
 * @param rawBooking - Raw booking data object
 * @returns Standardized booking data
 */
export function convertBookingToStandardFormat(
  rawBooking: RawBookingData,
): StandardBookingData {
  // Handle bookingDate conversion
  let bookingDate: { _seconds: number; _nanoseconds: number };

  if (typeof rawBooking.bookingDate === "string") {
    bookingDate = convertDateStringToTimestamp(rawBooking.bookingDate);
  } else {
    bookingDate = rawBooking.bookingDate;
  }

  return {
    userId: rawBooking.userId,
    patientName: rawBooking.patientName,
    doctorId: rawBooking.doctorId,
    doctorName: rawBooking.doctorName,
    specialization: rawBooking.specialization,
    doctorPhotoUrl: rawBooking.doctorPhotoUrl || null,
    hospital: rawBooking.hospital,
    photo_url: rawBooking.photo_url,
    bookingDate,
    slot: rawBooking.slot,
    bookingChannel: rawBooking.bookingChannel,
    bookingStatus: rawBooking.bookingStatus,
    paymentStatus: rawBooking.paymentStatus,
    comments: rawBooking.comments || [],
    patientAddress: rawBooking.patientAddress,
    bookingId: rawBooking.bookingId,
    updatedAt: rawBooking.updatedAt,
    patientAge:
      Number(rawBooking.patientAge) ||
      (rawBooking.patient?.age ? Number(rawBooking.patient.age) : 0),
    reason: rawBooking.reason || rawBooking.description || "No reason provided",
    contactNumber:
      rawBooking.contactNumber || rawBooking.patient?.phone || "No contact",
  };
}

/**
 * Converts an array of raw booking data to standardized format
 * @param rawBookings - Array of raw booking data objects
 * @returns Array of standardized booking data
 */
export function convertBookingsToStandardFormat(
  rawBookings: RawBookingData[],
): StandardBookingData[] {
  return rawBookings.map(convertBookingToStandardFormat);
}

/**
 * Validates if booking data matches the standard format
 * @param booking - Booking data to validate
 * @returns True if booking matches standard format
 */
export function isValidStandardBooking(
  booking: unknown,
): booking is StandardBookingData {
  if (!booking || typeof booking !== "object") {
    return false;
  }

  const b = booking as Record<string, unknown>;

  return (
    typeof b.userId === "string" &&
    typeof b.patientName === "string" &&
    typeof b.doctorId === "string" &&
    typeof b.doctorName === "string" &&
    typeof b.specialization === "string" &&
    (b.doctorPhotoUrl === null || typeof b.doctorPhotoUrl === "string") &&
    typeof b.hospital === "string" &&
    typeof b.photo_url === "string" &&
    typeof b.bookingDate === "object" &&
    b.bookingDate !== null &&
    typeof (b.bookingDate as any)._seconds === "number" &&
    typeof (b.bookingDate as any)._nanoseconds === "number" &&
    typeof b.slot === "string" &&
    typeof b.bookingChannel === "string" &&
    typeof b.bookingStatus === "string" &&
    typeof b.paymentStatus === "string" &&
    Array.isArray(b.comments) &&
    typeof b.patientAddress === "string" &&
    typeof b.bookingId === "string"
  );
}
