"use client";

import { useState, useMemo } from "react";
import { Search, ArrowUpDown, Download, Printer, Share2 } from "lucide-react";

export interface PriceRow {
  name: string;
  factory: string;
  price: number;
  change: number;
}

export default function PriceTable({ rows }: { rows: PriceRow[] }) {
  const [query, setQuery] = useState("");
  const [sortKey, setSortKey] = useState<"price" | "change">("price");
  const [sortDir, setSortDir] = useState<"asc" | "desc">("desc");
  const [selected, setSelected] = useState<Set<string>>(new Set());

  const filtered = useMemo(() => {
    let data = rows.filter(
      (r) => r.name.toLowerCase().includes(query.toLowerCase()) || r.factory.toLowerCase().includes(query.toLowerCase())
    );
    data = [...data].sort((a, b) => (sortDir === "asc" ? a[sortKey] - b[sortKey] : b[sortKey] - a[sortKey]));
    return data;
  }, [rows, query, sortKey, sortDir]);

  function toggleSort(key: "price" | "change") {
    if (sortKey === key) setSortDir((d) => (d === "asc" ? "desc" : "asc"));
    else {
      setSortKey(key);
      setSortDir("desc");
    }
  }

  function toggleSelect(name: string) {
    setSelected((prev) => {
      const next = new Set(prev);
      next.has(name) ? next.delete(name) : next.add(name);
      return next;
    });
  }

  function exportCSV() {
    const header = "محصول,کارخانه,قیمت,تغییر\n";
    const body = filtered.map((r) => `${r.name},${r.factory},${r.price},${r.change}%`).join("\n");
    const blob = new Blob(["\uFEFF" + header + body], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "قیمت-روز-متال-سنتر.csv";
    a.click();
    URL.revokeObjectURL(url);
  }

  async function share() {
    const text = filtered.slice(0, 5).map((r) => `${r.name}: ${r.price.toLocaleString("fa-IR")} تومان`).join("\n");
    if (navigator.share) {
      navigator.share({ title: "قیمت روز فولاد - متال سنتر", text }).catch(() => {});
    } else {
      navigator.clipboard.writeText(text);
    }
  }

  return (
    <div>
      {/* Toolbar */}
      <div className="mb-3 flex flex-wrap items-center gap-2">
        <div className="flex flex-1 items-center gap-2 rounded-xl border border-border-light bg-white px-3 py-2 dark:border-border-dark dark:bg-surface-dark">
          <Search size={15} className="text-ink/40" />
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="جستجوی محصول یا کارخانه..."
            className="w-full bg-transparent text-sm outline-none"
          />
        </div>
        {selected.size > 0 && (
          <span className="rounded-pill bg-blue/10 px-3 py-2 text-xs font-bold text-blue">
            {selected.size} محصول برای مقایسه انتخاب شد
          </span>
        )}
        <button onClick={exportCSV} className="flex items-center gap-1.5 rounded-xl border border-border-light bg-white px-3 py-2 text-xs font-semibold dark:border-border-dark dark:bg-surface-dark">
          <Download size={14} /> اکسل
        </button>
        <button onClick={() => window.print()} className="flex items-center gap-1.5 rounded-xl border border-border-light bg-white px-3 py-2 text-xs font-semibold dark:border-border-dark dark:bg-surface-dark">
          <Printer size={14} /> چاپ
        </button>
        <button onClick={share} className="flex items-center gap-1.5 rounded-xl border border-border-light bg-white px-3 py-2 text-xs font-semibold dark:border-border-dark dark:bg-surface-dark">
          <Share2 size={14} /> اشتراک
        </button>
      </div>

      {/* Desktop table */}
      <div className="hidden overflow-hidden rounded-card border border-border-light bg-white dark:border-border-dark dark:bg-surface-dark sm:block">
        <table className="w-full text-sm">
          <thead>
            <tr className="bg-steel text-xs text-ink/50 dark:bg-white/5 dark:text-white/40">
              <th className="w-10 p-3.5"></th>
              <th className="p-3.5 text-start font-semibold">محصول</th>
              <th className="p-3.5 text-start font-semibold">کارخانه</th>
              <th className="p-3.5 text-start font-semibold">
                <button onClick={() => toggleSort("price")} className="flex items-center gap-1">
                  قیمت <ArrowUpDown size={12} />
                </button>
              </th>
              <th className="p-3.5 text-start font-semibold">
                <button onClick={() => toggleSort("change")} className="flex items-center gap-1">
                  تغییر <ArrowUpDown size={12} />
                </button>
              </th>
            </tr>
          </thead>
          <tbody>
            {filtered.map((r) => (
              <tr key={r.name} className="border-t border-border-light dark:border-border-dark">
                <td className="p-3.5">
                  <input type="checkbox" checked={selected.has(r.name)} onChange={() => toggleSelect(r.name)} className="accent-blue" />
                </td>
                <td className="p-3.5 font-bold">{r.name}</td>
                <td className="p-3.5 text-ink/50 dark:text-white/40">{r.factory}</td>
                <td className="p-3.5">{r.price.toLocaleString("fa-IR")} ت</td>
                <td className={`p-3.5 font-bold ${r.change >= 0 ? "text-success" : "text-danger"}`}>
                  {r.change >= 0 ? "▲" : "▼"} {Math.abs(r.change)}%
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Mobile cards */}
      <div className="space-y-2.5 sm:hidden">
        {filtered.map((r) => (
          <div key={r.name} className="flex items-center gap-3 rounded-2xl border border-border-light bg-white p-3.5 dark:border-border-dark dark:bg-surface-dark">
            <input type="checkbox" checked={selected.has(r.name)} onChange={() => toggleSelect(r.name)} className="accent-blue" />
            <div className="flex-1">
              <div className="text-sm font-bold">{r.name}</div>
              <div className="text-xs text-ink/50">{r.factory}</div>
            </div>
            <div className="text-end">
              <div className="text-sm font-extrabold">{r.price.toLocaleString("fa-IR")} ت</div>
              <div className={`text-xs font-bold ${r.change >= 0 ? "text-success" : "text-danger"}`}>
                {r.change >= 0 ? "▲" : "▼"} {Math.abs(r.change)}%
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
