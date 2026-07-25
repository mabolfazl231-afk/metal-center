"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { Home, Package, TrendingUp, User, Plus } from "lucide-react";
import { useScrollDirection } from "@/hooks/useScrollDirection";

const SIDE_ITEMS = [
  { href: "/", label: "خانه", icon: Home },
  { href: "/products", label: "محصولات", icon: Package },
  { href: "/prices", label: "قیمت‌ها", icon: TrendingUp },
  { href: "/panel", label: "حساب", icon: User, badge: 2 },
];

// دکمه‌ی مرکزی شناور، جدا از آیتم‌های کناری، برای دسترسی سریع به RFQ
const CENTER_ITEM = { href: "/rfq", label: "استعلام سریع" };

export default function BottomNav() {
  const pathname = usePathname();
  const direction = useScrollDirection();

  // پنل‌های مدیریتی نوار پایین جداگانه‌ی خودشان را دارند، این‌جا نمایش نده
  if (pathname?.startsWith("/panel") || pathname?.startsWith("/admin")) return null;

  return (
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
          {SIDE_ITEMS.slice(0, 2).map((item) => (
            <NavItem key={item.href} item={item} active={pathname === item.href} />
          ))}

          {/* Floating center RFQ button */}
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

          {SIDE_ITEMS.slice(2).map((item) => (
            <NavItem key={item.href} item={item} active={pathname === item.href} />
          ))}
        </div>
      </motion.nav>
    </AnimatePresence>
  );
}

function NavItem({
  item,
  active,
}: {
  item: { href: string; label: string; icon: any; badge?: number };
  active: boolean;
}) {
  const Icon = item.icon;
  return (
    <Link
      href={item.href}
      aria-label={item.label}
      aria-current={active ? "page" : undefined}
      className="relative flex flex-1 flex-col items-center gap-1 py-2 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue"
    >
      <motion.div
        animate={{ scale: active ? 1.12 : 1 }}
        transition={{ type: "spring", stiffness: 400, damping: 20 }}
        className="relative"
      >
        <Icon
          size={21}
          strokeWidth={active ? 2.4 : 1.8}
          className={active ? "text-blue drop-shadow-[0_0_6px_rgba(10,61,145,0.5)]" : "text-ink/45 dark:text-white/50"}
        />
        {item.badge ? (
          <span className="absolute -end-1.5 -top-1.5 flex h-4 w-4 items-center justify-center rounded-full bg-danger text-[9px] font-bold text-white">
            {item.badge}
          </span>
        ) : null}
      </motion.div>
      <span className={`text-[10px] font-semibold ${active ? "text-blue" : "text-ink/45 dark:text-white/50"}`}>
        {item.label}
      </span>
      {active && (
        <motion.span
          layoutId="bottomnav-indicator"
          className="absolute -bottom-0.5 h-1 w-1 rounded-full bg-blue"
        />
      )}
    </Link>
  );
}
