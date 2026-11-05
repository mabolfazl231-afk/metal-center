"use client";

import { useEffect, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";

// انیمیشن ورود: کامیون می‌آید، دو کارگر تابلوی «متال سنتر» را نگه می‌دارند، سپس صفحه نمایان می‌شود.
// فقط یک بار در هر نشست (sessionStorage) پخش می‌شود و با کلیک یا برای کاربر «کاهش حرکت» رد می‌شود.
const KEY = "mc-intro-seen";
const DURATION_MS = 3900;

function Worker({ x, vest, delay }: { x: number; vest: string; delay: number }) {
  return (
    <motion.g initial={{ opacity: 0, x: 40 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.5, delay }}>
      <g transform={`translate(${x} 0)`}>
        <rect x="-13" y="290" width="11" height="40" rx="4" fill="#232A34" />
        <rect x="2" y="290" width="11" height="40" rx="4" fill="#232A34" />
        <rect x="-16" y="236" width="32" height="58" rx="10" fill={vest} />
        <rect x="-16" y="252" width="32" height="5" fill="#FFFFFF" opacity="0.85" />
        <line x1="-14" y1="246" x2="-14" y2="192" stroke="#F5C18A" strokeWidth="8" strokeLinecap="round" />
        <line x1="14" y1="246" x2="14" y2="192" stroke="#F5C18A" strokeWidth="8" strokeLinecap="round" />
        <circle cx="-14" cy="190" r="5" fill="#F5C18A" />
        <circle cx="14" cy="190" r="5" fill="#F5C18A" />
        <circle cx="0" cy="222" r="15" fill="#F5C18A" />
        <path d="M-17 218 A17 17 0 0 1 17 218 Z" fill="#FFB300" />
        <line x1="-17" y1="218" x2="17" y2="218" stroke="#E0A000" strokeWidth="3" />
      </g>
    </motion.g>
  );
}

function IntroScene() {
  return (
    <svg viewBox="0 0 800 400" className="w-full max-w-[860px]" aria-hidden>
      <rect x="0" y="330" width="800" height="3" fill="#B9C6DC" opacity="0.35" />

      {/* کامیون: از سمت چپ وارد می‌شود و می‌ایستد */}
      <motion.g initial={{ x: -520 }} animate={{ x: 0 }} transition={{ duration: 1.6, ease: [0.22, 0.8, 0.3, 1] }}>
        <rect x="40" y="170" width="170" height="120" rx="8" fill="#0A3D91" />
        <rect x="40" y="170" width="170" height="10" rx="5" fill="#1E5BC6" />
        <path d="M215 210 L268 210 L300 252 L300 290 L215 290 Z" fill="#1E5BC6" />
        <path d="M226 220 L262 220 L284 248 L226 248 Z" fill="#CFE2FF" />
        <rect x="36" y="288" width="272" height="10" rx="4" fill="#071B34" />
        <text x="125" y="240" textAnchor="middle" fontSize="22" fontWeight="800" fill="#FFFFFF" fontFamily="Vazirmatn, sans-serif">
          متال سنتر
        </text>
        {[90, 260].map((cx) => (
          <g key={cx}>
            <circle cx={cx} cy="318" r="20" fill="#111827" />
            <circle cx={cx} cy="318" r="8" fill="#B9C6DC">
              <animate attributeName="opacity" values="1;0.4;1" dur="0.5s" repeatCount="indefinite" />
            </circle>
            <line x1={cx} y1={306} x2={cx} y2={330} stroke="#94A3B8" strokeWidth="3" strokeLinecap="round">
              <animateTransform attributeName="transform" type="rotate" from={`0 ${cx} 318`} to={`360 ${cx} 318`} dur="0.5s" repeatCount="indefinite" />
            </line>
          </g>
        ))}
      </motion.g>

      {/* دو کارگر که تابلو را نگه داشته‌اند */}
      <Worker x={470} vest="#E8590C" delay={1.25} />
      <Worker x={600} vest="#0CA678" delay={1.4} />

      {/* تابلوی متال سنتر */}
      <motion.g initial={{ opacity: 0, y: -18 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6, delay: 1.5, ease: "easeOut" }}>
        <rect x="415" y="105" width="240" height="90" rx="12" fill="#FFFFFF" stroke="#0A3D91" strokeWidth="6" />
        <text x="535" y="162" textAnchor="middle" fontSize="34" fontWeight="800" fill="#0A3D91" fontFamily="Vazirmatn, sans-serif">
          متال سنتر
        </text>
        <text x="535" y="184" textAnchor="middle" fontSize="12" letterSpacing="4" fill="#E8590C">METAL CENTER</text>
      </motion.g>

      <motion.text
        x="400"
        y="375"
        textAnchor="middle"
        fontSize="16"
        fill="#93A0B8"
        fontFamily="Vazirmatn, sans-serif"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.6, delay: 2.2 }}
      >
        پلتفرم هوشمند فولاد
      </motion.text>
    </svg>
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
      // اگر مرورگر اجازه نداد، انیمیشن ساده نمایش داده نمی‌شود
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
          className="fixed inset-0 z-[100] flex cursor-pointer flex-col items-center justify-center bg-navy px-6"
        >
          <div className="pointer-events-none absolute inset-0 opacity-40 [background-image:radial-gradient(rgba(255,255,255,0.07)_1px,transparent_1px)] [background-size:22px_22px]" />
          <IntroScene />
          <span className="absolute bottom-6 end-6 text-xs text-white/50">برای رد شدن کلیک کنید</span>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
