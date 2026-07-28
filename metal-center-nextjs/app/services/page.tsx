import Link from "next/link";
import { services } from "@/lib/data";

export const metadata = { title: "خدمات", description: "برش، خم‌کاری، گالوانیزه، لجستیک و صادرات فولاد." };

export default function ServicesPage() {
  return (
    <div className="mx-auto max-w-[1240px] px-6 py-10">
      <div className="mb-10 text-center">
        <h1 className="mb-2 text-[28px] font-extrabold">خدمات متال سنتر</h1>
        <p className="mx-auto max-w-[540px] text-[14.5px] text-ink/50 dark:text-white/40">
          فراتر از خرید و فروش — خدمات تکمیلی برای آماده‌سازی و تحویل محصول فولادی شما.
        </p>
      </div>
      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
        {services.map((s) => (
          <div key={s.title} className="rounded-card border border-border-light bg-white dark:border-border-dark dark:bg-surface-dark p-6 shadow-soft">
            <h3 className="mb-2 font-bold">{s.title}</h3>
            <p className="mb-4 text-[13px] leading-7 text-ink/50 dark:text-white/40">{s.desc}</p>
            <Link href="/rfq" className="text-xs font-bold text-blue">
              درخواست این خدمت ←
            </Link>
          </div>
        ))}
      </div>
    </div>
  );
}
