// src/components/DesktopView.tsx
"use client";

import React from "react";
import { useCalendar } from "kanban/context/CalendarContext";
import { DayColumn } from "./DayColumn";
import { getWeekDays, formatDateKey, isSameDay } from "../lib/dataUtils";

export const DesktopView = () => {
  const { events, currentDate } = useCalendar();
  const weekDates = getWeekDays(currentDate);
  const today = new Date(); // For highlighting current day

  return (
    <div className="flex flex-row h-full">
      <div className="flex flex-grow border-t border-gray-200">
        {weekDates.map((date) => {
          const dateKey = formatDateKey(date);
          return (
            <DayColumn
              key={dateKey}
              date={dateKey}
              events={events[dateKey] || []}
              isCurrent={isSameDay(date, today)}
            />
          );
        })}
      </div>
    </div>
  );
};
