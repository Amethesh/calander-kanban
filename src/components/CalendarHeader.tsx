"use client";

import React, { useRef, useEffect, useMemo } from "react";
import { useCalendar } from "kanban/context/CalendarContext";
import {
  format,
  addDays,
  subDays,
  addWeeks,
  subWeeks,
  eachDayOfInterval,
  isSameDay,
} from "date-fns";
import { getWeekDisplay } from "../lib/dataUtils";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronLeftIcon, ChevronRightIcon } from "@heroicons/react/24/solid";
import Image from "next/image";

export const CalendarHeader = () => {
  const { currentDate, setCurrentDate, viewMode } = useCalendar();
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const selectedDateRef = useRef<HTMLButtonElement>(null);

  // --- Desktop Logic ---
  const handlePrevWeek = () => setCurrentDate((prev) => subWeeks(prev, 1));
  const handleNextWeek = () => setCurrentDate((prev) => addWeeks(prev, 1));
  const desktopDateDisplay = getWeekDisplay(currentDate);

  const handleToday = () => {
    setCurrentDate(new Date());
  };

  // --- Mobile Logic ---
  const mobileDateRange = useMemo(() => {
    const today = new Date();
    const startDate = subDays(today, 90);
    const endDate = addDays(today, 90);
    return eachDayOfInterval({ start: startDate, end: endDate });
  }, []);

  const handleSelectDateMobile = (date: Date) => {
    setCurrentDate(date);
  };
  console.log("Header currentDate", currentDate);
  useEffect(() => {
    if (
      viewMode === "mobile" &&
      selectedDateRef.current &&
      scrollContainerRef.current
    ) {
      selectedDateRef.current.scrollIntoView({
        behavior: "smooth",
        inline: "center",
        block: "nearest",
      });
    }
  }, [currentDate, viewMode]);

  return (
    <div className="bg-header-gradient text-white shadow-md">
      <div className="flex items-center justify-between p-4 pb-2">
        <div className="flex items-center space-x-4">
          <h1 className="flex items-center">
            <Image
              src="/logo.png"
              alt="logo"
              width={30}
              height={30}
              className="object-contain"
            />
            <span className="text-2xl text-[#6b4ce5]">Kanban</span>
          </h1>
        </div>
        <button
          onClick={handleToday}
          className="px-3 py-1 border border-white rounded text-sm hover:bg-white/20 transition-colors"
        >
          Today
        </button>
      </div>
      <div className="flex items-center justify-center px-4 pb-3">
        {viewMode === "mobile" ? (
          <div
            ref={scrollContainerRef}
            className="flex space-x-1 overflow-x-auto pb-2 scrollbar-hide scroll-smooth w-full justify-start"
          >
            {mobileDateRange.map((date) => {
              const isSelected = isSameDay(date, currentDate);
              return (
                <button
                  key={date.toISOString()}
                  ref={isSelected ? selectedDateRef : null}
                  onClick={() => handleSelectDateMobile(date)}
                  aria-label={`Select date ${format(date, "MMMM d, yyyy")}`}
                  className={`flex flex-col items-center justify-center p-2 rounded-lg w-14 h-14 flex-shrink-0 border transition-colors ${
                    isSelected
                      ? "bg-white text-[#6b4ce5] border-transparent font-semibold shadow-md"
                      : "bg-transparent border-white/30 hover:bg-white/20"
                  }`}
                >
                  <span className="text-xs uppercase font-medium">
                    {format(date, "eee")}
                  </span>
                  <span className="text-lg font-bold">{format(date, "d")}</span>
                </button>
              );
            })}
          </div>
        ) : (
          <div className="flex items-center space-x-2">
            <button
              onClick={handlePrevWeek}
              aria-label="Previous week"
              className="p-2 rounded-full hover:bg-white/20 transition-colors"
            >
              <ChevronLeftIcon className="w-5 h-5" />
            </button>
            <AnimatePresence mode="wait">
              <motion.div
                key={desktopDateDisplay}
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 10 }}
                transition={{ duration: 0.2 }}
                className="text-center w-48 font-medium"
              >
                {desktopDateDisplay}
              </motion.div>
            </AnimatePresence>

            <button
              onClick={handleNextWeek}
              aria-label="Next week"
              className="p-2 rounded-full hover:bg-white/20 transition-colors"
            >
              <ChevronRightIcon className="w-5 h-5" />
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
