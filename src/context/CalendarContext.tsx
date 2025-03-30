// src/context/CalendarContext.tsx
"use client";

import React, {
  createContext,
  useState,
  useContext,
  ReactNode,
  Dispatch,
  SetStateAction,
  useEffect,
} from "react";
import { EventsByDate, Event } from "../types/index";
import initialEvents from "../data/events";
import { startOfWeek, parseISO } from "date-fns";

type ViewMode = "mobile" | "desktop";

interface CalendarContextProps {
  events: EventsByDate;
  setEvents: Dispatch<SetStateAction<EventsByDate>>;
  currentDate: Date; // Represents the focused day (mobile) or start of week (desktop)
  setCurrentDate: Dispatch<SetStateAction<Date>>;
  selectedEvent: Event | null;
  setSelectedEvent: Dispatch<SetStateAction<Event | null>>;
  viewMode: ViewMode;
}

const CalendarContext = createContext<CalendarContextProps | undefined>(
  undefined
);

// Helper to get initial date (e.g., first date with events or today)
const getInitialDate = (): Date => {
  const firstEventDate = Object.keys(initialEvents).sort()[0];
  return firstEventDate ? parseISO(firstEventDate) : new Date();
};

export const CalendarProvider = ({ children }: { children: ReactNode }) => {
  const [events, setEvents] = useState<EventsByDate>(initialEvents);
  const [currentDate, setCurrentDate] = useState<Date>(() =>
    startOfWeek(getInitialDate(), { weekStartsOn: 1 })
  ); // Start week on Monday
  const [selectedEvent, setSelectedEvent] = useState<Event | null>(null);
  const [viewMode, setViewMode] = useState<ViewMode>("desktop"); // Default, will update client-side

  // Client-side effect to determine view mode
  useEffect(() => {
    const checkViewMode = () => {
      // Using 768px as a common breakpoint for tablets/mobile landscape
      setViewMode(window.innerWidth < 768 ? "mobile" : "desktop");
    };
    checkViewMode(); // Initial check
    window.addEventListener("resize", checkViewMode);
    return () => window.removeEventListener("resize", checkViewMode);
  }, []);

  // Adjust currentDate based on viewMode change if needed
  useEffect(() => {
    // If switching to desktop, ensure currentDate is the start of the week
    if (viewMode === "desktop") {
      setCurrentDate((prevDate) => startOfWeek(prevDate, { weekStartsOn: 1 }));
    }
    // No specific adjustment needed when switching to mobile, it just uses the date
  }, [viewMode]);

  return (
    <CalendarContext.Provider
      value={{
        events,
        setEvents,
        currentDate,
        setCurrentDate,
        selectedEvent,
        setSelectedEvent,
        viewMode,
      }}
    >
      {children}
    </CalendarContext.Provider>
  );
};

export const useCalendar = (): CalendarContextProps => {
  const context = useContext(CalendarContext);
  if (!context) {
    throw new Error("useCalendar must be used within a CalendarProvider");
  }
  return context;
};
