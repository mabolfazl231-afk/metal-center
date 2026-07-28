"use client";

import Link from "next/link";
import Image from "next/image";
import { useState } from "react";
import { rfqRows, statusLabel } from "@/lib/data";
import { useAuthGuard, signOut } from "@/lib/useAuthGuard";

const NAV = [
  { key: "dashboard", label: "نمای کلی" },
  { key: "rfqs", label: "مدیریت استعلام‌ها" },
  { key: "products", label: "محصولات" },
  { key: "prices", label: "قیمت‌گذاری" },
  { key: "factories", label: "کارخانه‌ها" },
  { key: "users", label: "کاربران" },
];

// فقط ایمیل‌های داخل این لیست اجازه‌ی ورود به پنل ادمین را دارند.
// این یک روش ساده برای شروع است؛ در آینده بهتر است این لیست به یک جدول
// "roles" در دیتابیس منتقل شود (طبق User Roles سند اصلی پروژه).
const ADMIN_EMAILS = (process.env.NEXT_PUBLIC_ADMIN_EMAILS ?? "").split(",").map((e) => e.trim());

export default function AdminPanelPage() {
  const { user, loading } = useAuthGuard();
  const [tab, setTab] = useState("dashboard");

  if (loading) {
    return <div className="flex min-h-screen items-center justify-center text-sm text-ink/50">در حال بارگذاری...</div>;
  }
  if (!user) return null;

  if (!ADMIN_EMAILS.includes(user.email ?? "")) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center gap-3 px-6 text-center">
        <p className="font-bold">دسترسی به این بخش محدود است</p>
        <p className="text-sm text-ink/50">حساب شما مجوز ورود به پنل مدیریت را ندارد.</p>
        <Link href="/" className="text-sm font-bold text-blue">بازگشت به سایت</Link>
      </div>
    );
  }

  return (
    <div className="grid min-h-screen grid-cols-1 lg:grid-cols-[260px_1fr]">
      <aside className="hidden bg-navy p-5 text-[#B9C6DC] lg:block">
        <Link href="/" className="mb-1 flex items-center gap-2.5 px-2 text-base font-extrabold text-white">
          <Image src="/logo.png" alt="متال سنتر" width={32} height={32} className="rounded-[10px]" />
          متال سنتر
        </Link>
        <div className="mb-5 px-2 text-[11px] text-[#7A8AAA]">پنل مدیریت · نقش: ادمین</div>
        <nav className="space-y-1">
          {NAV.map((n) => (
            <button
              key={n.key}
              onClick={() => setTab(n.key)}
              className={`block w-full rounded-xl px-3 py-2.5 text-start text-sm font-semibold ${
                tab === n.key ? "bg-white/10 text-white" : "hover:bg-white/5"
              }`}
            >
              {n.label}
            </button>
          ))}
        </nav>
        <Link href="/" className="mt-8 block border-t border-white/10 pt-4 text-xs font-semibold text-[#93A0B8]">
          ← بازگشت به سایت
        </Link>
        <div className="mt-2 truncate text-[11px] text-[#5F7091]" dir="ltr">{user.email}</div>
        <button onClick={signOut} className="mt-2 text-xs font-semibold text-danger">
          خروج از حساب
        </button>
      </aside>

      <div className="p-6">
        <div className="mb-6 flex gap-2 overflow-x-auto lg:hidden">
          {NAV.map((n) => (
            <button
              key={n.key}
              onClick={() => setTab(n.key)}
              className={`whitespace-nowrap rounded-full border px-4 py-2 text-xs font-bold ${
                tab === n.key ? "border-blue bg-blue text-white" : "border-black/10 text-ink/60"
              }`}
            >
              {n.label}
            </button>
          ))}
        </div>

        {tab === "dashboard" && (
          <div>
            <h1 className="mb-1 text-xl font-extrabold">نمای کلی سیستم</h1>
            <p className="mb-6 text-sm text-ink/50">آمار کلی فروش، استعلام‌ها و عملکرد پلتفرم</p>
            <div className="mb-6 grid grid-cols-2 gap-3.5 lg:grid-cols-4">
              {[
                { num: "۹", lbl: "استعلام جدید امروز" },
                { num: "۱۴۲", lbl: "سفارش این ماه" },
                { num: "۲.۴ میلیارد", lbl: "درآمد این ماه (ت)" },
                { num: "۲۴۰", lbl: "کارخانه فعال" },
              ].map((s) => (
                <div key={s.lbl} className="rounded-2xl border border-black/5 bg-white p-4">
                  <div className="text-lg font-extrabold">{s.num}</div>
                  <div className="mt-1 text-xs text-ink/50">{s.lbl}</div>
                </div>
              ))}
            </div>
          </div>
        )}

        {tab === "rfqs" && (
          <div>
            <h1 className="mb-4 text-xl font-extrabold">مدیریت استعلام‌ها</h1>
            <div className="overflow-hidden rounded-card border border-black/5 bg-white">
              <table className="w-full text-sm">
                <thead>
                  <tr className="bg-steel text-xs text-ink/50">
                    <th className="p-3.5 text-start">شماره</th>
                    <th className="p-3.5 text-start">محصول</th>
                    <th className="p-3.5 text-start">وضعیت</th>
                    <th className="p-3.5 text-start"></th>
                  </tr>
                </thead>
                <tbody>
                  {rfqRows.map((r) => (
                    <tr key={r.id} className="border-t border-black/5">
                      <td className="p-3.5 font-bold">{r.id}</td>
                      <td className="p-3.5">{r.name}</td>
                      <td className="p-3.5">
                        <span className="rounded-full bg-blue/10 px-2.5 py-1 text-[11px] font-bold text-blue">
                          {statusLabel[r.status]}
                        </span>
                      </td>
                      <td className="p-3.5">
                        <button className="text-xs font-bold text-blue">تخصیص کارشناس</button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {["products", "prices", "factories", "users"].includes(tab) && (
          <div>
            <h1 className="mb-1 text-xl font-extrabold">
              {NAV.find((n) => n.key === tab)?.label}
            </h1>
            <p className="text-sm text-ink/50">
              این بخش در مرحله ۱۱ (اتصال دیتابیس Supabase) به جداول واقعی وصل می‌شود — الان فقط ساختار UI آماده است.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
