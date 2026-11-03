"use client";

import { dailyPrices } from "@/lib/data";

export default function PriceTicker() {
  const items = [...dailyPrices, ...dailyPrices];

  return (
    <div className="overflow-hidden border-b border-white/10 bg-navy text-white">
      <div className="flex w-max animate-[ticker_32s_linear_infinite] gap-9 py-2.5 hover:[animation-play-state:paused]">
        {items.map((p, i) => (
          <span key={i} className="flex items-center gap-2 whitespace-nowrap border-e border-white/10 pe-9 text-[12.5px] font-medium text-[#C9D4E8]">
            {p.name}
            <b className="text-white">{p.price} ت</b>
            <span className={p.dir === "up" ? "font-bold text-success" : "font-bold text-danger"}>
              {p.dir === "up" ? "▲" : "▼"} {p.change}
            </span>
          </span>
        ))}
      </div>
    </div>
  );
}
