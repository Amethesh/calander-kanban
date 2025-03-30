// src/components/CalendarView.tsx
"use client";

import React, { useState } from "react";
import {
  DndContext,
  DragEndEvent,
  closestCenter,
  PointerSensor,
  KeyboardSensor,
  useSensor,
  useSensors,
  DragOverlay,
  DragStartEvent,
} from "@dnd-kit/core";
import { sortableKeyboardCoordinates } from "@dnd-kit/sortable";
import { useCalendar } from "kanban/context/CalendarContext";
import { MobileView } from "./MobileView";
import { DesktopView } from "./DesktopView";
import { EventCard } from "./EventCard";
import { Event } from "kanban/types";
import { parseTime } from "../lib/dataUtils"; // Assuming parseTime is exported or moved here

export const CalendarView = () => {
  const { viewMode, setEvents } = useCalendar();
  const [activeEvent, setActiveEvent] = useState<Event | null>(null); // For DragOverlay

  const sensors = useSensors(
    useSensor(PointerSensor, {
      // Require the mouse to move by 10 pixels before starting a drag
      // Helps avoid conflicts with clicks
      activationConstraint: {
        distance: 10,
      },
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  const handleDragStart = (event: DragStartEvent) => {
    const { active } = event;
    // Find the event being dragged from the original data passed to useDraggable
    const eventData = active.data.current?.event as Event;
    if (eventData) {
      setActiveEvent(eventData);
    }
  };

  const handleDragEnd = (event: DragEndEvent) => {
    setActiveEvent(null);
    const { active, over } = event;

    if (!over) {
      console.log("Drag cancelled or dropped outside a droppable area");
      return;
    }

    const activeId = active.id as string;
    const targetDate = over.id as string; // DayColumn's ID is the date string
    console.log(`Active ID: ${activeId}`);
    console.log(`Dropped on ${targetDate}`);

    // Get source date from the data passed during drag start
    const sourceDate = active.data.current?.sourceDate as string;
    const draggedEvent = active.data.current?.event as Event;
    console.log(`Source Date: ${sourceDate}`);
    console.log(`Dragged Event: ${JSON.stringify(draggedEvent)}`);

    if (!draggedEvent || !sourceDate) {
      console.error("Missing event data on drag end");
      return;
    }

    if (sourceDate !== targetDate) {
      console.log(
        `Moving event ${activeId} from ${sourceDate} to ${targetDate}`
      );

      setEvents((prevEvents) => {
        const newEvents = { ...prevEvents };

        if (newEvents[sourceDate]) {
          newEvents[sourceDate] = newEvents[sourceDate].filter(
            (ev) => ev.id !== activeId
          );
        }

        // Add to target date
        if (!newEvents[targetDate]) {
          newEvents[targetDate] = []; // Create array if day doesn't exist
        }

        // Avoid duplicates if drag logic somehow fires incorrectly
        if (!newEvents[targetDate].some((ev) => ev.id === activeId)) {
          newEvents[targetDate].push(draggedEvent);
          // Sort the target day's events by time
          newEvents[targetDate].sort(
            (a, b) => parseTime(a.time) - parseTime(b.time)
          );
        }

        return newEvents;
      });
    } else {
      console.log(`Event ${activeId} dropped on the same date ${targetDate}`);
      // Reordering within the same day is not required per instructions.
      // If it were, this is where you'd implement it using libraries like @dnd-kit/sortable
    }
  };

  return (
    <DndContext
      sensors={sensors}
      collisionDetection={closestCenter} // Or other strategies if needed
      onDragStart={handleDragStart}
      onDragEnd={handleDragEnd}
    >
      <div className="flex-grow flex flex-col overflow-y-scroll">
        {viewMode === "mobile" ? <MobileView /> : <DesktopView />}
      </div>

      {/* Drag Overlay for smooth visual feedback */}
      <DragOverlay dropAnimation={null}>
        {activeEvent ? (
          // Render a copy of the card being dragged
          <EventCard event={activeEvent} date="" /> // Date prop isn't crucial here
        ) : null}
      </DragOverlay>
    </DndContext>
  );
};
