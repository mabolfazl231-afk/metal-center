"use client";

import Link from "next/link";
import Image from "next/image";
import { useState, useEffect } from "react";
import { Search, Bell, Languages, Menu, X, LogIn, Sparkles } from "lucide-react";
import SmartSearch from "./SmartSearch";
import MegaMenu from "./MegaMenu";
import Drawer from "./ui/Drawer";
import Accordion from "./ui/Accordion";
import ThemeToggle from "./ThemeToggle";
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

// دکمه‌های آیکونی مشترک بین دسکتاپ و موبایل — یک استایل شیشه‌ای واحد،
// با حلقه‌ی آبی و حالت انتخاب‌شده هنگام هاور/فوکوس روی هر دو پلتفرم.
function IconBtn({
  onClick,
  href,
  label,
  children,
  badge,
}: {
  onClick?: () => void;
  href?: string;
  label: string;
  children: React.ReactNode;
  badge?: boolean;
}) {
  const cls =
    "relative flex h-10 w-10 items-center justify-center rounded-xl border border-border-light bg-white/70 backdrop-blur transition-all duration-hover hover:border-blue hover:bg-blue hover:text-white hover:shadow-glow active:scale-95 dark:border-border-dark dark:bg-white/5 dark:hover:bg-blue";
  const content = (
    <>
      {children}
      {badge && <span className="absolute end-1.5 top-1.5 h-2 w-2 rounded-full bg-danger ring-2 ring-white dark:ring-navy" />}
    </>
  );
  if (href) {
    return (
      <Link href={href} aria-label={label} className={cls}>
        {content}
      </Link>
    );
  }
  return (
    <button onClick={onClick} aria-label={label} className={cls}>
      {content}
    </button>
  );
}

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
          scrolled ? "h-[68px]" : "h-[92px]"
        }`}
      >
        <Link href="/" className="flex items-center">
          <Image
            src="/logo.png"
            alt="متال سنتر"
            width={scrolled ? 130 : 170}
            height={scrolled ? 46 : 60}
            className="h-auto w-auto object-contain transition-all duration-300"
            style={{ maxHeight: scrolled ? 46 : 60 }}
            priority
          />
        </Link>

        <nav className="flex items-center gap-1">
          {NAV_LINKS.map((link) => (
            <div key={link.href} onMouseEnter={() => setOpenMega(link.mega ?? null)} className="relative">
              <Link
                href={link.href}
                className="rounded-[10px] px-3 py-2.5 text-[14px] font-medium text-ink/65 transition-all duration-hover hover:bg-blue/10 hover:text-blue dark:text-white/65 dark:hover:bg-blue/20 dark:hover:text-white"
              >
                {link.label}
              </Link>
            </div>
          ))}
        </nav>

        <div className="flex items-center gap-2">
          <IconBtn onClick={() => setSearchOpen(true)} label="جستجوی هوشمند">
            <Search size={17} />
          </IconBtn>
          <IconBtn href="/panel" label="اعلان‌ها" badge>
            <Bell size={17} />
          </IconBtn>
          <IconBtn onClick={toggleDirection} label="تغییر زبان">
            <Languages size={17} />
          </IconBtn>
          <ThemeToggle />
          <Link
            href="/login"
            className="rounded-btn border border-border-light bg-white/70 px-[18px] py-[11px] text-sm font-semibold backdrop-blur transition-all hover:border-blue hover:text-blue dark:border-border-dark dark:bg-white/5"
          >
            ورود
          </Link>
          <Link
            href="/rfq"
            className="rounded-btn bg-blue px-[18px] py-[11px] text-sm font-semibold text-white transition-colors duration-btn hover:bg-navy"
          >
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
      <div className="flex h-[60px] items-center justify-between gap-2 px-3 lg:hidden">
        <button
          type="button"
          onClick={() => setDrawerOpen(true)}
          aria-label="باز کردن منو"
          className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-xl border border-border-light bg-white/70 backdrop-blur transition-all active:scale-95 dark:border-border-dark dark:bg-white/5"
        >
          <Menu size={19} />
        </button>

        <Link href="/" className="flex min-w-0 flex-1 items-center justify-center">
          <Image
            src="/logo.png"
            alt="متال سنتر"
            width={150}
            height={52}
            className="h-11 w-auto object-contain"
            priority
          />
        </Link>

        <div className="flex flex-shrink-0 items-center gap-1.5">
          <IconBtn onClick={() => setSearchOpen(true)} label="جستجو">
            <Search size={16} />
          </IconBtn>
          <IconBtn href="/panel" label="اعلان‌ها" badge>
            <Bell size={16} />
          </IconBtn>
          <ThemeToggle className="!h-10 !w-10" />
        </div>
      </div>

      {/* ===== Mobile drawer — همه‌ی قابلیت‌های هدر اینجا ===== */}
      <Drawer open={drawerOpen} onClose={() => setDrawerOpen(false)}>
        <div className="mb-5 flex items-center justify-between">
          <Image src="/logo.png" alt="متال سنتر" width={130} height={44} className="h-10 w-auto object-contain" />
          <button
            onClick={() => setDrawerOpen(false)}
            aria-label="بستن"
            className="flex h-9 w-9 items-center justify-center rounded-xl border border-border-light dark:border-border-dark"
          >
            <X size={17} />
          </button>
        </div>

        <Link
          href="/login"
          onClick={() => setDrawerOpen(false)}
          className="mb-4 flex items-center gap-3 rounded-2xl border border-blue/20 bg-blue/5 p-3.5 transition-all hover:border-blue hover:bg-blue/10"
        >
          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-blue text-white">
            <LogIn size={17} />
          </div>
          <div>
            <div className="text-sm font-bold">ورود / ثبت‌نام</div>
            <div className="text-[11px] text-ink/50 dark:text-white/40">برای مدیریت استعلام‌ها و علاقه‌مندی‌ها</div>
          </div>
        </Link>

        {/* جستجو، دارک‌مود و زبان — همه‌جا در دسترس */}
        <div className="mb-4 grid grid-cols-3 gap-2">
          <button
            onClick={() => {
              setDrawerOpen(false);
              setSearchOpen(true);
            }}
            className="flex flex-col items-center gap-1.5 rounded-2xl border border-border-light py-3 text-[11px] font-semibold dark:border-border-dark"
          >
            <Search size={17} /> جستجو
          </button>
          <ThemeToggle className="!h-auto !w-full !flex-col !gap-1.5 !rounded-2xl !border !py-3 !text-[11px] !font-semibold" showLabel />
          <button
            onClick={toggleDirection}
            className="flex flex-col items-center gap-1.5 rounded-2xl border border-border-light py-3 text-[11px] font-semibold dark:border-border-dark"
          >
            <Languages size={17} /> EN / فا
          </button>
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
            { href: "/assistant", label: "دستیار هوشمند Metal AI", icon: true },
            { href: "/knowledge", label: "مرکز دانش" },
            { href: "/about", label: "درباره ما" },
            { href: "/contact", label: "تماس با ما" },
          ].map((l) => (
            <Link
              key={l.href}
              href={l.href}
              onClick={() => setDrawerOpen(false)}
              className="flex items-center gap-2 rounded-xl px-2 py-3 text-sm font-semibold transition-colors hover:bg-blue/10 hover:text-blue dark:hover:bg-blue/20"
            >
              {l.icon && <Sparkles size={15} className="text-blue" />}
              {l.label}
            </Link>
          ))}
        </div>

        <Link
          href="/rfq"
          onClick={() => setDrawerOpen(false)}
          className="mt-4 block rounded-btn bg-blue py-3.5 text-center text-sm font-bold text-white shadow-glow"
        >
          + درخواست استعلام سریع
        </Link>
      </Drawer>

      {searchOpen && <SmartSearch onClose={() => setSearchOpen(false)} />}
    </header>
  );
}
