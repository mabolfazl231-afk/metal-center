import type { Config } from "tailwindcss";

// Design tokens pulled directly from the Metal Center Brand Book / Design System.
// Keep this file as the single source of truth for colors, radius, and fonts —
// every component should reference these tokens instead of hardcoding hex values.
const config: Config = {
  content: [
    "./app/**/*.{ts,tsx}",
    "./components/**/*.{ts,tsx}",
  ],
  darkMode: "class",
  theme: {
    extend: {
      colors: {
        blue: "#0A3D91",   // Primary — Industrial Blue
        navy: "#071B34",   // Secondary — Deep Navy
        steel: "#F8FAFC",  // Background — Steel White
        gray: "#A1A8B3",
        ink: "#232A34",    // Text
        success: "#00C853",
        warning: "#FFB300",
        danger: "#E53935",
      },
      borderRadius: {
        card: "20px",
        btn: "14px",
      },
      fontFamily: {
        fa: ["Vazirmatn", "sans-serif"],
        en: ["Inter", "sans-serif"],
      },
      transitionDuration: {
        hover: "120ms",
        btn: "180ms",
        modal: "250ms",
        page: "500ms",
      },
    },
  },
  plugins: [],
};
export default config;
