"use client";

import Link from "next/link";
import { useCategories } from "@/lib/useCategories";

// صفحه‌ی یک دسته: نوع‌های زیرمجموعه (مثلاً ساده و آجدار) هرکدام به لیست قیمت خودشان می‌روند
export default function CategoryDetail({ slug }: { slug: string }) {
  const { nodes, flat, loaded } = useCategories();

  const top = nodes.find((n) => n.slug === slug);
  const child = flat.find((f) => f.slug === slug && f.parentName);

  if (!top && !child) {
    return (
      <div className="rounded-card border border-dashed border-black/10 py-16 text-center">
        <p className="mb-4 text-sm text-ink/50">
          {loaded ? "این دسته پیدا نشد." : "در حال بارگذاری..."}
        </p>
        <Link href="/products" className="text-sm font-bold text-blue">
          بازگشت به محصولات ←
        </Link>
      </div>
    );
  }

  if (!top && child) {
    return (
      <div>
        <Link href={`/category/${flat.find((f) => f.name === child.parentName)?.slug ?? ""}`} className="mb-6 inline-block text-sm font-bold text-blue">
          ← {child.parentName}
        </Link>
        <h1 className="mb-6 text-2xl font-extrabold">{child.name}</h1>
        <Link href={`/prices?cat=${child.slug}`} className="inline-block rounded-btn bg-blue px-5 py-3 text-sm font-bold text-white">
          مشاهده لیست قیمت {child.name}
        </Link>
      </div>
    );
  }

  const items = top!.children.length > 0 ? top!.children : [];

  return (
    <div>
      <Link href="/products" className="mb-6 inline-block text-sm font-bold text-blue">
        ← همه‌ی محصولات
      </Link>
      <h1 className="mb-2 text-2xl font-extrabold">{top!.name}</h1>
      <p className="mb-8 text-sm text-ink/55">
        {items.length > 0 ? "نوع مورد نظرت را انتخاب کن تا لیست قیمت و سایزهایش را ببینی." : "لیست قیمت و سایزهای این دسته را ببین."}
      </p>

      <div className="grid grid-cols-2 gap-4 sm:grid-cols-3">
        {items.map((k) => (
          <Link
            key={k.slug}
            href={`/prices?cat=${k.slug}`}
            className="group rounded-card border-2 bg-white p-6 text-center shadow-soft transition-all hover:-translate-y-1 hover:shadow-lifted dark:bg-surface-dark"
            style={{ borderColor: `${top!.color}66` }}
          >
            <div className="text-lg font-extrabold">{k.name}</div>
            <div className="mt-4 inline-block rounded-pill bg-blue/10 px-4 py-1.5 text-xs font-bold text-blue transition group-hover:bg-blue group-hover:text-white">
              مشاهده قیمت ←
            </div>
          </Link>
        ))}

        <Link
          href={`/prices?cat=${top!.slug}`}
          className="group rounded-card bg-gradient-to-br from-blue to-navy p-6 text-center text-white shadow-lifted transition-all hover:-translate-y-1 hover:shadow-glow"
        >
          <div className="text-lg font-extrabold">همه‌ی {top!.name}</div>
          <div className="mt-4 inline-block rounded-pill bg-white/20 px-4 py-1.5 text-xs font-bold">لیست کامل قیمت ←</div>
        </Link>
      </div>
    </div>
  );
}
