// Utility functions for time slot management

export const timeSlotToKey = (timeSlot: string | { key: string; from: string; to: string }): string => {
  // Handle new object format
  if (typeof timeSlot === 'object' && timeSlot.key) {
    return timeSlot.key;
  }

  // Handle old string format: "12:00 AM -> 1:00 AM"
  if (typeof timeSlot !== 'string') {
    throw new Error('Invalid timeSlot format: expected string');
  }
  const [startTime] = timeSlot.split(' -> ');
  const [time, period] = startTime.split(' ');
  const [hours] = time.split(':');

  const hour = parseInt(hours);
  const isAM = period === 'AM';
  
  // Convert to 24-hour format
  let hour24 = hour;
  if (isAM && hour === 12) hour24 = 0;
  if (!isAM && hour !== 12) hour24 = hour + 12;
  
  // Determine time period
  let periodName: string;
  if (hour24 >= 0 && hour24 < 6) {
    periodName = 'early_morning';
  } else if (hour24 >= 6 && hour24 < 12) {
    periodName = 'morning';
  } else if (hour24 >= 12 && hour24 < 18) {
    periodName = 'afternoon';
  } else if (hour24 >= 18 && hour24 < 21) {
    periodName = 'evening';
  } else {
    periodName = 'night';
  }
  
  // Handle midnight (12:00 AM)
  if (hour24 === 0) {
    return 'midnight_12am';
  }
  
  // Handle noon (12:00 PM)
  if (hour24 === 12) {
    return 'afternoon_12pm';
  }
  
  // Format the key
  const hourStr = hour24.toString();
  const periodSuffix = isAM ? 'am' : 'pm';
  
  return `${periodName}_${hourStr}${periodSuffix}`;
};

export const keyToTimeSlot = (key: string): string => {
  // Handle special cases
  if (key === 'midnight_12am') return '12:00 AM -> 1:00 AM';
  if (key === 'noon_12pm') return '12:00 PM -> 1:00 PM';
  
  // Parse the key
  const parts = key.split('_');
  if (parts.length < 2) return key;
  
  const timePart = parts[1];
  
  // Extract hour and period
  const hour = parseInt(timePart.replace(/[ap]m/, ''));
  const isAM = timePart.includes('am');
  
  // Convert to 12-hour format
  let hour12 = hour;
  let period = isAM ? 'AM' : 'PM';
  
  if (hour === 0) {
    hour12 = 12;
    period = 'AM';
  } else if (hour === 12) {
    hour12 = 12;
  } else if (hour > 12) {
    hour12 = hour - 12;
  }
  
  // Calculate end time (next hour)
  let endHour12 = hour12 + 1;
  let endPeriod = period;
  
  if (endHour12 === 13) {
    endHour12 = 1;
  } else if (endHour12 === 12 && hour12 === 11) {
    // Handle AM/PM transition
    endPeriod = isAM ? 'PM' : 'AM';
  }
  
  return `${hour12}:00 ${period} -> ${endHour12}:00 ${endPeriod}`;
};

// Day name mapping
export const dayNames = [
  'Sunday',
  'Monday', 
  'Tuesday',
  'Wednesday',
  'Thursday',
  'Friday',
  'Saturday'
];

export const getDayName = (date: Date): string => {
  return dayNames[date.getDay()];
};
