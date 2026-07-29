import { categories, dailyPrices } from "@/lib/data";
import ProductCard from "@/components/product/ProductCard";

export const metadata = { title: "محصولات فولادی", description: "میلگرد، تیرآهن، ورق و پروفیل با مشخصات فنی کامل." };

export default function ProductsPage() {
  const products = dailyPrices.map((p) => ({
    name: p.name,
    factory: p.factory,
    price: p.price,
    unit: "kg",
    badge: "موجود" as const,
  }));

  return (
    <div className="mx-auto max-w-[1240px] px-6 py-10">
      <h1 className="mb-2 text-[28px] font-extrabold">همه محصولات فولادی</h1>
      <p className="mb-8 max-w-[560px] text-[14.5px] text-ink/50 dark:text-white/40">
        مشخصات فنی، استاندارد، سایز و قیمت لحظه‌ای برای هر محصول.
      </p>

      <div className="mb-8 flex flex-wrap gap-2">
        {categories.map((c) => (
          <button
            key={c.name}
            className="rounded-pill border border-border-light px-4 py-2 text-xs font-bold text-ink/60 hover:border-blue hover:text-blue dark:border-border-dark dark:text-white/60"
          >
            {c.name} <span className="text-ink/30">· {c.count}</span>
          </button>
        ))}
      </div>

      <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
        {products.map((p) => (
          <ProductCard key={p.name} product={p} />
        ))}
      </div>
    </div>
  );
}
