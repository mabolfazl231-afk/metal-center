import Link from "next/link";
import { TrendingUp, FileText, Calculator, Factory as FactoryIcon } from "lucide-react";
import { dailyPrices, categories, factories } from "@/lib/data";
import LiveCounter from "@/components/LiveCounter";
import ProductCard from "@/components/product/ProductCard";

export default function HomePage() {
  return (
    <>
      {/* Hero */}
      <section className="relative overflow-hidden bg-navy px-6 py-24 text-white">
        <div className="absolute -end-32 -top-32 h-96 w-96 rounded-full bg-blue/30 blur-3xl" />
        <div className="relative mx-auto max-w-[760px]">
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
          <div className="mb-10 flex flex-wrap gap-3">
            <Link href="/prices" className="rounded-btn bg-white px-6 py-3.5 font-semibold text-navy transition-transform hover:-translate-y-0.5">
              قیمت روز
            </Link>
            <Link href="/rfq" className="rounded-btn bg-blue px-6 py-3.5 font-semibold transition-transform hover:-translate-y-0.5">
              استعلام هوشمند
            </Link>
          </div>

          {/* Live stats */}
          <div className="grid grid-cols-3 gap-4 border-t border-white/10 pt-8 text-center sm:text-start">
            <div>
              <div className="text-2xl font-extrabold"><LiveCounter target={240} suffix="+" /></div>
              <div className="mt-1 text-xs text-[#93A0B8]">کارخانه تأییدشده</div>
            </div>
            <div>
              <div className="text-2xl font-extrabold"><LiveCounter target={358} /></div>
              <div className="mt-1 text-xs text-[#93A0B8]">محصول ثبت‌شده</div>
            </div>
            <div>
              <div className="text-2xl font-extrabold"><LiveCounter target={18000} suffix="+" /></div>
              <div className="mt-1 text-xs text-[#93A0B8]">استعلام موفق</div>
            </div>
          </div>
        </div>
      </section>

      {/* Quick actions */}
      <section className="mx-auto max-w-[1240px] px-6 py-12">
        <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
          {[
            { icon: TrendingUp, label: "قیمت روز", href: "/prices" },
            { icon: FileText, label: "استعلام قیمت", href: "/rfq" },
            { icon: Calculator, label: "ماشین‌حساب وزن", href: "/knowledge" },
            { icon: FactoryIcon, label: "کارخانه‌ها", href: "/factories" },
          ].map((qa) => (
            <Link
              key={qa.label}
              href={qa.href}
              className="flex flex-col items-center gap-3 rounded-card border border-border-light bg-white p-6 text-center shadow-soft transition-all hover:-translate-y-1 hover:shadow-lifted dark:border-border-dark dark:bg-surface-dark"
            >
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-blue/10">
                <qa.icon size={22} className="text-blue" />
              </div>
              <span className="text-sm font-bold">{qa.label}</span>
            </Link>
          ))}
        </div>
      </section>

      {/* Categories */}
      <section className="mx-auto max-w-[1240px] px-6 py-8">
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
              className="rounded-card border border-border-light bg-white p-5 text-center shadow-soft transition-transform hover:-translate-y-1 dark:border-border-dark dark:bg-surface-dark"
            >
              <div className="text-[14px] font-bold">{c.name}</div>
              <div className="mt-1 text-xs text-ink/50 dark:text-white/40">{c.count}</div>
            </Link>
          ))}
        </div>
      </section>

      {/* Featured products */}
      <section className="mx-auto max-w-[1240px] px-6 py-8">
        <div className="mb-8 flex items-end justify-between">
          <h2 className="text-[26px] font-extrabold">محصولات پرطرفدار</h2>
          <Link href="/products" className="text-[14px] font-semibold text-blue">همه ←</Link>
        </div>
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
          {dailyPrices.map((p) => (
            <ProductCard key={p.name} product={{ name: p.name, factory: p.factory, price: p.price, badge: "موجود" }} />
          ))}
        </div>
      </section>

      {/* Factories */}
      <section className="mx-auto max-w-[1240px] px-6 py-12">
        <div className="mb-8 flex items-end justify-between">
          <h2 className="text-[26px] font-extrabold">کارخانه‌های منتخب</h2>
          <Link href="/factories" className="text-[14px] font-semibold text-blue">همه کارخانه‌ها ←</Link>
        </div>
        <div className="grid grid-cols-1 gap-5 sm:grid-cols-3">
          {factories.map((f) => (
            <Link
              key={f.name}
              href="/factories"
              className="overflow-hidden rounded-card border border-border-light bg-white shadow-soft dark:border-border-dark dark:bg-surface-dark"
            >
              <div className="h-[110px] bg-gradient-to-br from-[#123a6e] to-blue" />
              <div className="p-4">
                <div className="font-bold">{f.name}</div>
                <div className="mt-1 text-xs text-ink/50 dark:text-white/40">{f.location} · {f.products} محصول فعال</div>
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
          <Link href="/login" className="inline-block rounded-btn bg-white px-6 py-3.5 font-semibold text-blue">
            ثبت‌نام رایگان
          </Link>
        </div>
      </section>
    </>
  );
}
