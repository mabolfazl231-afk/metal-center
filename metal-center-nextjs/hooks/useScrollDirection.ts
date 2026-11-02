"use client";

import { useEffect, useState, useRef } from "react";

// وقتی کاربر به پایین اسکرول می‌کند "down" برمی‌گرداند (نوار پایین مخفی می‌شود)،
// وقتی به بالا اسکرول می‌کند "up" برمی‌گرداند (نوار دوباره ظاهر می‌شود).
export function useScrollDirection() {
  const [direction, setDirection] = useState<"up" | "down">("up");
  const lastY = useRef(0);

  useEffect(() => {
    lastY.current = window.scrollY;
    function onScroll() {
      const currentY = window.scrollY;
      const diff = currentY - lastY.current;
      if (Math.abs(diff) > 8) {
        setDirection(diff > 0 && currentY > 80 ? "down" : "up");
        lastY.current = currentY;
      }
    }
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return direction;
}
