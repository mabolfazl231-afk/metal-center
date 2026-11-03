"use client";

import { useMemo, useState } from "react";
import Modal from "@/components/ui/Modal";

export type HistoryPoint = { price: number; at: string };

const RANGES = [
  { key: "day", label: "۲۴ ساعت", ms: 24 * 3600e3 },
  { key: "week", label: "هفته", ms: 7 * 86400e3 },
  { key: "month", label: "ماه", ms: 30 * 86400e3 },
  { key: "year", label: "سال", ms: 365 * 86400e3 },
];

const W = 560;
const H = 220;
const PAD = 18;

export default function PriceChartModal({
  open,
  onClose,
  productName,
  history,
}: {
  open: boolean;
  onClose: () => void;
  productName: string;
  history: HistoryPoint[];
}) {
  const [range, setRange] = useState("week");
  const [hover, setHover] = useState<number | null>(null);
  const active = RANGES.find((r) => r.key === range) ?? RANGES[1];

  // نقاط داخل بازه‌ی انتخابی؛ اگر خالی بود، آخرین قیمت ثبت‌شده نشان داده می‌شود
  const points = useMemo(() => {
    const now = Date.now();
    const sorted = [...history].sort((a, b) => new Date(a.at).getTime() - new Date(b.at).getTime());
    const inRange = sorted.filter((p) => now - new Date(p.at).getTime() <= active.ms);
    if (inRange.length === 0 && sorted.length > 0) return [sorted[sorted.length - 1]];
    return inRange;
  }, [history, active.ms]);

  const prices = points.map((p) => p.price);
  const max = prices.length ? Math.max(...prices) : 0;
  const min = prices.length ? Math.min(...prices) : 0;
  const span = max - min || 1;

  const coords = points.map((p, i) => ({
    x: points.length === 1 ? W / 2 : PAD + (i / (points.length - 1)) * (W - PAD * 2),
    y: PAD + (1 - (p.price - min) / span) * (H - PAD * 2),
  }));

  const line = coords.map((c, i) => `${i === 0 ? "M" : "L"}${c.x.toFixed(1)},${c.y.toFixed(1)}`).join(" ");
  const area = coords.length
    ? `${line} L${coords[coords.length - 1].x.toFixed(1)},${H} L${coords[0].x.toFixed(1)},${H} Z`
    : "";

  const first = points[0]?.price ?? 0;
  const last = points[points.length - 1]?.price ?? 0;
  const change = first ? ((last - first) / first) * 100 : 0;

  const hp = hover !== null ? points[hover] : null;
  const hc = hover !== null ? coords[hover] : null;

  function onMove(e: React.MouseEvent<SVGSVGElement>) {
    if (!coords.length) return;
    const rect = e.currentTarget.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width) * W;
    let best = 0;
    let bestDist = Infinity;
    coords.forEach((c, i) => {
      const d = Math.abs(c.x - x);
      if (d < bestDist) {
        bestDist = d;
        best = i;
      }
    });
    setHover(best);
  }

  return (
    <Modal open={open} onClose={onClose} title={`روند قیمت — ${productName}`}>
      <div className="mb-4 flex gap-1.5 rounded-xl bg-steel p-1 dark:bg-white/5">
        {RANGES.map((r) => (
          <button
            key={r.key}
            onClick={() => {
              setRange(r.key);
              setHover(null);
            }}
            className={`flex-1 rounded-lg py-2 text-xs font-bold transition ${
              range === r.key ? "bg-white text-blue shadow-soft dark:bg-surface-dark" : "text-ink/50 dark:text-white/40"
            }`}
          >
            {r.label}
          </button>
        ))}
      </div>

      {points.length < 2 && (
        <p className="mb-3 rounded-xl bg-warning/10 px-3 py-2 text-xs text-[#B87700]">
          برای این بازه هنوز تاریخچه‌ی کافی ثبت نشده است.
        </p>
      )}

      <div className="relative">
        <svg
          viewBox={`0 0 ${W} ${H}`}
          className="w-full cursor-crosshair"
          onMouseMove={onMove}
          onTouchMove={(e) => onMove(e as unknown as React.MouseEvent<SVGSVGElement>)}
          onMouseLeave={() => setHover(null)}
        >
          <defs>
            <linearGradient id="chartGrad" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#0A3D91" stopOpacity="0.28" />
              <stop offset="100%" stopColor="#0A3D91" stopOpacity="0" />
            </linearGradient>
          </defs>
          {area && <path d={area} fill="url(#chartGrad)" />}
          {line && <path d={line} fill="none" stroke="#0A3D91" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />}
          {coords.map((c, i) => (
            <circle
              key={i}
              cx={c.x}
              cy={c.y}
              r={hover === i ? 6 : 3.5}
              fill={hover === i ? "#E8590C" : "#0A3D91"}
              stroke="#fff"
              strokeWidth="1.5"
            />
          ))}
          {hc && <line x1={hc.x} x2={hc.x} y1={0} y2={H} stroke="#E8590C" strokeOpacity="0.35" strokeDasharray="4 4" />}
        </svg>

        {/* پنجره‌ی توضیح نقطه‌ی انتخاب‌شده */}
        {hp && hc && (
          <div
            className="pointer-events-none absolute -top-2 z-10 -translate-x-1/2 whitespace-nowrap rounded-xl bg-navy px-3 py-2 text-center text-white shadow-lifted"
            style={{ left: `${(hc.x / W) * 100}%` }}
          >
            <div className="text-xs opacity-70">{new Date(hp.at).toLocaleString("fa-IR", { dateStyle: "medium", timeStyle: "short" })}</div>
            <div className="text-sm font-extrabold">{Math.round(hp.price).toLocaleString("fa-IR")} ت</div>
          </div>
        )}
      </div>

      <div className="mt-3 flex flex-wrap justify-between gap-2 text-xs text-ink/60 dark:text-white/50">
        <span>کمترین: {Math.round(min).toLocaleString("fa-IR")} ت</span>
        <span>بیشترین: {Math.round(max).toLocaleString("fa-IR")} ت</span>
        <span className={change >= 0 ? "font-bold text-success" : "font-bold text-danger"}>
          تغییر در بازه: {change >= 0 ? "▲" : "▼"} {Math.abs(change).toFixed(1)}٪
        </span>
      </div>
    </Modal>
  );
}
