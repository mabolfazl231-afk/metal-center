"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { AnimatePresence, motion } from "framer-motion";
import LiveCounter from "@/components/LiveCounter";

const SLIDES = [
  {
    eyebrow: "قیمت‌ها هر ۱۵ دقیقه به‌روزرسانی می‌شوند",
    title: (
      <>
        فولاد را <span className="text-[#7FB2FF]">هوشمندانه</span> بخرید، بفروشید و مدیریت کنید
      </>
    ),
    desc: "قیمت لحظه‌ای، استعلام آنی با آپلود فایل، و شبکه‌ای معتبر از کارخانه‌ها — همه در یک پلتفرم.",
    primary: { label: "لیست قیمت", href: "/prices" },
    secondary: { label: "استعلام هوشمند", href: "/rfq" },
  },
  {
    eyebrow: "✦ جدید — دستیار هوشمند فولاد",
    title: (
      <>
        از <span className="text-[#7FB2FF]">Metal AI</span> برای انتخاب محصول کمک بگیرید
      </>
    ),
    desc: "سوال بپرسید، بهترین سایز و استاندارد را پیدا کنید، و مستقیم درخواست استعلام ثبت کنید.",
    primary: { label: "شروع گفتگو با Metal AI", href: "/assistant" },
    secondary: { label: "مشاهده محصولات", href: "/products" },
  },
  {
    eyebrow: "شبکه‌ی معتبر کارخانه‌ها",
    title: (
      <>
        مستقیم از <span className="text-[#7FB2FF]">۲۴۰+ کارخانه</span> تأییدشده خرید کنید
      </>
    ),
    desc: "بدون واسطه، با قیمت شفاف و گواهی استاندارد معتبر برای هر محصول.",
    primary: { label: "مشاهده کارخانه‌ها", href: "/factories" },
    secondary: { label: "درباره ما", href: "/about" },
  },
];

export default function HeroSlider() {
  const [index, setIndex] = useState(0);

  useEffect(() => {
    const t = setInterval(() => setIndex((i) => (i + 1) % SLIDES.length), 6000);
    return () => clearInterval(t);
  }, []);

  const slide = SLIDES[index];

  return (
    <section className="relative overflow-hidden bg-navy px-6 py-24 text-white">
      <div className="absolute -end-32 -top-32 h-96 w-96 rounded-full bg-blue/30 blur-3xl" />
      <div className="relative mx-auto min-h-[280px] max-w-[760px]">
        <AnimatePresence mode="wait">
          <motion.div
            key={index}
            initial={{ opacity: 0, y: 14 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -14 }}
            transition={{ duration: 0.4 }}
          >
            <span className="mb-5 inline-flex items-center gap-2 rounded-full border border-success/30 bg-success/10 px-3 py-1.5 text-[12.5px] font-semibold text-success">
              ● {slide.eyebrow}
            </span>
            <h1 className="mb-4 text-[clamp(28px,5vw,50px)] font-extrabold leading-tight">{slide.title}</h1>
            <p className="mb-8 max-w-[600px] text-[16px] leading-8 text-[#B9C6DC]">{slide.desc}</p>
            <div className="mb-10 flex flex-wrap gap-3">
              <Link href={slide.primary.href} className="rounded-btn bg-white px-6 py-3.5 font-semibold text-navy transition-transform hover:-translate-y-0.5">
                {slide.primary.label}
              </Link>
              <Link href={slide.secondary.href} className="rounded-btn border border-white/20 bg-white/5 px-6 py-3.5 font-semibold backdrop-blur transition-transform hover:-translate-y-0.5">
                {slide.secondary.label}
              </Link>
            </div>
          </motion.div>
        </AnimatePresence>

        {/* dots */}
        <div className="mb-8 flex gap-2">
          {SLIDES.map((_, i) => (
            <button
              key={i}
              onClick={() => setIndex(i)}
              aria-label={`اسلاید ${i + 1}`}
              className={`h-1.5 rounded-full transition-all ${i === index ? "w-8 bg-white" : "w-1.5 bg-white/30"}`}
            />
          ))}
        </div>

        <div className="grid grid-cols-3 gap-4 border-t border-white/10 pt-8 text-center sm:text-start">
          <div>
            <div className="text-2xl font-extrabold"><LiveCounter target={240} suffix="+" /></div>
            <div className="mt-1 text-xs text-[#93A0B8]">کارخانه تأییدشده</div>
          </div>
          <div>
            <div className="text-2xl font-extrabold"><LiveCounter target={358} /></div>
            <div className="mt-1 text-xs text-[#93A0B8]">محصول ثبت‌شده</div>
          </div>
          <div>
            <div className="text-2xl font-extrabold"><LiveCounter target={18000} suffix="+" /></div>
            <div className="mt-1 text-xs text-[#93A0B8]">استعلام موفق</div>
          </div>
        </div>
      </div>
    </section>
  );
}
