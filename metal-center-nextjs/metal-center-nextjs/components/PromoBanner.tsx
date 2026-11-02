"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { AnimatePresence, motion } from "framer-motion";
import { Sparkles, ArrowLeft } from "lucide-react";

const SLIDES = [
  { text: "لیست قیمت به‌روز شد: میلگرد، تیرآهن، ورق، پروفیل", cta: "مشاهده لیست قیمت", href: "/prices", from: "#0A3D91", to: "#0CA678" },
  { text: "استعلام سریع بگیر و پیش‌فاکتور کارشناسی دریافت کن", cta: "درخواست استعلام", href: "/rfq", from: "#7048E8", to: "#E8590C" },
  { text: "از Metal AI بپرس؛ بهترین سایز و استاندارد را پیدا کن", cta: "شروع گفتگو", href: "/assistant", from: "#0CA678", to: "#0A3D91" },
];

export default function PromoBanner() {
  const [i, setI] = useState(0);

  useEffect(() => {
    const t = setInterval(() => setI((n) => (n + 1) % SLIDES.length), 4500);
    return () => clearInterval(t);
  }, []);

  const s = SLIDES[i];

  return (
    <div className="relative overflow-hidden" style={{ background: `linear-gradient(90deg, ${s.from}, ${s.to})` }}>
      <div className="mx-auto flex h-11 max-w-[1240px] items-center justify-between gap-3 px-4 text-white sm:px-6">
        <AnimatePresence mode="wait">
          <motion.div
            key={i}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.35 }}
            className="flex min-w-0 items-center gap-2 text-[13px] font-bold sm:text-sm"
          >
            <Sparkles size={15} className="flex-shrink-0" />
            <span className="truncate">{s.text}</span>
          </motion.div>
        </AnimatePresence>
        <Link href={s.href} className="flex flex-shrink-0 items-center gap-1 rounded-pill bg-white/20 px-3 py-1 text-xs font-extrabold backdrop-blur transition hover:bg-white/35">
          {s.cta} <ArrowLeft size={13} />
        </Link>
      </div>
      <div className="absolute bottom-0 start-0 flex gap-1 p-1">
        {SLIDES.map((_, k) => (
          <span key={k} className={`h-1 rounded-full transition-all ${k === i ? "w-6 bg-white" : "w-2 bg-white/40"}`} />
        ))}
      </div>
    </div>
  );
}
