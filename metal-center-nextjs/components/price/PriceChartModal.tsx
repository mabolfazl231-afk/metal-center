"use client";

import { useState, useMemo } from "react";
import Modal from "@/components/ui/Modal";

const RANGES: { key: string; label: string; points: number }[] = [
  { key: "day", label: "روزانه", points: 24 },
  { key: "week", label: "هفتگی", points: 7 },
  { key: "month", label: "ماهانه", points: 30 },
  { key: "year", label: "سالانه", points: 12 },
];

function genSeries(n: number, base: number) {
  let v = base;
  const out: number[] = [];
  for (let i = 0; i < n; i++) {
    v += (Math.random() - 0.45) * (base * 0.01);
    out.push(v);
  }
  return out;
}

export default function PriceChartModal({
  open,
  onClose,
  productName,
  basePrice,
}: {
  open: boolean;
  onClose: () => void;
  productName: string;
  basePrice: number;
}) {
  const [range, setRange] = useState("week");
  const active = RANGES.find((r) => r.key === range)!;
  const series = useMemo(() => genSeries(active.points, basePrice), [range, basePrice, active.points]);

  const max = Math.max(...series);
  const min = Math.min(...series);
  const W = 500;
  const H = 180;
  const path = series
    .map((v, i) => {
      const x = (i / (series.length - 1)) * W;
      const y = H - ((v - min) / (max - min || 1)) * H;
      return `${i === 0 ? "M" : "L"}${x.toFixed(1)},${y.toFixed(1)}`;
    })
    .join(" ");

  return (
    <Modal open={open} onClose={onClose} title={`روند قیمت — ${productName}`}>
      <div className="mb-4 flex gap-1.5 rounded-xl bg-steel p-1 dark:bg-white/5">
        {RANGES.map((r) => (
          <button
            key={r.key}
            onClick={() => setRange(r.key)}
            className={`flex-1 rounded-lg py-2 text-xs font-bold ${
              range === r.key ? "bg-white text-blue shadow-soft dark:bg-surface-dark" : "text-ink/50 dark:text-white/40"
            }`}
          >
            {r.label}
          </button>
        ))}
      </div>
      <svg viewBox={`0 0 ${W} ${H}`} className="w-full">
        <defs>
          <linearGradient id="chartGrad" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#0A3D91" stopOpacity="0.25" />
            <stop offset="100%" stopColor="#0A3D91" stopOpacity="0" />
          </linearGradient>
        </defs>
        <path d={`${path} L${W},${H} L0,${H} Z`} fill="url(#chartGrad)" />
        <path d={path} fill="none" stroke="#0A3D91" strokeWidth="2.5" strokeLinecap="round" />
      </svg>
      <div className="mt-3 flex justify-between text-xs text-ink/50 dark:text-white/40">
        <span>کمترین: {Math.round(min).toLocaleString("fa-IR")} ت</span>
        <span>بیشترین: {Math.round(max).toLocaleString("fa-IR")} ت</span>
      </div>
    </Modal>
  );
}
