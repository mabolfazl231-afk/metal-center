"use client";

import Link from "next/link";
import Image from "next/image";
import { useState, useEffect } from "react";
import { Search, Bell, Sun, Languages, User, Menu } from "lucide-react";
import SmartSearch from "./SmartSearch";
import MegaMenu from "./MegaMenu";
import Drawer from "./ui/Drawer";
import Accordion from "./ui/Accordion";
import { categories } from "@/lib/data";

const NAV_LINKS = [
  { href: "/products", label: "محصولات", mega: "products" as const },
  { href: "/prices", label: "قیمت روز" },
  { href: "/rfq", label: "استعلام قیمت" },
  { href: "/factories", label: "کارخانه‌ها", mega: "factories" as const },
  { href: "/services", label: "خدمات", mega: "services" as const },
  { href: "/knowledge", label: "مرکز دانش" },
  { href: "/assistant", label: "✦ دستیار هوشمند" },
];

export default function Header() {
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [openMega, setOpenMega] = useState<string | null>(null);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    function onScroll() {
      setScrolled(window.scrollY > 24);
    }
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  function toggleTheme() {
    const html = document.documentElement;
    html.classList.toggle("dark", !html.classList.contains("dark"));
  }

  function toggleDirection() {
    const html = document.documentElement;
    html.dir = html.dir === "rtl" ? "ltr" : "rtl";
  }

  return (
    <header
      onMouseLeave={() => setOpenMega(null)}
      className={`sticky top-0 z-50 border-b border-border-light/70 bg-white/80 backdrop-blur-xl transition-all duration-300 dark:border-border-dark/70 dark:bg-navy/80 ${
        scrolled ? "shadow-glass" : ""
      }`}
    >
      {/* ===== Desktop header ===== */}
      <div
        className={`mx-auto hidden max-w-[1240px] items-center justify-between gap-5 px-6 transition-all duration-300 lg:flex ${
          scrolled ? "h-[62px]" : "h-[84px]"
        }`}
      >
        <Link href="/" className="flex items-center gap-2.5">
          <Image
            src="/logo.png"
            alt="متال سنتر"
            width={scrolled ? 32 : 40}
            height={scrolled ? 32 : 40}
            className="rounded-[10px] transition-all duration-300"
            priority
          />
          <div className="leading-tight">
            <div className="text-[19px] font-extrabold">متال سنتر</div>
            {!scrolled && <div className="text-[10.5px] font-medium text-ink/40 dark:text-white/40">Smart Steel Platform</div>}
          </div>
        </Link>

        <nav className="flex items-center gap-1">
          {NAV_LINKS.map((link) => (
            <div
              key={link.href}
              onMouseEnter={() => setOpenMega(link.mega ?? null)}
              className="relative"
            >
              <Link
                href={link.href}
                className="rounded-[10px] px-3 py-2.5 text-[14px] font-medium text-ink/65 transition-colors duration-hover hover:bg-steel hover:text-ink dark:text-white/65 dark:hover:bg-white/5 dark:hover:text-white"
              >
                {link.label}
              </Link>
            </div>
          ))}
        </nav>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setSearchOpen(true)}
            className="flex h-10 w-10 items-center justify-center rounded-xl border border-border-light bg-steel dark:border-border-dark dark:bg-white/5"
            aria-label="جستجوی هوشمند"
          >
            <Search size={17} />
          </button>
          <button className="relative flex h-10 w-10 items-center justify-center rounded-xl border border-border-light bg-steel dark:border-border-dark dark:bg-white/5" aria-label="اعلان‌ها">
            <Bell size={17} />
            <span className="absolute end-2 top-2 h-1.5 w-1.5 rounded-full bg-danger" />
          </button>
          <button onClick={toggleDirection} className="flex h-10 w-10 items-center justify-center rounded-xl border border-border-light bg-steel dark:border-border-dark dark:bg-white/5" aria-label="تغییر زبان">
            <Languages size={17} />
          </button>
          <button onClick={toggleTheme} className="flex h-10 w-10 items-center justify-center rounded-xl border border-border-light bg-steel dark:border-border-dark dark:bg-white/5" aria-label="حالت روشن/تیره">
            <Sun size={17} />
          </button>
          <Link href="/login" className="rounded-btn border border-border-light bg-steel px-[18px] py-[11px] text-sm font-semibold dark:border-border-dark dark:bg-white/5">
            ورود
          </Link>
          <Link href="/rfq" className="rounded-btn bg-blue px-[18px] py-[11px] text-sm font-semibold text-white transition-colors duration-btn hover:bg-navy">
            درخواست استعلام
          </Link>
        </div>
      </div>

      {openMega && (
        <div onMouseEnter={() => setOpenMega(openMega)}>
          <MegaMenu menuKey={openMega as any} />
        </div>
      )}

      {/* ===== Mobile header ===== */}
      <div className="flex h-[64px] items-center justify-between px-4 lg:hidden">
        <button
          onClick={() => setDrawerOpen(true)}
          className="flex h-10 w-10 items-center justify-center rounded-xl border border-border-light bg-steel dark:border-border-dark dark:bg-white/5"
          aria-label="باز کردن منو"
        >
          <Menu size={19} />
        </button>
        <Link href="/" className="flex items-center gap-2">
          <Image src="/logo.png" alt="متال سنتر" width={30} height={30} className="rounded-lg" priority />
          <span className="text-[15px] font-extrabold">متال سنتر</span>
        </Link>
        <div className="flex items-center gap-1.5">
          <button
            onClick={() => setSearchOpen(true)}
            className="flex h-9 w-9 items-center justify-center rounded-xl border border-border-light bg-steel dark:border-border-dark dark:bg-white/5"
            aria-label="جستجو"
          >
            <Search size={16} />
          </button>
          <Link
            href="/panel"
            className="flex h-9 w-9 items-center justify-center rounded-xl border border-border-light bg-steel dark:border-border-dark dark:bg-white/5"
            aria-label="حساب کاربری"
          >
            <User size={16} />
          </Link>
        </div>
      </div>

      {/* ===== Mobile drawer ===== */}
      <Drawer open={drawerOpen} onClose={() => setDrawerOpen(false)} title="متال سنتر">
        <div className="mb-4 flex items-center gap-3 rounded-2xl bg-steel p-3 dark:bg-white/5">
          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-blue text-sm font-bold text-white">
            م
          </div>
          <div>
            <div className="text-sm font-bold">پروفایل من</div>
            <Link href="/login" className="text-xs font-semibold text-blue">ورود / ثبت‌نام</Link>
          </div>
        </div>

        <Accordion
          items={[
            {
              title: "محصولات",
              content: (
                <ul className="space-y-2">
                  {categories.map((c) => (
                    <li key={c.name}>
                      <Link href="/products" onClick={() => setDrawerOpen(false)} className="text-sm text-ink/70 dark:text-white/70">
                        {c.name} <span className="text-ink/30">· {c.count}</span>
                      </Link>
                    </li>
                  ))}
                </ul>
              ),
            },
          ]}
        />

        <div className="mt-2 space-y-0.5">
          {[
            { href: "/prices", label: "قیمت روز" },
            { href: "/factories", label: "کارخانه‌ها" },
            { href: "/services", label: "خدمات" },
            { href: "/assistant", label: "✦ Metal AI" },
            { href: "/knowledge", label: "مقالات" },
            { href: "/contact", label: "تماس" },
          ].map((l) => (
            <Link
              key={l.href}
              href={l.href}
              onClick={() => setDrawerOpen(false)}
              className="block rounded-xl px-2 py-3 text-sm font-semibold hover:bg-steel dark:hover:bg-white/5"
            >
              {l.label}
            </Link>
          ))}
        </div>

        <div className="mt-4 flex gap-2 border-t border-border-light pt-4 dark:border-border-dark">
          <button onClick={toggleTheme} className="flex flex-1 items-center justify-center gap-2 rounded-xl border border-border-light py-2.5 text-xs font-semibold dark:border-border-dark">
            <Sun size={14} /> حالت تیره
          </button>
          <button onClick={toggleDirection} className="flex flex-1 items-center justify-center gap-2 rounded-xl border border-border-light py-2.5 text-xs font-semibold dark:border-border-dark">
            <Languages size={14} /> EN / فا
          </button>
        </div>

        <Link
          href="/rfq"
          onClick={() => setDrawerOpen(false)}
          className="mt-4 block rounded-btn bg-blue py-3 text-center text-sm font-bold text-white"
        >
          + استعلام هوشمند
        </Link>
      </Drawer>

      {searchOpen && <SmartSearch onClose={() => setSearchOpen(false)} />}
    </header>
  );
}
