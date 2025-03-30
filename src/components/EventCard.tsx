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
  date: string;
}

const listOfColours = [
  "fa86b3",
  "6b48e7",
  "fcc441",
  "f74903",
  "4ecdc4",
  "ff6b6b",
  "3d3d3d",
];

const getIndexFromString = (str: string, arrayLength: number): number => {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i);
    hash = (hash << 5) - hash + char;
    hash |= 0;
  }
  return Math.abs(hash) % arrayLength;
};

const getTextColorForBackground = (hexColor: string): string => {
  const r = parseInt(hexColor.substring(0, 2), 16);
  const g = parseInt(hexColor.substring(2, 4), 16);
  const b = parseInt(hexColor.substring(4, 6), 16);
  const brightness = (r * 299 + g * 587 + b * 114) / 1000;
  return brightness > 150 ? "text-black" : "text-white";
};

const getTimeOfDayClass = (timeStr: string): string => {
  try {
    const [time, modifier] = timeStr.split(" ");
    if (!time || !modifier) return "bg-gray-500 text-white";

    const hours = parseInt(time.split(":")[0]);
    const adjustedHours =
      modifier.toUpperCase() === "PM" && hours !== 12
        ? hours + 12
        : modifier.toUpperCase() === "AM" && hours === 12
        ? 0
        : hours;

    if (adjustedHours >= 5 && adjustedHours < 12) {
      return "bg-sky-200 text-sky-800"; // Morning: Light Blue
    } else if (adjustedHours >= 12 && adjustedHours < 17) {
      return "bg-emerald-200 text-emerald-800"; // Afternoon: Light Green
    } else if (adjustedHours >= 17 && adjustedHours < 22) {
      return "bg-amber-200 text-amber-800"; // Evening: Light Orange/Amber
    } else {
      return "bg-indigo-200 text-indigo-800"; // Night: Light Indigo
    }
  } catch (error) {
    console.error("Error parsing time for badge:", timeStr, error);
    return "bg-gray-500 text-white";
  }
};

export const EventCard = ({ event, date }: EventCardProps) => {
  const { setSelectedEvent } = useCalendar();
  const { attributes, listeners, setNodeRef, transform, isDragging } =
    useDraggable({
      id: event.id,
      data: { event, sourceDate: date }, // Pass event data and source date
    });

  const colorIndex = getIndexFromString(event.id, listOfColours.length);
  const cardColorHex = listOfColours[colorIndex];
  const cardBgColorStyle = `#${cardColorHex}`;
  const textColorClass = getTextColorForBackground(cardColorHex);
  const timeOfDayClass = getTimeOfDayClass(event.time);

  const style = {
    transform: CSS.Translate.toString(transform),
    zIndex: isDragging ? 100 : 1,
    opacity: isDragging ? 0.85 : 1,
    cursor: isDragging ? "grabbing" : "grab",
  };

  const bgStyle = {
    backgroundColor: cardBgColorStyle,
    backgroundImage: `linear-gradient(to bottom right, ${cardBgColorStyle}, rgba(255,255,255,0.2))`,
  };

  const handleCardClick = () => {
    setSelectedEvent(event);
  };

  return (
    <motion.div
      ref={setNodeRef}
      style={style}
      layoutId={`card-${event.id}`}
      className={`rounded-xl shadow-lg p-0 mb-4 touch-none overflow-hidden flex flex-col ${textColorClass}`}
      {...listeners}
      {...attributes}
      onClick={handleCardClick}
      whileHover={{ scale: 1.02 }}
      transition={{ type: "spring", stiffness: 400, damping: 25 }}
    >
      {event.imageUrl && (
        <motion.div
          layoutId={`image-container-${event.id}`}
          className="relative h-32 w-full translate-y-4 -z-20"
        >
          <Image
            src={event.imageUrl}
            alt={event.title}
            layout="fill"
            objectFit="cover"
            priority={false}
            className="opacity-90  rounded-t-xl"
          />
        </motion.div>
      )}

      <motion.div
        style={bgStyle}
        className="p-4 flex flex-col flex-grow rounded-xl"
      >
        <motion.h3
          layoutId={`title-${event.id}`}
          className="font-bold text-base mb-2 leading-tight"
        >
          {event.title}
        </motion.h3>
        <motion.div
          className={`inline-block px-2.5 py-1 rounded-full text-xs font-medium ${timeOfDayClass} mb-3 self-start`}
        >
          {event.time}
        </motion.div>
        <motion.p className={`text-sm opacity-80 line-clamp-3 flex-grow`}>
          {event.description}
        </motion.p>
      </motion.div>
    </motion.div>
  );
};
