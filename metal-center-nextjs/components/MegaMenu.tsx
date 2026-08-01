"use client";

import { useState } from "react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { categories, factories } from "@/lib/data";

const SIMPLE_CONTENT: Record<string, { columns: { title: string; links: { label: string; href: string }[] }[]; banner: string }> = {
  factories: {
    columns: [
      { title: "استان‌ها", links: [
        { label: "اصفهان", href: "/factories" },
        { label: "خوزستان", href: "/factories" },
        { label: "آذربایجان شرقی", href: "/factories" },
      ]},
      { title: "معتبرترین‌ها", links: factories.slice(0, 3).map((f) => ({ label: f.name, href: "/factories" })) },
      { title: "دسترسی سریع", links: [
        { label: "همه کارخانه‌های تأییدشده", href: "/factories" },
        { label: "ثبت درخواست همکاری", href: "/contact" },
      ]},
    ],
    banner: "۲۴۰+ کارخانه‌ی تأییدشده در شبکه‌ی متال سنتر",
  },
  services: {
    columns: [
      { title: "خدمات صنعتی", links: [
        { label: "برش فولاد", href: "/services" },
        { label: "خم‌کاری", href: "/services" },
        { label: "گالوانیزه", href: "/services" },
      ]},
      { title: "لجستیک", links: [
        { label: "حمل سراسری", href: "/services" },
        { label: "صادرات", href: "/export" },
      ]},
      { title: "دسترسی سریع", links: [
        { label: "مشاوره رایگان", href: "/rfq" },
        { label: "تماس با تیم فنی", href: "/contact" },
      ]},
    ],
    banner: "مدیریت کامل پروژه از تأمین تا تحویل درب کارگاه",
  },
};

// Mega Menu دو سطحی محصولات: سطح اول دسته‌بندی‌ها، وقتی روی یکی هاور می‌کنی
// (بدون باز شدن پنجره‌ی جدید) همان پنل به سایزها + کارخانه‌های آن دسته تغییر می‌کند.
function ProductsMegaMenu() {
  const [active, setActive] = useState(categories[0]);

  return (
    <div className="mx-auto grid max-w-[1240px] grid-cols-[240px_1fr] gap-0 px-6 py-2">
      {/* ستون دسته‌بندی‌ها */}
      <div className="border-e border-border-light py-4 pe-4 dark:border-border-dark">
        {categories.map((c) => (
          <button
            key={c.name}
            onMouseEnter={() => setActive(c)}
            className={`flex w-full items-center justify-between rounded-xl px-3 py-2.5 text-start text-sm font-semibold transition-colors ${
              active.name === c.name ? "bg-blue/10 text-blue" : "text-ink/70 hover:bg-steel dark:text-white/70 dark:hover:bg-white/5"
            }`}
          >
            {c.name}
            <span className="text-[10.5px] font-normal text-ink/30">{c.count}</span>
          </button>
        ))}
      </div>

      {/* پنل سمت راست — با تغییر active عوض می‌شود، نه پنجره‌ی جدید */}
      <AnimatePresence mode="wait">
        <motion.div
          key={active.name}
          initial={{ opacity: 0, x: -8 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.15 }}
          className="grid grid-cols-3 gap-8 py-5 ps-6"
        >
          <div>
            <div className="mb-3 text-[11px] font-bold uppercase tracking-wide text-ink/40 dark:text-white/40">سایزها</div>
            <div className="flex flex-wrap gap-1.5">
              {active.sizes.map((s) => (
                <Link
                  key={s}
                  href="/prices"
                  className="rounded-lg border border-border-light px-2.5 py-1.5 text-xs font-semibold text-ink/70 hover:border-blue hover:text-blue dark:border-border-dark dark:text-white/70"
                >
                  {s}
                </Link>
              ))}
            </div>
          </div>
          <div>
            <div className="mb-3 text-[11px] font-bold uppercase tracking-wide text-ink/40 dark:text-white/40">کارخانه‌های تأمین‌کننده</div>
            <ul className="space-y-2">
              {factories.slice(0, 4).map((f) => (
                <li key={f.name}>
                  <Link href="/factories" className="text-sm font-medium text-ink/75 hover:text-blue dark:text-white/75">
                    {f.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
          <div className="flex flex-col justify-between rounded-2xl bg-gradient-to-br from-blue to-navy p-5 text-white">
            <div className="mb-3 h-8 w-8 rounded-lg bg-white/15" />
            <p className="text-sm font-bold leading-6">{active.name} — قیمت لحظه‌ای و استعلام آنی</p>
            <Link href="/prices" className="mt-4 text-xs font-bold text-[#7FB2FF]">
              مشاهده قیمت {active.name} ←
            </Link>
          </div>
        </motion.div>
      </AnimatePresence>
    </div>
  );
}

export default function MegaMenu({ menuKey }: { menuKey: "products" | "factories" | "services" }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: 8 }}
      transition={{ duration: 0.18 }}
      className="absolute inset-x-0 top-full border-t border-border-light bg-white/90 shadow-glass backdrop-blur-2xl dark:border-border-dark dark:bg-navy/90"
    >
      {menuKey === "products" ? (
        <ProductsMegaMenu />
      ) : (
        <div className="mx-auto grid max-w-[1240px] grid-cols-4 gap-8 px-6 py-8">
          {SIMPLE_CONTENT[menuKey].columns.map((col) => (
            <div key={col.title}>
              <div className="mb-3 text-[11px] font-bold uppercase tracking-wide text-ink/40 dark:text-white/40">
                {col.title}
              </div>
              <ul className="space-y-2">
                {col.links.map((l) => (
                  <li key={l.label}>
                    <Link href={l.href} className="text-sm font-medium text-ink/75 hover:text-blue dark:text-white/75">
                      {l.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
          <div className="flex flex-col justify-between rounded-2xl bg-gradient-to-br from-blue to-navy p-5 text-white">
            <div className="mb-3 h-8 w-8 rounded-lg bg-white/15" />
            <p className="text-sm font-bold leading-6">{SIMPLE_CONTENT[menuKey].banner}</p>
            <Link href="/rfq" className="mt-4 text-xs font-bold text-[#7FB2FF]">
              ثبت استعلام سریع ←
            </Link>
          </div>
        </div>
      )}
    </motion.div>
  );
}
