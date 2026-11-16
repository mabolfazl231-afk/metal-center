"use client";

import type { ReactNode } from "react";
import { motion, useReducedMotion } from "framer-motion";

// هر بخش فوتر با یک حرکت آرام و یک‌بار، وقتی به آن می‌رسیم ظاهر می‌شود
export function Reveal({ children, className = "", delay = 0 }: { children: ReactNode; className?: string; delay?: number }) {
  const reduce = useReducedMotion();
  return (
    <motion.div
      className={className}
      initial={reduce ? false : { opacity: 0, y: 12 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-40px" }}
      transition={{ duration: 0.5, delay, ease: [0.22, 0.8, 0.3, 1] }}
    >
      {children}
    </motion.div>
  );
}

// خط نور باریکی که به‌آرامی بالای فوتر حرکت می‌کند
export function FlowLine() {
  const reduce = useReducedMotion();
  return (
    <div className="absolute inset-x-0 top-0 h-px overflow-hidden bg-white/10">
      {!reduce && (
        <motion.div
          className="absolute inset-y-0 w-1/3 bg-gradient-to-r from-transparent via-[#7FB2FF] to-transparent"
          initial={{ x: "-100%" }}
          animate={{ x: "400%" }}
          transition={{ duration: 4.5, repeat: Infinity, ease: "linear" }}
        />
      )}
    </div>
  );
}
