"use client";

import Link from "next/link";
import Image from "next/image";
import { useState } from "react";
import { useAuthGuard, signOut } from "@/lib/useAuthGuard";
import ProductPriceManager from "@/components/admin/ProductPriceManager";
import FactoryCategoryManager from "@/components/admin/FactoryCategoryManager";
import PriceListBuilder from "@/components/admin/PriceListBuilder";
import DashboardStats from "@/components/admin/DashboardStats";
import RfqManager from "@/components/admin/RfqManager";
import MessagesManager from "@/components/admin/MessagesManager";
import HeroManager from "@/components/admin/HeroManager";
import SiteSettingsManager from "@/components/admin/SiteSettingsManager";
import MenuManager from "@/components/admin/MenuManager";
import ServicesManager from "@/components/admin/ServicesManager";
import ArticlesManager from "@/components/admin/ArticlesManager";
import MediaLibrary from "@/components/admin/MediaLibrary";

const NAV = [
  { key: "dashboard", label: "نمای کلی" },
  { key: "rfqs", label: "مدیریت استعلام‌ها" },
  { key: "messages", label: "پیام‌های تماس" },
  { key: "products", label: "محصولات و قیمت‌ها" },
  { key: "lists", label: "لیست‌های قیمت" },
  { key: "factories", label: "کارخانه‌ها و دسته‌ها" },
  { key: "hero", label: "بنرهای صفحه‌ی اصلی" },
  { key: "settings", label: "تنظیمات و تماس" },
  { key: "menu", label: "منوی فوتر" },
  { key: "services", label: "خدمات" },
  { key: "articles", label: "مقالات دانش" },
  { key: "media", label: "رسانه‌ها" },
  { key: "users", label: "کاربران" },
];

// فقط ایمیل‌های داخل این لیست اجازه‌ی ورود به پنل ادمین را دارند.
const ADMIN_EMAILS = (process.env.NEXT_PUBLIC_ADMIN_EMAILS ?? "").split(",").map((e) => e.trim().toLowerCase());

export default function AdminPanelPage() {
  const { user, loading } = useAuthGuard();
  const [tab, setTab] = useState("dashboard");

  if (loading) {
    return <div className="flex min-h-screen items-center justify-center text-sm text-ink/50">در حال بارگذاری...</div>;
  }
  if (!user) return null;

  if (!ADMIN_EMAILS.includes((user.email ?? "").toLowerCase())) {
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

        {tab === "dashboard" && <DashboardStats />}
        {tab === "rfqs" && <RfqManager />}
        {tab === "messages" && <MessagesManager />}
        {tab === "products" && <ProductPriceManager />}
        {tab === "lists" && <PriceListBuilder />}
        {tab === "factories" && <FactoryCategoryManager />}
        {tab === "hero" && <HeroManager />}
        {tab === "settings" && <SiteSettingsManager />}
        {tab === "menu" && <MenuManager />}
        {tab === "services" && <ServicesManager />}
        {tab === "articles" && <ArticlesManager />}
        {tab === "media" && <MediaLibrary />}

        {tab === "users" && (
          <div>
            <h1 className="mb-1 text-xl font-extrabold">کاربران</h1>
            <p className="text-sm text-ink/50">
              فهرست کاربران حساب‌دار هنوز اضافه نشده است. برای نمایش آن باید یک جدول پروفایل یا کلید سرور اضافه شود.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
