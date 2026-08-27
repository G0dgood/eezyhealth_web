/**
 * Booking status semantics
 * ------------------------
 * Time slots are not stored with an available/reserved/booked state. A slot is
 * blocked purely by deriving it: if a booking exists for that doctor + date +
 * slot and that booking still "occupies" the slot, the slot is unavailable.
 *
 * The status vocabulary is written by many places with inconsistent casing
 * ("Cancelled" from mobile, "cancelled" from Finance, "canceled" in places), so
 * every comparison MUST be case-insensitive. Comparing with === against a
 * single spelling is what previously left rejected bookings holding their slot
 * forever.
 */

/** Statuses that release the slot back to available. */
const RELEASING = /cancel|declin|reject|refund|expire/;

/**
 * True when a booking no longer holds its slot (cancelled, rejected by Finance,
 * refunded, or an expired reservation), so the slot is free again.
 */
export const releasesSlot = (booking: any): boolean => {
  if (!booking) return true;
  const values = [booking.bookingStatus, booking.status];
  return values.some((v) => RELEASING.test(String(v || "").toLowerCase()));
};

/**
 * True when a booking still occupies its slot. Covers both `reserved` (payment
 * receipt submitted, awaiting Finance) and `scheduled` (payment confirmed) —
 * both keep the slot unavailable to other patients.
 */
export const occupiesSlot = (booking: any): boolean => !releasesSlot(booking);

/** True when the booking is a payment-pending hold rather than a firm booking. */
export const isReserved = (booking: any): boolean =>
  String(booking?.bookingStatus || "").toLowerCase() === "reserved";

/**
 * Canonical status vocabulary.
 *
 * Bookings carry a status written by many different places, and the words are
 * not interchangeable across them:
 *
 *  - `pending`   — created, awaiting the doctor's acceptance
 *  - `reserved`  — bank-transfer receipt submitted, awaiting Finance
 *  - `accepted` / `confirmed` — the doctor accepted
 *  - `scheduled` — Finance verified the payment (confirmPayment writes this)
 *
 * `scheduled` is the one that kept getting missed: every doctor/nurse screen
 * matched only `accepted`/`confirmed`, so a booking whose payment Finance had
 * just verified fell through to the default and still displayed as "pending".
 * Route every screen through these helpers so the vocabulary stays in one place.
 */
const statusOf = (booking: any): string =>
  String(booking?.bookingStatus || booking?.status || "").toLowerCase();

/**
 * The doctor has accepted the appointment.
 *
 * Deliberately EXCLUDES `scheduled`: that means Finance verified the payment
 * (the booking is "booked"), which is when the doctor is *invited* to confirm —
 * not a confirmation itself.
 */
export const isConfirmedStatus = (status: string): boolean =>
  /^(accepted|approved|confirmed)$/.test(String(status || "").toLowerCase());

/** Finance verified the payment — booked, awaiting the doctor's confirmation. */
export const isBookedStatus = (status: string): boolean =>
  String(status || "").toLowerCase() === "scheduled";

/** Awaiting Finance verification of a submitted receipt. */
export const isReservedStatus = (status: string): boolean =>
  String(status || "").toLowerCase() === "reserved";

export type BookingPhase =
  | "reserved" // receipt submitted, awaiting Finance verification
  | "booked" // Finance verified payment, awaiting the doctor's confirmation
  | "confirmed" // doctor confirmed
  | "pending" // legacy: created, awaiting the doctor
  | "rescheduled"
  | "completed"
  | "cancelled";

/**
 * Classify a booking into the phase the UI cares about. Unknown statuses fall
 * back to "pending" (the previous default) so nothing disappears.
 */
export const classifyBooking = (booking: any): BookingPhase => {
  const status = statusOf(booking);
  if (!status) return "pending";
  if (isReservedStatus(status)) return "reserved";
  if (isBookedStatus(status)) return "booked";
  if (isConfirmedStatus(status)) return "confirmed";
  if (/reschedul/.test(status)) return "rescheduled";
  if (/complet/.test(status)) return "completed";
  if (/cancel|declin|reject|refund|expire|missed/.test(status))
    return "cancelled";
  return "pending";
};

/** Booked or confirmed — payment is verified either way, so it's locked in. */
export const isLockedIn = (phase: BookingPhase): boolean =>
  phase === "booked" || phase === "confirmed";
