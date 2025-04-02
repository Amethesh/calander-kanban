import { CalendarHeader } from "kanban/components/CalendarHeader";
import { CalendarView } from "kanban/components/CalendarView";
import { EventDetail } from "kanban/components/EventDetail";

export default function Home() {
  return (
    <main className="flex flex-col h-screen overflow-hidden">
      <CalendarHeader />
      <div className="flex-grow flex flex-col overflow-hidden">
        <CalendarView />
      </div>
      <EventDetail />
    </main>
  );
}
