// src/app/page.tsx
// "use client"; // Required because we use hooks and context

import { CalendarHeader } from "kanban/components/CalendarHeader";
import { CalendarView } from "kanban/components/CalendarView";
import { EventDetail } from "kanban/components/EventDetail";
// import { useCalendar } from "kanban/context/CalendarContext"; // Ensure useCalendar is client-side usable

export default function Home() {
  // We don't strictly need useCalendar here if EventDetail reads it internally,
  // but it's good practice to show dependencies.
  // const { selectedEvent } = useCalendar(); // This line would make the page client-side only

  return (
    <main className="flex flex-col h-screen overflow-hidden">
      <CalendarHeader />
      <div className="flex-grow flex flex-col overflow-hidden">
        {/* CalendarView contains DndContext and switches between Mobile/Desktop */}
        <CalendarView />
      </div>
      {/* Event Detail Modal - Renders conditionally based on context state */}
      <EventDetail />
    </main>
  );
}
