"use client";

import { useState, useEffect, type ReactNode } from "react";
import Link from "next/link";
import { AnimatePresence, motion } from "framer-motion";
import LiveCounter from "@/components/LiveCounter";
import HeroIntro from "@/components/HeroIntro";
import { supabase } from "@/lib/supabase";

type Slide = {
  key: string;
  image: string | null;
  gradient: string;
  eyebrow: string;
  title: ReactNode;
  desc: string;
  primary: { label: string; href: string };
  secondary: { label: string; href: string };
};

const GRADIENTS = [
  "linear-gradient(120deg, #071B34 0%, #0A3D91 60%, #1E5BC6 100%)",
  "linear-gradient(120deg, #071B34 0%, #0B2E5E 55%, #0CA678 130%)",
  "linear-gradient(120deg, #071B34 0%, #1E2A5E 60%, #7048E8 130%)",
];

// بنرهای پیش‌فرض؛ فقط وقتی جدول hero_slides خالی باشد یا خوانده نشود استفاده می‌شود
const DEFAULT_SLIDES: Slide[] = [
  {
    key: "default-1",
    image: "/banners/hero-1.jpg",
    gradient: GRADIENTS[0],
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
    key: "default-2",
    image: "/banners/hero-2.jpg",
    gradient: GRADIENTS[1],
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
    key: "default-3",
    image: "/banners/hero-3.jpg",
    gradient: GRADIENTS[2],
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

type DbSlide = {
  id: string;
  eyebrow: string;
  title: string;
  description: string;
  primary_label: string;
  primary_href: string;
  secondary_label: string;
  secondary_href: string;
  image_url: string | null;
};

function fromDb(s: DbSlide, i: number): Slide {
  return {
    key: s.id,
    image: s.image_url || null,
    gradient: GRADIENTS[i % GRADIENTS.length],
    eyebrow: s.eyebrow,
    title: s.title,
    desc: s.description,
    primary: { label: s.primary_label, href: s.primary_href },
    secondary: { label: s.secondary_label, href: s.secondary_href },
  };
}

// میله‌های سه‌بعدی شیشه‌ای برای سمت چپ هیرو (فقط دسکتاپ)
const PANELS = [
  { label: "میلگرد", sub: "A3 · A2", y: -112, z: 80, w: 300, c: "#2F6FD6" },
  { label: "تیرآهن", sub: "IPE · HEB", y: 0, z: 0, w: 340, c: "#0CA678" },
  { label: "ورق", sub: "روغنی · گالوانیزه", y: 112, z: -80, w: 300, c: "#E8590C" },
];

export default function HeroSlider() {
  const [slides, setSlides] = useState<Slide[]>(DEFAULT_SLIDES);
  const [index, setIndex] = useState(0);

  // بنرها از Supabase خوانده می‌شوند؛ اگر خطا یا خالی باشد، بنرهای پیش‌فرض می‌مانند
  useEffect(() => {
    let cancelled = false;
    supabase
      .from("hero_slides")
      .select("id,eyebrow,title,description,primary_label,primary_href,secondary_label,secondary_href,image_url")
      .eq("active", true)
      .order("sort_order", { ascending: true })
      .then(({ data, error }) => {
        if (!cancelled && !error && data && data.length > 0) {
          setSlides((data as DbSlide[]).map(fromDb));
        }
      });
    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    const t = setInterval(() => setIndex((i) => (i + 1) % slides.length), 6000);
    return () => clearInterval(t);
  }, [slides.length]);

  const slide = slides[index % slides.length];

  return (
    <section className="relative isolate flex min-h-[560px] items-center overflow-hidden bg-navy py-20 text-white">
      <HeroIntro />

      {/* بنرهای محوشونده: هر اسلاید آرام محو می‌شود و کمی بزرگ‌نمایی می‌کند */}
      <div className="absolute inset-0 -z-10">
        {slides.map((s, i) => (
          <motion.div
            key={s.key}
            initial={{ opacity: i === 0 ? 1 : 0, scale: 1 }}
            animate={{ opacity: i === index % slides.length ? 1 : 0, scale: i === index % slides.length ? 1.06 : 1 }}
            transition={{ opacity: { duration: 1.6, ease: "easeInOut" }, scale: { duration: 8, ease: "linear" } }}
            className="absolute inset-0"
            style={{
              backgroundImage: s.image ? `url("${s.image}"), ${s.gradient}` : s.gradient,
              backgroundSize: "cover",
              backgroundPosition: "center",
            }}
          />
        ))}
        <div className="absolute inset-0 bg-gradient-to-l from-navy via-navy/85 to-navy/35" />
        <div className="absolute inset-0 opacity-30 [background-image:radial-gradient(rgba(255,255,255,0.08)_1px,transparent_1px)] [background-size:22px_22px]" />
      </div>

      {/* میله‌های سه‌بعدی */}
      <div className="pointer-events-none absolute inset-y-0 end-0 hidden w-[46%] lg:block" style={{ perspective: 1200 }}>
        <motion.div
          className="absolute left-1/2 top-1/2 h-0 w-0"
          style={{ transformStyle: "preserve-3d" }}
          animate={{ rotateX: [14, 6, 14], rotateY: [-26, -14, -26] }}
          transition={{ duration: 10, repeat: Infinity, ease: "easeInOut" }}
        >
          {PANELS.map((p) => (
            <div
              key={p.label}
              className="absolute flex h-[104px] items-center justify-between rounded-2xl border border-white/25 px-5"
              style={{
                width: p.w,
                left: 0,
                top: 0,
                marginLeft: -p.w / 2,
                marginTop: -52,
                transform: `translateY(${p.y}px) translateZ(${p.z}px)`,
                background: `linear-gradient(135deg, ${p.c}e6, rgba(7,27,52,0.85))`,
                boxShadow: "0 30px 50px -20px rgba(0,0,0,0.6), inset 0 1px 0 rgba(255,255,255,0.35)",
              }}
            >
              <div>
                <div className="text-lg font-extrabold">{p.label}</div>
                <div className="text-[11px] text-white/60" dir="ltr">{p.sub}</div>
              </div>
              <div className="h-10 w-10 rounded-xl bg-white/15" />
            </div>
          ))}
        </motion.div>
      </div>

      <div className="relative z-10 mx-auto w-full max-w-[1240px] px-6">
        <div className="max-w-[600px]">
          <AnimatePresence mode="wait">
            <motion.div
              key={slide.key}
              initial={{ opacity: 0, y: 14 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -14 }}
              transition={{ duration: 0.5 }}
            >
              {slide.eyebrow && (
                <span className="mb-5 inline-flex items-center gap-2 rounded-full border border-success/30 bg-success/10 px-3 py-1.5 text-[12.5px] font-semibold text-success">
                  ● {slide.eyebrow}
                </span>
              )}
              <h1 className="mb-4 text-[clamp(28px,5vw,50px)] font-extrabold leading-tight">{slide.title}</h1>
              <p className="mb-8 max-w-[560px] text-[16px] leading-8 text-[#B9C6DC]">{slide.desc}</p>
              <div className="mb-10 flex flex-wrap gap-3">
                <Link href={slide.primary.href} className="rounded-btn bg-white px-6 py-3.5 font-semibold text-navy shadow-lifted transition-transform hover:-translate-y-0.5">
                  {slide.primary.label}
                </Link>
                {slide.secondary.label && (
                  <Link href={slide.secondary.href} className="rounded-btn border border-white/20 bg-white/5 px-6 py-3.5 font-semibold backdrop-blur transition-transform hover:-translate-y-0.5">
                    {slide.secondary.label}
                  </Link>
                )}
              </div>
            </motion.div>
          </AnimatePresence>

          {/* نقطه‌های اسلاید */}
          <div className="mb-8 flex gap-2">
            {slides.map((s, i) => (
              <button
                key={s.key}
                onClick={() => setIndex(i)}
                aria-label={`اسلاید ${i + 1}`}
                className={`h-1.5 rounded-full transition-all duration-500 ${i === index % slides.length ? "w-8 bg-white" : "w-1.5 bg-white/30"}`}
              />
            ))}
          </div>

          <div className="grid max-w-[560px] grid-cols-3 gap-4 border-t border-white/10 pt-8 text-center sm:text-start">
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
      </div>
    </section>
  );
}
