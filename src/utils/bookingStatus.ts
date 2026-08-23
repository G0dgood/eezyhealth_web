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
