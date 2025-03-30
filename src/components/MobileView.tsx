// src/components/MobileView.tsx
"use client";

import React, { useRef } from "react";
import { useCalendar } from "kanban/context/CalendarContext";
import { DayColumn } from "./DayColumn";
import { addDays, subDays, formatISO, isSameDay } from "date-fns";
import { formatDateKey } from "../lib/dataUtils";
import { motion, PanInfo, useAnimation } from "framer-motion";

const SWIPE_THRESHOLD = 50; // Minimum pixels to trigger navigation

export const MobileView = () => {
  const { events, currentDate, setCurrentDate } = useCalendar();
  const controls = useAnimation();
  const dragContainerRef = useRef<HTMLDivElement>(null);
  const today = new Date();

  // Dates to render: previous, current, next
  const datesToRender = [
    subDays(currentDate, 1),
    currentDate,
    addDays(currentDate, 1),
  ];

  const handleDragEnd = (
    event: MouseEvent | TouchEvent | PointerEvent,
    info: PanInfo
  ) => {
    const offset = info.offset.x;
    const velocity = info.velocity.x;

    if (offset < -SWIPE_THRESHOLD || velocity < -500) {
      // Swiped left (show next day)
      setCurrentDate((prev) => addDays(prev, 1));
      controls.start({ x: 0, transition: { duration: 0 } }); // Reset instantly after nav
    } else if (offset > SWIPE_THRESHOLD || velocity > 500) {
      // Swiped right (show previous day)
      setCurrentDate((prev) => subDays(prev, 1));
      controls.start({ x: 0, transition: { duration: 0 } }); // Reset instantly after nav
    } else {
      // Didn't swipe far enough, animate back to center
      controls.start({
        x: 0,
        transition: { type: "spring", stiffness: 300, damping: 30 },
      });
    }
  };

  return (
    <div ref={dragContainerRef} className="flex-grow overflow-hidden relative">
      {/* This motion div holds the sliding days */}
      <motion.div
        key={formatISO(currentDate)} // Change key to force re-render/reset of position logic on date change
        className="flex absolute inset-0 w-[300%]" // 3 times the width for prev, current, next
        style={{ x: "-100%" }} // Start showing the middle (current) day
        drag="x"
        dragConstraints={dragContainerRef} // Constrain dragging within the container
        dragElastic={0.1} // A little bounce at the edges
        onDragEnd={handleDragEnd}
        animate={controls} // Control position with animation hook
      >
        {datesToRender.map((date) => {
          const dateKey = formatDateKey(date);
          return (
            <div key={dateKey} className="w-full h-full flex-shrink-0">
              <DayColumn
                date={dateKey}
                events={events[dateKey] || []}
                isCurrent={isSameDay(date, today)}
              />
            </div>
          );
        })}
      </motion.div>
    </div>
  );
};
