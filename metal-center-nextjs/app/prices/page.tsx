"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import { Search, Download, Printer, BellRing } from "lucide-react";
import { categories, factoryPriceGroups, type FactoryGroup } from "@/lib/data";
import { fetchPriceGroups } from "@/lib/priceSource";
import FactoryPriceGroup from "@/components/price/FactoryPriceGroup";

// خروجی CSV (Excel آن را باز می‌کند) از همان ردیف‌هایی که الان فیلتر شده‌اند
function exportCsv(groups: FactoryGroup[], vat: number) {
  const esc = (v: string | number) => `"${String(v).replace(/"/g, '""')}"`;
  const lines = [["کارخانه", "محصول", "سایز", "وزن (kg/m)", "قیمت (تومان)", "وضعیت"].map(esc).join(",")];
  groups.forEach((g) =>
    g.rows.forEach((r) => {
      const price = r.callForPrice ? "تماس بگیرید" : r.price ? Math.round(r.price * vat) : "استعلام";
      lines.push([g.factory, r.name, r.size, r.weight, price, r.stock].map(esc).join(","));
    })
  );
  const blob = new Blob(["﻿" + lines.join("\n")], { type: "text/csv;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = `metal-center-prices-${new Date().toISOString().slice(0, 10)}.csv`;
  document.body.appendChild(a);
  a.click();
  a.remove();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}

export default function PricesPage() {
  const [activeCategory, setActiveCategory] = useState("همه");
  const [groups, setGroups] = useState<FactoryGroup[] | null>(null);
  const [updatedAt, setUpdatedAt] = useState<Date | null>(null);
  const [query, setQuery] = useState("");
  const [includeVAT, setIncludeVAT] = useState(false);

  // داده‌ی قیمت از Supabase؛ هر ۶۰ ثانیه تازه می‌شود. اگر خطا یا خالی بود، داده‌ی داخل کد نشان داده می‌شود
  useEffect(() => {
    let cancelled = false;
    const load = () =>
      fetchPriceGroups()
        .then((list) => {
          if (cancelled) return;
          setGroups(list.length > 0 ? list : factoryPriceGroups);
          setUpdatedAt(new Date());
        })
        .catch(() => {
          if (!cancelled) setGroups((g) => g ?? factoryPriceGroups);
        });
    load();
    const timer = setInterval(load, 60000);
    return () => {
      cancelled = true;
      clearInterval(timer);
    };
  }, []);

  // اگر از صفحه‌ی محصولات با ?cat=... آمده باشی، همان دسته از اول انتخاب می‌شود
  useEffect(() => {
    const slug = new URLSearchParams(window.location.search).get("cat");
    const found = categories.find((c) => c.slug === slug);
    if (found) setActiveCategory(found.name);
  }, []);

  const vat = includeVAT ? 1.1 : 1;

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

  const rowCount = filteredGroups.reduce((n, g) => n + g.rows.length, 0);
  const timeLabel = updatedAt?.toLocaleTimeString("fa-IR", { hour: "2-digit", minute: "2-digit" });

  return (
    <div className="mx-auto max-w-[1240px] px-4 py-6 sm:px-6 sm:py-10">
      <div className="print-letterhead">
        <Image src="/logo.png" alt="متال سنتر" width={130} height={46} className="h-10 w-auto object-contain" />
        <div className="text-end text-xs text-ink/60">
          <div className="font-bold">گزارش لیست قیمت فولاد</div>
          <div>تاریخ چاپ: {new Date().toLocaleDateString("fa-IR")}</div>
        </div>
      </div>

      <header className="mb-5 flex flex-col gap-3 sm:mb-6 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="text-[24px] font-extrabold leading-tight sm:text-[30px]">لیست قیمت فولاد</h1>
          <p className="mt-1.5 text-[13.5px] text-ink/50 dark:text-white/40">قیمت لحظه‌ای به تفکیک کارخانه</p>
        </div>
        <span className="inline-flex w-fit items-center gap-2.5 rounded-full border border-success/25 bg-white px-3.5 py-2 text-xs font-bold text-success shadow-soft dark:bg-surface-dark">
          <span className="relative flex h-2 w-2">
            <span className="absolute inset-0 animate-ping rounded-full bg-success opacity-60" />
            <span className="relative h-2 w-2 rounded-full bg-success" />
          </span>
          {timeLabel ? `به‌روزرسانی ${timeLabel}` : "در حال اتصال..."}
        </span>
      </header>

      {/* دسته‌بندی‌ها — روی گوشی با اسکرول افقی */}
      <div className="-mx-4 mb-4 flex gap-2 overflow-x-auto px-4 pb-2 [scrollbar-width:none] sm:mx-0 sm:px-0">
        {["همه", ...categories.map((c) => c.name)].map((name) => {
          const active = activeCategory === name || (name === "همه" && activeCategory === "همه");
          return (
            <button
              key={name}
              onClick={() => setActiveCategory(name)}
              className={`shrink-0 rounded-pill border px-4 py-2 text-[12.5px] font-bold transition-all active:scale-95 ${
                active
                  ? "border-blue bg-blue text-white shadow-glow"
                  : "border-border-light bg-white text-ink/60 dark:border-border-dark dark:bg-surface-dark dark:text-white/60"
              }`}
            >
              {name === "همه" ? "همه محصولات" : name}
            </button>
          );
        })}
      </div>

      {/* نوار ابزار */}
      <div className="mb-5 space-y-3 rounded-card border border-border-light bg-white p-3 shadow-soft dark:border-border-dark dark:bg-surface-dark sm:p-4">
        <label className="flex items-center gap-2.5 rounded-xl bg-steel px-3.5 py-3 dark:bg-white/5">
          <Search size={16} className="text-ink/40" />
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="جستجوی محصول یا سایز..."
            className="w-full bg-transparent text-sm outline-none placeholder:text-ink/40"
          />
        </label>
        <div className="flex flex-wrap items-center justify-between gap-2">
          <button
            role="switch"
            aria-checked={includeVAT}
            onClick={() => setIncludeVAT((v) => !v)}
            className="flex items-center gap-2.5 rounded-xl px-1.5 py-1.5 text-xs font-bold"
          >
            <span className={`relative h-6 w-11 flex-shrink-0 rounded-full transition-colors ${includeVAT ? "bg-success" : "bg-ink/20"}`}>
              <span className={`absolute top-0.5 h-5 w-5 rounded-full bg-white shadow transition-all ${includeVAT ? "end-0.5" : "start-0.5"}`} />
            </span>
            با ارزش‌افزوده (+۱۰٪)
          </button>
          <div className="flex gap-2">
            <button
              onClick={() => exportCsv(filteredGroups, vat)}
              className="flex items-center gap-1.5 rounded-xl border border-border-light bg-white px-3.5 py-2.5 text-xs font-bold transition active:scale-95 dark:border-border-dark dark:bg-surface-dark"
            >
              <Download size={14} /> خروجی اکسل
            </button>
            <button
              onClick={() => window.print()}
              className="flex items-center gap-1.5 rounded-xl border border-border-light bg-white px-3.5 py-2.5 text-xs font-bold transition active:scale-95 dark:border-border-dark dark:bg-surface-dark"
            >
              <Printer size={14} /> چاپ / PDF
            </button>
          </div>
        </div>
      </div>

      {groups !== null && filteredGroups.length > 0 && (
        <p className="mb-3 text-xs text-ink/50 dark:text-white/40">
          {filteredGroups.length} کارخانه · {rowCount} محصول
        </p>
      )}

      {/* جدول‌ها به تفکیک کارخانه */}
      {groups === null ? (
        <div className="space-y-5">
          {[0, 1, 2].map((i) => (
            <div key={i} className="h-24 animate-pulse rounded-card border border-border-light bg-white/70 shadow-soft dark:bg-surface-dark" />
          ))}
        </div>
      ) : filteredGroups.length > 0 ? (
        filteredGroups.map((g) => <FactoryPriceGroup key={g.factory} group={g} includeVAT={includeVAT} />)
      ) : (
        <p className="rounded-card border border-dashed border-border-light py-16 text-center text-sm text-ink/40">
          محصولی با این مشخصات پیدا نشد.
        </p>
      )}

      {/* هشدار قیمت */}
      <div className="relative mt-10 overflow-hidden rounded-card bg-gradient-to-br from-navy to-[#0A2547] p-6 text-center text-white shadow-lifted sm:p-8">
        <div className="pointer-events-none absolute -start-10 -top-10 h-40 w-40 rounded-full bg-[#1E5BC6]/30 blur-3xl" />
        <div className="relative mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br from-[#1E5BC6] to-[#0A3D91] shadow-glow">
          <BellRing size={22} />
        </div>
        <h2 className="relative mb-2 text-xl font-extrabold">هشدار قیمت فعال کن</h2>
        <p className="relative mx-auto mb-5 max-w-md text-sm leading-7 text-[#B9C6DC]">
          وقتی قیمت محصول موردنظرت به حد تعیین‌شده رسید، اعلان دریافت کن.
        </p>
        <div className="relative mx-auto flex max-w-md flex-col gap-2 sm:flex-row">
          <input type="text" placeholder="ایمیل یا شماره موبایل" className="flex-1 rounded-btn bg-white px-4 py-3 text-sm text-ink outline-none" />
          <button disabled title="به‌زودی" className="rounded-btn bg-white/20 px-5 py-3 text-sm font-bold text-white/70">
            به‌زودی
          </button>
        </div>
      </div>
    </div>
  );
}
