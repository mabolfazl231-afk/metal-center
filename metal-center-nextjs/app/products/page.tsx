import { categories } from "@/lib/data";

export const metadata = { title: "محصولات فولادی", description: "میلگرد، تیرآهن، ورق و پروفیل با مشخصات فنی کامل." };

export default function ProductsPage() {
  return (
    <div className="mx-auto max-w-[1240px] px-6 py-10">
      <h1 className="mb-2 text-[28px] font-extrabold">همه محصولات فولادی</h1>
      <p className="mb-8 max-w-[560px] text-[14.5px] text-ink/50">
        مشخصات فنی، استاندارد، سایز و قیمت لحظه‌ای برای هر محصول.
      </p>
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-5">
        {categories.map((c) => (
          <div key={c.name} className="rounded-card border border-black/5 bg-white p-5 text-center shadow-soft">
            <div className="text-sm font-bold">{c.name}</div>
            <div className="mt-1 text-xs text-ink/50">{c.count}</div>
          </div>
        ))}
      </div>
      <p className="mt-10 text-sm text-ink/50">
        این صفحه یک نمونه اولیه است. لیست کامل محصولات (فیلتر، صفحه‌بندی، جزئیات محصول)
        طبق همون طراحی HTML مرحله ۲ باید تکمیل بشه — همون الگوی این فایل رو برای بقیه صفحات ادامه بده.
      </p>
    </div>
  );
}
