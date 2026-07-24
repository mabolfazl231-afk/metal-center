import Link from "next/link";
import { dailyPrices, categories, factories } from "@/lib/data";

export default function HomePage() {
  return (
    <>
      {/* Hero */}
      <section className="relative overflow-hidden bg-navy px-6 py-20 text-white">
        <div className="mx-auto max-w-[760px]">
          <span className="mb-5 inline-flex items-center gap-2 rounded-full border border-success/30 bg-success/10 px-3 py-1.5 text-[12.5px] font-semibold text-success">
            ● قیمت‌ها هر ۱۵ دقیقه به‌روزرسانی می‌شوند
          </span>
          <h1 className="mb-4 text-[clamp(30px,5vw,52px)] font-extrabold leading-tight">
            فولاد را <span className="text-[#7FB2FF]">هوشمندانه</span> بخرید، بفروشید و مدیریت کنید
          </h1>
          <p className="mb-8 max-w-[600px] text-[16.5px] leading-8 text-[#B9C6DC]">
            قیمت لحظه‌ای، استعلام آنی با آپلود فایل، و شبکه‌ای معتبر از کارخانه‌ها —
            همه در یک پلتفرم برای پیمانکاران، تولیدکنندگان و بازرگانان فولاد.
          </p>
          <Link
            href="/rfq"
            className="inline-block rounded-btn bg-blue px-6 py-3.5 font-semibold transition-colors duration-btn hover:bg-blue/90"
          >
            شروع درخواست استعلام
          </Link>
        </div>
      </section>

      {/* Categories */}
      <section className="mx-auto max-w-[1240px] px-6 py-14">
        <div className="mb-8 flex items-end justify-between">
          <div>
            <span className="mb-2 block text-[12.5px] font-bold text-blue">محصولات</span>
            <h2 className="text-[26px] font-extrabold">دسته‌بندی محصولات فولادی</h2>
          </div>
          <Link href="/products" className="text-[14px] font-semibold text-blue">
            مشاهده همه محصولات ←
          </Link>
        </div>
        <div className="grid grid-cols-2 gap-3.5 sm:grid-cols-3 lg:grid-cols-5">
          {categories.map((c) => (
            <Link
              key={c.name}
              href="/products"
              className="rounded-card border border-black/5 bg-white p-5 text-center shadow-soft transition-transform duration-btn hover:-translate-y-1"
            >
              <div className="text-[14px] font-bold">{c.name}</div>
              <div className="mt-1 text-xs text-ink/50">{c.count}</div>
            </Link>
          ))}
        </div>
      </section>

      {/* Daily prices */}
      <section className="mx-auto max-w-[1240px] px-6 py-14">
        <div className="mb-8 flex items-end justify-between">
          <div>
            <span className="mb-2 block text-[12.5px] font-bold text-blue">بازار</span>
            <h2 className="text-[26px] font-extrabold">قیمت روز فولاد</h2>
          </div>
          <Link href="/prices" className="text-[14px] font-semibold text-blue">
            تاریخچه و نمودار کامل ←
          </Link>
        </div>
        <div className="overflow-hidden rounded-card border border-black/5 bg-white">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-steel text-xs text-ink/50">
                <th className="p-4 text-start font-semibold">محصول</th>
                <th className="p-4 text-start font-semibold">کارخانه</th>
                <th className="p-4 text-start font-semibold">قیمت</th>
                <th className="p-4 text-start font-semibold">تغییر</th>
              </tr>
            </thead>
            <tbody>
              {dailyPrices.map((p) => (
                <tr key={p.name} className="border-t border-black/5 hover:bg-steel">
                  <td className="p-4 font-bold">{p.name}</td>
                  <td className="p-4 text-ink/50">{p.factory}</td>
                  <td className="p-4">{p.price} تومان</td>
                  <td className={`p-4 font-bold ${p.dir === "up" ? "text-success" : "text-danger"}`}>
                    {p.dir === "up" ? "▲" : "▼"} {p.change}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      {/* Factories */}
      <section className="mx-auto max-w-[1240px] px-6 py-14">
        <div className="mb-8 flex items-end justify-between">
          <h2 className="text-[26px] font-extrabold">کارخانه‌های منتخب</h2>
          <Link href="/factories" className="text-[14px] font-semibold text-blue">
            همه کارخانه‌ها ←
          </Link>
        </div>
        <div className="grid grid-cols-1 gap-5 sm:grid-cols-3">
          {factories.map((f) => (
            <Link
              key={f.name}
              href="/factories"
              className="overflow-hidden rounded-card border border-black/5 bg-white shadow-soft"
            >
              <div className="h-[110px] bg-gradient-to-br from-[#123a6e] to-blue" />
              <div className="p-4">
                <div className="font-bold">{f.name}</div>
                <div className="mt-1 text-xs text-ink/50">{f.location} · {f.products} محصول فعال</div>
              </div>
            </Link>
          ))}
        </div>
      </section>

      {/* CTA */}
      <section className="mx-auto max-w-[1240px] px-6 pb-16">
        <div className="rounded-card bg-blue px-8 py-12 text-center text-white">
          <h2 className="mb-2 text-2xl font-extrabold">حساب کاربری خود را بسازید</h2>
          <p className="mb-6 text-[#DCE7FA]">مدیریت استعلام‌ها، پیش‌فاکتورها و هشدار قیمت — همه در یک داشبورد.</p>
          <Link href="/rfq" className="inline-block rounded-btn bg-white px-6 py-3.5 font-semibold text-blue">
            ثبت‌نام رایگان
          </Link>
        </div>
      </section>
    </>
  );
}
