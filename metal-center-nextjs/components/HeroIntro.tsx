"use client";

import { useEffect, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";

// انیمیشن ورود: تصویر کامیون و کارگرها از دور (عقب) به جلو می‌آید و بزرگ می‌شود،
// سپس چراغ‌های جلو و چراغ‌های سقف روشن می‌شوند و صفحه‌ی اصلی نمایان می‌شود.
// فقط یک بار در هر نشست (sessionStorage) پخش می‌شود و با کلیک یا برای کاربر «کاهش حرکت» رد می‌شود.
const KEY = "mc-intro-seen";
const DURATION_MS = 3800;
const IMAGE = "/hero/truck-hero.jpg";

// مختصات چراغ‌ها روی تصویر (درصد از عرض و ارتفاع). اگر جای چراغ‌ها کمی جابه‌جا بود، همین اعداد را تنظیم کنید.
const HEADLIGHTS = [
  { left: "7.7%", top: "66.5%" },
  { left: "21.3%", top: "67%" },
];
const ROOF_LIGHTS = [
  { left: "12.3%", top: "25.8%" },
  { left: "23%", top: "25.4%" },
];

function Glow({ left, top, size, color, delay }: { left: string; top: string; size: number; color: string; delay: number }) {
  return (
    <motion.div
      className="pointer-events-none absolute rounded-full"
      style={{
        left,
        top,
        width: size,
        height: size,
        marginLeft: -size / 2,
        marginTop: -size / 2,
        background: `radial-gradient(circle, ${color} 0%, ${color}66 35%, transparent 70%)`,
        mixBlendMode: "screen",
      }}
      initial={{ opacity: 0 }}
      animate={{ opacity: [0, 1, 0.75, 1] }}
      transition={{ duration: 0.9, delay, times: [0, 0.35, 0.6, 1] }}
    />
  );
}

function IntroScene() {
  return (
    <div className="relative w-full max-w-[1100px] overflow-hidden rounded-2xl shadow-2xl" style={{ aspectRatio: "1672 / 941" }}>
      {/* تصویر از دور شروع می‌شود، کوچک و محو است، و به‌تدریج جلو می‌آید */}
      <motion.div
        className="absolute inset-0"
        initial={{ scale: 0.3, opacity: 0, filter: "blur(8px)", y: -30 }}
        animate={{ scale: 1, opacity: 1, filter: "blur(0px)", y: 0 }}
        transition={{ duration: 2.2, ease: [0.22, 0.8, 0.3, 1] }}
      >
        <img src={IMAGE} alt="متال سنتر" className="h-full w-full object-cover" />

        {/* چراغ‌های جلو کامیون، بعد از رسیدن به جلو روشن می‌شوند */}
        {HEADLIGHTS.map((p, i) => (
          <Glow key={`h${i}`} left={p.left} top={p.top} size={90} color="#FFF6D6" delay={2.2} />
        ))}
        {/* چراغ‌های سقف (کهربایی) */}
        {ROOF_LIGHTS.map((p, i) => (
          <Glow key={`r${i}`} left={p.left} top={p.top} size={50} color="#FFB300" delay={2.4} />
        ))}
      </motion.div>

      {/* نور آرام روی جاده‌ی خیس بعد از روشن شدن چراغ‌ها */}
      <motion.div
        className="pointer-events-none absolute inset-x-0 bottom-0 h-[30%]"
        style={{ background: "linear-gradient(to top, rgba(255,246,214,0.18), transparent)" }}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.8, delay: 2.4 }}
      />
    </div>
  );
}

export default function HeroIntro() {
  const [show, setShow] = useState(false);

  useEffect(() => {
    let seen = false;
    let reduce = false;
    try {
      seen = sessionStorage.getItem(KEY) === "1";
      reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    } catch {
      // اگر مرورگر اجازه نداد، انیمیشن نمایش داده نمی‌شود
    }
    if (seen || reduce) return;
    setShow(true);
    try {
      sessionStorage.setItem(KEY, "1");
    } catch {}
    // تایمر پاک نمی‌شود تا در حالت توسعه (Strict Mode) هم درست پایان یابد
    setTimeout(() => setShow(false), DURATION_MS);
  }, []);

  return (
    <AnimatePresence>
      {show && (
        <motion.div
          key="hero-intro"
          role="presentation"
          onClick={() => setShow(false)}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.6 }}
          className="fixed inset-0 z-[100] flex cursor-pointer flex-col items-center justify-center bg-navy px-4"
        >
          <IntroScene />
          <span className="absolute bottom-6 end-6 text-xs text-white/50">برای رد شدن کلیک کنید</span>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
