"use client";

import { Sun, Moon } from "lucide-react";
import { useEffect, useState } from "react";

export default function ThemeToggle({
  className = "",
  showLabel = false,
}: {
  className?: string;
  showLabel?: boolean;
}) {
  const [isDark, setIsDark] = useState(false);

  useEffect(() => {
    const stored = localStorage.getItem("theme");
    const prefersDark = window.matchMedia("(prefers-color-scheme: dark)").matches;
    const shouldBeDark = stored ? stored === "dark" : prefersDark;
    document.documentElement.classList.toggle("dark", shouldBeDark);
    setIsDark(shouldBeDark);
  }, []);

  function toggle() {
    const next = !isDark;
    setIsDark(next);
    document.documentElement.classList.toggle("dark", next);
    localStorage.setItem("theme", next ? "dark" : "light");
  }

  return (
    <button
      type="button"
      onClick={toggle}
      aria-label="تغییر حالت روشن/تیره"
      className={`flex h-10 w-10 items-center justify-center rounded-xl border border-border-light bg-white/70 backdrop-blur transition-all duration-hover hover:border-blue hover:bg-blue hover:text-white hover:shadow-glow active:scale-95 dark:border-border-dark dark:bg-white/5 dark:hover:bg-blue ${className}`}
    >
      {isDark ? <Moon size={17} /> : <Sun size={17} />}
      {showLabel && <span className="mt-1.5">{isDark ? "حالت تیره" : "حالت روشن"}</span>}
    </button>
  );
}
