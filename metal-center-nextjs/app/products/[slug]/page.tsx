"use client";

import { useState } from "react";
import Link from "next/link";
import { Package, ShieldCheck, TrendingUp } from "lucide-react";
import ProductCard from "@/components/product/ProductCard";
import { dailyPrices, factories } from "@/lib/data";

const TABS = ["مشخصات فنی", "جدول وزن", "تاریخچه قیمت", "کارخانه سازنده", "سوالات متداول"];

export default function ProductDetailPage({ params }: { params: { slug: string } }) {
  const [tab, setTab] = useState(0);
  const product = dailyPrices[0]; // نمونه — بعداً بر اساس params.slug از دیتابیس گرفته می‌شود
  const factory = factories[0];

  return (
    <div className="mx-auto max-w-[1100px] px-6 py-10">
      <div className="mb-6 text-xs text-ink/40">
        <Link href="/">خانه</Link> / <Link href="/products">محصولات</Link> / <span className="text-ink">{product.name}</span>
      </div>

      <div className="grid grid-cols-1 gap-10 lg:grid-cols-2">
        {/* Gallery */}
        <div>
          <div className="mb-3 flex h-[320px] items-center justify-center rounded-card bg-gradient-to-br from-[#123a6e] to-blue">
            <Package size={72} strokeWidth={1.1} className="text-white/60" />
          </div>
          <div className="flex gap-2">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className={`h-16 w-16 rounded-xl border-2 ${i === 1 ? "border-blue" : "border-border-light"} bg-white`} />
            ))}
          </div>
        </div>

        {/* Info */}
        <div>
          <h1 className="mb-2 text-2xl font-extrabold leading-9">{product.name} — شاخه ۱۲ متری</h1>
          <div className="mb-5 flex flex-wrap gap-2">
            {["استاندارد A3", "سایز ۱۴mm", "شاخه ۱۲m"].map((t) => (
              <span key={t} className="rounded-pill bg-steel px-3 py-1 text-xs font-semibold text-ink/60">{t}</span>
            ))}
          </div>

          <div className="mb-5 rounded-card border border-border-light bg-white p-5">
            <div className="mb-1 text-2xl font-extrabold text-blue">
              {product.price} تومان <span className="text-xs font-medium text-ink/40">/ کیلوگرم</span>
            </div>
            <div className="flex items-center gap-1.5 text-xs text-ink/50">
              <span className="h-1.5 w-1.5 animate-pulse-soft rounded-full bg-success" />
              آخرین به‌روزرسانی: ۱۵ دقیقه پیش · {product.factory}
            </div>
          </div>

          <div className="mb-5 grid grid-cols-2 gap-2.5">
            {[
              { label: "کارخانه", value: product.factory },
              { label: "استاندارد", value: "A3 (ملی ایران)" },
              { label: "موجودی", value: "موجود", green: true },
              { label: "حداقل سفارش", value: "۵ تن" },
            ].map((s) => (
              <div key={s.label} className="rounded-xl bg-steel p-3">
                <div className="text-[11px] text-ink/50">{s.label}</div>
                <div className={`text-sm font-bold ${s.green ? "text-success" : ""}`}>{s.value}</div>
              </div>
            ))}
          </div>

          <div className="flex gap-2.5">
            <Link href="/rfq" className="flex-1 rounded-btn bg-blue py-3.5 text-center text-sm font-bold text-white hover:bg-navy">
              درخواست استعلام برای این محصول
            </Link>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="mt-12 flex gap-6 overflow-x-auto border-b border-border-light">
        {TABS.map((t, i) => (
          <button
            key={t}
            onClick={() => setTab(i)}
            className={`whitespace-nowrap border-b-2 pb-3 text-sm font-semibold ${
              tab === i ? "border-blue text-blue" : "border-transparent text-ink/50"
            }`}
          >
            {t}
          </button>
        ))}
      </div>

      <div className="py-8">
        {tab === 0 && (
          <table className="w-full text-sm">
            <tbody>
              {[
                ["استاندارد", "A3 — ملی ایران"],
                ["قطر اسمی", "۱۴ میلی‌متر"],
                ["طول شاخه", "۱۲ متر"],
                ["کاربرد", "سازه‌های بتنی، اسکلت ساختمان"],
              ].map(([k, v]) => (
                <tr key={k} className="border-b border-border-light">
                  <td className="w-1/3 py-3 text-ink/50">{k}</td>
                  <td className="py-3 font-semibold">{v}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}

        {tab === 1 && (
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-steel text-xs text-ink/50">
                <th className="p-3 text-start">سایز (mm)</th>
                <th className="p-3 text-start">وزن هر شاخه (kg)</th>
                <th className="p-3 text-start">وزن هر متر (kg)</th>
              </tr>
            </thead>
            <tbody>
              {[["۱۲", "۱۰.۶", "۰.۸۸"], ["۱۴", "۱۴.۵", "۱.۲۱"], ["۱۶", "۱۸.۹", "۱.۵۸"], ["۱۸", "۲۴.۰", "۲.۰۰"]].map((r) => (
                <tr key={r[0]} className="border-b border-border-light">
                  {r.map((c, i) => <td key={i} className="p-3">{c}</td>)}
                </tr>
              ))}
            </tbody>
          </table>
        )}

        {tab === 2 && (
          <div className="flex items-center gap-2 text-sm text-ink/50">
            <TrendingUp size={16} /> نمودار تاریخچه قیمت در صفحه‌ی «قیمت روز» با جزئیات کامل در دسترس است.
          </div>
        )}

        {tab === 3 && (
          <div className="flex items-center gap-3 rounded-2xl border border-border-light bg-white p-4">
            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-gradient-to-br from-blue to-navy text-white">
              <ShieldCheck size={18} />
            </div>
            <div className="flex-1">
              <div className="font-bold">{factory.name}</div>
              <div className="text-xs text-ink/50">{factory.location} · {factory.products} محصول فعال</div>
            </div>
            <Link href="/factories" className="text-xs font-bold text-blue">مشاهده ←</Link>
          </div>
        )}

        {tab === 4 && (
          <div className="space-y-3 text-sm">
            <details className="rounded-xl border border-border-light p-4">
              <summary className="cursor-pointer font-bold">حداقل مقدار سفارش چقدر است؟</summary>
              <p className="mt-2 text-ink/60">حداقل سفارش برای این محصول ۵ تن است.</p>
            </details>
            <details className="rounded-xl border border-border-light p-4">
              <summary className="cursor-pointer font-bold">زمان تحویل معمولاً چقدر طول می‌کشد؟</summary>
              <p className="mt-2 text-ink/60">بسته به موجودی کارخانه، معمولاً ۲ تا ۵ روز کاری.</p>
            </details>
          </div>
        )}
      </div>

      {/* Related */}
      <div className="mt-8">
        <h2 className="mb-5 text-lg font-extrabold">محصولات مشابه</h2>
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
          {dailyPrices.slice(0, 4).map((p) => (
            <ProductCard key={p.name} product={{ name: p.name, factory: p.factory, price: p.price, badge: "موجود" }} />
          ))}
        </div>
      </div>
    </div>
  );
}
