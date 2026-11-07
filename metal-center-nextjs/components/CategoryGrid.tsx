"use client";

import Link from "next/link";
import type { CSSProperties } from "react";
import { Box } from "lucide-react";
import { useCategories, type CatNode } from "@/lib/useCategories";

// عکس‌های پیش‌فرض (بدون پس‌زمینه) برای دسته‌هایی که عکس دلخواه ندارند
const DEFAULT_IMAGE_SLUGS = ["rebar", "beam", "sheet", "profile", "channel"];

function imageOf(c: CatNode) {
  if (c.image) return c.image;
  return DEFAULT_IMAGE_SLUGS.includes(c.slug) ? `/products/${c.slug}.png` : "";
}

// صفحه‌ی اصلی: فقط دسته‌هایی که در پنل «نمایش در صفحه‌ی اصلی» خورده‌اند
// صفحه‌ی محصولات: همه‌ی دسته‌های اصلی به‌صورت دسترسی سریع، با زیرمجموعه‌هایشان
export default function CategoryGrid({ variant }: { variant: "home" | "products" }) {
  const { nodes } = useCategories();

  if (variant === "products") {
    return (
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-5">
        {nodes.map((c) => (
          <div
            key={c.slug}
            className="group relative flex flex-col overflow-hidden rounded-card p-7 text-center text-white shadow-lifted transition duration-300 hover:-translate-y-1.5 hover:shadow-glow"
            style={{ background: `linear-gradient(135deg, ${c.color}, ${c.color}cc)` }}
          >
            <Link href={`/category/${c.slug}`} className="flex flex-col items-center">
              <CardImage node={c} tone="light" />
              <div className="text-lg font-extrabold">{c.name}</div>
              {c.count && <div className="mt-1 text-xs opacity-80">{c.count}</div>}
              <div className="mt-6 inline-block rounded-pill bg-white/20 px-4 py-1.5 text-xs font-bold backdrop-blur transition group-hover:bg-white/30">
                مشاهده انواع ←
              </div>
            </Link>
            <SubLinks node={c} tone="light" />
          </div>
        ))}
      </div>
    );
  }

  const home = nodes.filter((n) => n.showOnHome);

  return (
    <div className="grid grid-cols-2 gap-3.5 sm:grid-cols-3 lg:grid-cols-5">
      {home.map((c) => (
        <div
          key={c.slug}
          className="group flex flex-col rounded-card border-2 bg-white p-5 text-center shadow-soft transition-all hover:-translate-y-1 hover:shadow-lifted dark:bg-surface-dark"
          style={{ borderColor: `${c.color}55` }}
        >
          <Link href={`/category/${c.slug}`} className="flex flex-col items-center">
            <CardImage node={c} tone="dark" />
            <div className="text-[14px] font-bold">{c.name}</div>
            {c.count && <div className="mt-1 text-xs text-ink/50 dark:text-white/40">{c.count}</div>}
          </Link>
          <SubLinks node={c} tone="dark" />
        </div>
      ))}
    </div>
  );
}

// عکس دسته؛ اگر عکس نبود، آیکون سه‌بعدی با رنگ دسته
function CardImage({ node, tone }: { node: CatNode; tone: "light" | "dark" }) {
  const src = imageOf(node);
  if (src) {
    return (
      <div className="relative mx-auto mb-3 flex h-24 items-end justify-center">
        {tone === "dark" && <div className="absolute inset-x-6 bottom-0 h-3 rounded-full bg-black/15 blur-md" />}
        <img
          src={src}
          alt={node.name}
          loading="lazy"
          className="relative h-full w-auto object-contain drop-shadow-[0_10px_12px_rgba(0,0,0,0.28)] transition duration-300 group-hover:scale-110"
        />
      </div>
    );
  }
  return (
    <div
      className="icon-3d mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-2xl transition-transform duration-300 group-hover:scale-110"
      style={{ "--tile": node.color } as CSSProperties}
    >
      <Box size={22} />
    </div>
  );
}

// دسته‌بندی‌های هر دسته به‌صورت چیپ؛ جدا از لینک اصلی تا لینک داخل لینک نشود
function SubLinks({ node, tone }: { node: CatNode; tone: "light" | "dark" }) {
  if (node.children.length === 0) return null;
  const cls =
    tone === "light"
      ? "rounded-pill bg-white/20 px-2.5 py-1 text-[11px] font-bold text-white hover:bg-white/30"
      : "rounded-pill bg-steel px-2.5 py-1 text-[11px] font-bold text-ink/70 hover:text-blue dark:bg-white/5 dark:text-white/70";
  return (
    <div className="mt-4 flex flex-wrap justify-center gap-1.5">
      {node.children.map((k) => (
        <Link key={k.slug} href={`/prices?cat=${k.slug}`} className={cls}>
          {/* نام کامل: «میلگرد آجدار»، مگر اینکه نام دسته‌بندی خودش شامل نام والد باشد */}
          {k.name.includes(node.name) ? k.name : `${node.name} ${k.name}`}
        </Link>
      ))}
    </div>
  );
}
