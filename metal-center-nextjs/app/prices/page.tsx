"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { Search, Download, Printer } from "lucide-react";
import { categories, factoryPriceGroups, type FactoryGroup } from "@/lib/data";
import { fetchPriceGroups } from "@/lib/priceSource";
import FactoryPriceGroup from "@/components/price/FactoryPriceGroup";

export default function PricesPage() {
  const [activeCategory, setActiveCategory] = useState("همه");

  // داده‌ی قیمت از Supabase خوانده می‌شود؛ اگر خطا یا خالی بود، داده‌ی داخل کد نشان داده می‌شود
  const [groups, setGroups] = useState<FactoryGroup[] | null>(null);
  useEffect(() => {
    let cancelled = false;
    fetchPriceGroups()
      .then((list) => {
        if (cancelled) return;
        setGroups(list.length > 0 ? list : factoryPriceGroups);
      })
      .catch(() => {
        if (!cancelled) setGroups(factoryPriceGroups);
      });
    return () => {
      cancelled = true;
    };
  }, []);

  // اگر از صفحه‌ی محصولات با ?cat=... آمده باشی، همان دسته از اول انتخاب می‌شود
  useEffect(() => {
    const slug = new URLSearchParams(window.location.search).get("cat");
    const found = categories.find((c) => c.slug === slug);
    if (found) setActiveCategory(found.name);
  }, []);
  const [query, setQuery] = useState("");
  const [includeVAT, setIncludeVAT] = useState(false);

  const filteredGroups = (groups ?? [])
    .map((g) => ({
      ...g,
      rows: g.rows.filter(
        (r) =>
          (activeCategory === "همه" || r.name.includes(activeCategory)) &&
          (r.name + r.size).toLowerCase().includes(query.toLowerCase())
      ),
    }))
    .filter((g) => g.rows.length > 0);

  return (
    <div className="mx-auto max-w-[1240px] px-4 py-8 sm:px-6 sm:py-10">
      <div className="print-letterhead">
        <Image src="/logo.png" alt="متال سنتر" width={130} height={46} className="h-10 w-auto object-contain" />
        <div className="text-end text-xs text-ink/60">
          <div className="font-bold">گزارش لیست قیمت فولاد</div>
          <div>تاریخ چاپ: {new Date().toLocaleDateString("fa-IR")}</div>
        </div>
      </div>
      <div className="mb-6 flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="mb-2 text-[26px] font-extrabold sm:text-[28px]">لیست قیمت فولاد</h1>
          <p className="max-w-[560px] text-[14px] text-ink/50 dark:text-white/40 sm:text-[14.5px]">
            قیمت لحظه‌ای به تفکیک کارخانه — هر کارخانه یک بخش جداگانه، بدون صفحه‌بندی.
          </p>
        </div>
        <span className="inline-flex items-center gap-2 rounded-full border border-success/30 bg-success/10 px-3 py-1.5 text-xs font-semibold text-success">
          ● آنلاین · ۱۵ دقیقه پیش
        </span>
      </div>

      {/* دسترسی سریع دسته‌بندی — نوار اسکرول افقی */}
      <div className="mb-5 flex gap-2 overflow-x-auto pb-1">
        <button
          onClick={() => setActiveCategory("همه")}
          className={`whitespace-nowrap rounded-pill border px-4 py-2 text-xs font-bold ${
            activeCategory === "همه" ? "border-blue bg-blue text-white" : "border-border-light text-ink/60 dark:border-border-dark dark:text-white/60"
          }`}
        >
          همه محصولات
        </button>
        {categories.map((c) => (
          <button
            key={c.name}
            onClick={() => setActiveCategory(c.name)}
            className={`whitespace-nowrap rounded-pill border px-4 py-2 text-xs font-bold ${
              activeCategory === c.name ? "border-blue bg-blue text-white" : "border-border-light text-ink/60 dark:border-border-dark dark:text-white/60"
            }`}
          >
            {c.name}
          </button>
        ))}
      </div>

      {/* نوار فیلتر */}
      <div className="mb-6 flex flex-wrap items-center gap-2">
        <div className="flex flex-1 items-center gap-2 rounded-xl border border-border-light bg-white px-3 py-2.5 dark:border-border-dark dark:bg-surface-dark">
          <Search size={15} className="text-ink/40" />
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="جستجوی محصول یا سایز..."
            className="w-full bg-transparent text-sm outline-none"
          />
        </div>
        <label className="flex items-center gap-2 rounded-xl border border-border-light bg-white px-3 py-2.5 text-xs font-semibold dark:border-border-dark dark:bg-surface-dark">
          <input type="checkbox" checked={includeVAT} onChange={(e) => setIncludeVAT(e.target.checked)} className="accent-blue" />
          نمایش با ارزش‌افزوده (۱۰٪)
        </label>
        <button className="flex items-center gap-1.5 rounded-xl border border-border-light bg-white px-3 py-2.5 text-xs font-semibold dark:border-border-dark dark:bg-surface-dark">
          <Download size={14} /> اکسل
        </button>
        <button onClick={() => window.print()} className="flex items-center gap-1.5 rounded-xl border border-border-light bg-white px-3 py-2.5 text-xs font-semibold dark:border-border-dark dark:bg-surface-dark">
          <Printer size={14} /> PDF / چاپ
        </button>
      </div>

      {/* جدول‌های گروه‌بندی‌شده بر اساس کارخانه */}
      {filteredGroups.length > 0 ? (
        filteredGroups.map((g) => <FactoryPriceGroup key={g.factory} group={g} includeVAT={includeVAT} />)
      ) : (
        <p className="py-16 text-center text-sm text-ink/40">{groups === null ? "در حال بارگذاری قیمت‌ها..." : "محصولی با این مشخصات پیدا نشد."}</p>
      )}

      <div className="mt-10 rounded-card bg-gradient-to-b from-navy to-[#0A2547] p-8 text-center text-white">
        <h2 className="mb-2 text-xl font-extrabold">هشدار قیمت فعال کن</h2>
        <p className="mb-5 text-sm text-[#B9C6DC]">
          وقتی قیمت محصول موردنظرت به حد تعیین‌شده رسید، اعلان دریافت کن.
        </p>
        <div className="mx-auto flex max-w-md gap-2">
          <input type="text" placeholder="ایمیل یا شماره موبایل" className="flex-1 rounded-btn px-4 py-3 text-sm text-ink" />
          <button className="rounded-btn bg-white px-5 py-3 text-sm font-bold text-navy">فعال‌سازی</button>
        </div>
      </div>
    </div>
  );
}
