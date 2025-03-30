// src/app/layout.tsx
import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { ReactNode } from "react";
import { CalendarProvider } from "kanban/context/CalendarContext";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Calendar Kanban Board",
  description: "Draggable calendar events",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${inter.className} bg-background-gradient min-h-screen`}
      >
        {/* Wrap entire application potentially needing calendar state */}
        <CalendarProvider>{children}</CalendarProvider>
      </body>
    </html>
  );
}
