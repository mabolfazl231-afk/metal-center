import Link from "next/link";
import { categories, dailyPrices } from "@/lib/data";
import { catalogRows } from "@/lib/catalog";
import ProductCard from "@/components/product/ProductCard";

export const metadata = { title: "محصولات فولادی", description: "میلگرد، تیرآهن، ورق و پروفیل با مشخصات فنی کامل." };

export default function ProductsPage({ searchParams }: { searchParams: { cat?: string } }) {
  const active = categories.find((c) => c.slug === searchParams.cat);

  // گروه‌بندی ردیف‌های فایل فنی بر اساس کارخانه (فقط دسته‌ی انتخاب‌شده)
  const groups = active
    ? Array.from(
        catalogRows
          .filter((r) => r.cat === active.slug)
          .reduce((m, r) => {
            const list = m.get(r.factory) ?? [];
            list.push(r);
            m.set(r.factory, list);
            return m;
          }, new Map<string, typeof catalogRows>())
      )
    : [];

  const products = dailyPrices
    .filter((p) => !active || p.cat === active.slug)
    .map((p) => ({ name: p.name, factory: p.factory, price: p.price, unit: "kg", badge: "موجود" as const }));

  return (
    <div className="mx-auto max-w-[1240px] px-6 py-10">
      <h1 className="mb-2 text-[28px] font-extrabold">{active ? `موجودی و سایزهای ${active.name}` : "همه محصولات فولادی"}</h1>
      <p className="mb-8 max-w-[560px] text-[14.5px] text-ink/50 dark:text-white/40">
        مشخصات فنی، سایز و وزن هر کارخانه. قیمت هر سایز با استعلام اعلام می‌شود.
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

      {active ? (
        groups.length > 0 ? (
          <div className="space-y-6">
            {groups.map(([factory, rows]) => (
              <div key={factory} className="overflow-hidden rounded-card border-2 bg-white shadow-soft dark:bg-surface-dark" style={{ borderColor: `${active.color}33` }}>
                <div className="flex items-center justify-between px-5 py-4 text-white" style={{ background: active.color }}>
                  <span className="font-extrabold">{factory}</span>
                  <span className="text-xs font-bold opacity-90">{rows.length} سایز</span>
                </div>
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b border-border-light text-start text-xs text-ink/50 dark:border-border-dark dark:text-white/40">
                        <th className="p-3 text-start font-bold">محصول</th>
                        <th className="p-3 text-start font-bold">سایز</th>
                        <th className="p-3 text-start font-bold">وزن نظری (kg/m)</th>
                        <th className="p-3 text-start font-bold">قیمت</th>
                      </tr>
                    </thead>
                    <tbody>
                      {rows.map((r, i) => (
                        <tr key={i} className="border-b border-border-light/60 last:border-0 dark:border-border-dark/60">
                          <td className="p-3 font-semibold">{r.product}</td>
                          <td className="p-3">{r.size}</td>
                          <td className="p-3 text-ink/60 dark:text-white/50">{r.weight}</td>
                          <td className="p-3">
                            <Link href="/rfq" className="rounded-lg px-2.5 py-1 text-xs font-bold text-white" style={{ background: active.color }}>
                              استعلام
                            </Link>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-sm text-ink/50 dark:text-white/40">سایزهای این دسته به‌زودی اضافه می‌شود.</p>
        )
      ) : (
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
          {products.map((p) => (
            <ProductCard key={p.name} product={p} />
          ))}
        </div>
      )}
    </div>
  );
}
