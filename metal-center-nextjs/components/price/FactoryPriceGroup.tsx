"use client";

import { useState } from "react";
import { ChevronDown, Phone, Heart, BarChart3 } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import type { FactoryGroup, PriceRow } from "@/lib/data";
import PriceChartModal from "./PriceChartModal";

function Sparkline({ points }: { points: number[] }) {
  const w = 70, h = 24;
  const max = Math.max(...points), min = Math.min(...points);
  const pts = points
    .map((p, i) => `${(i / (points.length - 1)) * w},${h - ((p - min) / (max - min || 1)) * h}`)
    .join(" ");
  const up = points[points.length - 1] >= points[0];
  return (
    <svg viewBox={`0 0 ${w} ${h}`} className="h-6 w-[70px]">
      <polyline points={pts} fill="none" stroke={up ? "#00C853" : "#E53935"} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function AIBadge({ prediction }: { prediction: PriceRow["aiPrediction"] }) {
  const map = {
    افزایش: "bg-success/10 text-success",
    کاهش: "bg-danger/10 text-danger",
    ثابت: "bg-blue/10 text-blue",
  };
  return <span className={`rounded-pill px-2.5 py-1 text-[10.5px] font-bold ${map[prediction]}`}>{prediction === "ثابت" ? "بدون تغییر" : `احتمال ${prediction}`}</span>;
}

export default function FactoryPriceGroup({ group, includeVAT }: { group: FactoryGroup; includeVAT: boolean }) {
  const [open, setOpen] = useState(true);
  const [chartRow, setChartRow] = useState<PriceRow | null>(null);
  const vatMultiplier = includeVAT ? 1.1 : 1;

  return (
    <div className="mb-5 overflow-hidden rounded-card border border-border-light bg-white dark:border-border-dark dark:bg-surface-dark">
      {/* Factory header */}
      <button
        onClick={() => setOpen((o) => !o)}
        className="flex w-full items-center gap-3 p-4 text-start"
      >
        <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-gradient-to-br from-blue to-navy text-sm font-extrabold text-white">
          {group.shortName}
        </div>
        <div className="flex-1">
          <div className="font-bold">{group.factory}</div>
          <div className="text-[11.5px] text-ink/50 dark:text-white/40">به‌روزرسانی: {group.updatedAgo}</div>
        </div>
        <div className="hidden text-center sm:block">
          <div className="text-sm font-extrabold">{group.rows.length}</div>
          <div className="text-[10.5px] text-ink/40">سایز موجود</div>
        </div>
        <div className="hidden text-center sm:block">
          <div className="text-sm font-extrabold">{group.totalStock}</div>
          <div className="text-[10.5px] text-ink/40">موجودی</div>
        </div>
        <div className="text-center">
          <div className={`text-sm font-extrabold ${group.totalChange >= 0 ? "text-success" : "text-danger"}`}>
            {group.totalChange >= 0 ? "▲" : "▼"} {Math.abs(group.totalChange)}%
          </div>
          <div className="text-[10.5px] text-ink/40">تغییر کلی</div>
        </div>
        <motion.span animate={{ rotate: open ? 180 : 0 }} transition={{ duration: 0.2 }}>
          <ChevronDown size={18} className="text-ink/40" />
        </motion.span>
      </button>

      <AnimatePresence initial={false}>
        {open && (
          <motion.div
            initial={{ height: 0 }}
            animate={{ height: "auto" }}
            exit={{ height: 0 }}
            transition={{ duration: 0.25 }}
            className="overflow-hidden"
          >
            {/* Desktop table */}
            <table className="hidden w-full text-sm sm:table">
              <thead>
                <tr className="border-t border-border-light bg-steel text-xs text-ink/50 dark:border-border-dark dark:bg-white/5 dark:text-white/40">
                  <th className="p-3 text-start">محصول / سایز</th>
                  <th className="p-3 text-start">وزن (kg/m)</th>
                  <th className="p-3 text-start">قیمت (تومان)</th>
                  <th className="p-3 text-start">تغییر</th>
                  <th className="p-3 text-start">نمودار ۷ روزه</th>
                  <th className="p-3 text-start">موجودی</th>
                  <th className="p-3 text-start">پیش‌بینی AI</th>
                  <th className="p-3 text-start">عملیات</th>
                </tr>
              </thead>
              <tbody>
                {group.rows.map((r) => (
                  <tr key={r.name + r.size} className="border-t border-border-light dark:border-border-dark">
                    <td className="p-3 font-bold">{r.name} {r.size}</td>
                    <td className="p-3 text-ink/50 dark:text-white/40">{r.weight}</td>
                    <td className="p-3 font-extrabold">{Math.round(r.price * vatMultiplier).toLocaleString("fa-IR")}</td>
                    <td className={`p-3 font-bold ${r.change >= 0 ? "text-success" : "text-danger"}`}>
                      {r.change >= 0 ? "▲" : "▼"} {Math.abs(r.change)}%
                    </td>
                    <td className="p-3">
                      <button onClick={() => setChartRow(r)}>
                        <Sparkline points={r.spark} />
                      </button>
                    </td>
                    <td className="p-3">
                      <span className={`rounded-pill px-2 py-0.5 text-[10.5px] font-bold ${r.stock === "موجود" ? "bg-success/10 text-success" : r.stock === "محدود" ? "bg-warning/15 text-[#B87700]" : "bg-danger/10 text-danger"}`}>
                        {r.stock}
                      </span>
                    </td>
                    <td className="p-3"><AIBadge prediction={r.aiPrediction} /></td>
                    <td className="p-3">
                      <div className="flex gap-1.5">
                        <button className="flex h-8 w-8 items-center justify-center rounded-lg bg-steel dark:bg-white/5" aria-label="تماس"><Phone size={13} /></button>
                        <button className="flex h-8 w-8 items-center justify-center rounded-lg bg-steel dark:bg-white/5" aria-label="علاقه‌مندی"><Heart size={13} /></button>
                        <button onClick={() => setChartRow(r)} className="flex h-8 w-8 items-center justify-center rounded-lg bg-steel dark:bg-white/5" aria-label="نمودار"><BarChart3 size={13} /></button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>

            {/* Mobile cards */}
            <div className="space-y-2.5 border-t border-border-light p-3 dark:border-border-dark sm:hidden">
              {group.rows.map((r) => (
                <div key={r.name + r.size} className="rounded-2xl border border-border-light p-3.5 dark:border-border-dark">
                  <div className="mb-2 flex items-start justify-between">
                    <div>
                      <div className="text-sm font-bold">{r.name} {r.size}</div>
                      <div className="text-[11px] text-ink/40">وزن: {r.weight} kg/m</div>
                    </div>
                    <AIBadge prediction={r.aiPrediction} />
                  </div>
                  <div className="mb-2 flex items-center justify-between">
                    <div className="text-base font-extrabold">{Math.round(r.price * vatMultiplier).toLocaleString("fa-IR")} ت</div>
                    <button onClick={() => setChartRow(r)}><Sparkline points={r.spark} /></button>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className={`text-xs font-bold ${r.change >= 0 ? "text-success" : "text-danger"}`}>
                      {r.change >= 0 ? "▲" : "▼"} {Math.abs(r.change)}%
                    </span>
                    <div className="flex gap-1.5">
                      <button className="flex h-8 w-8 items-center justify-center rounded-lg bg-steel dark:bg-white/5"><Phone size={13} /></button>
                      <button className="flex h-8 w-8 items-center justify-center rounded-lg bg-steel dark:bg-white/5"><Heart size={13} /></button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {chartRow && (
        <PriceChartModal
          open={!!chartRow}
          onClose={() => setChartRow(null)}
          productName={`${chartRow.name} ${chartRow.size}`}
          basePrice={chartRow.price}
        />
      )}
    </div>
  );
}
