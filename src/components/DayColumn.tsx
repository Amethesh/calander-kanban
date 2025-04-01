// src/components/DayColumn.tsx
"use client";

import React from "react";
import { Event } from "kanban/types";
import { EventCard } from "./EventCard";
import { useDroppable } from "@dnd-kit/core";
import { format } from "date-fns";
import { parseTime } from "kanban/lib/dataUtils";

interface DayColumnProps {
  date: string; // 'yyyy-MM-dd'
  events: Event[];
  isCurrent?: boolean; // Highlight current day on mobile header
}

export const DayColumn = ({ date, events, isCurrent }: DayColumnProps) => {
  const { setNodeRef, isOver } = useDroppable({
    id: date,
  });

  // Sort events by time
  const sortedEvents = [...events].sort(
    (a, b) => parseTime(a.time) - parseTime(b.time)
  );

  const dateObj = new Date(date + "T00:00:00"); // Ensure correct parsing

  return (
    <div
      ref={setNodeRef}
      className=" mx-1 my-4 flex-shrink-0 w-full md:w-[13.5%] p-2 h-full min-h-[300px]"
    >
      <div className="text-center mb-3 sticky top-0 bg-inherit z-10 py-1 backdrop-opacity-90 backdrop-blur-lg">
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
      <div
        className={`relative space-y-2 px-1 h-full  ${
          isOver ? "border-2 border-dashed border-amber-800 rounded-4xl" : ""
        }`}
      >
        {sortedEvents.length > 0 ? (
          sortedEvents.map((event) => (
            <EventCard key={event.id} event={event} date={date} />
          ))
        ) : (
          <div className="text-center text-sm text-gray-400 pt-10">
            No events
          </div>
        )}
      </div>
    </div>
  );
};
