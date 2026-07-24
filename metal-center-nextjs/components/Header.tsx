"use client";

import Link from "next/link";
import Image from "next/image";
import { useState } from "react";
import SmartSearch from "./SmartSearch";

const NAV_LINKS = [
  { href: "/products", label: "محصولات" },
  { href: "/prices", label: "قیمت روز" },
  { href: "/rfq", label: "استعلام قیمت" },
  { href: "/factories", label: "کارخانه‌ها" },
  { href: "/knowledge", label: "مرکز دانش" },
  { href: "/assistant", label: "✦ دستیار هوشمند" },
];

export default function Header() {
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);

  function toggleTheme() {
    const html = document.documentElement;
    const isDark = html.classList.contains("dark");
    html.classList.toggle("dark", !isDark);
  }

  function toggleDirection() {
    const html = document.documentElement;
    html.dir = html.dir === "rtl" ? "ltr" : "rtl";
  }

  return (
    <header className="sticky top-0 z-50 border-b border-black/5 bg-white/90 backdrop-blur dark:bg-navy/90">
      <div className="mx-auto flex h-[72px] max-w-[1240px] items-center justify-between gap-5 px-6">
        <Link href="/" className="flex items-center gap-2.5 text-[19px] font-extrabold">
          <Image src="/logo.png" alt="متال سنتر" width={38} height={38} className="rounded-[10px]" priority />
          متال سنتر
        </Link>

        <nav className="hidden items-center gap-1 lg:flex">
          {NAV_LINKS.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="rounded-[10px] px-3 py-2.5 text-[14.5px] font-medium text-ink/60 transition-colors duration-hover hover:bg-steel hover:text-ink"
            >
              {link.label}
            </Link>
          ))}
        </nav>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setSearchOpen(true)}
            className="flex h-10 w-10 items-center justify-center rounded-xl border border-black/10 bg-steel"
            aria-label="جستجوی هوشمند"
          >
            <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
              <circle cx="11" cy="11" r="7" />
              <path d="m21 21-4.3-4.3" />
            </svg>
          </button>
          <button
            onClick={toggleDirection}
            className="hidden h-10 w-10 items-center justify-center rounded-xl border border-black/10 bg-steel lg:flex"
            aria-label="تغییر جهت RTL/LTR"
          >
            ⇄
          </button>
          <button
            onClick={toggleTheme}
            className="flex h-10 w-10 items-center justify-center rounded-xl border border-black/10 bg-steel"
            aria-label="تغییر حالت روشن/تیره"
          >
            ☀
          </button>
          <Link
            href="/login"
            className="hidden rounded-btn border border-black/10 bg-steel px-[18px] py-[11px] text-sm font-semibold lg:flex"
          >
            ورود
          </Link>
          <Link
            href="/rfq"
            className="rounded-btn bg-blue px-[18px] py-[11px] text-sm font-semibold text-white transition-colors duration-btn hover:bg-navy"
          >
            درخواست استعلام
          </Link>
          <button
            className="flex h-10 w-10 items-center justify-center rounded-xl border border-black/10 bg-steel lg:hidden"
            onClick={() => setDrawerOpen(true)}
            aria-label="باز کردن منو"
          >
            ☰
          </button>
        </div>
      </div>

      {/* mobile drawer — same NAV_LINKS data source as desktop nav */}
      {drawerOpen && (
        <div className="fixed inset-0 z-[60] lg:hidden">
          <div
            className="absolute inset-0 bg-navy/50"
            onClick={() => setDrawerOpen(false)}
          />
          <div className="absolute inset-y-0 end-0 w-[86%] max-w-[340px] bg-white p-6 dark:bg-navy">
            <button
              className="mb-5 block text-sm font-semibold"
              onClick={() => setDrawerOpen(false)}
            >
              ✕ بستن
            </button>
            {NAV_LINKS.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                onClick={() => setDrawerOpen(false)}
                className="block border-b border-black/5 py-3.5 text-[16px] font-semibold"
              >
                {link.label}
              </Link>
            ))}
          </div>
        </div>
      )}
      {searchOpen && <SmartSearch onClose={() => setSearchOpen(false)} />}
    </header>
  );
}
