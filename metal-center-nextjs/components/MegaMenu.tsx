"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { categories } from "@/lib/data";

const CONTENT: Record<string, { columns: { title: string; links: { label: string; href: string }[] }[]; banner: string }> = {
  products: {
    columns: [
      { title: "دسته‌بندی‌ها", links: categories.map((c) => ({ label: c.name, href: "/products" })) },
      { title: "پرطرفدار", links: [
        { label: "میلگرد A3 سایز ۱۴", href: "/products" },
        { label: "تیرآهن IPE ۱۸", href: "/products" },
        { label: "ورق روغنی ۲ میل", href: "/products" },
      ]},
      { title: "دسترسی سریع", links: [
        { label: "قیمت روز محصولات", href: "/prices" },
        { label: "جدول وزن استاندارد", href: "/knowledge" },
        { label: "ثبت استعلام قیمت", href: "/rfq" },
      ]},
    ],
    banner: "قیمت‌ها هر ۱۵ دقیقه به‌روزرسانی می‌شوند",
  },
  factories: {
    columns: [
      { title: "استان‌ها", links: [
        { label: "اصفهان", href: "/factories" },
        { label: "خوزستان", href: "/factories" },
        { label: "آذربایجان شرقی", href: "/factories" },
      ]},
      { title: "معتبرترین‌ها", links: [
        { label: "ذوب آهن اصفهان", href: "/factories" },
        { label: "فولاد مبارکه", href: "/factories" },
      ]},
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

export default function MegaMenu({ menuKey }: { menuKey: keyof typeof CONTENT }) {
  const data = CONTENT[menuKey];
  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: 8 }}
      transition={{ duration: 0.18 }}
      className="absolute inset-x-0 top-full border-t border-border-light bg-white/85 shadow-glass backdrop-blur-2xl dark:border-border-dark dark:bg-navy/85"
    >
      <div className="mx-auto grid max-w-[1240px] grid-cols-4 gap-8 px-6 py-8">
        {data.columns.map((col) => (
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
          <p className="text-sm font-bold leading-6">{data.banner}</p>
          <Link href="/rfq" className="mt-4 text-xs font-bold text-[#7FB2FF]">
            ثبت استعلام سریع ←
          </Link>
        </div>
      </div>
    </motion.div>
  );
}
