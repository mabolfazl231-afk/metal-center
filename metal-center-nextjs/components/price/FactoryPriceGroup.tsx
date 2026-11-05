"use client";

import { useState } from "react";
import { ChevronDown, Phone, BarChart3, TrendingUp, TrendingDown, Minus } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import type { FactoryGroup, PriceRow } from "@/lib/data";
import { factories } from "@/lib/data";
import { keyOf } from "@/lib/priceFilters";
import PriceChartModal from "./PriceChartModal";
import FactoryLogo from "@/components/factories/FactoryLogo";
import { PRIMARY_PHONE } from "@/lib/site";

const norm = (s: string) => s.replace(/[‌\s]/g, "");

// نمودار کوچک: اگر داده‌ی کافی یا تغییر نداشته باشد، چیزی نشان نمی‌دهد
function Sparkline({ points }: { points: number[] }) {
  if (points.length < 2) return null;
  const max = Math.max(...points);
  const min = Math.min(...points);
  if (max === min) return null;
  const w = 80;
  const h = 28;
  const pts = points.map((p, i) => `${(i / (points.length - 1)) * w},${h - ((p - min) / (max - min)) * h}`).join(" ");
  const up = points[points.length - 1] >= points[0];
  const color = up ? "#00C853" : "#E53935";
  return (
    <svg viewBox={`0 0 ${w} ${h}`} className="h-7 w-20" aria-hidden>
      <polygon points={`0,${h} ${pts} ${w},${h}`} fill={color} opacity="0.12" />
      <polyline points={pts} fill="none" stroke={color} strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function ChangeTag({ value }: { value: number }) {
  if (value === 0) {
    return (
      <span className="inline-flex items-center gap-1 text-xs font-bold text-ink/40 dark:text-white/40">
        <Minus size={12} /> بدون تغییر
      </span>
    );
  }
  const up = value > 0;
  return (
    <span className={`inline-flex items-center gap-1 text-xs font-bold ${up ? "text-success" : "text-danger"}`}>
      {up ? <TrendingUp size={13} /> : <TrendingDown size={13} />}
      {Math.abs(value)}%
    </span>
  );
}

// تغییر قیمت فقط وقتی تاریخچه‌ی واقعی باشد نشان داده می‌شود
function ChangeCell({ row }: { row: PriceRow }) {
  if (!row.hasChange) return <span className="text-xs text-ink/35 dark:text-white/35">بدون سابقه</span>;
  return <ChangeTag value={row.change} />;
}

const STOCK_STYLE: Record<PriceRow["stock"], string> = {
  موجود: "bg-success/10 text-success",
  محدود: "bg-warning/15 text-[#B87700]",
  نامشخص: "bg-blue/10 text-blue",
  ناموجود: "bg-danger/10 text-danger",
};

function StockBadge({ stock }: { stock: PriceRow["stock"] }) {
  return <span className={`shrink-0 rounded-pill px-2.5 py-1 text-[10.5px] font-bold ${STOCK_STYLE[stock]}`}>{stock}</span>;
}

function PriceCell({ row, vat, big = false }: { row: PriceRow; vat: number; big?: boolean }) {
  if (row.callForPrice) {
    return <span className="rounded-pill bg-warning/15 px-3 py-1 text-[12px] font-bold text-[#B87700]">تماس بگیرید</span>;
  }
  if (!row.price) {
    return <span className="rounded-pill bg-blue/10 px-3 py-1 text-[12px] font-bold text-blue">استعلام</span>;
  }
  return (
    <span>
      <span className={big ? "text-[22px] font-extrabold leading-none" : "font-extrabold"}>
        {Math.round(row.price * vat).toLocaleString("fa-IR")}
      </span>
      <span className="ms-1 text-[11px] font-medium text-ink/45 dark:text-white/40">{row.unit || "تومان"}</span>
    </span>
  );
}

// برچسب‌های مشخصات اختصاصی، گرید و محل بارگیری
function MetaChips({ row }: { row: PriceRow }) {
  const items = [
    ...(row.grade ? [{ label: "گرید", value: row.grade }] : []),
    ...(row.loadingPlace ? [{ label: "بارگیری", value: row.loadingPlace }] : []),
    ...(row.attrs ?? []),
  ];
  if (items.length === 0) return null;
  return (
    <div className="mt-1.5 flex flex-wrap gap-1">
      {items.map((a) => (
        <span key={a.label} className="rounded-md bg-steel px-1.5 py-0.5 text-[10.5px] font-semibold text-ink/65 dark:bg-white/5 dark:text-white/60">
          {a.label}: <span dir="ltr">{a.value}</span>
        </span>
      ))}
    </div>
  );
}

function FactoryAvatar({ name }: { name: string }) {
  const slug = factories.find((f) => norm(f.name) === norm(name))?.slug ?? "";
  return (
    <div className="flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-blue to-navy p-1 shadow-lifted">
      <div className="flex h-full w-full items-center justify-center overflow-hidden rounded-xl bg-white p-1.5">
        <FactoryLogo slug={slug} name={name} fallbackClassName="text-lg font-extrabold text-blue" />
      </div>
    </div>
  );
}

export default function FactoryPriceGroup({
  group,
  includeVAT,
  selected,
  onToggle,
}: {
  group: FactoryGroup;
  includeVAT: boolean;
  selected: string[];
  onToggle: (key: string) => void;
}) {
  const [open, setOpen] = useState(true);
  const [chartRow, setChartRow] = useState<PriceRow | null>(null);
  const liveRow = chartRow ? group.rows.find((r) => keyOf(r) === keyOf(chartRow)) ?? chartRow : null;
  const vat = includeVAT ? 1.1 : 1;
  const delivery = group.delivery && group.delivery !== "—" ? group.delivery : null;
  const canSelect = (key: string) => selected.includes(key) || selected.length < 4;

  return (
    <div className="mb-5 overflow-hidden rounded-card border border-border-light bg-white shadow-soft dark:border-border-dark dark:bg-surface-dark">
      {/* سربرگ کارخانه */}
      <button onClick={() => setOpen((o) => !o)} aria-expanded={open} className="flex w-full items-center gap-3 p-3.5 text-start sm:p-4">
        <FactoryAvatar name={group.factory} />
        <div className="min-w-0 flex-1">
          <div className="truncate text-[15px] font-extrabold sm:text-base">{group.factory}</div>
          <div className="mt-0.5 flex flex-wrap items-center gap-x-2 text-[11.5px] text-ink/50 dark:text-white/40">
            <span>{group.rows.length} محصول</span>
            {group.updatedAgo && group.updatedAgo !== "—" && (
              <>
                <span>·</span>
                <span>به‌روزرسانی {group.updatedAgo}</span>
              </>
            )}
            {delivery && (
              <>
                <span>·</span>
                <span>تحویل از {delivery}</span>
              </>
            )}
          </div>
        </div>
        <motion.span
          animate={{ rotate: open ? 180 : 0 }}
          transition={{ duration: 0.2 }}
          className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full bg-steel dark:bg-white/5"
        >
          <ChevronDown size={16} className="text-ink/50" />
        </motion.span>
      </button>

      <AnimatePresence initial={false}>
        {open && (
          <motion.div
            key="body"
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.25 }}
            className="overflow-hidden"
          >
            {/* جدول دسکتاپ */}
            <table className="hidden w-full text-sm sm:table">
              <thead>
                <tr className="border-t border-border-light bg-steel text-xs text-ink/50 dark:border-border-dark dark:bg-white/5 dark:text-white/40">
                  <th className="w-10 p-3 text-start"><span className="sr-only">مقایسه</span></th>
                  <th className="p-3 text-start">محصول / سایز</th>
                  <th className="p-3 text-start">وزن (kg/m)</th>
                  <th className="p-3 text-start">قیمت</th>
                  <th className="p-3 text-start">تغییر</th>
                  <th className="p-3 text-start">روند</th>
                  <th className="p-3 text-start">موجودی</th>
                  <th className="p-3 text-start">عملیات</th>
                </tr>
              </thead>
              <tbody>
                {group.rows.map((r) => {
                  const key = keyOf(r);
                  const hasPrice = r.price > 0 && !r.callForPrice;
                  return (
                    <tr key={key} className="border-t border-border-light transition-colors hover:bg-steel/60 dark:border-border-dark dark:hover:bg-white/[0.03]">
                      <td className="p-3">
                        <input
                          type="checkbox"
                          aria-label="افزودن به مقایسه"
                          checked={selected.includes(key)}
                          disabled={!canSelect(key)}
                          onChange={() => onToggle(key)}
                          className="h-4 w-4 accent-blue disabled:opacity-30"
                        />
                      </td>
                      <td className="p-3 font-bold">
                        {r.name} <span className="text-blue" dir="ltr">{r.size}</span>
                        <MetaChips row={r} />
                      </td>
                      <td className="p-3 text-ink/50 dark:text-white/40">{r.weight}</td>
                      <td className="p-3"><PriceCell row={r} vat={vat} /></td>
                      <td className="p-3"><ChangeCell row={r} /></td>
                      <td className="p-3">
                        {hasPrice && (
                          <button onClick={() => setChartRow(r)} aria-label="نمودار قیمت">
                            <Sparkline points={r.spark} />
                          </button>
                        )}
                      </td>
                      <td className="p-3"><StockBadge stock={r.stock} /></td>
                      <td className="p-3">
                        <div className="flex gap-1.5">
                          <a href={`tel:${PRIMARY_PHONE}`} className="flex h-9 w-9 items-center justify-center rounded-xl bg-steel transition hover:bg-blue hover:text-white dark:bg-white/5" aria-label="تماس با کارخانه">
                            <Phone size={14} />
                          </a>
                          {hasPrice && (
                            <button onClick={() => setChartRow(r)} className="flex h-9 w-9 items-center justify-center rounded-xl bg-steel transition hover:bg-blue hover:text-white dark:bg-white/5" aria-label="نمودار">
                              <BarChart3 size={14} />
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>

            {/* کارت‌های موبایل */}
            <div className="space-y-3 border-t border-border-light bg-steel/50 p-3 dark:border-border-dark dark:bg-white/[0.02] sm:hidden">
              {group.rows.map((r) => {
                const key = keyOf(r);
                const hasPrice = !r.callForPrice && r.price > 0;
                return (
                  <div key={key} className="rounded-2xl border border-white bg-white p-4 shadow-soft dark:border-border-dark dark:bg-surface-dark">
                    <div className="flex items-start gap-3">
                      <input
                        type="checkbox"
                        aria-label="افزودن به مقایسه"
                        checked={selected.includes(key)}
                        disabled={!canSelect(key)}
                        onChange={() => onToggle(key)}
                        className="mt-1.5 h-5 w-5 flex-shrink-0 accent-blue disabled:opacity-30"
                      />
                      <div className="min-w-0 flex-1">
                        <div className="flex items-start justify-between gap-3">
                          <div className="min-w-0">
                            <div className="text-[14.5px] font-extrabold leading-6">{r.name}</div>
                            <div className="mt-1 flex flex-wrap items-center gap-1.5 text-[11px] text-ink/50 dark:text-white/40">
                              <span className="rounded-lg bg-blue/10 px-2 py-0.5 font-bold text-blue" dir="ltr">{r.size}</span>
                              {r.weight && r.weight !== "—" && <span>{r.weight} kg/m</span>}
                            </div>
                          </div>
                          <StockBadge stock={r.stock} />
                        </div>
                        <MetaChips row={r} />

                        <div className="mt-3 flex items-end justify-between gap-3">
                          <div className="space-y-1.5">
                            <PriceCell row={r} vat={vat} big />
                            <div><ChangeCell row={r} /></div>
                          </div>
                          {hasPrice && <Sparkline points={r.spark} />}
                        </div>
                      </div>
                    </div>

                    <div className="mt-3 flex gap-2 border-t border-border-light pt-3 dark:border-border-dark">
                      <a
                        href={`tel:${PRIMARY_PHONE}`}
                        className="flex flex-1 items-center justify-center gap-1.5 rounded-xl bg-blue py-2.5 text-xs font-bold text-white active:scale-[0.98]"
                      >
                        <Phone size={14} /> تماس با کارخانه
                      </a>
                      {hasPrice && (
                        <button
                          onClick={() => setChartRow(r)}
                          className="flex flex-1 items-center justify-center gap-1.5 rounded-xl border border-border-light py-2.5 text-xs font-bold active:scale-[0.98] dark:border-border-dark"
                        >
                          <BarChart3 size={14} /> نمودار قیمت
                        </button>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {liveRow && (
        <PriceChartModal
          open={!!liveRow}
          onClose={() => setChartRow(null)}
          productName={`${liveRow.name} ${liveRow.size}`}
          history={liveRow.history ?? []}
        />
      )}
    </div>
  );
}
