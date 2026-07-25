import type { Config } from "tailwindcss";

// ===== Metal Center Design System =====
// منبع اصلی همه‌ی توکن‌های طراحی سایت. هیچ کامپوننتی نباید رنگ/فاصله/سایه
// را مستقیم (hardcode) بنویسد؛ همه باید از همین فایل استفاده کنند.
const config: Config = {
  content: ["./app/**/*.{ts,tsx}", "./components/**/*.{ts,tsx}"],
  darkMode: "class",
  theme: {
    extend: {
      colors: {
        blue: "#0A3D91",
        "blue-light": "#1E5BC6",
        navy: "#071B34",
        steel: "#F8FAFC",
        gray: "#A1A8B3",
        ink: "#232A34",
        success: "#00C853",
        warning: "#FFB300",
        danger: "#E53935",
        // سطوح خنثی برای حالت روشن/تیره
        surface: {
          light: "#FFFFFF",
          dark: "#101A2C",
        },
        border: {
          light: "#E7EAEE",
          dark: "#1D2A42",
        },
      },
      borderRadius: {
        card: "20px",
        btn: "14px",
        pill: "999px",
      },
      boxShadow: {
        soft: "0 1px 2px rgba(7,27,52,.04), 0 8px 24px rgba(7,27,52,.06)",
        lifted: "0 12px 40px rgba(7,27,52,.14)",
        glass: "0 8px 32px rgba(7,27,52,.18)",
        glow: "0 0 0 4px rgba(10,61,145,.12)",
      },
      spacing: {
        "4.5": "1.125rem",
        18: "4.5rem",
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
      keyframes: {
        "fade-in": { from: { opacity: "0" }, to: { opacity: "1" } },
        "slide-up": { from: { opacity: "0", transform: "translateY(12px)" }, to: { opacity: "1", transform: "translateY(0)" } },
        "scale-in": { from: { opacity: "0", transform: "scale(.96)" }, to: { opacity: "1", transform: "scale(1)" } },
        shimmer: { "100%": { transform: "translateX(100%)" } },
        pulse-soft: { "0%,100%": { opacity: "1" }, "50%": { opacity: ".45" } },
      },
      animation: {
        "fade-in": "fade-in .3s ease-out",
        "slide-up": "slide-up .35s cubic-bezier(.2,.8,.2,1)",
        "scale-in": "scale-in .2s ease-out",
        shimmer: "shimmer 1.6s infinite",
        "pulse-soft": "pulse-soft 1.8s ease-in-out infinite",
      },
    },
  },
  plugins: [],
};
export default config;
