"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { Home, Package, TrendingUp, User, Plus, X } from "lucide-react";
import { useState } from "react";
import { useScrollDirection } from "@/hooks/useScrollDirection";
import Drawer from "@/components/ui/Drawer";
import { categories } from "@/lib/data";

const CENTER_ITEM = { href: "/rfq", label: "استعلام سریع" };

export default function BottomNav() {
  const pathname = usePathname();
  const direction = useScrollDirection();
  const [productsOpen, setProductsOpen] = useState(false);

  if (pathname?.startsWith("/panel") || pathname?.startsWith("/admin")) return null;

  const isProducts = pathname === "/products" || pathname?.startsWith("/products/");

  return (
    <>
      <AnimatePresence>
        <motion.nav
          role="navigation"
          aria-label="ناوبری اصلی"
          initial={{ y: 0 }}
          animate={{ y: direction === "down" ? 110 : 0 }}
          transition={{ type: "spring", stiffness: 320, damping: 32 }}
          className="fixed inset-x-3 bottom-3 z-[70] lg:hidden"
        >
          <div
            className="relative flex h-[72px] items-center justify-around rounded-[28px] border border-white/40 bg-white/70 px-3 shadow-[0_8px_32px_rgba(7,27,52,0.18)] backdrop-blur-xl dark:border-white/10 dark:bg-navy/70"
            style={{ paddingBottom: "env(safe-area-inset-bottom)" }}
          >
            <NavLink href="/" label="خانه" icon={Home} active={pathname === "/"} />
            <button
              onClick={() => setProductsOpen(true)}
              aria-label="محصولات"
              className="relative flex flex-1 flex-col items-center gap-1 py-2"
            >
              <Package size={21} strokeWidth={isProducts ? 2.4 : 1.8} className={isProducts ? "text-blue" : "text-ink/45 dark:text-white/50"} />
              <span className={`text-[10px] font-semibold ${isProducts ? "text-blue" : "text-ink/45 dark:text-white/50"}`}>محصولات</span>
            </button>

            <Link href={CENTER_ITEM.href} aria-label={CENTER_ITEM.label} className="relative -mt-9">
              <motion.div
                whileTap={{ scale: 0.9 }}
                className="flex h-[58px] w-[58px] items-center justify-center rounded-full bg-blue text-white shadow-[0_6px_20px_rgba(10,61,145,0.5)]"
              >
                <motion.span
                  animate={{ scale: [1, 1.15, 1], opacity: [0.5, 0, 0.5] }}
                  transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
                  className="absolute inset-0 rounded-full bg-blue"
                />
                <Plus size={26} strokeWidth={2.4} className="relative z-10" />
              </motion.div>
            </Link>

            <NavLink href="/prices" label="قیمت‌ها" icon={TrendingUp} active={pathname === "/prices"} />
            <NavLink href="/panel" label="حساب" icon={User} active={pathname === "/panel"} badge={2} />
          </div>
        </motion.nav>
      </AnimatePresence>

      {/* کشوی محصولات — همه‌ی دسته‌بندی‌ها، بدون رفتن به صفحه‌ی جدا */}
      <Drawer open={productsOpen} onClose={() => setProductsOpen(false)} side="end">
        <div className="mb-5 flex items-center justify-between">
          <span className="text-lg font-extrabold">همه محصولات</span>
          <button
            onClick={() => setProductsOpen(false)}
            className="flex h-9 w-9 items-center justify-center rounded-xl border border-border-light dark:border-border-dark"
            aria-label="بستن"
          >
            <X size={17} />
          </button>
        </div>
        <div className="space-y-2.5">
          {categories.map((c) => (
            <Link
              key={c.name}
              href="/products"
              onClick={() => setProductsOpen(false)}
              className="flex items-center justify-between rounded-2xl border border-border-light p-4 transition-colors hover:border-blue hover:bg-blue/5 dark:border-border-dark"
            >
              <div>
                <div className="font-bold">{c.name}</div>
                <div className="text-[11px] text-ink/50 dark:text-white/40">{c.count}</div>
              </div>
              <div className="flex flex-wrap justify-end gap-1 max-w-[140px]">
                {c.sizes.slice(0, 4).map((s) => (
                  <span key={s} className="rounded-md bg-steel px-1.5 py-0.5 text-[10px] font-semibold text-ink/50 dark:bg-white/5 dark:text-white/40">
                    {s}
                  </span>
                ))}
              </div>
            </Link>
          ))}
        </div>
        <Link
          href="/prices"
          onClick={() => setProductsOpen(false)}
          className="mt-5 block rounded-btn bg-blue py-3.5 text-center text-sm font-bold text-white"
        >
          مشاهده جدول کامل قیمت‌ها
        </Link>
      </Drawer>
    </>
  );
}

function NavLink({
  href,
  label,
  icon: Icon,
  active,
  badge,
}: {
  href: string;
  label: string;
  icon: any;
  active: boolean;
  badge?: number;
}) {
  return (
    <Link href={href} aria-label={label} aria-current={active ? "page" : undefined} className="relative flex flex-1 flex-col items-center gap-1 py-2">
      <motion.div animate={{ scale: active ? 1.12 : 1 }} transition={{ type: "spring", stiffness: 400, damping: 20 }} className="relative">
        <Icon size={21} strokeWidth={active ? 2.4 : 1.8} className={active ? "text-blue" : "text-ink/45 dark:text-white/50"} />
        {badge ? (
          <span className="absolute -end-1.5 -top-1.5 flex h-4 w-4 items-center justify-center rounded-full bg-danger text-[9px] font-bold text-white">
            {badge}
          </span>
        ) : null}
      </motion.div>
      <span className={`text-[10px] font-semibold ${active ? "text-blue" : "text-ink/45 dark:text-white/50"}`}>{label}</span>
    </Link>
  );
}
