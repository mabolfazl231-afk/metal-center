"use client";

import Link from "next/link";
import { factories, factoryLogos } from "@/lib/data";
import { ChevronLeft, ChevronRight, Phone, FileText } from "lucide-react";
import { useRef } from "react";

export default function FactorySlider() {
  const trackRef = useRef<HTMLDivElement>(null);

  function scroll(dir: 1 | -1) {
    trackRef.current?.scrollBy({ left: dir * 300, behavior: "smooth" });
  }

  return (
    <section className="bg-white px-6 py-14 dark:bg-canvas-dark">
      <div className="mx-auto max-w-[1240px]">
        <div className="mb-8 flex items-end justify-between">
          <h2 className="text-[26px] font-extrabold">کارخانه‌های منتخب</h2>
          <div className="flex items-center gap-2">
            <Link href="/factories" className="text-[14px] font-semibold text-blue">همه ←</Link>
            <button onClick={() => scroll(-1)} className="flex h-9 w-9 items-center justify-center rounded-xl border border-border-light dark:border-border-dark" aria-label="قبلی">
              <ChevronRight size={16} />
            </button>
            <button onClick={() => scroll(1)} className="flex h-9 w-9 items-center justify-center rounded-xl border border-border-light dark:border-border-dark" aria-label="بعدی">
              <ChevronLeft size={16} />
            </button>
          </div>
        </div>

        <div
          ref={trackRef}
          className="scrollbar-none flex snap-x snap-mandatory gap-5 overflow-x-auto pb-2"
          style={{ scrollbarWidth: "none" }}
        >
          {[...factories, ...factories].map((f, i) => (
            <div
              key={f.name + i}
              className="w-[260px] flex-shrink-0 snap-start overflow-hidden rounded-card border border-border-light bg-white shadow-soft dark:border-border-dark dark:bg-surface-dark"
            >
              <div className="flex h-[100px] items-center justify-center bg-gradient-to-br from-[#123a6e] to-blue p-4">
                {factoryLogos.includes(f.slug) ? (
                  <img src={`/factories/${f.slug}.png`} alt={f.name} className="max-h-full max-w-full object-contain" />
                ) : (
                  <span className="text-3xl font-extrabold text-white/90">{f.name.charAt(0)}</span>
                )}
              </div>
              <div className="p-4">
                <div className="mb-1 font-bold">{f.name}</div>
                <div className="mb-3 text-xs text-ink/50 dark:text-white/40">{f.cats} · {f.products} محصول</div>
                <div className="flex gap-2">
                  <a href="tel:02191990000" className="flex h-9 flex-1 items-center justify-center gap-1.5 rounded-xl bg-steel text-xs font-semibold dark:bg-white/5">
                    <Phone size={13} /> تماس
                  </a>
                  <Link href="/rfq" className="flex h-9 flex-1 items-center justify-center gap-1.5 rounded-xl bg-blue text-xs font-semibold text-white">
                    <FileText size={13} /> استعلام
                  </Link>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
