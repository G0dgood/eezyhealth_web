"use client";

import { useState, useEffect } from "react";
import { ChevronLeft, ChevronRight, Plus, Save } from "lucide-react";
import Breadcrumb from "@/components/Breadcrumb";
import Title from "@/components/Title";

interface TimeSlot {
  time: string;
  available: boolean;
  color: "green" | "blue" | "none";
}

interface DayAvailability {
  date: string;
  dayName: string;
  timeSlots: TimeSlot[];
}

export default function DoctorAvailabilityPage() {
  const [currentMonth, setCurrentMonth] = useState("January, 2025");
  const [currentWeekStart, setCurrentWeekStart] = useState(
    new Date(2025, 0, 26)
  ); // Jan 26, 2025
  const [consultationDuration, setConsultationDuration] =
    useState("30 minutes");

  // Initialize calendar with current week
  useEffect(() => {
    generateWeekAvailability(currentWeekStart);
  }, []);
  const [availability, setAvailability] = useState<DayAvailability[]>([
    {
      date: "Jan 26",
      dayName: "Sunday",
      timeSlots: [
        { time: "12:00 AM -> 12:30 AM", available: false, color: "none" },
        { time: "12:30 AM -> 01:00 AM", available: false, color: "none" },
        { time: "01:00 AM -> 01:30 AM", available: false, color: "none" },
        { time: "01:30 AM -> 02:00 AM", available: false, color: "none" },
        { time: "02:00 AM -> 02:30 AM", available: false, color: "none" },
        { time: "02:30 AM -> 03:00 AM", available: false, color: "none" },
        { time: "03:00 AM -> 03:30 AM", available: false, color: "none" },
        { time: "03:30 AM -> 04:00 AM", available: false, color: "none" },
        { time: "04:00 AM -> 04:30 AM", available: false, color: "none" },
        { time: "04:30 AM -> 05:00 AM", available: false, color: "none" },
        { time: "05:00 AM -> 05:30 AM", available: false, color: "none" },
        { time: "05:30 AM -> 06:00 AM", available: false, color: "none" },
        { time: "06:00 AM -> 06:30 AM", available: false, color: "none" },
        { time: "06:30 AM -> 07:00 AM", available: false, color: "none" },
        { time: "07:00 AM -> 07:30 AM", available: false, color: "none" },
        { time: "07:30 AM -> 08:00 AM", available: false, color: "none" },
        { time: "08:00 AM -> 08:30 AM", available: false, color: "none" },
        { time: "08:30 AM -> 09:00 AM", available: false, color: "none" },
        { time: "09:00 AM -> 09:30 AM", available: false, color: "none" },
        { time: "09:30 AM -> 10:00 AM", available: false, color: "none" },
        { time: "10:00 AM -> 10:30 AM", available: false, color: "none" },
        { time: "10:30 AM -> 11:00 AM", available: false, color: "none" },
        { time: "11:00 AM -> 11:30 AM", available: false, color: "none" },
        { time: "11:30 AM -> 12:00 PM", available: false, color: "none" },
        { time: "12:00 PM -> 12:30 PM", available: false, color: "none" },
        { time: "12:30 PM -> 01:00 PM", available: false, color: "none" },
        { time: "01:00 PM -> 01:30 PM", available: false, color: "none" },
        { time: "01:30 PM -> 02:00 PM", available: false, color: "none" },
        { time: "02:00 PM -> 02:30 PM", available: false, color: "none" },
        { time: "02:30 PM -> 03:00 PM", available: false, color: "none" },
        { time: "03:00 PM -> 03:30 PM", available: false, color: "none" },
        { time: "03:30 PM -> 04:00 PM", available: false, color: "none" },
        { time: "04:00 PM -> 04:30 PM", available: false, color: "none" },
        { time: "04:30 PM -> 05:00 PM", available: false, color: "none" },
        { time: "05:00 PM -> 05:30 PM", available: false, color: "none" },
        { time: "05:30 PM -> 06:00 PM", available: false, color: "none" },
        { time: "06:00 PM -> 06:30 PM", available: false, color: "none" },
        { time: "06:30 PM -> 07:00 PM", available: false, color: "none" },
        { time: "07:00 PM -> 07:30 PM", available: false, color: "none" },
        { time: "07:30 PM -> 08:00 PM", available: false, color: "none" },
        { time: "08:00 PM -> 08:30 PM", available: false, color: "none" },
        { time: "08:30 PM -> 09:00 PM", available: false, color: "none" },
        { time: "09:00 PM -> 09:30 PM", available: false, color: "none" },
        { time: "09:30 PM -> 10:00 PM", available: false, color: "none" },
        { time: "10:00 PM -> 10:30 PM", available: false, color: "none" },
        { time: "10:30 PM -> 11:00 PM", available: false, color: "none" },
        { time: "11:00 PM -> 11:30 PM", available: false, color: "none" },
        { time: "11:30 PM -> 12:00 AM", available: false, color: "none" },
      ],
    },
    {
      date: "Jan 27",
      dayName: "Monday",
      timeSlots: [
        { time: "12:00 AM -> 12:30 AM", available: false, color: "none" },
        { time: "12:30 AM -> 01:00 AM", available: false, color: "none" },
        { time: "01:00 AM -> 01:30 AM", available: false, color: "none" },
        { time: "01:30 AM -> 02:00 AM", available: false, color: "none" },
        { time: "02:00 AM -> 02:30 AM", available: false, color: "none" },
        { time: "02:30 AM -> 03:00 AM", available: false, color: "none" },
        { time: "03:00 AM -> 03:30 AM", available: false, color: "none" },
        { time: "03:30 AM -> 04:00 AM", available: false, color: "none" },
        { time: "04:00 AM -> 04:30 AM", available: false, color: "none" },
        { time: "04:30 AM -> 05:00 AM", available: false, color: "none" },
        { time: "05:00 AM -> 05:30 AM", available: false, color: "none" },
        { time: "05:30 AM -> 06:00 AM", available: false, color: "none" },
        { time: "06:00 AM -> 06:30 AM", available: false, color: "none" },
        { time: "06:30 AM -> 07:00 AM", available: false, color: "none" },
        { time: "07:00 AM -> 07:30 AM", available: false, color: "none" },
        { time: "07:30 AM -> 08:00 AM", available: false, color: "none" },
        { time: "08:00 AM -> 08:30 AM", available: false, color: "none" },
        { time: "08:30 AM -> 09:00 AM", available: false, color: "none" },
        { time: "09:00 AM -> 09:30 AM", available: false, color: "none" },
        { time: "09:30 AM -> 10:00 AM", available: false, color: "none" },
        { time: "10:00 AM -> 10:30 AM", available: true, color: "green" },
        { time: "10:30 AM -> 11:00 AM", available: true, color: "green" },
        { time: "11:00 AM -> 11:30 AM", available: false, color: "none" },
        { time: "11:30 AM -> 12:00 PM", available: false, color: "none" },
        { time: "12:00 PM -> 12:30 PM", available: false, color: "none" },
        { time: "12:30 PM -> 01:00 PM", available: false, color: "none" },
        { time: "01:00 PM -> 01:30 PM", available: false, color: "none" },
        { time: "01:30 PM -> 02:00 PM", available: true, color: "blue" },
        { time: "02:00 PM -> 02:30 PM", available: true, color: "blue" },
        { time: "02:30 PM -> 03:00 PM", available: false, color: "none" },
        { time: "03:00 PM -> 03:30 PM", available: false, color: "none" },
        { time: "03:30 PM -> 04:00 PM", available: false, color: "none" },
        { time: "04:00 PM -> 04:30 PM", available: false, color: "none" },
        { time: "04:30 PM -> 05:00 PM", available: false, color: "none" },
        { time: "05:00 PM -> 05:30 PM", available: false, color: "none" },
        { time: "05:30 PM -> 06:00 PM", available: false, color: "none" },
        { time: "06:00 PM -> 06:30 PM", available: false, color: "none" },
        { time: "06:30 PM -> 07:00 PM", available: false, color: "none" },
        { time: "07:00 PM -> 07:30 PM", available: false, color: "none" },
        { time: "07:30 PM -> 08:00 PM", available: false, color: "none" },
        { time: "08:00 PM -> 08:30 PM", available: false, color: "none" },
        { time: "08:30 PM -> 09:00 PM", available: false, color: "none" },
        { time: "09:00 PM -> 09:30 PM", available: false, color: "none" },
        { time: "09:30 PM -> 10:00 PM", available: false, color: "none" },
        { time: "10:00 PM -> 10:30 PM", available: false, color: "none" },
        { time: "10:30 PM -> 11:00 PM", available: false, color: "none" },
        { time: "11:00 PM -> 11:30 PM", available: false, color: "none" },
        { time: "11:30 PM -> 12:00 AM", available: false, color: "none" },
      ],
    },
    {
      date: "Jan 28",
      dayName: "Tuesday",
      timeSlots: [
        { time: "12:00 AM -> 12:30 AM", available: false, color: "none" },
        { time: "12:30 AM -> 01:00 AM", available: false, color: "none" },
        { time: "01:00 AM -> 01:30 AM", available: false, color: "none" },
        { time: "01:30 AM -> 02:00 AM", available: false, color: "none" },
        { time: "02:00 AM -> 02:30 AM", available: false, color: "none" },
        { time: "02:30 AM -> 03:00 AM", available: false, color: "none" },
        { time: "03:00 AM -> 03:30 AM", available: false, color: "none" },
        { time: "03:30 AM -> 04:00 AM", available: false, color: "none" },
        { time: "04:00 AM -> 04:30 AM", available: false, color: "none" },
        { time: "04:30 AM -> 05:00 AM", available: false, color: "none" },
        { time: "05:00 AM -> 05:30 AM", available: false, color: "none" },
        { time: "05:30 AM -> 06:00 AM", available: false, color: "none" },
        { time: "06:00 AM -> 06:30 AM", available: false, color: "none" },
        { time: "06:30 AM -> 07:00 AM", available: false, color: "none" },
        { time: "07:00 AM -> 07:30 AM", available: false, color: "none" },
        { time: "07:30 AM -> 08:00 AM", available: false, color: "none" },
        { time: "08:00 AM -> 08:30 AM", available: false, color: "none" },
        { time: "08:30 AM -> 09:00 AM", available: true, color: "green" },
        { time: "09:00 AM -> 09:30 AM", available: true, color: "green" },
        { time: "09:30 AM -> 10:00 AM", available: false, color: "none" },
        { time: "10:00 AM -> 10:30 AM", available: false, color: "none" },
        { time: "10:30 AM -> 11:00 AM", available: false, color: "none" },
        { time: "11:00 AM -> 11:30 AM", available: false, color: "none" },
        { time: "11:30 AM -> 12:00 PM", available: false, color: "none" },
        { time: "12:00 PM -> 12:30 PM", available: false, color: "none" },
        { time: "12:30 PM -> 01:00 PM", available: false, color: "none" },
        { time: "01:00 PM -> 01:30 PM", available: false, color: "none" },
        { time: "01:30 PM -> 02:00 PM", available: false, color: "none" },
        { time: "02:00 PM -> 02:30 PM", available: false, color: "none" },
        { time: "02:30 PM -> 03:00 PM", available: false, color: "none" },
        { time: "03:00 PM -> 03:30 PM", available: false, color: "none" },
        { time: "03:30 PM -> 04:00 PM", available: false, color: "none" },
        { time: "04:00 PM -> 04:30 PM", available: false, color: "none" },
        { time: "04:30 PM -> 05:00 PM", available: false, color: "none" },
        { time: "05:00 PM -> 05:30 PM", available: false, color: "none" },
        { time: "05:30 PM -> 06:00 PM", available: false, color: "none" },
        { time: "06:00 PM -> 06:30 PM", available: false, color: "none" },
        { time: "06:30 PM -> 07:00 PM", available: false, color: "none" },
        { time: "07:00 PM -> 07:30 PM", available: false, color: "none" },
        { time: "07:30 PM -> 08:00 PM", available: false, color: "none" },
        { time: "08:00 PM -> 08:30 PM", available: false, color: "none" },
        { time: "08:30 PM -> 09:00 PM", available: false, color: "none" },
        { time: "09:00 PM -> 09:30 PM", available: false, color: "none" },
        { time: "09:30 PM -> 10:00 PM", available: false, color: "none" },
        { time: "10:00 PM -> 10:30 PM", available: false, color: "none" },
        { time: "10:30 PM -> 11:00 PM", available: false, color: "none" },
        { time: "11:00 PM -> 11:30 PM", available: false, color: "none" },
        { time: "11:30 PM -> 12:00 AM", available: false, color: "none" },
      ],
    },
    {
      date: "Jan 29",
      dayName: "Wednesday",
      timeSlots: [
        { time: "12:00 AM -> 12:30 AM", available: false, color: "none" },
        { time: "12:30 AM -> 01:00 AM", available: false, color: "none" },
        { time: "01:00 AM -> 01:30 AM", available: false, color: "none" },
        { time: "01:30 AM -> 02:00 AM", available: false, color: "none" },
        { time: "02:00 AM -> 02:30 AM", available: false, color: "none" },
        { time: "02:30 AM -> 03:00 AM", available: false, color: "none" },
        { time: "03:00 AM -> 03:30 AM", available: false, color: "none" },
        { time: "03:30 AM -> 04:00 AM", available: false, color: "none" },
        { time: "04:00 AM -> 04:30 AM", available: false, color: "none" },
        { time: "04:30 AM -> 05:00 AM", available: false, color: "none" },
        { time: "05:00 AM -> 05:30 AM", available: false, color: "none" },
        { time: "05:30 AM -> 06:00 AM", available: false, color: "none" },
        { time: "06:00 AM -> 06:30 AM", available: false, color: "none" },
        { time: "06:30 AM -> 07:00 AM", available: false, color: "none" },
        { time: "07:00 AM -> 07:30 AM", available: false, color: "none" },
        { time: "07:30 AM -> 08:00 AM", available: false, color: "none" },
        { time: "08:00 AM -> 08:30 AM", available: false, color: "none" },
        { time: "08:30 AM -> 09:00 AM", available: false, color: "none" },
        { time: "09:00 AM -> 09:30 AM", available: false, color: "none" },
        { time: "09:30 AM -> 10:00 AM", available: false, color: "none" },
        { time: "10:00 AM -> 10:30 AM", available: false, color: "none" },
        { time: "10:30 AM -> 11:00 AM", available: false, color: "none" },
        { time: "11:00 AM -> 11:30 AM", available: false, color: "none" },
        { time: "11:30 AM -> 12:00 PM", available: false, color: "none" },
        { time: "12:00 PM -> 12:30 PM", available: false, color: "none" },
        { time: "12:30 PM -> 01:00 PM", available: false, color: "none" },
        { time: "01:00 PM -> 01:30 PM", available: false, color: "none" },
        { time: "01:30 PM -> 02:00 PM", available: false, color: "none" },
        { time: "02:00 PM -> 02:30 PM", available: false, color: "none" },
        { time: "02:30 PM -> 03:00 PM", available: false, color: "none" },
        { time: "03:00 PM -> 03:30 PM", available: false, color: "none" },
        { time: "03:30 PM -> 04:00 PM", available: false, color: "none" },
        { time: "04:00 PM -> 04:30 PM", available: true, color: "blue" },
        { time: "04:30 PM -> 05:00 PM", available: true, color: "blue" },
        { time: "05:00 PM -> 05:30 PM", available: false, color: "none" },
        { time: "05:30 PM -> 06:00 PM", available: false, color: "none" },
        { time: "06:00 PM -> 06:30 PM", available: false, color: "none" },
        { time: "06:30 PM -> 07:00 PM", available: false, color: "none" },
        { time: "07:00 PM -> 07:30 PM", available: false, color: "none" },
        { time: "07:30 PM -> 08:00 PM", available: false, color: "none" },
        { time: "08:00 PM -> 08:30 PM", available: false, color: "none" },
        { time: "08:30 PM -> 09:00 PM", available: false, color: "none" },
        { time: "09:00 PM -> 09:30 PM", available: false, color: "none" },
        { time: "09:30 PM -> 10:00 PM", available: false, color: "none" },
        { time: "10:00 PM -> 10:30 PM", available: false, color: "none" },
        { time: "10:30 PM -> 11:00 PM", available: false, color: "none" },
        { time: "11:00 PM -> 11:30 PM", available: false, color: "none" },
        { time: "11:30 PM -> 12:00 AM", available: false, color: "none" },
      ],
    },
    {
      date: "Jan 30",
      dayName: "Thursday",
      timeSlots: [
        { time: "12:00 AM -> 12:30 AM", available: false, color: "none" },
        { time: "12:30 AM -> 01:00 AM", available: false, color: "none" },
        { time: "01:00 AM -> 01:30 AM", available: false, color: "none" },
        { time: "01:30 AM -> 02:00 AM", available: false, color: "none" },
        { time: "02:00 AM -> 02:30 AM", available: false, color: "none" },
        { time: "02:30 AM -> 03:00 AM", available: false, color: "none" },
        { time: "03:00 AM -> 03:30 AM", available: false, color: "none" },
        { time: "03:30 AM -> 04:00 AM", available: false, color: "none" },
        { time: "04:00 AM -> 04:30 AM", available: false, color: "none" },
        { time: "04:30 AM -> 05:00 AM", available: false, color: "none" },
        { time: "05:00 AM -> 05:30 AM", available: false, color: "none" },
        { time: "05:30 AM -> 06:00 AM", available: false, color: "none" },
        { time: "06:00 AM -> 06:30 AM", available: false, color: "none" },
        { time: "06:30 AM -> 07:00 AM", available: false, color: "none" },
        { time: "07:00 AM -> 07:30 AM", available: false, color: "none" },
        { time: "07:30 AM -> 08:00 AM", available: false, color: "none" },
        { time: "08:00 AM -> 08:30 AM", available: false, color: "none" },
        { time: "08:30 AM -> 09:00 AM", available: false, color: "none" },
        { time: "09:00 AM -> 09:30 AM", available: false, color: "none" },
        { time: "09:30 AM -> 10:00 AM", available: false, color: "none" },
        { time: "10:00 AM -> 10:30 AM", available: false, color: "none" },
        { time: "10:30 AM -> 11:00 AM", available: false, color: "none" },
        { time: "11:00 AM -> 11:30 AM", available: false, color: "none" },
        { time: "11:30 AM -> 12:00 PM", available: true, color: "green" },
        { time: "12:00 PM -> 12:30 PM", available: true, color: "green" },
        { time: "12:30 PM -> 01:00 PM", available: false, color: "none" },
        { time: "01:00 PM -> 01:30 PM", available: false, color: "none" },
        { time: "01:30 PM -> 02:00 PM", available: false, color: "none" },
        { time: "02:00 PM -> 02:30 PM", available: false, color: "none" },
        { time: "02:30 PM -> 03:00 PM", available: false, color: "none" },
        { time: "03:00 PM -> 03:30 PM", available: false, color: "none" },
        { time: "03:30 PM -> 04:00 PM", available: false, color: "none" },
        { time: "04:00 PM -> 04:30 PM", available: false, color: "none" },
        { time: "04:30 PM -> 05:00 PM", available: false, color: "none" },
        { time: "05:00 PM -> 05:30 PM", available: false, color: "none" },
        { time: "05:30 PM -> 06:00 PM", available: false, color: "none" },
        { time: "06:00 PM -> 06:30 PM", available: false, color: "none" },
        { time: "06:30 PM -> 07:00 PM", available: false, color: "none" },
        { time: "07:00 PM -> 07:30 PM", available: false, color: "none" },
        { time: "07:30 PM -> 08:00 PM", available: false, color: "none" },
        { time: "08:00 PM -> 08:30 PM", available: false, color: "none" },
        { time: "08:30 PM -> 09:00 PM", available: false, color: "none" },
        { time: "09:00 PM -> 09:30 PM", available: false, color: "none" },
        { time: "09:30 PM -> 10:00 PM", available: false, color: "none" },
        { time: "10:00 PM -> 10:30 PM", available: false, color: "none" },
        { time: "10:30 PM -> 11:00 PM", available: false, color: "none" },
        { time: "11:00 PM -> 11:30 PM", available: false, color: "none" },
        { time: "11:30 PM -> 12:00 AM", available: false, color: "none" },
      ],
    },
    {
      date: "Jan 31",
      dayName: "Friday",
      timeSlots: [
        { time: "12:00 AM -> 12:30 AM", available: false, color: "none" },
        { time: "12:30 AM -> 01:00 AM", available: false, color: "none" },
        { time: "01:00 AM -> 01:30 AM", available: false, color: "none" },
        { time: "01:30 AM -> 02:00 AM", available: false, color: "none" },
        { time: "02:00 AM -> 02:30 AM", available: false, color: "none" },
        { time: "02:30 AM -> 03:00 AM", available: false, color: "none" },
        { time: "03:00 AM -> 03:30 AM", available: false, color: "none" },
        { time: "03:30 AM -> 04:00 AM", available: false, color: "none" },
        { time: "04:00 AM -> 04:30 AM", available: false, color: "none" },
        { time: "04:30 AM -> 05:00 AM", available: false, color: "none" },
        { time: "05:00 AM -> 05:30 AM", available: false, color: "none" },
        { time: "05:30 AM -> 06:00 AM", available: false, color: "none" },
        { time: "06:00 AM -> 06:30 AM", available: false, color: "none" },
        { time: "06:30 AM -> 07:00 AM", available: false, color: "none" },
        { time: "07:00 AM -> 07:30 AM", available: false, color: "none" },
        { time: "07:30 AM -> 08:00 AM", available: false, color: "none" },
        { time: "08:00 AM -> 08:30 AM", available: false, color: "none" },
        { time: "08:30 AM -> 09:00 AM", available: false, color: "none" },
        { time: "09:00 AM -> 09:30 AM", available: false, color: "none" },
        { time: "09:30 AM -> 10:00 AM", available: false, color: "none" },
        { time: "10:00 AM -> 10:30 AM", available: false, color: "none" },
        { time: "10:30 AM -> 11:00 AM", available: false, color: "none" },
        { time: "11:00 AM -> 11:30 AM", available: false, color: "none" },
        { time: "11:30 AM -> 12:00 PM", available: false, color: "none" },
        { time: "12:00 PM -> 12:30 PM", available: false, color: "none" },
        { time: "12:30 PM -> 01:00 PM", available: false, color: "none" },
        { time: "01:00 PM -> 01:30 PM", available: false, color: "none" },
        { time: "01:30 PM -> 02:00 PM", available: false, color: "none" },
        { time: "02:00 PM -> 02:30 PM", available: false, color: "none" },
        { time: "02:30 PM -> 03:00 PM", available: false, color: "none" },
        { time: "03:00 PM -> 03:30 PM", available: false, color: "none" },
        { time: "03:30 PM -> 04:00 PM", available: false, color: "none" },
        { time: "04:00 PM -> 04:30 PM", available: false, color: "none" },
        { time: "04:30 PM -> 05:00 PM", available: false, color: "none" },
        { time: "05:00 PM -> 05:30 PM", available: false, color: "none" },
        { time: "05:30 PM -> 06:00 PM", available: false, color: "none" },
        { time: "06:00 PM -> 06:30 PM", available: false, color: "none" },
        { time: "06:30 PM -> 07:00 PM", available: false, color: "none" },
        { time: "07:00 PM -> 07:30 PM", available: false, color: "none" },
        { time: "07:30 PM -> 08:00 PM", available: false, color: "none" },
        { time: "08:00 PM -> 08:30 PM", available: false, color: "none" },
        { time: "08:30 PM -> 09:00 PM", available: false, color: "none" },
        { time: "09:00 PM -> 09:30 PM", available: false, color: "none" },
        { time: "09:30 PM -> 10:00 PM", available: false, color: "none" },
        { time: "10:00 PM -> 10:30 PM", available: false, color: "none" },
        { time: "10:30 PM -> 11:00 PM", available: false, color: "none" },
        { time: "11:00 PM -> 11:30 PM", available: false, color: "none" },
        { time: "11:30 PM -> 12:00 AM", available: false, color: "none" },
      ],
    },
    {
      date: "Feb 1",
      dayName: "Saturday",
      timeSlots: [
        { time: "12:00 AM -> 12:30 AM", available: false, color: "none" },
        { time: "12:30 AM -> 01:00 AM", available: false, color: "none" },
        { time: "01:00 AM -> 01:30 AM", available: false, color: "none" },
        { time: "01:30 AM -> 02:00 AM", available: false, color: "none" },
        { time: "02:00 AM -> 02:30 AM", available: false, color: "none" },
        { time: "02:30 AM -> 03:00 AM", available: false, color: "none" },
        { time: "03:00 AM -> 03:30 AM", available: false, color: "none" },
        { time: "03:30 AM -> 04:00 AM", available: false, color: "none" },
        { time: "04:00 AM -> 04:30 AM", available: false, color: "none" },
        { time: "04:30 AM -> 05:00 AM", available: false, color: "none" },
        { time: "05:00 AM -> 05:30 AM", available: false, color: "none" },
        { time: "05:30 AM -> 06:00 AM", available: false, color: "none" },
        { time: "06:00 AM -> 06:30 AM", available: false, color: "none" },
        { time: "06:30 AM -> 07:00 AM", available: false, color: "none" },
        { time: "07:00 AM -> 07:30 AM", available: false, color: "none" },
        { time: "07:30 AM -> 08:00 AM", available: false, color: "none" },
        { time: "08:00 AM -> 08:30 AM", available: false, color: "none" },
        { time: "08:30 AM -> 09:00 AM", available: false, color: "none" },
        { time: "09:00 AM -> 09:30 AM", available: false, color: "none" },
        { time: "09:30 AM -> 10:00 AM", available: false, color: "none" },
        { time: "10:00 AM -> 10:30 AM", available: false, color: "none" },
        { time: "10:30 AM -> 11:00 AM", available: false, color: "none" },
        { time: "11:00 AM -> 11:30 AM", available: false, color: "none" },
        { time: "11:30 AM -> 12:00 PM", available: false, color: "none" },
        { time: "12:00 PM -> 12:30 PM", available: false, color: "none" },
        { time: "12:30 PM -> 01:00 PM", available: false, color: "none" },
        { time: "01:00 PM -> 01:30 PM", available: false, color: "none" },
        { time: "01:30 PM -> 02:00 PM", available: false, color: "none" },
        { time: "02:00 PM -> 02:30 PM", available: false, color: "none" },
        { time: "02:30 PM -> 03:00 PM", available: false, color: "none" },
        { time: "03:00 PM -> 03:30 PM", available: false, color: "none" },
        { time: "03:30 PM -> 04:00 PM", available: false, color: "none" },
        { time: "04:00 PM -> 04:30 PM", available: false, color: "none" },
        { time: "04:30 PM -> 05:00 PM", available: false, color: "none" },
        { time: "05:00 PM -> 05:30 PM", available: false, color: "none" },
        { time: "05:30 PM -> 06:00 PM", available: false, color: "none" },
        { time: "06:00 PM -> 06:30 PM", available: false, color: "none" },
        { time: "06:30 PM -> 07:00 PM", available: false, color: "none" },
        { time: "07:00 PM -> 07:30 PM", available: false, color: "none" },
        { time: "07:30 PM -> 08:00 PM", available: false, color: "none" },
        { time: "08:00 PM -> 08:30 PM", available: false, color: "none" },
        { time: "08:30 PM -> 09:00 PM", available: false, color: "none" },
        { time: "09:00 PM -> 09:30 PM", available: false, color: "none" },
        { time: "09:30 PM -> 10:00 PM", available: false, color: "none" },
        { time: "10:00 PM -> 10:30 PM", available: false, color: "none" },
        { time: "10:30 PM -> 11:00 PM", available: false, color: "none" },
        { time: "11:00 PM -> 11:30 PM", available: false, color: "none" },
        { time: "11:30 PM -> 12:00 AM", available: false, color: "none" },
      ],
    },
  ]);

  const handleTimeSlotClick = (dayIndex: number, slotIndex: number) => {
    const newAvailability = [...availability];
    const currentSlot = newAvailability[dayIndex].timeSlots[slotIndex];

    // Cycle through colors: none -> green -> blue -> none
    if (currentSlot.color === "none") {
      currentSlot.color = "green";
      currentSlot.available = true;
    } else if (currentSlot.color === "green") {
      currentSlot.color = "blue";
      currentSlot.available = true;
    } else {
      currentSlot.color = "none";
      currentSlot.available = false;
    }

    setAvailability(newAvailability);
  };

  const handleSaveAvailability = () => {
    // Here you would typically save the availability to the backend
    console.log("Saving availability:", availability);
    // You could show a success message or redirect
  };

  const handleAddRecurringPattern = () => {
    // Here you would typically open a modal to set recurring patterns
    console.log("Adding recurring pattern");
  };

  const navigateWeek = (direction: "prev" | "next") => {
    const newWeekStart = new Date(currentWeekStart);

    if (direction === "prev") {
      newWeekStart.setDate(newWeekStart.getDate() - 7);
    } else {
      newWeekStart.setDate(newWeekStart.getDate() + 7);
    }

    setCurrentWeekStart(newWeekStart);

    // Update the month display
    const monthNames = [
      "January",
      "February",
      "March",
      "April",
      "May",
      "June",
      "July",
      "August",
      "September",
      "October",
      "November",
      "December",
    ];
    const month = monthNames[newWeekStart.getMonth()];
    const year = newWeekStart.getFullYear();
    setCurrentMonth(`${month}, ${year}`);

    // Generate new availability data for the new week
    generateWeekAvailability(newWeekStart);
  };

  const generateWeekAvailability = (weekStart: Date) => {
    const newAvailability: DayAvailability[] = [];
    const dayNames = [
      "Sunday",
      "Monday",
      "Tuesday",
      "Wednesday",
      "Thursday",
      "Friday",
      "Saturday",
    ];

    for (let i = 0; i < 7; i++) {
      const currentDate = new Date(weekStart);
      currentDate.setDate(weekStart.getDate() + i);

      const month = currentDate.getMonth() + 1;
      const day = currentDate.getDate();
      const monthNames = [
        "Jan",
        "Feb",
        "Mar",
        "Apr",
        "May",
        "Jun",
        "Jul",
        "Aug",
        "Sep",
        "Oct",
        "Nov",
        "Dec",
      ];

      const newDay: DayAvailability = {
        date: `${monthNames[currentDate.getMonth()]} ${day}`,
        dayName: dayNames[currentDate.getDay()],
        timeSlots: Array.from({ length: 48 }, (_, index) => {
          const hour = Math.floor(index / 2);
          const minute = (index % 2) * 30;
          const ampm = hour < 12 ? "AM" : "PM";
          const displayHour = hour === 0 ? 12 : hour > 12 ? hour - 12 : hour;
          const nextHour = hour + 1 === 24 ? 0 : hour + 1;
          const nextDisplayHour =
            nextHour === 0 ? 12 : nextHour > 12 ? nextHour - 12 : nextHour;
          const nextAmpm = nextHour < 12 ? "AM" : "PM";

          const timeString = `${displayHour
            .toString()
            .padStart(2, "0")}:${minute
            .toString()
            .padStart(2, "0")} ${ampm} -> ${nextDisplayHour
            .toString()
            .padStart(2, "0")}:${minute
            .toString()
            .padStart(2, "0")} ${nextAmpm}`;

          return {
            time: timeString,
            available: false,
            color: "none",
          };
        }),
      };

      newAvailability.push(newDay);
    }

    setAvailability(newAvailability);
  };

  const getSlotColor = (color: string) => {
    switch (color) {
      case "green":
        return "bg-[#44CE2D]";
      case "blue":
        return "bg-blue-500";
      default:
        return "bg-white";
    }
  };

  const getSlotTextColor = (color: string) => {
    switch (color) {
      case "green":
      case "blue":
        return "text-white";
      default:
        return "text-gray-900";
    }
  };

  return (
    <div>
      <div className="mb-6">
        <Breadcrumb
          homeHref="/doctor"
          items={[
            { label: "Doctor", href: "/doctor" },
            { label: "Availability", href: "/doctor/availability" },
          ]}
        />
      </div>

      <Title title="Set your availability" />

      {/* Header Section */}
      <div className="border-[var(--border)] mb-6">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
          <div className="space-y-4">
            <h2 className="text-lg font-medium text-gray-700">
              Set your availability
            </h2>

            <div className="flex items-center gap-3">
              <label className="text-sm font-medium text-gray-700">
                Consultation duration:
              </label>
              <select
                value={consultationDuration}
                onChange={(e) => setConsultationDuration(e.target.value)}
                className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#44CE2D] focus:border-[#44CE2D] bg-white">
                <option value="15 minutes">15 minutes</option>
                <option value="30 minutes">30 minutes</option>
                <option value="45 minutes">45 minutes</option>
                <option value="1 hour">1 hour</option>
              </select>
            </div>
          </div>

          <div className="flex gap-3">
            <button
              onClick={handleAddRecurringPattern}
              className="px-4 py-2 border border-[#44CE2D] text-[#44CE2D] rounded-lg hover:bg-[#44CE2D] hover:text-white transition-colors flex items-center gap-2 cursor-pointer">
              <Plus className="w-4 h-4" />
              Add Recurring Pattern
            </button>

            <button
              onClick={handleSaveAvailability}
              className="px-6 py-2 bg-[#44CE2D] text-white rounded-lg hover:bg-[#3bb025] transition-colors flex items-center gap-2 cursor-pointer">
              <Save className="w-4 h-4" />
              Save Availability
            </button>
          </div>
        </div>
      </div>

      {/* Calendar Grid */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
        {/* Calendar Header */}
        <div className="p-4 border-b border-gray-200 flex items-center justify-between">
          <div>
            <h3 className="text-lg font-medium text-gray-900">
              {currentMonth}
            </h3>
            <p className="text-sm text-gray-500">
              {currentWeekStart.toLocaleDateString("en-US", {
                month: "short",
                day: "numeric",
              })}{" "}
              -{" "}
              {new Date(
                currentWeekStart.getTime() + 6 * 24 * 60 * 60 * 1000
              ).toLocaleDateString("en-US", {
                month: "short",
                day: "numeric",
                year: "numeric",
              })}
            </p>
          </div>
          <div className="flex gap-2">
            <button
              onClick={() => {
                const today = new Date();
                const startOfWeek = new Date(today);
                startOfWeek.setDate(today.getDate() - today.getDay());
                setCurrentWeekStart(startOfWeek);
                generateWeekAvailability(startOfWeek);
                const monthNames = [
                  "January",
                  "February",
                  "March",
                  "April",
                  "May",
                  "June",
                  "July",
                  "August",
                  "September",
                  "October",
                  "November",
                  "December",
                ];
                const month = monthNames[today.getMonth()];
                const year = today.getFullYear();
                setCurrentMonth(`${month}, ${year}`);
              }}
              className="px-3 py-1 text-sm bg-[#44CE2D] text-white rounded-lg hover:bg-[#3bb025] transition-colors">
              Today
            </button>
            <button
              onClick={() => navigateWeek("prev")}
              className="p-2 hover:bg-gray-100 rounded-lg transition-colors">
              <ChevronLeft className="w-4 h-4 text-gray-600 cursor-pointer" />
            </button>
            <button
              onClick={() => navigateWeek("next")}
              className="p-2 hover:bg-gray-100 rounded-lg transition-colors">
              <ChevronRight className="w-4 h-4 text-gray-600 cursor-pointer" />
            </button>
          </div>
        </div>

        {/* Calendar Grid */}
        <div className="overflow-x-auto">
          <div className="min-w-[800px]">
            {/* Day Headers */}
            <div className="grid grid-cols-8 border-b border-gray-200">
              <div className="p-3 text-sm font-medium text-gray-500 bg-gray-50"></div>
              {availability.map((day) => (
                <div
                  key={day.date}
                  className="p-3 text-sm font-medium text-gray-900 bg-gray-50 text-center">
                  <div className="font-semibold">{day.dayName}</div>
                  <div className="text-xs text-gray-500">{day.date}</div>
                </div>
              ))}
            </div>

            {/* Time Slots */}
            {availability[0].timeSlots.map((_, slotIndex) => (
              <div
                key={slotIndex}
                className="grid grid-cols-8 border-b border-gray-200 last:border-b-0">
                {/* Time Label */}
                <div className="p-3 text-sm text-gray-600 bg-gray-50 flex items-center justify-center border-r border-gray-200">
                  {availability[0].timeSlots[slotIndex].time}
                </div>

                {/* Day Columns */}
                {availability.map((day, dayIndex) => (
                  <div
                    key={`${day.date}-${slotIndex}`}
                    className={`p-3 border-r border-gray-200 last:border-r-0 cursor-pointer transition-colors hover:bg-gray-50 ${getSlotColor(
                      day.timeSlots[slotIndex].color
                    )} ${getSlotTextColor(day.timeSlots[slotIndex].color)}`}
                    onClick={() => handleTimeSlotClick(dayIndex, slotIndex)}>
                    <div className="w-full h-6 flex items-center justify-center">
                      {day.timeSlots[slotIndex].available && (
                        <div className="w-2 h-2 rounded-full bg-current opacity-75"></div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
