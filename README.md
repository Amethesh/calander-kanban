# Calendar Kanban Board ✨

A responsive calendar application built with Next.js, Tailwind CSS, and Framer Motion, featuring draggable event cards, smooth transitions, and distinct mobile/desktop views. This project was created as a frontend challenge implementation.

![Screenshot/GIF Placeholder](https://i.imgur.com/qie31rQ.gif)

## Features 🚀

*   **Responsive Design:**
    *   **Mobile:** Single-day view with infinite horizontal swiping/navigation between days.
    *   **Desktop:** Full week view with previous/next week navigation buttons.
*   **Drag & Drop:** Smoothly drag event cards between different days on both mobile and desktop.
*   **Smooth Card-to-Detail Transition:** Clicking an event card animates it seamlessly into a full-screen detail view using shared layout animations (`Framer Motion`).
*   **Animated Navigation:** The header date display animates smoothly as you navigate between days/weeks.
*   **State Management:** Uses React Context API for managing calendar state (events, current date, selected event) client-side.
*   **Time-Based Sorting:** Events within a day are automatically sorted by their `time` field.
*   **Modern Tech Stack:** Built with popular and efficient frontend technologies.

## Tech Stack 🔧

*   **Framework:** [Next.js](https://nextjs.org/) (App Router)
*   **Language:** [TypeScript](https://www.typescriptlang.org/)
*   **Styling:** [Tailwind CSS](https://tailwindcss.com/)
*   **Animation:** [Framer Motion](https://www.framer.com/motion/)
*   **Drag & Drop:** [@dnd-kit](https://dndkit.com/)
*   **Date Utility:** [date-fns](https://date-fns.org/)
*   **Linting/Formatting:** ESLint, Prettier (configured with Next.js template)

## Getting Started 🏁

Follow these instructions to get a copy of the project up and running on your local machine for development and testing purposes.

### Prerequisites

*   Node.js (v18.x or later recommended)
*   npm, yarn, or pnpm

### Installation

1.  **Clone the repository:**
    ```bash
    git clone https://github.com/Amethesh/calendar-kanban.git
    cd calendar-kanban
    ```

2.  **Install dependencies:**
    ```bash
    npm install
    # or
    yarn install
    # or
    pnpm install
    ```

3.  **Run the development server:**
    ```bash
    npm run dev
    # or
    yarn dev
    # or
    pnpm dev
    ```

4.  Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

## Usage ➡️

*   **Navigation:**
    *   **Desktop:** Use the `<` and `>` buttons in the header to navigate between weeks. Click "Today" to jump to the current week.
    *   **Mobile:** Swipe left or right on the calendar area to move between days, or use the `<` and `>` buttons in the header. Click "Today" to jump to the current day.
*   **Moving Events:** Click and hold an event card, then drag it to a different day column. Release the mouse button (or lift your finger) to drop the event onto the new day.
*   **Viewing Event Details:** Click on any event card. It will smoothly expand into a full-screen modal showing the event details (image, title, time, description).
*   **Closing Event Details:** Click the 'X' button in the top-right corner of the detail modal or click on the semi-transparent overlay background.

## Key Implementation Details 💡

*   **State Management:** `src/context/CalendarContext.tsx` holds the application's core state using React Context, including the events data, current date reference, selected event for the detail view, and the responsive view mode (`mobile`/`desktop`).
*   **Drag and Drop:** `@dnd-kit/core` provides the `DndContext`. `useDraggable` is used on `EventCard` and `useDroppable` is used on `DayColumn`. `DragOverlay` provides a smooth visual feedback during dragging.
*   **Animations:** `Framer Motion` is used extensively:
    *   `layoutId` prop on `motion` components in `EventCard` and `EventDetail` enables the shared element transition.
    *   `AnimatePresence` handles the mount/unmount animations for the `EventDetail` modal and the header date display.
    *   `drag="x"` and `onDragEnd` props handle the swipe gesture navigation in `MobileView`.
*   **Responsiveness:** A `useEffect` hook in `CalendarContext` listens to window resize events to determine the `viewMode` state, which conditionally renders `MobileView` or `DesktopView`. Tailwind's responsive classes handle layout changes.

## Folder Structure (Simplified)

calendar-kanban/
├── public/
├── src/
│ ├── app/ # Next.js App Router pages (layout.tsx, page.tsx)
│ ├── components/ # Reusable React components (EventCard, DayColumn, Header, Views, etc.)
│ ├── context/ # React Context for global state (CalendarContext)
│ ├── data/ # Mock data (events.ts)
│ ├── lib/ # Utility functions (dateUtils.ts)
│ ├── types/ # TypeScript type definitions (index.ts)
│ └── globals.css # Global styles
├── .eslintrc.json
├── next.config.mjs
├── package.json
├── postcss.config.js
├── README.md # You are here!
├── tailwind.config.ts
└── tsconfig.json


## Contributing

Contributions, issues, and feature requests are welcome! Feel free to check the [issues page](https://github.com/Amethesh/calander-kanban/issues) (if you plan to make it public).

## License

This project is licensed under the MIT License - see the LICENSE file for details (You may need to create a LICENSE file, MIT is a common choice).

---
