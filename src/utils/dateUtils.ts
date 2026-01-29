/**
 * Returns the appropriate suffix for a day number (1st, 2nd, 3rd, 4th, etc.)
 * @param day - The day number
 * @returns The suffix string
 */
export const getDaySuffix = (day: number): string => {
  if (day >= 11 && day <= 13) return "th";
  switch (day % 10) {
    case 1:
      return "st";
    case 2:
      return "nd";
    case 3:
      return "rd";
    default:
      return "th";
  }
};

/**
 * Formats a date with day suffix
 * @param date - The date to format
 * @returns Formatted date string with suffix
 */
export const formatDateWithSuffix = (date: Date): string => {
  const day = date.getDate();
  const suffix = getDaySuffix(day);
  return `${day}${suffix}`;
};

/**
 * Gets the day name abbreviation
 * @param date - The date
 * @returns Day name abbreviation (SUN, MON, etc.)
 */
export const getDayName = (date: Date): string => {
  const dayNames = ["SUN", "MON", "TUE", "WED", "THU", "FRI", "SAT"];
  return dayNames[date.getDay()];
};

/**
 * Formats a Firebase date (Timestamp, ISO string, or Date object) to a readable string
 * @param date - The date to format
 * @returns Formatted date string (e.g., "Oct 27, 2023")
 */
export const formatFirebaseDate = (date: any): string => {
  if (!date) return "";

  let dateObj: Date;

  if (date instanceof Date) {
    dateObj = date;
  } else if (typeof date === "string") {
    dateObj = new Date(date);
  } else if (typeof date === "object" && "seconds" in date) {
    // Handle raw Firestore timestamp if it somehow leaks through
    dateObj = new Date(date.seconds * 1000);
  } else {
    return "";
  }

  // Check if date is valid
  if (isNaN(dateObj.getTime())) return "Invalid Date";

  return dateObj.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
};
