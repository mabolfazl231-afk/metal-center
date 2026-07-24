"use client";

import Link from "next/link";

const ITEMS = [
  { href: "/", label: "خانه" },
  { href: "/products", label: "محصولات" },
  { href: "/rfq", label: "استعلام" },
  { href: "/prices", label: "قیمت‌ها" },
  { href: "/panel", label: "حساب" },
];

export default function BottomNav() {
  return (
    <nav className="fixed inset-x-0 bottom-0 z-[70] border-t border-black/5 bg-white pb-[env(safe-area-inset-bottom)] lg:hidden">
      <ul className="flex justify-around py-2">
        {ITEMS.map((item) => (
          <li key={item.href}>
            <Link
              href={item.href}
              className="flex flex-col items-center gap-1 px-2 py-1 text-[10.5px] font-semibold text-ink/60"
            >
              {item.label}
            </Link>
          </li>
        ))}
      </ul>
    </nav>
  );
}
