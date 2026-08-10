// Shared logic for the "Missed Bookings" reports (doctor / nurse / admin).
//
// A booking is almost never stored with a literal `bookingStatus === "missed"`.
// Throughout the apps, "missed" is COMPUTED: an appointment whose date has
// already passed and was never settled (not completed, cancelled, accepted,
// confirmed, refunded, or rescheduled). Filtering on the literal string alone
// makes the Missed Bookings page look empty, which is the bug these helpers fix.

const MONTHS: Record<string, number> = {
  jan: 0, feb: 1, mar: 2, apr: 3, may: 4, jun: 5,
  jul: 6, aug: 7, sep: 8, oct: 9, nov: 10, dec: 11,
};

// bookingDate comes in several shapes: a Firestore Timestamp (serialized as
// {_seconds}/{seconds} or with a toDate()), an ISO string, or the app's own
// "DD-MMM-YY" / "DD-MMM-YYYY" format (e.g. "04-Aug-26") which `new Date()`
// cannot parse. Returns epoch millis, or 0 when unparseable.
export function parseBookingMillis(raw: unknown): number {
  if (!raw) return 0;

  if (typeof raw === "object") {
    const o = raw as {
      _seconds?: number;
      seconds?: number;
      toDate?: () => Date;
    };
    if (typeof o._seconds === "number") return o._seconds * 1000;
    if (typeof o.seconds === "number") return o.seconds * 1000;
    if (typeof o.toDate === "function") {
      const t = o.toDate().getTime();
      return isNaN(t) ? 0 : t;
    }
  }

  const s = String(raw).trim();

  const m = s.match(/^(\d{1,2})-([A-Za-z]{3})-(\d{2,4})$/);
  if (m) {
    const day = Number(m[1]);
    const mon = MONTHS[m[2].toLowerCase()];
    let yr = Number(m[3]);
    if (yr < 100) yr += 2000;
    if (mon !== undefined) return new Date(yr, mon, day).getTime();
  }

  const t = new Date(s).getTime();
  return isNaN(t) ? 0 : t;
}

// Extracts the start/end hour (24h) of a booking slot. Slot keys embed the
// hour + period, e.g. "morning_8am", "evening_8pm", "afternoon_12pm",
// "midnight_12am". Returns null when the slot carries no parseable time.
export function slotToHours(
  slot: unknown
): { start: number; end: number } | null {
  if (!slot) return null;
  const s = String(slot).toLowerCase();
  const m = s.match(/(\d{1,2})\s*(am|pm)/);
  if (!m) return null;

  let hour = parseInt(m[1], 10);
  if (Number.isNaN(hour)) return null;
  const period = m[2];
  if (period === "pm" && hour !== 12) hour += 12;
  if (period === "am" && hour === 12) hour = 0;

  // A slot is a one-hour window; it isn't "over" until the end of that hour.
  return { start: hour, end: hour + 1 };
}

// Epoch millis for the END of a booking's time window (date + slot end hour),
// so an appointment is only considered past once its slot has fully elapsed.
// Falls back to end-of-day when the slot has no parseable time.
export function appointmentEndMillis(booking: any): number {
  const dayMs = parseBookingMillis(booking?.bookingDate);
  if (!dayMs) return 0;

  const d = new Date(dayMs);
  d.setHours(0, 0, 0, 0); // normalize to local midnight of the booked date

  const slot = slotToHours(booking?.slot ?? booking?.timeSlot);
  if (slot) {
    d.setHours(slot.end, 0, 0, 0);
  } else {
    // Unknown slot → be lenient and only treat as past after the whole day.
    d.setHours(23, 59, 59, 999);
  }
  return d.getTime();
}

// True once the appointment's time window (date + slot) has fully passed.
// This is time-aware: an appointment booked for 8 PM today is NOT past at 8 AM.
export function hasAppointmentTimePassed(booking: any): boolean {
  const end = appointmentEndMillis(booking);
  return end > 0 && end < Date.now();
}

// Statuses that mean the booking was resolved one way or another, so it can
// never be "missed".
const SETTLED_STATUSES = [
  "completed",
  "cancelled",
  "canceled",
  "accepted",
  "confirmed",
  "refunded",
  "rescheduled",
];

// True when a booking should appear on the Missed Bookings report.
export function isMissedBooking(booking: any): boolean {
  const status = (booking?.bookingStatus || booking?.status || "")
    .toString()
    .toLowerCase();

  if (status === "missed") return true;
  if (SETTLED_STATUSES.includes(status)) return false;

  // Time-aware: an appointment is only missed once its slot has fully elapsed,
  // so an appointment booked for later today is not prematurely flagged.
  return hasAppointmentTimePassed(booking);
}
