"use client";

import React from "react";
import { useCalendar } from "kanban/context/CalendarContext";
import { DayColumn } from "./DayColumn";
import { getWeekDays, formatDateKey, isSameDay } from "../lib/dataUtils";

export const DesktopView = () => {
  const { events, currentDate } = useCalendar();
  const weekDates = getWeekDays(currentDate);
  const today = new Date();

  const lineColor = "#222222cb";
  const lineHeight = "1px";
  const lineSpacing = "6rem";

  const repeatingBackgroundStyle: React.CSSProperties = {
    backgroundImage: `repeating-linear-gradient(
      to bottom,
      transparent 0,
      transparent calc(${lineSpacing} - ${lineHeight}),
      ${lineColor} calc(${lineSpacing} - ${lineHeight}),
      ${lineColor} ${lineSpacing}
    )`,
    backgroundSize: `100% ${lineSpacing}`,
    backgroundRepeat: "repeat-y",
    backgroundPosition: "0 0",
  };

  return (
    <div className="flex flex-row h-full">
      <div
        className="relative flex flex-grow border-t border-gray-200"
        style={repeatingBackgroundStyle}
      >
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
