import React from 'react';
import { motion } from 'framer-motion';

export const AnimatedTitle = ({ className = '' }) => {
  return (
    <div className={`flex items-center gap-2 font-semibold ${className}`}>
      <span className="h-8 w-8 rounded-md bg-primary text-center text-lg font-bold leading-8 text-primary-foreground">
        A
      </span>
      <span className="hidden md:inline-block relative">
        Annotation{' '}
        <span className="relative">
          Manager
          <svg
            viewBox="0 0 286 73"
            fill="none"
            className="absolute -left-2 -right-2 -top-2 bottom-0 translate-y-1 h-6"
          >
            {' '}
            <motion.path
              initial={{ pathLength: 0 }}
              animate={{ pathLength: 1 }}
              whileInView={{ pathLength: 1 }}
              viewport={{ once: false, amount: 0.1 }}
              transition={{
                duration: 1.25,
                ease: 'easeInOut',
              }}
              d="M142.293 1C106.854 16.8908 6.08202 7.17705 1.23654 43.3756C-2.10604 68.3466 29.5633 73.2652 122.688 71.7518C215.814 70.2384 316.298 70.689 275.761 38.0785C230.14 1.37835 97.0503 24.4575 52.9384 1"
              stroke="hsl(var(--primary))"
              strokeWidth="2"
              className="drop-shadow-sm"
            />
          </svg>
        </span>
      </span>
    </div>
  );
};
