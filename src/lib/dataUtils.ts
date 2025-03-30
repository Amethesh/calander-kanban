// src/lib/dateUtils.ts
import {
  format,
  addDays,
  subDays,
  addWeeks,
  subWeeks,
  startOfWeek,
  endOfWeek,
  eachDayOfInterval,
  parseISO,
  isSameDay,
  formatISO,
} from "date-fns";

const DATE_FORMAT = "yyyy-MM-dd";
const WEEK_STARTS_ON = 1; // Monday

export const formatDateKey = (date: Date): string => {
  return format(date, DATE_FORMAT);
};

export const parseTime = (timeStr: string): number => {
  const [time, modifier] = timeStr.split(" ");
  const [minutes] = time.split(":").map(Number);
  let hours = minutes;
  if (modifier === "PM" && hours !== 12) hours += 12;
  if (modifier === "AM" && hours === 12) hours = 0; // Midnight case
  return hours * 60 + minutes;
};

export const getWeekDays = (date: Date): Date[] => {
  const start = startOfWeek(date, { weekStartsOn: WEEK_STARTS_ON });
  const end = endOfWeek(date, { weekStartsOn: WEEK_STARTS_ON });
  return eachDayOfInterval({ start, end });
};

export const getWeekDisplay = (date: Date): string => {
  const start = startOfWeek(date, { weekStartsOn: WEEK_STARTS_ON });
  const end = endOfWeek(date, { weekStartsOn: WEEK_STARTS_ON });
  // Format like "Mar 11 - 17, 2024"
  const startMonth = format(start, "MMM");
  const endMonth = format(end, "MMM");
  if (startMonth === endMonth) {
    return `${startMonth} ${format(start, "d")} - ${format(end, "d")}, ${format(
      start,
      "yyyy"
    )}`;
  } else {
    return `${startMonth} ${format(start, "d")} - ${endMonth} ${format(
      end,
      "d"
    )}, ${format(start, "yyyy")}`;
  }
};

export {
  format,
  addDays,
  subDays,
  addWeeks,
  subWeeks,
  parseISO,
  isSameDay,
  formatISO,
  startOfWeek, // Re-export for direct use
};
