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
