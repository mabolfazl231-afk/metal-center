"use client";

import { useState, useMemo } from "react";
import Link from "next/link";
import { dailyPrices, articles, factories, categories } from "@/lib/data";

type Result = { label: string; sub: string; href: string; type: string };

function buildIndex(): Result[] {
  const items: Result[] = [];
  dailyPrices.forEach((p) => items.push({ label: p.name, sub: `محصول · ${p.factory}`, href: "/products", type: "محصول" }));
  categories.forEach((c) => items.push({ label: c.name, sub: `دسته‌بندی · ${c.count}`, href: "/products", type: "دسته" }));
  factories.forEach((f) => items.push({ label: f.name, sub: `کارخانه · ${f.location}`, href: "/factories", type: "کارخانه" }));
  articles.forEach((a) => items.push({ label: a.title, sub: `مقاله · ${a.tag}`, href: "/knowledge", type: "مقاله" }));
  return items;
}

// این جستجو فعلاً روی داده‌های نمونه‌ی lib/data.ts کار می‌کند.
// وقتی این داده‌ها به Supabase وصل شدند (طبق الگوی مرحله ۱۱)، همین تابع
// می‌تواند به یک کوئری real-time روی جدول‌های واقعی تبدیل شود.
export default function SmartSearch({ onClose }: { onClose: () => void }) {
  const [query, setQuery] = useState("");
  const index = useMemo(buildIndex, []);

  const results = useMemo(() => {
    if (!query.trim()) return [];
    const q = query.trim().toLowerCase();
    return index.filter((item) => item.label.toLowerCase().includes(q)).slice(0, 8);
  }, [query, index]);

  return (
    <div className="fixed inset-0 z-[200] flex items-start justify-center bg-navy/50 p-4 pt-20">
      <div className="w-full max-w-xl rounded-card bg-white shadow-2xl">
        <div className="flex items-center gap-3 border-b border-black/5 p-4">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#8A93A3" strokeWidth="1.8">
            <circle cx="11" cy="11" r="7" />
            <path d="m21 21-4.3-4.3" />
          </svg>
          <input
            autoFocus
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="جستجوی هوشمند در محصولات، کارخانه‌ها و مقالات..."
            className="flex-1 border-none text-sm outline-none"
          />
          <button onClick={onClose} className="text-xs font-bold text-ink/40">✕</button>
        </div>

        <div className="max-h-96 overflow-y-auto p-2">
          {query && results.length === 0 && (
            <p className="p-6 text-center text-sm text-ink/40">نتیجه‌ای پیدا نشد.</p>
          )}
          {results.map((r, i) => (
            <Link
              key={i}
              href={r.href}
              onClick={onClose}
              className="flex items-center justify-between rounded-xl px-4 py-3 text-sm hover:bg-steel"
            >
              <div>
                <div className="font-bold">{r.label}</div>
                <div className="text-xs text-ink/50">{r.sub}</div>
              </div>
              <span className="rounded-full bg-steel px-2.5 py-1 text-[10.5px] font-bold text-blue">{r.type}</span>
            </Link>
          ))}
          {!query && (
            <div className="p-4">
              <div className="mb-2 text-[11px] font-bold text-ink/40">پیشنهادها</div>
              <div className="flex flex-wrap gap-2">
                {["میلگرد", "تیرآهن", "قیمت روز", "کارخانه اصفهان"].map((s) => (
                  <button
                    key={s}
                    onClick={() => setQuery(s)}
                    className="rounded-full border border-black/10 px-3 py-1.5 text-xs font-semibold text-ink/60"
                  >
                    {s}
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>

        <Link
          href="/assistant"
          onClick={onClose}
          className="flex items-center justify-center gap-2 border-t border-black/5 p-3.5 text-xs font-bold text-blue"
        >
          ✦ به‌جای جستجو، از دستیار هوشمند خرید بپرس ←
        </Link>
      </div>
    </div>
  );
}
