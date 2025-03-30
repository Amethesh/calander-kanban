// src/components/CalendarHeader.tsx
"use client";

import React from "react";
import { useCalendar } from "kanban/context/CalendarContext";
import { format, addDays, subDays, addWeeks, subWeeks } from "date-fns";
import { getWeekDisplay } from "../lib/dataUtils";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronLeftIcon, ChevronRightIcon } from "@heroicons/react/24/solid"; // Install @heroicons/react

export const CalendarHeader = () => {
  const { currentDate, setCurrentDate, viewMode } = useCalendar();

  const handlePrev = () => {
    setCurrentDate((prev) =>
      viewMode === "mobile" ? subDays(prev, 1) : subWeeks(prev, 1)
    );
  };

  const handleNext = () => {
    setCurrentDate((prev) =>
      viewMode === "mobile" ? addDays(prev, 1) : addWeeks(prev, 1)
    );
  };

  const handleToday = () => {
    setCurrentDate(new Date());
  };

  const displayDate =
    viewMode === "mobile"
      ? format(currentDate, "MMMM d, yyyy")
      : getWeekDisplay(currentDate);

  return (
    <div className="flex items-center justify-between p-4 bg-header-gradient text-white shadow-md">
      <div className="flex items-center space-x-4">
        <h1 className="text-xl font-semibold">Calendar</h1>
        <button
          onClick={handleToday}
          className="px-3 py-1 border border-white rounded text-sm hover:bg-white/20 transition-colors"
        >
          Today
        </button>
      </div>

      <div className="flex items-center space-x-2">
        <button
          onClick={handlePrev}
          aria-label={viewMode === "mobile" ? "Previous day" : "Previous week"}
          className="p-2 rounded-full hover:bg-white/20 transition-colors"
        >
          <ChevronLeftIcon className="w-5 h-5" />
        </button>

        {/* Animate the date display text */}
        <AnimatePresence mode="wait">
          <motion.div
            key={displayDate} // Change key triggers animation
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 10 }}
            transition={{ duration: 0.2 }}
            className="text-center w-48 font-medium" // Fixed width helps stability
          >
            {displayDate}
          </motion.div>
        </AnimatePresence>

        <button
          onClick={handleNext}
          aria-label={viewMode === "mobile" ? "Next day" : "Next week"}
          className="p-2 rounded-full hover:bg-white/20 transition-colors"
        >
          <ChevronRightIcon className="w-5 h-5" />
        </button>
      </div>
      {/* Placeholder for potential future actions */}
      <div className="w-24"></div>
    </div>
  );
};
