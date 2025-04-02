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
  const { viewMode, setCurrentDate, setEvents } = useCalendar();
  const [activeEvent, setActiveEvent] = useState<Event | null>(null);
  const edgeHoverTimeoutRef = useRef<NodeJS.Timeout | null>(null);
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
    isNearEdgeRef.current = null;
  }, []);

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
      };
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

      if (currentlyNear) {
        if (currentlyNear !== isNearEdgeRef.current) {
          console.log(
            `Entered edge zone: ${currentlyNear}. Clearing previous timeout if any.`
          );
          clearEdgeHoverTimeout();
          isNearEdgeRef.current = currentlyNear;
          edgeHoverTimeoutRef.current = setTimeout(() => {
            if (isNearEdgeRef.current === currentlyNear) {
              console.log(`Edge Timeout Fired: Scrolling ${currentlyNear}`);
              if (currentlyNear === "left") {
                setCurrentDate((prev) => subDays(prev, 1));
              } else {
                setCurrentDate((prev) => addDays(prev, 1));
              }
              edgeHoverTimeoutRef.current = null;
            } else {
              edgeHoverTimeoutRef.current = null;
            }
          }, EDGE_HOVER_DELAY);
        } else {
          if (!edgeHoverTimeoutRef.current) {
            console.log(`Still near ${currentlyNear}, starting new timeout.`);
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
        if (isNearEdgeRef.current) {
          console.log("Moved away from edge. Clearing timeout.");
          clearEdgeHoverTimeout();
        }
      }
    },
    [viewMode, setCurrentDate, clearEdgeHoverTimeout]
  );

  const handleDragEnd = (event: DragEndEvent) => {
    console.log("Drag End event:", event);
    const { active, over } = event;
    clearEdgeHoverTimeout();

    const draggedEvent = activeDragDataRef.current.event;
    const sourceDate = activeDragDataRef.current.sourceDate;

    setActiveEvent(null);
    activeDragDataRef.current = { event: null, sourceDate: null };

    if (!over) {
      console.log(
        "Drag cancelled or dropped outside droppable. Event:",
        draggedEvent?.id,
        "Source:",
        sourceDate
      );
      return;
    }

    const activeId = active.id as string;
    const targetDate = over.id as string;

    console.log(
      `Drag End: Event ${activeId} (from ${sourceDate}) dropped on ${targetDate}`
    );
    if (!draggedEvent || !sourceDate || activeId !== draggedEvent.id) {
      console.error(
        "Missing or inconsistent event data on drag end. Aborting state update.",
        { activeId, draggedEvent, sourceDate }
      );
      return;
    }

    if (sourceDate !== targetDate) {
      console.log(
        `Moving event ${activeId} from ${sourceDate} to ${targetDate}`
      );

      setEvents((prevEvents) => {
        const newEvents = { ...prevEvents };
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

        if (!newEvents[targetDate]) {
          console.log(`Target date ${targetDate} array initialized.`);
          newEvents[targetDate] = [];
        }
        if (newEvents[targetDate].some((ev) => ev.id === activeId)) {
          console.warn(
            `Event ${activeId} already exists in target ${targetDate}. Skipping add.`
          );
        } else {
          console.log(`Adding event ${activeId} to ${targetDate}.`);
          newEvents[targetDate].push(draggedEvent);
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
    clearEdgeHoverTimeout();
    setActiveEvent(null);
    activeDragDataRef.current = { event: null, sourceDate: null };
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
