"use client";

import Link from "next/link";
import { factories as staticFactories } from "@/lib/data";
import { fetchFactoryCards, type FactoryCard } from "@/lib/cms";
import FactoryLogo from "@/components/factories/FactoryLogo";
import { ChevronLeft, ChevronRight, Phone, FileText } from "lucide-react";
import { PRIMARY_PHONE } from "@/lib/site";
import { useEffect, useRef, useState } from "react";

// فهرست ثابت، وقتی هنوز کارخانه‌ای در پنل ثبت نشده است
const FALLBACK: FactoryCard[] = staticFactories.map((f) => ({ name: f.name, slug: f.slug, logoUrl: null, location: null }));

export default function FactorySlider() {
  const trackRef = useRef<HTMLDivElement>(null);
  const [list, setList] = useState<FactoryCard[]>(FALLBACK);

  useEffect(() => {
    let cancelled = false;
    fetchFactoryCards().then((db) => {
      if (!cancelled && db) setList(db);
    });
    return () => {
      cancelled = true;
    };
  }, []);

  function scroll(dir: 1 | -1) {
    trackRef.current?.scrollBy({ left: dir * 300, behavior: "smooth" });
  }

  // اگر کارخانه‌ای از پنل بود، خط دسته‌ها و تعداد محصول را از فهرست ثابت می‌گیریم (اگر نام یکی بود)
  const infoOf = (f: FactoryCard) => {
    const s = staticFactories.find((x) => x.name === f.name);
    return s ? `${s.cats} · ${s.products} محصول` : f.location ?? "کارخانه‌ی تأییدشده";
  };

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
          {[...list, ...list].map((f, i) => (
            <div
              key={f.name + i}
              className="flex w-[260px] flex-shrink-0 snap-start flex-col overflow-hidden rounded-card border border-border-light bg-white shadow-soft dark:border-border-dark dark:bg-surface-dark"
            >
              {/* لوگو کل بالای کارت؛ کلیک، لیست قیمت همان کارخانه را باز می‌کند */}
              <Link
                href={`/prices?factory=${encodeURIComponent(f.name)}`}
                className="flex h-[130px] items-center justify-center bg-logo-white p-5"
              >
                <FactoryLogo slug={f.slug} name={f.name} url={f.logoUrl ?? undefined} />
              </Link>
              <div className="flex flex-1 flex-col p-4">
                <Link href={`/prices?factory=${encodeURIComponent(f.name)}`} className="mb-1 font-bold hover:text-blue">
                  {f.name}
                </Link>
                <div className="mb-3 text-xs text-ink/50 dark:text-white/40">{infoOf(f)}</div>
                <div className="mt-auto flex gap-2">
                  <a href={`tel:${PRIMARY_PHONE}`} className="flex h-9 flex-1 items-center justify-center gap-1.5 rounded-xl bg-steel text-xs font-semibold dark:bg-white/5">
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
