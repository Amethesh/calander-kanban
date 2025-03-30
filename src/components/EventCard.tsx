// src/components/EventCard.tsx
"use client";

import React from "react";
import Image from "next/image";
import { Event } from "kanban/types";
import { useDraggable } from "@dnd-kit/core";
import { CSS } from "@dnd-kit/utilities";
import { motion } from "framer-motion";
import { useCalendar } from "kanban/context/CalendarContext";

interface EventCardProps {
  event: Event;
  date: string; // Pass the date for context if needed during drag
}

// Helper function to parse time for sorting
const parseTime = (timeStr: string): number => {
  const [time, modifier] = timeStr.split(" ");
  let hours;
  const [hoursStr, minutes] = time.split(":").map(Number);
  hours = hoursStr;
  if (modifier === "PM" && hours !== 12) hours += 12;
  if (modifier === "AM" && hours === 12) hours = 0; // Midnight case
  return hours * 60 + minutes;
};

const getTimeOfDayColor = (timeStr: string): string => {
  const [time, modifier] = timeStr.split(" ");
  const hours = parseInt(time.split(":")[0]);
  const adjustedHours =
    modifier === "PM" && hours !== 12
      ? hours + 12
      : modifier === "AM" && hours === 12
      ? 0
      : hours;

  if (adjustedHours >= 5 && adjustedHours < 12) {
    return "bg-yellow-800 text-yellow-100"; // Morning: Yellow
  } else if (adjustedHours >= 12 && adjustedHours < 17) {
    return "bg-green-800 text-green-100"; // Afternoon: Green
  } else if (adjustedHours >= 17 && adjustedHours < 22) {
    return "bg-orange-800 text-orange-100"; // Evening: Orange
  } else {
    return "bg-purple-800 text-purple-100"; // Night: Purple
  }
};

export const EventCard = ({ event, date }: EventCardProps) => {
  const { setSelectedEvent } = useCalendar();
  const { attributes, listeners, setNodeRef, transform, isDragging } =
    useDraggable({
      id: event.id,
      data: { event, sourceDate: date }, // Pass event data and source date
    });

  const style = {
    transform: CSS.Translate.toString(transform),
    zIndex: isDragging ? 100 : 1, // Bring dragged item to front
    opacity: isDragging ? 0.8 : 1,
    cursor: isDragging ? "grabbing" : "grab",
  };

  const handleCardClick = () => {
    setSelectedEvent(event);
  };

  const timeOfDayColor = getTimeOfDayColor(event.time);

  return (
    <motion.div
      ref={setNodeRef}
      style={style}
      layoutId={`card-${event.id}`} // Crucial for shared layout animation
      className="bg-[#121212] rounded-lg shadow-md p-3 mb-3 border border-[#212121] touch-none hover:border-[#333333]" // touch-none prevents scrolling while dragging on mobile
      {...listeners}
      {...attributes}
      onClick={handleCardClick}
      whileHover={{ scale: 1.03 }}
      transition={{ type: "spring", stiffness: 300, damping: 20 }}
    >
      {/* Inner elements can also have layoutId for finer animation control */}
      <motion.h3
        layoutId={`title-${event.id}`}
        className="font-semibold text-sm mb-1 text-gray-100"
      >
        {event.title}
      </motion.h3>
      <motion.div
        className={`inline-block px-2 py-1 rounded-full text-xs ${timeOfDayColor} mb-2`}
      >
        {event.time}
      </motion.div>
      {/* Optional: Show image thumbnail */}
      {event.imageUrl && (
        <motion.div
          layoutId={`image-container-${event.id}`}
          className="relative h-16 w-full rounded overflow-hidden mb-1"
        >
          <Image
            // Use layoutId on Image *if* Image component supports it directly, otherwise wrap
            // layoutId={`image-${event.id}`}
            src={event.imageUrl}
            alt={event.title}
            layout="fill"
            objectFit="cover"
            priority={false} // Lower priority for list images
          />
        </motion.div>
      )}
      {/* <p className="text-xs text-gray-600 line-clamp-2">{event.description}</p> */}
    </motion.div>
  );
};

// Re-export helper if needed elsewhere
export { parseTime };
