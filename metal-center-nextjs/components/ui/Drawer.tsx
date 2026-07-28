"use client";

import { AnimatePresence, motion } from "framer-motion";
import { X } from "lucide-react";

export default function Drawer({
  open,
  onClose,
  side = "end",
  title,
  children,
}: {
  open: boolean;
  onClose: () => void;
  side?: "start" | "end";
  title?: string;
  children: React.ReactNode;
}) {
  const offscreen = side === "end" ? "100%" : "-100%";
  return (
    <AnimatePresence>
      {open && (
        <div className="fixed inset-0 z-[200]">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="absolute inset-0 bg-navy/50 backdrop-blur-sm"
          />
          <motion.div
            initial={{ x: offscreen }}
            animate={{ x: 0 }}
            exit={{ x: offscreen }}
            transition={{ type: "spring", stiffness: 300, damping: 32 }}
            className={`absolute inset-y-0 ${side === "end" ? "end-0" : "start-0"} w-[86%] max-w-[340px] overflow-y-auto bg-white p-6 shadow-lifted dark:bg-navy`}
          >
            <div className="mb-5 flex items-center justify-between">
              {title && <span className="text-lg font-extrabold">{title}</span>}
              <button onClick={onClose} className="ms-auto rounded-lg p-1.5 hover:bg-steel dark:hover:bg-white/10" aria-label="بستن">
                <X size={20} />
              </button>
            </div>
            {children}
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
