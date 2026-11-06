"use client";

import { useState, useRef, useEffect } from "react";
import { AnimatePresence, motion } from "framer-motion";

export default function Dropdown({
  trigger,
  children,
  align = "end",
}: {
  trigger: React.ReactNode;
  children: React.ReactNode;
  align?: "start" | "end";
}) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    }
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, []);

  return (
    <div ref={ref} className="relative inline-block">
      <div onClick={() => setOpen((o) => !o)}>{trigger}</div>
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, scale: 0.96, y: -6 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.96, y: -6 }}
            transition={{ duration: 0.15 }}
            className={`absolute top-full z-50 mt-2 min-w-[180px] rounded-2xl border border-border-light bg-white p-1.5 shadow-lifted dark:border-border-dark dark:bg-surface-dark ${
              align === "end" ? "end-0" : "start-0"
            }`}
            onClick={() => setOpen(false)}
          >
            {children}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

export function DropdownItem({ children, ...props }: React.HTMLAttributes<HTMLButtonElement>) {
  return (
    <button
      className="flex w-full items-center gap-2 rounded-xl px-3 py-2.5 text-start text-sm font-medium hover:bg-steel dark:hover:bg-white/5"
      {...(props as any)}
    >
      {children}
    </button>
  );
}
