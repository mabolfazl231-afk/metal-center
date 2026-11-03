import Link from "next/link";
import { TrendingUp, FileText, Calculator, Factory as FactoryIcon, CircleDot, Layers, Square, RectangleHorizontal, Box } from "lucide-react";
import { dailyPrices, categories } from "@/lib/data";
import ProductCard from "@/components/product/ProductCard";
import HeroSlider from "@/components/HeroSlider";
import { WhyMetalCenter, BuyingSteps } from "@/components/WhySteps";
import FactorySlider from "@/components/FactorySlider";

const CATEGORY_ICONS: Record<string, any> = {
  "میلگرد": CircleDot,
  "تیرآهن": Layers,
  "ورق": RectangleHorizontal,
  "پروفیل": Box,
  "نبشی و ناودانی": Square,
};

export default function HomePage() {
  return (
    <>
      <HeroSlider />

      {/* Quick actions */}
      <section className="bg-gradient-to-br from-[#E8F0FF] via-white to-[#E9FBF4] px-6 py-12 dark:bg-white/[0.02]">
        <div className="mx-auto max-w-[1240px]">
          <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
            {[
              { icon: TrendingUp, label: "لیست قیمت", href: "/prices", color: "#0CA678" },
              { icon: FileText, label: "استعلام قیمت", href: "/rfq", color: "#0A3D91" },
              { icon: Calculator, label: "ماشین‌حساب وزن", href: "/knowledge", color: "#F08C00" },
              { icon: FactoryIcon, label: "کارخانه‌ها", href: "/factories", color: "#7048E8" },
            ].map((qa) => (
              <Link
                key={qa.label}
                href={qa.href}
                className="flex flex-col items-center gap-3 rounded-card border border-border-light bg-white p-6 text-center shadow-soft transition-all hover:-translate-y-1 hover:shadow-lifted dark:border-border-dark dark:bg-surface-dark"
              >
                <div className="flex h-12 w-12 items-center justify-center rounded-2xl" style={{ background: `${qa.color}24` }}>
                  <qa.icon size={22} style={{ color: qa.color }} />
                </div>
                <span className="text-sm font-bold">{qa.label}</span>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Categories */}
      <section className="bg-white px-6 py-14 dark:bg-canvas-dark">
        <div className="mx-auto max-w-[1240px]">
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
            {categories.map((c) => {
              const Icon = CATEGORY_ICONS[c.name] ?? Box;
              return (
                <Link
                  key={c.name}
                  href={`/prices?cat=${c.slug}`}
                  className="group rounded-card border-2 bg-white p-5 text-center shadow-soft transition-all hover:-translate-y-1 hover:shadow-lifted dark:bg-surface-dark"
                  style={{ borderColor: `${c.color}55` }}
                >
                  {["rebar", "beam", "sheet", "profile", "channel"].includes(c.slug) ? (
                    <div className="relative mx-auto mb-3 flex h-24 items-end justify-center">
                      <div className="absolute inset-x-6 bottom-0 h-3 rounded-full bg-black/15 blur-md" />
                      <img
                        src={`/products/${c.slug}.png`}
                        alt={c.name}
                        loading="lazy"
                        className="relative h-full w-auto object-contain drop-shadow-[0_10px_12px_rgba(0,0,0,0.28)] transition duration-300 group-hover:scale-110"
                      />
                    </div>
                  ) : (
                    <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-2xl" style={{ background: c.color }}>
                      <Icon size={22} className="text-white" />
                    </div>
                  )}
                  <div className="text-[14px] font-bold">{c.name}</div>
                  <div className="mt-1 text-xs text-ink/50 dark:text-white/40">{c.count}</div>
                </Link>
              );
            })}
          </div>
        </div>
      </section>

      <WhyMetalCenter />

      {/* Featured products */}
      <section className="bg-gradient-to-br from-[#FFF4E6] via-white to-[#EEF4FF] px-6 py-14 dark:bg-white/[0.02]">
        <div className="mx-auto max-w-[1240px]">
          <div className="mb-8 flex items-end justify-between">
            <h2 className="text-[26px] font-extrabold">محصولات پرطرفدار</h2>
            <Link href="/products" className="text-[14px] font-semibold text-blue">همه ←</Link>
          </div>
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
            {dailyPrices.map((p) => (
              <ProductCard key={p.name} product={{ name: p.name, factory: p.factory, price: p.price, badge: "موجود" }} />
            ))}
          </div>
        </div>
      </section>

      <BuyingSteps />

      <FactorySlider />

      {/* CTA */}
      <section className="bg-gradient-to-br from-[#EEF4FF] via-[#F3EEFF] to-[#E9FBF4] px-6 py-16 dark:bg-white/[0.02]">
        <div className="mx-auto max-w-[1240px] rounded-card bg-blue px-8 py-12 text-center text-white">
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
