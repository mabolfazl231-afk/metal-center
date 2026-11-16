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

type Col = { key: string; label: string };

// ستون‌های پیش‌فرض، وقتی دسته‌ای تنظیم ستون ندارد
const DEFAULT_COLS: Col[] = [
  { key: "weight_kg", label: "وزن (kg / شاخه ۱۲ متری)" },
  { key: "price", label: "قیمت (تومان)" },
];
// ستون نوسان همیشه بعد از قیمت می‌آید و خودکار حساب می‌شود
const CHANGE_COL: Col = { key: "__change", label: "نوسان" };

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
      <span className="inline-flex items-center gap-0.5 text-[11px] font-bold text-ink/40 dark:text-white/40 sm:text-xs">
        <Minus size={11} /> بدون تغییر
      </span>
    );
  }
  const up = value > 0;
  return (
    <span className={`inline-flex items-center gap-0.5 text-[11px] font-bold sm:text-xs ${up ? "text-success" : "text-danger"}`}>
      {up ? <TrendingUp size={12} /> : <TrendingDown size={12} />}
      {Math.abs(value)}%
    </span>
  );
}

// تغییر قیمت فقط وقتی تاریخچه‌ی واقعی باشد نشان داده می‌شود
function ChangeCell({ row }: { row: PriceRow }) {
  if (!row.hasChange) return <span className="text-[11px] text-ink/35 dark:text-white/35 sm:text-xs">بدون سابقه</span>;
  return <ChangeTag value={row.change} />;
}

const STOCK_STYLE: Record<PriceRow["stock"], string> = {
  موجود: "bg-success/10 text-success",
  محدود: "bg-warning/15 text-[#B87700]",
  نامشخص: "bg-blue/10 text-blue",
  ناموجود: "bg-danger/10 text-danger",
};

function StockBadge({ stock }: { stock: PriceRow["stock"] }) {
  return <span className={`inline-block shrink-0 rounded-pill px-2 py-0.5 text-[10px] font-bold sm:px-2.5 sm:py-1 ${STOCK_STYLE[stock]}`}>{stock}</span>;
}

function PriceCell({ row, vat }: { row: PriceRow; vat: number }) {
  if (row.callForPrice) {
    return <span className="whitespace-nowrap rounded-pill bg-warning/15 px-2 py-0.5 text-[11px] font-bold text-[#B87700] sm:px-3 sm:py-1 sm:text-xs">تماس بگیرید</span>;
  }
  if (!row.price) {
    return <span className="whitespace-nowrap rounded-pill bg-blue/10 px-2 py-0.5 text-[11px] font-bold text-blue sm:px-3 sm:py-1 sm:text-xs">استعلام</span>;
  }
  return (
    <span className="whitespace-nowrap">
      <span className="font-extrabold">{Math.round(row.price * vat).toLocaleString("fa-IR")}</span>
      <span className="ms-1 text-[10.5px] font-medium text-ink/45 dark:text-white/40">{row.unit || "تومان"}</span>
    </span>
  );
}

// روی گوشی، گرید، محل بارگیری و ستون‌های اختصاصی زیر نام محصول دیده می‌شوند (روی دسکتاپ ستون جدا هستند)
function MobileChips({ row }: { row: PriceRow }) {
  const items = [
    ...(row.grade ? [{ label: row.colLabels?.grade ?? "گرید", value: row.grade }] : []),
    ...(row.loadingPlace ? [{ label: row.colLabels?.loadingPlace ?? "بارگیری", value: row.loadingPlace }] : []),
    ...(row.attrs ?? []),
  ];
  if (items.length === 0) return null;
  return (
    <div className="mt-1 flex flex-wrap gap-1 sm:hidden">
      {items.map((a) => (
        <span key={a.label} className="rounded bg-steel px-1 py-px text-[10px] font-semibold text-ink/65 dark:bg-white/5 dark:text-white/60">
          {a.label}: <span dir="ltr">{a.value}</span>
        </span>
      ))}
    </div>
  );
}

function FactoryAvatar({ name, logoUrl }: { name: string; logoUrl?: string }) {
  const slug = factories.find((f) => norm(f.name) === norm(name))?.slug ?? "";
  return (
    <div className="flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-blue to-navy p-1 shadow-lifted">
      <div className="flex h-full w-full items-center justify-center overflow-hidden rounded-xl bg-white p-1.5">
        <FactoryLogo slug={slug} name={name} url={logoUrl} fallbackClassName="text-lg font-extrabold text-blue" />
      </div>
    </div>
  );
}

// مقدار یک ستون برای یک ردیف
function valueOf(r: PriceRow, c: Col): string {
  if (c.key === "weight_kg") return r.weight;
  if (c.key === "grade") return r.grade || "—";
  if (c.key === "loading_place") return r.loadingPlace || "—";
  return r.attrs?.find((a) => a.label === c.label)?.value || "—";
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

  // ستون‌های جدول به ترتیب تنظیم پنل؛ اگر ردیف‌ها از دسته‌های مختلف‌اند، ترتیب اولین دیده‌شده حفظ می‌شود
  const seen = new Map<string, Col>();
  for (const r of group.rows) for (const c of r.cols ?? []) if (!seen.has(c.key)) seen.set(c.key, c);
  const cols: Col[] = seen.size > 0 ? Array.from(seen.values()) : DEFAULT_COLS;
  const priceInCols = cols.some((c) => c.key === "price");
  // قیمت و نوسان کنار هم: نوسان بعد از قیمت
  const slots: Col[] = priceInCols
    ? cols.flatMap((c) => (c.key === "price" ? [c, CHANGE_COL] : [c]))
    : [...cols, CHANGE_COL];

  return (
    <div className="mb-5 overflow-hidden rounded-card border border-border-light bg-white shadow-soft dark:border-border-dark dark:bg-surface-dark">
      {/* سربرگ کارخانه */}
      <button onClick={() => setOpen((o) => !o)} aria-expanded={open} className="flex w-full items-center gap-3 p-3.5 text-start sm:p-4">
        <FactoryAvatar name={group.factory} logoUrl={group.logoUrl} />
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
            {/* یک جدول برای همه‌ی اندازه‌ها؛ روی گوشی ستون‌های کم‌اهمیت پنهان می‌شوند */}
            <div className="overflow-x-auto border-t border-border-light dark:border-border-dark">
              <table className="w-full min-w-[280px] text-[12.5px] sm:text-sm">
                <thead>
                  <tr className="bg-steel text-[11px] text-ink/50 dark:bg-white/5 dark:text-white/40 sm:text-xs">
                    <th className="w-8 p-2 text-start sm:p-3"><span className="sr-only">مقایسه</span></th>
                    <th className="p-2 text-start sm:p-3">محصول / سایز</th>
                    {slots.map((c) =>
                      c.key === "price" ? (
                        <th key={c.key} className="p-2 text-start sm:p-3">{c.label}</th>
                      ) : (
                        <th key={c.key} className="hidden p-3 text-start sm:table-cell">{c.label}</th>
                      )
                    )}
                    <th className="hidden p-3 text-start sm:table-cell">موجودی</th>
                    <th className="hidden p-3 text-start sm:table-cell">عملیات</th>
                  </tr>
                </thead>
                <tbody>
                  {group.rows.map((r) => {
                    const key = keyOf(r);
                    const hasPrice = r.price > 0 && !r.callForPrice;
                    return (
                      <tr key={key} className="border-t border-border-light align-top transition-colors hover:bg-steel/60 dark:border-border-dark dark:hover:bg-white/[0.03]">
                        <td className="p-2 sm:p-3">
                          <input
                            type="checkbox"
                            aria-label="افزودن به مقایسه"
                            checked={selected.includes(key)}
                            disabled={!canSelect(key)}
                            onChange={() => onToggle(key)}
                            className="h-4 w-4 accent-blue disabled:opacity-30"
                          />
                        </td>

                        <td className="p-2 sm:p-3">
                          <div className="font-bold leading-5">
                            {r.name} <span className="whitespace-nowrap text-blue" dir="ltr">{r.size}</span>
                          </div>
                          <div className="mt-1 sm:hidden">
                            <StockBadge stock={r.stock} />
                          </div>
                          <MobileChips row={r} />
                        </td>

                        {slots.map((c) => {
                          if (c.key === "price") {
                            return (
                              <td key={c.key} className="p-2 sm:p-3">
                                <PriceCell row={r} vat={vat} />
                                {/* روی گوشی: نوسان، نمودار و تماس زیر قیمت */}
                                <div className="mt-1 flex flex-wrap items-center gap-x-2 gap-y-1 sm:hidden">
                                  <ChangeCell row={r} />
                                  {hasPrice && (
                                    <button onClick={() => setChartRow(r)} className="inline-flex items-center gap-0.5 text-[11px] font-bold text-blue">
                                      <BarChart3 size={12} /> نمودار
                                    </button>
                                  )}
                                  <a href={`tel:${PRIMARY_PHONE}`} className="inline-flex items-center gap-0.5 text-[11px] font-bold text-blue">
                                    <Phone size={12} /> تماس
                                  </a>
                                </div>
                              </td>
                            );
                          }
                          if (c.key === CHANGE_COL.key) {
                            return (
                              <td key={c.key} className="hidden p-3 sm:table-cell">
                                <div className="flex flex-col items-start gap-1">
                                  <ChangeCell row={r} />
                                  {hasPrice && (
                                    <button onClick={() => setChartRow(r)} aria-label="نمودار قیمت">
                                      <Sparkline points={r.spark} />
                                    </button>
                                  )}
                                </div>
                              </td>
                            );
                          }
                          return (
                            <td key={c.key} className="hidden p-3 text-ink/70 dark:text-white/60 sm:table-cell">
                              {valueOf(r, c)}
                            </td>
                          );
                        })}

                        <td className="hidden p-3 sm:table-cell"><StockBadge stock={r.stock} /></td>

                        <td className="hidden p-3 sm:table-cell">
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
