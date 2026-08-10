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

  const ms = parseBookingMillis(booking?.bookingDate);
  if (!ms) return false;

  // Compare against the start of today so appointments still scheduled for
  // today are not prematurely flagged as missed.
  const startOfToday = new Date();
  startOfToday.setHours(0, 0, 0, 0);

  return ms < startOfToday.getTime();
}
