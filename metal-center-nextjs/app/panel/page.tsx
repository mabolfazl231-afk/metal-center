"use client";

import Link from "next/link";
import Image from "next/image";
import { useState } from "react";
import { rfqRows, statusLabel } from "@/lib/data";
import { useAuthGuard, signOut } from "@/lib/useAuthGuard";

const NAV = [
  { key: "overview", label: "نمای کلی" },
  { key: "rfqs", label: "استعلام‌های من" },
  { key: "invoices", label: "فاکتورها" },
  { key: "favorites", label: "علاقه‌مندی‌ها" },
  { key: "profile", label: "پروفایل" },
];

export default function CustomerPanelPage() {
  const { user, loading } = useAuthGuard();
  const [tab, setTab] = useState("overview");

  if (loading) {
    return <div className="flex min-h-screen items-center justify-center text-sm text-ink/50">در حال بارگذاری...</div>;
  }
  if (!user) return null; // useAuthGuard در حال هدایت به /login است

  return (
    <div className="grid min-h-screen grid-cols-1 lg:grid-cols-[260px_1fr]">
      <aside className="hidden border-e border-black/5 bg-white p-5 lg:block">
        <Link href="/" className="mb-6 flex items-center gap-2.5 px-2 text-base font-extrabold">
          <Image src="/logo.png" alt="متال سنتر" width={32} height={32} className="rounded-[10px]" />
          متال سنتر
        </Link>
        <nav className="space-y-1">
          {NAV.map((n) => (
            <button
              key={n.key}
              onClick={() => setTab(n.key)}
              className={`block w-full rounded-xl px-3 py-2.5 text-start text-sm font-semibold ${
                tab === n.key ? "bg-blue/10 text-blue" : "text-ink/60 hover:bg-steel"
              }`}
            >
              {n.label}
            </button>
          ))}
        </nav>
        <Link href="/" className="mt-8 block border-t border-black/5 pt-4 text-xs font-semibold text-ink/50">
          ← بازگشت به سایت
        </Link>
        <div className="mt-2 truncate text-[11px] text-ink/40" dir="ltr">{user.email}</div>
        <button onClick={signOut} className="mt-2 text-xs font-semibold text-danger">
          خروج از حساب
        </button>
      </aside>

      <div className="p-6">
        {/* mobile tab bar */}
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

        {tab === "overview" && (
          <div>
            <h1 className="mb-1 text-xl font-extrabold">نمای کلی حساب</h1>
            <p className="mb-6 text-sm text-ink/50">خلاصه فعالیت‌ها و استعلام‌های اخیر شما</p>
            <div className="mb-6 grid grid-cols-2 gap-3.5 lg:grid-cols-4">
              {[
                { num: "۷", lbl: "استعلام فعال" },
                { num: "۴", lbl: "پیش‌فاکتور در انتظار" },
                { num: "۱۲", lbl: "سفارش تکمیل‌شده" },
                { num: "۱۸", lbl: "محصول علاقه‌مندی" },
              ].map((s) => (
                <div key={s.lbl} className="rounded-2xl border border-black/5 bg-white p-4">
                  <div className="text-lg font-extrabold">{s.num}</div>
                  <div className="mt-1 text-xs text-ink/50">{s.lbl}</div>
                </div>
              ))}
            </div>
            <Link href="/rfq" className="inline-block rounded-btn bg-blue px-5 py-3 text-sm font-bold text-white">
              + استعلام جدید
            </Link>
          </div>
        )}

        {tab === "rfqs" && (
          <div>
            <h1 className="mb-4 text-xl font-extrabold">استعلام‌های من</h1>
            <div className="overflow-hidden rounded-card border border-black/5 bg-white">
              <table className="w-full text-sm">
                <thead>
                  <tr className="bg-steel text-xs text-ink/50">
                    <th className="p-3.5 text-start">شماره</th>
                    <th className="p-3.5 text-start">محصول</th>
                    <th className="p-3.5 text-start">تاریخ</th>
                    <th className="p-3.5 text-start">وضعیت</th>
                  </tr>
                </thead>
                <tbody>
                  {rfqRows.map((r) => (
                    <tr key={r.id} className="border-t border-black/5">
                      <td className="p-3.5 font-bold">{r.id}</td>
                      <td className="p-3.5">{r.name}</td>
                      <td className="p-3.5 text-ink/50">{r.date}</td>
                      <td className="p-3.5">
                        <span className="rounded-full bg-blue/10 px-2.5 py-1 text-[11px] font-bold text-blue">
                          {statusLabel[r.status]}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {tab === "invoices" && (
          <div>
            <h1 className="mb-4 text-xl font-extrabold">فاکتورها</h1>
            <p className="text-sm text-ink/50">
              این بخش در مرحله ۱۱ (اتصال دیتابیس) به داده واقعی وصل می‌شود.
            </p>
          </div>
        )}

        {tab === "favorites" && (
          <div>
            <h1 className="mb-4 text-xl font-extrabold">علاقه‌مندی‌ها</h1>
            <p className="text-sm text-ink/50">محصولات ذخیره‌شده شما اینجا نمایش داده می‌شود.</p>
          </div>
        )}

        {tab === "profile" && (
          <div>
            <h1 className="mb-4 text-xl font-extrabold">پروفایل و امنیت</h1>
            <div className="max-w-md space-y-3 rounded-card border border-black/5 bg-white p-6">
              <input placeholder="نام و نام خانوادگی" className="w-full rounded-xl border border-black/10 bg-steel p-3 text-sm" />
              <input placeholder="شماره موبایل" className="w-full rounded-xl border border-black/10 bg-steel p-3 text-sm" />
              <button className="rounded-btn bg-blue px-5 py-3 text-sm font-bold text-white">ذخیره تغییرات</button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
