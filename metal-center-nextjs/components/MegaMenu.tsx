"use client";

import { useState } from "react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { factories } from "@/lib/data";
import { useCategories, useFactoriesByCategory } from "@/lib/useCategories";

const SIMPLE_CONTENT: Record<string, { columns: { title: string; links: { label: string; href: string }[] }[]; banner: string }> = {
  factories: {
    columns: [
      { title: "استان‌ها", links: [
        { label: "اصفهان", href: "/factories" },
        { label: "خوزستان", href: "/factories" },
        { label: "آذربایجان شرقی", href: "/factories" },
      ]},
      { title: "معتبرترین‌ها", links: factories.slice(0, 3).map((f) => ({ label: f.name, href: "/factories" })) },
      { title: "دسترسی سریع", links: [
        { label: "همه کارخانه‌های تأییدشده", href: "/factories" },
        { label: "ثبت درخواست همکاری", href: "/contact" },
      ]},
    ],
    banner: "۲۴۰+ کارخانه‌ی تأییدشده در شبکه‌ی متال سنتر",
  },
  services: {
    columns: [
      { title: "خدمات صنعتی", links: [
        { label: "برش ورق و مقاطع", href: "/services" },
        { label: "خم‌کاری", href: "/services" },
        { label: "گالوانیزه", href: "/services" },
      ]},
      { title: "لجستیک", links: [
        { label: "حمل سراسری", href: "/services" },
        { label: "صادرات", href: "/export" },
      ]},
      { title: "دسترسی سریع", links: [
        { label: "مشاوره رایگان", href: "/rfq" },
        { label: "تماس با تیم فنی", href: "/contact" },
      ]},
    ],
    banner: "مدیریت کامل پروژه از تأمین تا تحویل درب کارگاه",
  },
};

// تصویر بدون پس‌زمینه‌ی هر دسته (در public/products). اگر نبود، کاشی سه‌بعدی با آیکون نمایش داده می‌شود.
const IMAGE_SLUGS = ["rebar", "beam", "sheet", "profile", "channel"];

function CategoryThumb({ slug, color, size, image }: { slug: string; color: string; size: "sm" | "lg"; image?: string }) {
  // عکس آپلودشده از پنل اولویت دارد
  if (image) {
    return (
      <img
        src={image}
        alt=""
        aria-hidden
        loading="lazy"
        className={`${size === "sm" ? "h-9 w-10" : "h-full w-auto"} flex-shrink-0 object-contain drop-shadow-[0_8px_8px_rgba(0,0,0,0.3)]`}
      />
    );
  }
  if (IMAGE_SLUGS.includes(slug)) {
    return (
      <img
        src={`/products/${slug}.png`}
        alt=""
        aria-hidden
        loading="lazy"
        className={`${size === "sm" ? "h-9 w-10" : "h-full w-auto"} flex-shrink-0 object-contain drop-shadow-[0_8px_8px_rgba(0,0,0,0.3)]`}
      />
    );
  }
  return (
    <span
      className={`icon-3d flex flex-shrink-0 items-center justify-center rounded-xl ${size === "sm" ? "h-9 w-9" : "h-16 w-16"}`}
      style={{ "--tile": color } as React.CSSProperties}
    >
      <span className="h-3 w-3 rounded-full bg-white/80" />
    </span>
  );
}

// Mega Menu محصولات: ستون دسته‌های اصلی ← با هاور، زیرمجموعه‌ها و کارخانه‌های همان زیرمجموعه (یا دسته) و تصویر آن.
// هیچ سایز یا تعدادی نشان داده نمی‌شود. همه‌ی لینک‌ها به صفحه‌ی محصول می‌روند.
function ProductsMegaMenu() {
  const { nodes } = useCategories();
  const factoriesMap = useFactoriesByCategory();
  const [activeName, setActiveName] = useState<string | null>(null);
  const [childName, setChildName] = useState<string | null>(null);

  const active = nodes.find((n) => n.name === activeName) ?? nodes[0];
  if (!active) return null;

  const child = childName ? active.children.find((k) => k.name === childName) ?? null : null;
  const focusName = child ? child.name : active.name;
  const linkedFactories = factoriesMap[focusName] ?? [];
  const targetSlug = child ? child.slug : active.slug;
  const pickImage =
    (child?.image || active.image) ||
    (IMAGE_SLUGS.includes(targetSlug) ? `/products/${targetSlug}.png` : "");

  return (
    <div className="mx-auto grid max-w-[1240px] grid-cols-[250px_1fr] px-6 py-2">
      <div className="border-e border-border-light py-4 pe-4 dark:border-border-dark">
        {nodes.map((c) => (
          <Link
            key={c.name}
            href={`/products/${c.slug}`}
            onMouseEnter={() => {
              setActiveName(c.name);
              setChildName(null);
            }}
            onFocus={() => {
              setActiveName(c.name);
              setChildName(null);
            }}
            className={`flex w-full items-center gap-3 rounded-xl px-2.5 py-2 text-start text-sm font-semibold transition-colors ${
              active.name === c.name ? "bg-blue/10 text-blue" : "text-ink/70 hover:bg-steel dark:text-white/70 dark:hover:bg-white/5"
            }`}
          >
            <CategoryThumb slug={c.slug} color={c.color} size="sm" image={c.image || undefined} />
            <span className="flex-1">{c.name}</span>
          </Link>
        ))}
      </div>

      <AnimatePresence mode="wait">
        <motion.div
          key={active.name + (child?.name ?? "")}
          initial={{ opacity: 0, x: -8 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.15 }}
          className="grid grid-cols-[1fr_1fr_1.2fr] gap-8 py-5 ps-6"
        >
          <div>
            <div className="mb-3 text-[11px] font-bold uppercase tracking-wide text-ink/40 dark:text-white/40">زیرمجموعه‌ها</div>
            {active.children.length === 0 ? (
              <p className="text-xs text-ink/40">این دسته زیرمجموعه ندارد.</p>
            ) : (
              <div className="flex flex-wrap gap-1.5">
                {active.children.map((k) => (
                  <Link
                    key={k.slug}
                    href={`/products/${k.slug}`}
                    onMouseEnter={() => setChildName(k.name)}
                    onFocus={() => setChildName(k.name)}
                    className={`rounded-lg border px-2.5 py-1.5 text-xs font-semibold hover:border-blue hover:text-blue dark:border-border-dark dark:text-white/70 ${
                      childName === k.name ? "border-blue text-blue" : "border-border-light text-ink/70"
                    }`}
                  >
                    {k.name}
                  </Link>
                ))}
              </div>
            )}
          </div>

          <div>
            <div className="mb-3 text-[11px] font-bold uppercase tracking-wide text-ink/40 dark:text-white/40">
              کارخانه‌های تأمین‌کننده{child ? ` ${child.name}` : ""}
            </div>
            {linkedFactories.length === 0 ? (
              <p className="text-xs text-ink/40">هنوز کارخانه‌ای برای {focusName} ثبت نشده است.</p>
            ) : (
              <ul className="space-y-2">
                {linkedFactories.slice(0, 6).map((f) => (
                  <li key={f.name}>
                    <Link
                      href={`/prices?cat=${targetSlug}&factory=${encodeURIComponent(f.name)}`}
                      className="flex items-center gap-2.5 text-sm font-medium text-ink/75 hover:text-blue dark:text-white/75"
                    >
                      {f.logoUrl ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img src={f.logoUrl} alt="" loading="lazy" className="h-7 w-9 flex-shrink-0 rounded-md border border-border-light bg-logo-white object-contain p-0.5" />
                      ) : (
                        <span className="flex h-7 w-9 flex-shrink-0 items-center justify-center rounded-md bg-steel text-[10px] font-bold text-blue">{f.name.slice(0, 2)}</span>
                      )}
                      {f.name}
                    </Link>
                  </li>
                ))}
              </ul>
            )}
          </div>

          <Link
            href={`/products/${targetSlug}`}
            className="group relative flex flex-col overflow-hidden rounded-2xl bg-gradient-to-br from-blue to-navy p-5 text-white"
          >
            <div className="pointer-events-none absolute -end-8 -top-8 h-32 w-32 rounded-full bg-white/10 blur-2xl" />
            <div className="relative flex h-28 items-end justify-center">
              {pickImage ? (
                <img
                  src={pickImage}
                  alt={focusName}
                  className="h-full w-auto object-contain drop-shadow-[0_14px_14px_rgba(0,0,0,0.45)] transition duration-300 group-hover:scale-105"
                />
              ) : (
                <CategoryThumb slug={active.slug} color={active.color} size="lg" />
              )}
            </div>
            <p className="relative mt-4 text-sm font-bold leading-6">{focusName} — قیمت لحظه‌ای و استعلام آنی</p>
            <span className="relative mt-3 text-xs font-bold text-[#7FB2FF]">مشاهده {focusName} ←</span>
          </Link>
        </motion.div>
      </AnimatePresence>
    </div>
  );
}

export default function MegaMenu({ menuKey }: { menuKey: "products" | "factories" | "services" }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: 8 }}
      transition={{ duration: 0.18 }}
      className="absolute inset-x-0 top-full border-t border-border-light bg-white shadow-glass dark:border-border-dark dark:bg-navy"
    >
      {menuKey === "products" ? (
        <ProductsMegaMenu />
      ) : (
        <div className="mx-auto grid max-w-[1240px] grid-cols-4 gap-8 px-6 py-8">
          {SIMPLE_CONTENT[menuKey].columns.map((col) => (
            <div key={col.title}>
              <div className="mb-3 text-[11px] font-bold uppercase tracking-wide text-ink/40 dark:text-white/40">
                {col.title}
              </div>
              <ul className="space-y-2">
                {col.links.map((l) => (
                  <li key={l.label}>
                    <Link href={l.href} className="text-sm font-medium text-ink/75 hover:text-blue dark:text-white/75">
                      {l.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
          <div className="flex flex-col justify-between rounded-2xl bg-gradient-to-br from-blue to-navy p-5 text-white">
            <div className="icon-3d mb-3 h-9 w-9 rounded-lg" style={{ "--tile": "#1E5BC6" } as React.CSSProperties} />
            <p className="text-sm font-bold leading-6">{SIMPLE_CONTENT[menuKey].banner}</p>
            <Link href="/rfq" className="mt-4 text-xs font-bold text-[#7FB2FF]">
              ثبت استعلام سریع ←
            </Link>
          </div>
        </div>
      )}
    </motion.div>
  );
}
