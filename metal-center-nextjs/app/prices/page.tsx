"use client";

import { useEffect, useMemo, useState } from "react";
import Image from "next/image";
import { Download, Printer, Link2, Check, GitCompare, X } from "lucide-react";
import { factoryPriceGroups, type FactoryGroup, type PriceRow } from "@/lib/data";
import { useCategories } from "@/lib/useCategories";
import { fetchPriceGroups } from "@/lib/priceSource";
import {
  ALL,
  EMPTY_FILTERS,
  applyFilters,
  distinct,
  keyOf,
  parseState,
  toSearch,
  type Filters,
} from "@/lib/priceFilters";
import FactoryPriceGroup from "@/components/price/FactoryPriceGroup";
import FilterBar from "@/components/price/FilterBar";
import CompareSheet from "@/components/price/CompareSheet";

// خروجی CSV (Excel آن را باز می‌کند) از همان ردیف‌هایی که الان فیلتر شده‌اند
function exportCsv(groups: FactoryGroup[], vat: number) {
  const esc = (v: string | number) => `"${String(v).replace(/"/g, '""')}"`;
  const lines = [["کارخانه", "محصول", "سایز", "گرید", "محل بارگیری", "وزن (kg/m)", "قیمت", "واحد", "وضعیت"].map(esc).join(",")];
  groups.forEach((g) =>
    g.rows.forEach((r: PriceRow) => {
      const price = r.callForPrice ? "تماس بگیرید" : r.price ? Math.round(r.price * vat) : "استعلام";
      lines.push([g.factory, r.name, r.size, r.grade ?? "", r.loadingPlace ?? "", r.weight, price, r.unit ?? "", r.stock].map(esc).join(","));
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

const MAX_COMPARE = 4;

export default function PricesPage() {
  const [groups, setGroups] = useState<FactoryGroup[] | null>(null);
  const [source, setSource] = useState<"db" | "sample" | null>(null);
  const [filters, setFilters] = useState<Filters>(EMPTY_FILTERS);
  const [includeVAT, setIncludeVAT] = useState(false);
  const [ready, setReady] = useState(false);
  const [selected, setSelected] = useState<string[]>([]);
  const [compareOpen, setCompareOpen] = useState(false);
  const [copied, setCopied] = useState(false);
  // همه‌ی دسته‌ها و زیرمجموعه‌ها (از دیتابیس، یا فهرست ثابت اگر دیتابیس خالی بود)
  const { flat: categories } = useCategories();

  // داده از Supabase؛ هر ۶۰ ثانیه تازه می‌شود. اگر دیتابیس خالی یا خطادار باشد، داده‌ی نمونه با برچسب مشخص نشان داده می‌شود
  useEffect(() => {
    let cancelled = false;
    const load = () =>
      fetchPriceGroups()
        .then((list) => {
          if (cancelled) return;
          if (list.length > 0) {
            setGroups(list);
            setSource("db");
          } else {
            setGroups(factoryPriceGroups);
            setSource("sample");
          }
        })
        .catch(() => {
          if (cancelled) return;
          setGroups((g) => g ?? factoryPriceGroups);
          setSource("sample");
        });
    load();
    const timer = setInterval(load, 60000);
    return () => {
      cancelled = true;
      clearInterval(timer);
    };
  }, []);

  // فیلترها از آدرس صفحه خوانده می‌شوند تا لینک اشتراک‌گذاری کار کند
  useEffect(() => {
    const s = parseState(window.location.search, categories);
    setFilters(s.filters);
    setIncludeVAT(s.vat);
    setReady(true);
  }, [categories]);

  // هر تغییر فیلتر، آدرس را بدون رفرش به‌روز می‌کند
  useEffect(() => {
    if (!ready) return;
    const q = toSearch(filters, categories, includeVAT);
    window.history.replaceState(null, "", q ? `/prices?${q}` : "/prices");
  }, [ready, filters, includeVAT]);

  const safeGroups = groups ?? [];
  const vat = includeVAT ? 1.1 : 1;
  const filtered = useMemo(() => applyFilters(safeGroups, filters), [groups, filters]); // eslint-disable-line react-hooks/exhaustive-deps

  const allRows = safeGroups.flatMap((g) => g.rows);
  const factoryOptions = safeGroups.map((g) => g.factory).sort((a, b) => a.localeCompare(b, "fa"));
  const gradeOptions = distinct(safeGroups, (r) => r.grade);
  const placeOptions = distinct(safeGroups, (r) => r.loadingPlace);

  // مشخصات اختصاصی فقط برای دسته‌ی انتخاب‌شده نشان داده می‌شود
  const catRow = filters.category === ALL ? undefined : allRows.find((r) => r.category === filters.category || r.parentCategory === filters.category);
  const attrColumns = (catRow?.columns ?? []).map((label) => ({
    label,
    options: distinct(safeGroups, (r) =>
      r.category === filters.category || r.parentCategory === filters.category ? r.attrs?.find((a) => a.label === label)?.value : undefined
    ),
  }));

  const rowCount = filtered.reduce((n, g) => n + g.rows.length, 0);
  const selectedRows = allRows.filter((r) => selected.includes(keyOf(r)));
  // آخرین زمان ثبت قیمت در دیتابیس؛ هر بار قیمتی در پنل ثبت شود، این تاریخ خودکار عوض می‌شود
  const latestIso = allRows.map((r) => r.updatedAt).filter(Boolean).sort().pop();
  const latestLabel = latestIso
    ? new Date(latestIso).toLocaleString("fa-IR", { year: "numeric", month: "long", day: "numeric", hour: "2-digit", minute: "2-digit" })
    : null;

  function patch(p: Partial<Filters>) {
    setFilters((f) => ({ ...f, ...p }));
  }

  function pickCategory(name: string) {
    setFilters((f) => ({ ...f, category: name, attrs: {} }));
  }

  function toggleCompare(key: string) {
    setSelected((s) => (s.includes(key) ? s.filter((k) => k !== key) : s.length < MAX_COMPARE ? [...s, key] : s));
  }

  async function copyLink() {
    const q = toSearch(filters, categories, includeVAT);
    const url = `${window.location.origin}/prices${q ? `?${q}` : ""}`;
    try {
      await navigator.clipboard.writeText(url);
      setCopied(true);
      setTimeout(() => setCopied(false), 1800);
    } catch {
      window.prompt("لینک را کپی کنید:", url);
    }
  }

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
          {latestLabel ? `آخرین به‌روزرسانی قیمت‌ها: ${latestLabel}` : "هنوز قیمتی ثبت نشده"}
        </span>
      </header>

      {source === "sample" && (
        <div className="mb-5 rounded-xl border border-warning/40 bg-warning/10 px-4 py-3 text-xs font-semibold text-[#8A5A00]">
          داده‌ی نمونه نمایش داده می‌شود؛ اتصال به دیتابیس برقرار نیست یا هنوز قیمتی ثبت نشده است.
        </div>
      )}

      {/* دسته‌بندی‌ها — روی گوشی با اسکرول افقی */}
      <div className="-mx-4 mb-4 flex gap-2 overflow-x-auto px-4 pb-2 [scrollbar-width:none] sm:mx-0 sm:px-0">
        {[ALL, ...categories.map((c) => c.name)].map((name) => {
          const active = filters.category === name;
          return (
            <button
              key={name}
              onClick={() => pickCategory(name)}
              className={`shrink-0 rounded-pill border px-4 py-2 text-[12.5px] font-bold transition-all active:scale-95 ${
                active
                  ? "border-blue bg-blue text-white shadow-glow"
                  : "border-border-light bg-white text-ink/60 dark:border-border-dark dark:bg-surface-dark dark:text-white/60"
              }`}
            >
              {name === ALL ? "همه محصولات" : name}
            </button>
          );
        })}
      </div>

      <FilterBar
        filters={filters}
        onChange={patch}
        onReset={() => setFilters(EMPTY_FILTERS)}
        factories={factoryOptions}
        grades={gradeOptions}
        places={placeOptions}
        attrColumns={attrColumns}
        resultText={groups === null ? "" : `${rowCount} محصول در ${filtered.length} کارخانه`}
      />

      {/* نوار ابزار: ارزش‌افزوده، لینک، خروجی و چاپ */}
      <div className="mb-5 flex flex-wrap items-center justify-between gap-2">
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
        <div className="flex flex-wrap gap-2">
          <button
            onClick={copyLink}
            className="flex items-center gap-1.5 rounded-xl border border-border-light bg-white px-3.5 py-2.5 text-xs font-bold transition active:scale-95 dark:border-border-dark dark:bg-surface-dark"
          >
            {copied ? <Check size={14} className="text-success" /> : <Link2 size={14} />} {copied ? "لینک کپی شد" : "کپی لینک"}
          </button>
          <button
            onClick={() => exportCsv(filtered, vat)}
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

      {/* جدول‌ها به تفکیک کارخانه */}
      {groups === null ? (
        <div className="space-y-5">
          {[0, 1, 2].map((i) => (
            <div key={i} className="h-24 animate-pulse rounded-card border border-border-light bg-white/70 shadow-soft dark:bg-surface-dark" />
          ))}
        </div>
      ) : filtered.length > 0 ? (
        filtered.map((g) => (
          <FactoryPriceGroup
            key={g.factory}
            group={g}
            includeVAT={includeVAT}
            selected={selected}
            onToggle={toggleCompare}
          />
        ))
      ) : (
        <div className="rounded-card border border-dashed border-border-light bg-white py-14 text-center dark:bg-surface-dark">
          <p className="text-sm text-ink/50">محصولی با این فیلترها پیدا نشد.</p>
          <button onClick={() => setFilters(EMPTY_FILTERS)} className="mt-3 text-xs font-bold text-blue">پاک کردن فیلترها</button>
        </div>
      )}

      {/* نوار شناور مقایسه */}
      {selectedRows.length > 0 && (
        <div className="fixed inset-x-4 bottom-[88px] z-40 mx-auto flex max-w-xl items-center justify-between gap-3 rounded-2xl bg-navy px-4 py-3 text-white shadow-lifted sm:bottom-6">
          <span className="text-sm font-bold">{selectedRows.length} محصول برای مقایسه</span>
          <div className="flex gap-2">
            <button onClick={() => setSelected([])} className="flex items-center gap-1 rounded-lg bg-white/10 px-3 py-2 text-xs font-bold">
              <X size={13} /> پاک کردن
            </button>
            <button
              onClick={() => setCompareOpen(true)}
              disabled={selectedRows.length < 2}
              className="flex items-center gap-1 rounded-lg bg-white px-3 py-2 text-xs font-bold text-navy disabled:opacity-40"
            >
              <GitCompare size={13} /> مقایسه
            </button>
          </div>
        </div>
      )}

      {compareOpen && selectedRows.length >= 2 && (
        <CompareSheet
          rows={selectedRows}
          vat={vat}
          onRemove={(key) => {
            setSelected((s) => s.filter((k) => k !== key));
          }}
          onClose={() => setCompareOpen(false)}
        />
      )}

      <div className="relative mt-10 overflow-hidden rounded-card bg-gradient-to-br from-navy to-[#0A2547] p-6 text-center text-white shadow-lifted sm:p-8">
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
