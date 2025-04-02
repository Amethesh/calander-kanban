"use client";

import React, { useRef } from "react";
import { useCalendar } from "kanban/context/CalendarContext";
import { DayColumn } from "./DayColumn";
import { addDays, subDays, formatISO, isSameDay } from "date-fns";
import { formatDateKey } from "../lib/dataUtils";
import { motion, PanInfo, useAnimation } from "framer-motion";

const SWIPE_THRESHOLD = 50;

export const MobileView = () => {
  const { events, currentDate, setCurrentDate } = useCalendar();
  const controls = useAnimation();
  const dragContainerRef = useRef<HTMLDivElement>(null);
  const today = new Date();

  const datesToRender = [
    // subDays(currentDate, 1),
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
      setCurrentDate((prev) => addDays(prev, 1));
      controls.start({ x: 0, transition: { duration: 0 } });
    } else if (offset > SWIPE_THRESHOLD || velocity > 500) {
      setCurrentDate((prev) => subDays(prev, 1));
      controls.start({ x: 0, transition: { duration: 0 } });
    } else {
      controls.start({
        x: 0,
        transition: { type: "spring", stiffness: 300, damping: 30 },
      });
    }
  };
  return (
    <div ref={dragContainerRef} className="flex-grow overflow-hidden relative">
      <motion.div
        key={formatISO(currentDate)}
        className="flex absolute inset-0 "
        // drag="x"
        dragConstraints={dragContainerRef}
        dragElastic={0.1}
        onDragEnd={handleDragEnd}
        animate={controls}
      >
        {datesToRender.map((date) => {
          const dateKey = formatDateKey(date);
          console.log("Rendering date:", dateKey);
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
