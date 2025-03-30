"use client";
import React from "react";

const TimeColumn = ({ minTime = 0, maxTime = 23 }) => {
  // Generate array of hours between minTime and maxTime
  const generateTimeSlots = () => {
    const timeSlots = [];
    for (let hour = minTime; hour <= maxTime; hour++) {
      // Convert 24-hour format to 12-hour format with AM/PM
      const hour12 = hour % 12 || 12;
      const amPm = hour < 12 ? "AM" : "PM";
      const formattedTime = `${hour12.toString().padStart(2, "0")}:00 ${amPm}`;

      timeSlots.push(formattedTime);
    }
    return timeSlots;
  };

  const timeSlots = generateTimeSlots();

  return (
    <div className="time-column mt-20">
      {timeSlots.map((time, index) => (
        <div key={index} className="time-slot h-20">
          {time}
        </div>
      ))}
    </div>
  );
};

export default TimeColumn;
