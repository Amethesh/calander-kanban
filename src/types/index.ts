// src/types/index.ts
export interface Event {
  id: string;
  title: string;
  description: string;
  imageUrl: string;
  time: string; // Keep as string for now, parse when needed for sorting
}

export interface EventsByDate {
  [date: string]: Event[]; // Date string in 'yyyy-MM-dd' format
}
