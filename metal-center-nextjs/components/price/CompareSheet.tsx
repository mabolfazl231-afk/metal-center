"use client";

import { X } from "lucide-react";
import type { PriceRow } from "@/lib/data";
import { keyOf } from "@/lib/priceFilters";

// مقایسه‌ی چند محصول کنار هم (حداکثر ۴ مورد)
export default function CompareSheet({
  rows,
  vat,
  onRemove,
  onClose,
}: {
  rows: PriceRow[];
  vat: number;
  onRemove: (key: string) => void;
  onClose: () => void;
}) {
  const priceText = (r: PriceRow) => {
    if (r.callForPrice) return "تماس بگیرید";
    if (!r.price) return "استعلام";
    return `${Math.round(r.price * vat).toLocaleString("fa-IR")} ${r.unit || "تومان"}`;
  };
  const changeText = (r: PriceRow) => (r.hasChange ? `${r.change > 0 ? "+" : ""}${r.change}%` : "بدون سابقه");
  const timeText = (r: PriceRow) => (r.updatedAt ? new Date(r.updatedAt).toLocaleString("fa-IR", { dateStyle: "short", timeStyle: "short" }) : "—");

  const lines: { label: string; value: (r: PriceRow) => string }[] = [
    { label: "کارخانه", value: (r) => r.factory ?? "—" },
    { label: "قیمت", value: priceText },
    { label: "تغییر قیمت", value: changeText },
    { label: "موجودی", value: (r) => r.stock },
    { label: "گرید", value: (r) => r.grade || "—" },
    { label: "محل بارگیری", value: (r) => r.loadingPlace || "—" },
    { label: "وزن (kg/m)", value: (r) => (r.weight && r.weight !== "—" ? r.weight : "—") },
    { label: "آخرین به‌روزرسانی", value: timeText },
  ];

  return (
    <div className="fixed inset-0 z-[80] flex items-end justify-center bg-navy/50 p-0 sm:items-center sm:p-6" onClick={onClose}>
      <div
        role="dialog"
        aria-modal="true"
        onClick={(e) => e.stopPropagation()}
        className="max-h-[85vh] w-full max-w-[900px] overflow-auto rounded-t-3xl bg-white p-5 shadow-lifted dark:bg-surface-dark sm:rounded-card sm:p-6"
      >
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-lg font-extrabold">مقایسه‌ی محصولات</h2>
          <button onClick={onClose} className="flex h-9 w-9 items-center justify-center rounded-full bg-steel dark:bg-white/5" aria-label="بستن">
            <X size={16} />
          </button>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full min-w-[520px] text-sm">
            <thead>
              <tr>
                <th className="w-32 p-2 text-start text-xs text-ink/45">ویژگی</th>
                {rows.map((r) => (
                  <th key={keyOf(r)} className="p-2 text-start align-top">
                    <div className="font-extrabold">{r.name}</div>
                    <div className="text-xs font-semibold text-blue" dir="ltr">{r.size}</div>
                    <button onClick={() => onRemove(keyOf(r))} className="mt-1 text-[11px] font-bold text-danger">حذف از مقایسه</button>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {lines.map((line) => (
                <tr key={line.label} className="border-t border-black/5 dark:border-white/10">
                  <td className="p-2.5 text-xs font-bold text-ink/50">{line.label}</td>
                  {rows.map((r) => (
                    <td key={keyOf(r)} className="p-2.5 font-semibold">{line.value(r)}</td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <p className="mt-4 text-[11px] text-ink/45">
          قیمت‌ها با ارزش‌افزوده {vat > 1 ? "نمایش داده شده‌اند" : "بدون ارزش‌افزوده هستند"}.
        </p>
      </div>
    </div>
  );
}
