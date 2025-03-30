// src/components/DayColumn.tsx
"use client";

import React from "react";
import { Event } from "kanban/types"; // Assuming this type exists
import { EventCard, parseTime } from "./EventCard"; // Assuming parseTime exists and returns minutes from midnight
import { useDroppable } from "@dnd-kit/core";
import { format } from "date-fns";

// Helper to generate hour slots
const generateHours = (start: number, end: number): number[] => {
  const hours = [];
  for (let i = start; i <= end; i++) {
    hours.push(i);
  }
  return hours;
};

// --- HourSlot Component ---
// Encapsulates the droppable logic and rendering for a single hour
interface HourSlotProps {
  date: string;
  hour: number; // 0-23
  events: Event[];
  isOver: boolean;
  setNodeRef: (element: HTMLElement | null) => void;
}

const HourSlot = ({
  date,
  hour,
  events,
  isOver,
  setNodeRef,
}: HourSlotProps) => {
  // Filter and sort events for this specific hour
  const eventsInHour = events
    .filter((event) => {
      const eventMinutes = parseTime(event.time); // e.g., 9:30 -> 570
      const hourStartMinutes = hour * 60; // e.g., 9 -> 540
      const hourEndMinutes = (hour + 1) * 60 - 1; // e.g., 9 -> 599 (up to 9:59)
      return eventMinutes >= hourStartMinutes && eventMinutes <= hourEndMinutes;
    })
    .sort((a, b) => parseTime(a.time) - parseTime(b.time)); // Sort within the hour

  return (
    <div
      ref={setNodeRef}
      className={`relative min-h-[80px] border-t border-dashed border-gray-300 dark:border-gray-600 px-1 py-1 transition-colors duration-150 ${
        isOver ? "bg-blue-100 dark:bg-blue-900/50" : "bg-transparent"
      }`}
    >
      {/* Optional: Display hour label */}
      <div className="absolute top-0 left-1 text-xs text-gray-400 dark:text-gray-500 pointer-events-none">
        {format(new Date(0, 0, 0, hour), "ha")} {/* Format as 9am, 10am etc. */}
      </div>

      <div className="space-y-1 mt-3">
        {" "}
        {/* Add margin-top if hour label is shown */}
        {eventsInHour.length > 0 ? (
          eventsInHour.map((event) => (
            <EventCard key={event.id} event={event} date={date} />
          ))
        ) : (
          // Optional: Placeholder for empty slots to ensure height
          <div className="h-1"></div>
        )}
      </div>
    </div>
  );
};

// --- Updated DayColumn Component ---
interface DayColumnProps {
  date: string; // 'yyyy-MM-dd'
  events: Event[];
  startHour?: number; // Default to 8 AM
  endHour?: number; // Default to 5 PM (17)
  isCurrent?: boolean; // Highlight current day on mobile header
}

export const DayColumn = ({
  date,
  events,
  startHour = 8, // Example default: 8 AM
  endHour = 17, // Example default: 5 PM (inclusive hour, so renders up to 5:59 PM slot)
  isCurrent,
}: DayColumnProps) => {
  const dateObj = new Date(date + "T00:00:00"); // Ensure correct parsing
  const hours = generateHours(startHour, endHour);

  return (
    // Container for the whole day column
    <div className="relative my-4 flex-shrink-0 w-full md:w-[14.2%] min-h-[300px] h-full flex flex-col">
      {/* Header */}
      <div className="text-center mb-3 sticky top-0 bg-inherit z-10 py-1 px-2">
        <span
          className={`text-3xl font-bold pr-1 ${
            isCurrent ? "text-white" : "text-[#303339]"
          }`}
        >
          {format(dateObj, "d")}
        </span>
        <span
          className={`text-xs font-medium ${
            isCurrent ? "text-brand-start" : "text-gray-500"
          }`}
        >
          /{format(dateObj, "EEE")}
        </span>
      </div>

      {/* Scrollable container for hour slots */}
      <div className="flex-grow- px-1 ">
        {/* Remove space-y here, handled by HourSlot margin/padding */}
        {hours.map((hour) => (
          <DroppableHourSlot
            key={hour}
            date={date}
            hour={hour}
            allDayEvents={events}
          />
        ))}
        {/* Optional: Add a section for events outside the specified hour range? */}
        {/* Or maybe filter them out completely if they shouldn't be displayed */}
        <div className="text-center text-xs text-gray-400 py-4">
          {
            events.length === 0 && hours.length === 0
              ? "No events"
              : "" /* Adjust message if needed */
          }
        </div>
      </div>
    </div>
  );
};

// --- Helper Component to contain useDroppable Hook ---
// Hooks cannot be called inside loops directly in the main component body,
// so we create a small wrapper component.
interface DroppableHourSlotProps {
  date: string;
  hour: number;
  allDayEvents: Event[]; // Pass all events for the day
}

const DroppableHourSlot = ({
  date,
  hour,
  allDayEvents,
}: DroppableHourSlotProps) => {
  const droppableId = `${date}-${hour.toString().padStart(2, "0")}`; // e.g., 2023-10-27-09
  const { setNodeRef, isOver } = useDroppable({
    id: droppableId,
    data: {
      // Optional: Pass data that might be useful in onDragEnd
      type: "hourSlot",
      date: date,
      hour: hour,
    },
  });

  return (
    <HourSlot
      date={date}
      hour={hour}
      events={allDayEvents} // Pass all events, HourSlot will filter
      isOver={isOver}
      setNodeRef={setNodeRef}
    />
  );
};
