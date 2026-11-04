"use client";

import { useState } from "react";
import { Search, SlidersHorizontal, RotateCcw } from "lucide-react";
import { ALL, type Filters, type SortKey } from "@/lib/priceFilters";

const SORT_LABEL: Record<SortKey, string> = {
  default: "پیش‌فرض",
  "price-asc": "قیمت: کم به زیاد",
  "price-desc": "قیمت: زیاد به کم",
  name: "نام محصول",
};

const SELECT = "w-full rounded-xl border border-black/10 bg-white px-3 py-2.5 text-sm outline-none focus:border-blue dark:border-white/10 dark:bg-surface-dark";

type Option = { value: string; label: string };

function Field({ label, value, options, onChange }: { label: string; value: string; options: Option[]; onChange: (v: string) => void }) {
  return (
    <label className="block">
      <span className="mb-1 block text-[11px] font-bold text-ink/50">{label}</span>
      <select className={SELECT} value={value} onChange={(e) => onChange(e.target.value)}>
        {options.map((o) => (
          <option key={o.value} value={o.value}>{o.label}</option>
        ))}
      </select>
    </label>
  );
}

export default function FilterBar({
  filters,
  onChange,
  onReset,
  factories,
  grades,
  places,
  attrColumns,
  resultText,
}: {
  filters: Filters;
  onChange: (patch: Partial<Filters>) => void;
  onReset: () => void;
  factories: string[];
  grades: string[];
  places: string[];
  attrColumns: { label: string; options: string[] }[];
  resultText: string;
}) {
  // روی گوشی فیلترها در یک پنل بازشونده قرار می‌گیرند؛ روی دسکتاپ همیشه دیده می‌شوند
  const [open, setOpen] = useState(false);

  const activeCount =
    [filters.factory, filters.grade, filters.place].filter((v) => v !== ALL).length +
    Object.values(filters.attrs).filter(Boolean).length +
    (filters.sort !== "default" ? 1 : 0);

  const all = (label: string): Option => ({ value: ALL, label });

  return (
    <div className="mb-5 space-y-3 rounded-card border border-border-light bg-white p-3 shadow-soft dark:border-border-dark dark:bg-surface-dark sm:p-4">
      <div className="flex items-center gap-2">
        <label className="flex flex-1 items-center gap-2 rounded-xl bg-steel px-3.5 py-3 dark:bg-white/5">
          <Search size={16} className="text-ink/40" />
          <input
            value={filters.query}
            onChange={(e) => onChange({ query: e.target.value })}
            placeholder="جستجوی نام، سایز، گرید یا مشخصات..."
            className="w-full bg-transparent text-sm outline-none placeholder:text-ink/40"
          />
        </label>
        <button
          onClick={() => setOpen((o) => !o)}
          aria-expanded={open}
          className="relative flex flex-shrink-0 items-center gap-1.5 rounded-xl border border-border-light bg-white px-3.5 py-3 text-xs font-bold sm:hidden dark:border-border-dark dark:bg-surface-dark"
        >
          <SlidersHorizontal size={15} /> فیلترها
          {activeCount > 0 && (
            <span className="absolute -start-1.5 -top-1.5 flex h-5 w-5 items-center justify-center rounded-full bg-blue text-[10px] text-white">
              {activeCount}
            </span>
          )}
        </button>
      </div>

      <div className={`${open ? "grid" : "hidden"} gap-3 sm:grid sm:grid-cols-2 lg:grid-cols-4`}>
        <Field
          label="کارخانه"
          value={filters.factory}
          options={[all("همه‌ی کارخانه‌ها"), ...factories.map((f) => ({ value: f, label: f }))]}
          onChange={(v) => onChange({ factory: v })}
        />
        <Field
          label="گرید"
          value={filters.grade}
          options={[all("همه‌ی گریدها"), ...grades.map((g) => ({ value: g, label: g }))]}
          onChange={(v) => onChange({ grade: v })}
        />
        <Field
          label="محل بارگیری"
          value={filters.place}
          options={[all("همه‌ی محل‌ها"), ...places.map((p) => ({ value: p, label: p }))]}
          onChange={(v) => onChange({ place: v })}
        />
        <Field
          label="مرتب‌سازی"
          value={filters.sort}
          options={(Object.keys(SORT_LABEL) as SortKey[]).map((k) => ({ value: k, label: SORT_LABEL[k] }))}
          onChange={(v) => onChange({ sort: v as SortKey })}
        />
        {attrColumns.map((col) => (
          <Field
            key={col.label}
            label={col.label}
            value={filters.attrs[col.label] ?? ""}
            options={[{ value: "", label: "همه" }, ...col.options.map((o) => ({ value: o, label: o }))]}
            onChange={(v) => onChange({ attrs: { ...filters.attrs, [col.label]: v } })}
          />
        ))}
      </div>

      <div className={`${open ? "flex" : "hidden"} items-center justify-between gap-2 sm:flex`}>
        <span className="text-xs text-ink/50 dark:text-white/40">{resultText}</span>
        <button onClick={onReset} className="flex items-center gap-1.5 text-xs font-bold text-blue">
          <RotateCcw size={13} /> پاک کردن فیلترها
        </button>
      </div>
    </div>
  );
}
