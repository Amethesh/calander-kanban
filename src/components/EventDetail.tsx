// src/components/EventDetail.tsx
"use client";

import React from "react";
import Image from "next/image";
import { motion, AnimatePresence } from "framer-motion";
import { XMarkIcon } from "@heroicons/react/24/solid";
import { useCalendar } from "kanban/context/CalendarContext";

export const EventDetail = () => {
  const { selectedEvent, setSelectedEvent } = useCalendar();

  const handleClose = () => {
    setSelectedEvent(null);
  };

  return (
    <AnimatePresence>
      {selectedEvent && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
          onClick={handleClose} // Close on overlay click
        >
          {/* Stop propagation to prevent closing when clicking card content */}
          <motion.div
            layoutId={`card-${selectedEvent.id}`} // MATCHES EventCard layoutId
            className="bg-white relative rounded-xl shadow-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto flex flex-col"
            onClick={(e) => e.stopPropagation()}
            transition={{ type: "spring", stiffness: 300, damping: 30 }}
          >
            {/* Image Section */}
            {selectedEvent.imageUrl && (
              <motion.div
                layoutId={`image-container-${selectedEvent.id}`} // Match if used in EventCard
                className="relative w-full h-48 md:h-64 flex-shrink-0"
              >
                <Image
                  // layoutId={`image-${selectedEvent.id}`} // Match if used
                  src={selectedEvent.imageUrl}
                  alt={selectedEvent.title}
                  layout="fill"
                  objectFit="cover"
                  className="rounded-t-xl"
                  priority // Load high priority as it's the main view
                />
              </motion.div>
            )}

            {/* Content Section */}
            <div className="p-6 flex-grow">
              <motion.h2
                layoutId={`title-${selectedEvent.id}`} // Match if used
                className="text-2xl font-bold mb-2 text-gray-900"
              >
                {selectedEvent.title}
              </motion.h2>
              <motion.p
                layoutId={`time-${selectedEvent.id}`} // Match if used
                className="text-sm text-indigo-600 font-medium mb-4"
              >
                {selectedEvent.time}
              </motion.p>
              <motion.p
                // Animate description appearance
                initial={{ opacity: 0 }}
                animate={{ opacity: 1, transition: { delay: 0.2 } }}
                className="text-gray-700 leading-relaxed"
              >
                {selectedEvent.description}
              </motion.p>
            </div>

            {/* Close Button */}
            <button
              onClick={handleClose}
              className="absolute top-3 right-3 p-2 bg-white/50 rounded-full hover:bg-white/80 transition-colors cursor-pointer shadow-md"
              aria-label="Close event details"
            >
              <XMarkIcon className="w-6 h-6 text-gray-700" />
            </button>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};
