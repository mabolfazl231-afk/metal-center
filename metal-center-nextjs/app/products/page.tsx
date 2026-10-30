import Link from "next/link";
import { categories, dailyPrices } from "@/lib/data";
import ProductCard from "@/components/product/ProductCard";

export const metadata = { title: "محصولات فولادی", description: "میلگرد، تیرآهن، ورق و پروفیل با مشخصات فنی کامل." };

export default function ProductsPage({ searchParams }: { searchParams: { cat?: string } }) {
  const active = categories.find((c) => c.slug === searchParams.cat);

  const products = dailyPrices
    .filter((p) => !active || p.cat === active.slug)
    .map((p) => ({ name: p.name, factory: p.factory, price: p.price, unit: "kg", badge: "موجود" as const }));

  return (
    <div className="mx-auto max-w-[1240px] px-6 py-10">
      <h1 className="mb-2 text-[28px] font-extrabold">{active ? active.name : "همه محصولات فولادی"}</h1>
      <p className="mb-8 max-w-[560px] text-[14.5px] text-ink/50 dark:text-white/40">
        مشخصات فنی، استاندارد، سایز و قیمت لحظه‌ای برای هر محصول.
      </p>

      <div className="mb-8 flex flex-wrap gap-2">
        <Link
          href="/products"
          className={`rounded-pill border px-4 py-2 text-xs font-bold ${!active ? "border-blue bg-blue text-white" : "border-border-light text-ink/60 hover:border-blue hover:text-blue dark:border-border-dark dark:text-white/60"}`}
        >
          همه
        </Link>
        {categories.map((c) => {
          const on = active?.slug === c.slug;
          return (
            <Link
              key={c.slug}
              href={`/products?cat=${c.slug}`}
              className="rounded-pill border px-4 py-2 text-xs font-bold"
              style={on ? { background: c.color, borderColor: c.color, color: "#fff" } : { borderColor: `${c.color}66`, color: c.color }}
            >
              {c.name} <span className="opacity-70">· {c.count}</span>
            </Link>
          );
        })}
      </div>

      {active && (
        <div className="mb-10 rounded-card border-2 p-6" style={{ borderColor: `${active.color}44`, background: `${active.color}0d` }}>
          <div className="mb-4 text-sm font-extrabold" style={{ color: active.color }}>سایزهای موجود در {active.name}</div>
          <div className="flex flex-wrap gap-2">
            {active.sizes.map((s) => (
              <span key={s} className="rounded-lg bg-white px-3 py-1.5 text-xs font-bold shadow-soft dark:bg-surface-dark">
                {s}
              </span>
            ))}
          </div>
        </div>
      )}

      {products.length > 0 ? (
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
          {products.map((p) => (
            <ProductCard key={p.name} product={p} />
          ))}
        </div>
      ) : (
        <p className="text-sm text-ink/50 dark:text-white/40">قیمت این دسته به‌زودی اضافه می‌شود. برای استعلام از دکمه‌ی «استعلام قیمت» استفاده کنید.</p>
      )}
    </div>
  );
}
