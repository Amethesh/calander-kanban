"use client";

import React, { useCallback, useEffect, useRef, useState } from "react";
import {
  DndContext,
  DragEndEvent,
  closestCenter,
  TouchSensor,
  useSensor,
  useSensors,
  DragOverlay,
  DragStartEvent,
  MouseSensor,
  DragMoveEvent,
  DragCancelEvent,
} from "@dnd-kit/core";
import { useCalendar } from "kanban/context/CalendarContext";
import { MobileView } from "./MobileView";
import { DesktopView } from "./DesktopView";
import { EventCard } from "./EventCard";
import { Event } from "kanban/types";
import { addDays, parseTime, subDays } from "../lib/dataUtils";

const EDGE_THRESHOLD = 200;
const EDGE_HOVER_DELAY = 900;

export const CalendarView = () => {
  const { viewMode, setCurrentDate, setEvents } = useCalendar(); // Assuming currentDate is available for logging
  const [activeEvent, setActiveEvent] = useState<Event | null>(null);
  const edgeHoverTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  // Use state for the edge ref to ensure re-renders acknowledge it if needed, though ref is often fine
  const isNearEdgeRef = useRef<"left" | "right" | null>(null);
  const activeDragDataRef = useRef<{
    event: Event | null;
    sourceDate: string | null;
  }>({ event: null, sourceDate: null });

  const sensors = useSensors(
    useSensor(MouseSensor, { activationConstraint: { distance: 10 } }),
    useSensor(TouchSensor, {
      activationConstraint: { delay: 250, tolerance: 10, distance: 100 },
    })
  );

  const clearEdgeHoverTimeout = useCallback(() => {
    if (edgeHoverTimeoutRef.current) {
      clearTimeout(edgeHoverTimeoutRef.current);
      edgeHoverTimeoutRef.current = null;
      console.log("Cleared edge hover timeout");
    }
    // Only reset the ref when explicitly clearing (moved away or drag end/cancel)
    isNearEdgeRef.current = null;
  }, []);

  // Clear timeout on unmount or view change as a safeguard
  useEffect(() => {
    return () => {
      clearEdgeHoverTimeout();
    };
  }, [clearEdgeHoverTimeout, viewMode]);

  const handleDragStart = (event: DragStartEvent) => {
    const { active } = event;
    const eventData = active.data.current?.event as Event;
    const sourceDate = active.data.current?.sourceDate as string;
    if (eventData) {
      console.log("Drag Start:", eventData.id, "from", sourceDate);
      setActiveEvent(eventData);
      activeDragDataRef.current = {
        event: eventData,
        sourceDate: sourceDate,
      }; // Store data for move handler
    } else {
      console.error("Drag Start: Missing event data");
      activeDragDataRef.current = { event: null, sourceDate: null };
    }
  };

  const handleDragMove = useCallback(
    (event: DragMoveEvent) => {
      if (viewMode !== "mobile" || !activeDragDataRef.current.event) return;

      const { active, delta } = event;
      const pointerX = (active.rect.current.initial?.left ?? 0) + delta.x;

      let currentlyNear: "left" | "right" | null = null;

      if (pointerX < EDGE_THRESHOLD) {
        currentlyNear = "left";
      } else if (pointerX > EDGE_THRESHOLD) {
        currentlyNear = "right";
      }

      // Debug log
      console.log(
        `Drag Move: pointerX=<span class="math-inline">\{pointerX\.toFixed\(0\)\}, currentlyNear\=</span>{currentlyNear}, isNearEdgeRef=<span class="math-inline">\{isNearEdgeRef\.current\}, timeoutRunning\=</span>{!!edgeHoverTimeoutRef.current}`
      );

      // --- Revised Logic ---
      if (currentlyNear) {
        // Pointer is near an edge
        if (currentlyNear !== isNearEdgeRef.current) {
          // Entered a *new* edge zone (or first time entering)
          console.log(
            `Entered edge zone: ${currentlyNear}. Clearing previous timeout if any.`
          );
          clearEdgeHoverTimeout(); // Clear any previous timer & reset ref
          isNearEdgeRef.current = currentlyNear; // Set the new edge
          // Start a new timer
          console.log(
            `Starting ${EDGE_HOVER_DELAY}ms timeout for ${currentlyNear} scroll.`
          );
          edgeHoverTimeoutRef.current = setTimeout(() => {
            // Check *again* when timeout fires if we are *still* near the *same* edge
            if (isNearEdgeRef.current === currentlyNear) {
              console.log(`Edge Timeout Fired: Scrolling ${currentlyNear}`);
              if (currentlyNear === "left") {
                setCurrentDate((prev) => subDays(prev, 1));
              } else {
                setCurrentDate((prev) => addDays(prev, 1));
              }
              // Reset the timeout ID, but NOT isNearEdgeRef here.
              // Allow the next move event to potentially restart the timer if still near edge.
              edgeHoverTimeoutRef.current = null;
            } else {
              console.log(
                "Edge Timeout Fired: No longer near the original edge. No scroll."
              );
              edgeHoverTimeoutRef.current = null; // Still clear the timeout ID
            }
          }, EDGE_HOVER_DELAY);
        } else {
          // Still near the *same* edge as before.
          // Do nothing if a timer is already running. If not, start one (e.g., if it just fired)
          if (!edgeHoverTimeoutRef.current) {
            console.log(`Still near ${currentlyNear}, starting new timeout.`);
            // Start a new timer (same logic as above)
            edgeHoverTimeoutRef.current = setTimeout(() => {
              if (isNearEdgeRef.current === currentlyNear) {
                console.log(
                  `Edge Timeout Fired (re-trigger): Scrolling ${currentlyNear}`
                );
                if (currentlyNear === "left") {
                  setCurrentDate((prev) => subDays(prev, 1));
                } else {
                  setCurrentDate((prev) => addDays(prev, 1));
                }
                edgeHoverTimeoutRef.current = null;
              } else {
                console.log(
                  "Edge Timeout Fired (re-trigger): No longer near original edge."
                );
                edgeHoverTimeoutRef.current = null;
              }
            }, EDGE_HOVER_DELAY);
          }
        }
      } else {
        // Pointer is NOT near any edge
        if (isNearEdgeRef.current) {
          // We *were* near an edge, but now moved away
          console.log("Moved away from edge. Clearing timeout.");
          clearEdgeHoverTimeout(); // Clear timer and reset ref state
        }
        // If we were not near an edge and still aren't, do nothing.
      }
    },
    [
      viewMode,
      setCurrentDate,
      clearEdgeHoverTimeout /* Add other dependencies if needed, like EDGE_THRESHOLD/DELAY if they change */,
    ]
  );

  const handleDragEnd = (event: DragEndEvent) => {
    console.log("Drag End event:", event);
    const { active, over } = event;

    // Clear any pending edge scroll immediately
    clearEdgeHoverTimeout();

    const draggedEvent = activeDragDataRef.current.event; // Use ref data
    const sourceDate = activeDragDataRef.current.sourceDate; // Use ref data

    setActiveEvent(null); // Clear overlay item
    activeDragDataRef.current = { event: null, sourceDate: null }; // Clear ref data

    if (!over) {
      console.log(
        "Drag cancelled or dropped outside droppable. Event:",
        draggedEvent?.id,
        "Source:",
        sourceDate
      );
      // Optional: Add logic to revert if needed, though dnd-kit usually handles visuals
      return;
    }

    const activeId = active.id as string; // Should match draggedEvent.id
    const targetDate = over.id as string; // ID from the useDroppable target

    console.log(
      `Drag End: Event ${activeId} (from ${sourceDate}) dropped on ${targetDate}`
    );

    // Validate data needed for state update
    if (!draggedEvent || !sourceDate || activeId !== draggedEvent.id) {
      console.error(
        "Missing or inconsistent event data on drag end. Aborting state update.",
        { activeId, draggedEvent, sourceDate }
      );
      return;
    }

    // Only update state if the date actually changed
    if (sourceDate !== targetDate) {
      console.log(
        `Moving event ${activeId} from ${sourceDate} to ${targetDate}`
      );

      setEvents((prevEvents) => {
        const newEvents = { ...prevEvents };

        // Remove from source
        if (newEvents[sourceDate]) {
          const originalLength = newEvents[sourceDate].length;
          newEvents[sourceDate] = newEvents[sourceDate].filter(
            (ev) => ev.id !== activeId
          );
          console.log(
            `Removed from ${sourceDate}. Length before: ${originalLength}, after: ${newEvents[sourceDate].length}`
          );
        } else {
          console.warn(
            `Source date ${sourceDate} not found in events state during move.`
          );
        }

        // Add to target
        if (!newEvents[targetDate]) {
          console.log(`Target date ${targetDate} array initialized.`);
          newEvents[targetDate] = [];
        }

        // Check if it somehow already exists (shouldn't happen with unique IDs and correct logic)
        if (newEvents[targetDate].some((ev) => ev.id === activeId)) {
          console.warn(
            `Event ${activeId} already exists in target ${targetDate}. Skipping add.`
          );
        } else {
          console.log(`Adding event ${activeId} to ${targetDate}.`);
          newEvents[targetDate].push(draggedEvent); // Add the original event object
          // Sort the target array by time
          newEvents[targetDate].sort(
            (a, b) => parseTime(a.time) - parseTime(b.time)
          );
        }

        return newEvents;
      });
    } else {
      console.log(
        `Event ${activeId} dropped on the same date ${targetDate}. No state change needed.`
      );
    }
  };

  const handleDragCancel = (event: DragCancelEvent) => {
    console.log("Drag Cancelled:", event.active.id);
    clearEdgeHoverTimeout(); // Clear timeout on cancel
    setActiveEvent(null); // Clear overlay item
    activeDragDataRef.current = { event: null, sourceDate: null }; // Clear ref data
  };

  return (
    <DndContext
      sensors={sensors}
      collisionDetection={closestCenter}
      onDragMove={handleDragMove}
      onDragStart={handleDragStart}
      onDragEnd={handleDragEnd}
      onDragCancel={handleDragCancel}
    >
      <div className="flex-grow flex flex-col overflow-y-scroll">
        {viewMode === "mobile" ? <MobileView /> : <DesktopView />}
      </div>
      <DragOverlay dropAnimation={null}>
        {activeEvent ? <EventCard event={activeEvent} date="" /> : null}
      </DragOverlay>
    </DndContext>
  );
};
