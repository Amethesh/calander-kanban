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
  currentDate: Date;
  setCurrentDate: Dispatch<SetStateAction<Date>>;
  selectedEvent: Event | null;
  setSelectedEvent: Dispatch<SetStateAction<Event | null>>;
  viewMode: ViewMode;
}

const CalendarContext = createContext<CalendarContextProps | undefined>(
  undefined
);

const getInitialDate = (): Date => {
  const firstEventDate = Object.keys(initialEvents).sort()[0];
  return firstEventDate ? parseISO(firstEventDate) : new Date();
};

export const CalendarProvider = ({ children }: { children: ReactNode }) => {
  const [events, setEvents] = useState<EventsByDate>(initialEvents);
  const [currentDate, setCurrentDate] = useState<Date>(() => getInitialDate());
  const [selectedEvent, setSelectedEvent] = useState<Event | null>(null);
  const [viewMode, setViewMode] = useState<ViewMode>("desktop");

  useEffect(() => {
    const checkViewMode = () => {
      setViewMode(window.innerWidth < 768 ? "mobile" : "desktop");
    };
    checkViewMode();
    window.addEventListener("resize", checkViewMode);
    return () => window.removeEventListener("resize", checkViewMode);
  }, []);

  useEffect(() => {
    if (viewMode === "desktop") {
      setCurrentDate((prevDate) => startOfWeek(prevDate, { weekStartsOn: 1 }));
    } else {
      setCurrentDate(() => getInitialDate());
    }
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
