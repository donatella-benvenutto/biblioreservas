"use client";

import { Calendar } from "@/components/ui/calendar";

interface AvailabilityCalendarProps {
  selectedDate: Date;
  onSelectDate: (date: Date) => void;
}

export function AvailabilityCalendar({ selectedDate, onSelectDate }: AvailabilityCalendarProps) {
  return (
    <Calendar
      mode="single"
      selected={selectedDate}
      onSelect={(date) => date && onSelectDate(date)}
      disabled={(date) => date < new Date(new Date().setHours(0, 0, 0, 0))}
      className="rounded-md border"
    />
  );
}
