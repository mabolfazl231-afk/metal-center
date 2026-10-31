import Link from "next/link";
import { categories } from "@/lib/data";

export const metadata = { title: "محصولات فولادی", description: "میلگرد، تیرآهن، ورق، پروفیل، نبشی و ناودانی با لیست قیمت و مشخصات کامل." };

export default function ProductsPage() {
  return (
    <div className="mx-auto max-w-[1240px] px-6 py-12">
      <h1 className="mb-2 text-[30px] font-extrabold">محصولات فولادی</h1>
      <p className="mb-10 text-[15px] text-ink/60">یک دسته را انتخاب کن تا لیست قیمت و سایزها را ببینی.</p>
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-5">
        {categories.map((c) => (
          <Link
            key={c.slug}
            href={`/prices?cat=${c.slug}`}
            className="group relative overflow-hidden rounded-card p-7 text-center text-white shadow-lifted transition duration-300 hover:-translate-y-1.5 hover:shadow-glow"
            style={{ background: `linear-gradient(135deg, ${c.color}, ${c.color}cc)` }}
          >
            <div className="text-lg font-extrabold">{c.name}</div>
            <div className="mt-1 text-xs opacity-80">{c.count}</div>
            <div className="mt-6 inline-block rounded-pill bg-white/20 px-4 py-1.5 text-xs font-bold backdrop-blur transition group-hover:bg-white/30">
              مشاهده لیست قیمت ←
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}
