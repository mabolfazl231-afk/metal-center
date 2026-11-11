"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { ChevronLeft } from "lucide-react";
import { useCategories, type CatChild } from "@/lib/useCategories";
import { fetchPriceGroups } from "@/lib/priceSource";
import { ALL, EMPTY_FILTERS, applyFilters } from "@/lib/priceFilters";
import type { FactoryGroup } from "@/lib/data";
import FactoryPriceGroup from "@/components/price/FactoryPriceGroup";
import FactoryLogo from "@/components/factories/FactoryLogo";

// صفحه‌ی خودکار هر دسته یا زیرمجموعه: عکس، زیرمجموعه‌ها، کارخانه‌ها، و لیست قیمت با نمودار.
// همه چیز از دیتابیس می‌آید؛ با افزودن یک دسته در پنل، این صفحه خودکار ساخته می‌شود.

const DEFAULT_IMAGE_SLUGS = ["rebar", "beam", "sheet", "profile", "channel"];

type Info = {
  name: string;
  slug: string;
  image: string;
  color: string;
  children: CatChild[];
  parentName: string | null;
  parentSlug: string | null;
};

export default function ProductDetailPage({ params }: { params: { slug: string } }) {
  const { nodes, flat, loaded } = useCategories();
  const [groups, setGroups] = useState<FactoryGroup[] | null>(null);
  const [includeVAT, setIncludeVAT] = useState(false);

  useEffect(() => {
    let cancelled = false;
    fetchPriceGroups()
      .then((list) => {
        if (!cancelled) setGroups(list);
      })
      .catch(() => {
        if (!cancelled) setGroups([]);
      });
    return () => {
      cancelled = true;
    };
  }, []);

  // پیدا کردن دسته‌ی فعلی: اصلی یا زیرمجموعه
  const root = nodes.find((n) => n.slug === params.slug);
  const childFlat = flat.find((f) => f.slug === params.slug && f.parentName);
  const parentNode = childFlat ? nodes.find((n) => n.name === childFlat.parentName) : undefined;
  const childNode = parentNode?.children.find((k) => k.slug === params.slug);

  const info: Info | null = root
    ? {
        name: root.name,
        slug: root.slug,
        image: root.image,
        color: root.color,
        children: root.children,
        parentName: null,
        parentSlug: null,
      }
    : childNode && parentNode
      ? {
          name: childNode.name,
          slug: childNode.slug,
          image: childNode.image,
          color: parentNode.color,
          children: [],
          parentName: parentNode.name,
          parentSlug: parentNode.slug,
        }
      : null;

  if (!info) {
    return (
      <div className="mx-auto max-w-[1240px] px-6 py-16 text-center">
        <p className="mb-4 text-sm text-ink/50">{loaded ? "این محصول پیدا نشد." : "در حال بارگذاری..."}</p>
        <Link href="/products" className="text-sm font-bold text-blue">بازگشت به محصولات ←</Link>
      </div>
    );
  }

  const imageSrc = info.image || (DEFAULT_IMAGE_SLUGS.includes(info.slug) ? `/products/${info.slug}.png` : "");
  // ردیف‌های این دسته (خودش و زیرمجموعه‌هایش)
  const filtered = groups ? applyFilters(groups, { ...EMPTY_FILTERS, category: info.name, factory: ALL }) : [];
  const rowCount = filtered.reduce((n, g) => n + g.rows.length, 0);
  // کارخانه‌هایی که همین دسته را دارند؛ هر کدام به لیست قیمت خودش (فیلتر شده) می‌رود
  const factoryNames = filtered.map((g) => ({ name: g.factory, logoUrl: g.logoUrl ?? null }));

  return (
    <div className="mx-auto max-w-[1240px] px-6 py-10">
      {/* مسیر صفحه */}
      <nav className="mb-6 flex flex-wrap items-center gap-1.5 text-xs text-ink/50 dark:text-white/40">
        <Link href="/">خانه</Link>
        <ChevronLeft size={12} />
        <Link href="/products">محصولات</Link>
        {info.parentName && info.parentSlug && (
          <>
            <ChevronLeft size={12} />
            <Link href={`/products/${info.parentSlug}`}>{info.parentName}</Link>
          </>
        )}
        <ChevronLeft size={12} />
        <span className="font-bold text-ink dark:text-white">{info.name}</span>
      </nav>

      {/* سرصفحه: عکس + اطلاعات */}
      <div className="grid grid-cols-1 gap-8 md:grid-cols-[1fr_1.2fr] md:items-center">
        <div
          className="flex h-[260px] items-center justify-center overflow-hidden rounded-card p-6"
          style={{ background: `linear-gradient(135deg, ${info.color}, ${info.color}cc)` }}
        >
          {imageSrc ? (
            <img src={imageSrc} alt={info.name} className="h-full w-auto object-contain drop-shadow-[0_18px_18px_rgba(0,0,0,0.35)]" />
          ) : (
            <span className="icon-3d flex h-20 w-20 items-center justify-center rounded-2xl" style={{ "--tile": info.color } as React.CSSProperties} />
          )}
        </div>

        <div>
          <h1 className="mb-2 text-[26px] font-extrabold leading-tight">{info.name}</h1>
          <p className="mb-5 text-sm text-ink/55 dark:text-white/50">
            {groups === null
              ? "در حال بارگذاری قیمت‌ها..."
              : rowCount > 0
                ? `${rowCount} ردیف قیمت در ${filtered.length} کارخانه`
                : "هنوز قیمتی برای این محصول ثبت نشده است."}
          </p>

          <div className="mb-5 flex flex-wrap items-center gap-2">
            <button
              role="switch"
              aria-checked={includeVAT}
              onClick={() => setIncludeVAT((v) => !v)}
              className="flex items-center gap-2.5 rounded-xl px-1.5 py-1.5 text-xs font-bold"
            >
              <span className={`relative h-6 w-11 flex-shrink-0 rounded-full transition-colors ${includeVAT ? "bg-success" : "bg-ink/20"}`}>
                <span className={`absolute top-0.5 h-5 w-5 rounded-full bg-white shadow transition-all ${includeVAT ? "end-0.5" : "start-0.5"}`} />
              </span>
              با ارزش‌افزوده (+۱۰٪)
            </button>
          </div>

          <div className="flex flex-wrap gap-2.5">
            <Link href={`/prices?cat=${info.slug}`} className="rounded-btn bg-blue px-5 py-3 text-sm font-bold text-white hover:bg-navy">
              لیست کامل قیمت
            </Link>
            <Link href="/rfq" className="rounded-btn border border-blue px-5 py-3 text-sm font-bold text-blue">
              استعلام برای این محصول
            </Link>
          </div>
        </div>
      </div>

      {/* زیرمجموعه‌ها */}
      {info.children.length > 0 && (
        <section className="mt-12">
          <h2 className="mb-4 text-lg font-extrabold">انواع {info.name}</h2>
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
            {info.children.map((k) => (
              <Link
                key={k.slug}
                href={`/products/${k.slug}`}
                className="group flex flex-col items-center rounded-card border border-border-light bg-white p-5 text-center shadow-soft transition hover:-translate-y-1 hover:shadow-lifted dark:border-border-dark dark:bg-surface-dark"
              >
                <div className="mb-3 flex h-20 items-center justify-center">
                  {k.image ? (
                    <img src={k.image} alt={k.name} loading="lazy" className="h-full w-auto object-contain transition group-hover:scale-110" />
                  ) : (
                    <span className="icon-3d h-10 w-10 rounded-xl" style={{ "--tile": info.color } as React.CSSProperties} />
                  )}
                </div>
                <div className="text-sm font-bold">{k.name}</div>
                <div className="mt-2 text-[11px] font-bold text-blue">مشاهده ←</div>
              </Link>
            ))}
          </div>
        </section>
      )}

      {/* کارخانه‌ها */}
      {factoryNames.length > 0 && (
        <section className="mt-12">
          <h2 className="mb-4 text-lg font-extrabold">کارخانه‌های تأمین‌کننده</h2>
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
            {factoryNames.map((f) => (
              <Link
                key={f.name}
                href={`/prices?cat=${info.slug}&factory=${encodeURIComponent(f.name)}`}
                className="flex flex-col items-center rounded-card border border-border-light bg-white p-4 text-center shadow-soft transition hover:-translate-y-1 hover:shadow-lifted dark:border-border-dark dark:bg-surface-dark"
              >
                <div className="mb-3 flex h-16 w-full items-center justify-center rounded-xl bg-logo-white p-2">
                  {f.logoUrl ? (
                    <img src={f.logoUrl} alt={f.name} loading="lazy" className="max-h-full max-w-full object-contain" />
                  ) : (
                    <FactoryLogo slug="" name={f.name} fallbackClassName="text-2xl font-extrabold text-blue" />
                  )}
                </div>
                <div className="text-sm font-bold">{f.name}</div>
              </Link>
            ))}
          </div>
        </section>
      )}

      {/* لیست قیمت با نمودار */}
      <section className="mt-12">
        <h2 className="mb-4 text-lg font-extrabold">لیست قیمت</h2>
        {groups === null ? (
          <div className="h-24 animate-pulse rounded-card border border-border-light bg-white/70 shadow-soft dark:bg-surface-dark" />
        ) : filtered.length === 0 ? (
          <div className="rounded-card border border-dashed border-border-light bg-white py-12 text-center text-sm text-ink/50 dark:bg-surface-dark">
            قیمتی برای این محصول ثبت نشده است.
          </div>
        ) : (
          <div className="space-y-5">
            {filtered.map((g) => (
              <FactoryPriceGroup key={g.factory} group={g} includeVAT={includeVAT} selected={[]} onToggle={() => {}} />
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
