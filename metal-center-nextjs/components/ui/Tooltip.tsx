"use client";

import { useState } from "react";
import { AnimatePresence, motion } from "framer-motion";

export default function Tooltip({ label, children }: { label: string; children: React.ReactNode }) {
  const [show, setShow] = useState(false);
  return (
    <span
      className="relative inline-flex"
      onMouseEnter={() => setShow(true)}
      onMouseLeave={() => setShow(false)}
      onFocus={() => setShow(true)}
      onBlur={() => setShow(false)}
    >
      {children}
      <AnimatePresence>
        {show && (
          <motion.span
            initial={{ opacity: 0, y: 4 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 4 }}
            transition={{ duration: 0.12 }}
            role="tooltip"
            className="pointer-events-none absolute bottom-full start-1/2 mb-2 -translate-x-1/2 whitespace-nowrap rounded-lg bg-navy px-2.5 py-1.5 text-[11px] font-semibold text-white shadow-soft"
          >
            {label}
          </motion.span>
        )}
      </AnimatePresence>
    </span>
  );
}
