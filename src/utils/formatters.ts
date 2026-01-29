export const formatSlot = (slot: string | undefined) => {
  if (!slot) return "";
  const timeSlotMap: Record<string, string> = {
    midnight_12am: "12:00 AM",
    early_morning_1am: "1:00 AM",
    early_morning_2am: "2:00 AM",
    early_morning_3am: "3:00 AM",
    early_morning_4am: "4:00 AM",
    early_morning_5am: "5:00 AM",
    morning_6am: "6:00 AM",
    morning_7am: "7:00 AM",
    morning_8am: "8:00 AM",
    morning_9am: "9:00 AM",
    morning_10am: "10:00 AM",
    morning_11am: "11:00 AM",
    afternoon_12pm: "12:00 PM",
    afternoon_1pm: "1:00 PM",
    afternoon_2pm: "2:00 PM",
    afternoon_3pm: "3:00 PM",
    afternoon_4pm: "4:00 PM",
    evening_5pm: "5:00 PM",
    evening_6pm: "6:00 PM",
    evening_7pm: "7:00 PM",
    evening_8pm: "8:00 PM",
    night_9pm: "9:00 PM",
    night_10pm: "10:00 PM",
    night_11pm: "11:00 PM",
  };
  return timeSlotMap[slot] || slot;
};
