import Link from "next/link";
import type { CSSProperties } from "react";
import { TrendingUp, FileText, Calculator, Factory as FactoryIcon } from "lucide-react";
import { dailyPrices } from "@/lib/data";
import ProductCard from "@/components/product/ProductCard";
import HeroSlider from "@/components/HeroSlider";
import { WhyMetalCenter, BuyingSteps } from "@/components/WhySteps";
import FactorySlider from "@/components/FactorySlider";
import Reveal from "@/components/Reveal";
import CategoryGrid from "@/components/CategoryGrid";

export default function HomePage() {
  return (
    <>
      <HeroSlider />

      {/* Quick actions */}
      <section className="bg-gradient-to-br from-[#E8F0FF] via-white to-[#E9FBF4] px-6 py-12 dark:bg-white/[0.02]">
        <div className="mx-auto max-w-[1240px]">
          <Reveal className="grid grid-cols-2 gap-4 lg:grid-cols-4">
            {[
              { icon: TrendingUp, label: "لیست قیمت", href: "/prices", color: "#0CA678" },
              { icon: FileText, label: "استعلام قیمت", href: "/rfq", color: "#0A3D91" },
              { icon: Calculator, label: "ماشین‌حساب وزن", href: "/steel-weight-calculator", color: "#F08C00" },
              { icon: FactoryIcon, label: "کارخانه‌ها", href: "/factories", color: "#7048E8" },
            ].map((qa) => (
              <Link
                key={qa.label}
                href={qa.href}
                className="group flex flex-col items-center gap-3 rounded-card border border-border-light bg-white p-6 text-center shadow-soft transition-all hover:-translate-y-1 hover:shadow-lifted dark:border-border-dark dark:bg-surface-dark"
              >
                <div
                  className="icon-3d flex h-14 w-14 items-center justify-center rounded-2xl transition-transform duration-300 group-hover:-translate-y-0.5 group-hover:scale-105"
                  style={{ "--tile": qa.color } as CSSProperties}
                >
                  <qa.icon size={24} />
                </div>
                <span className="text-sm font-bold">{qa.label}</span>
              </Link>
            ))}
          </Reveal>
        </div>
      </section>

      {/* Categories */}
      <section className="bg-white px-6 py-14 dark:bg-canvas-dark">
        <div className="mx-auto max-w-[1240px]">
          <Reveal>
            <div className="mb-8 flex items-end justify-between">
              <div>
                <span className="mb-2 block text-[12.5px] font-bold text-blue">محصولات</span>
                <h2 className="text-[26px] font-extrabold">دسته‌بندی محصولات فولادی</h2>
              </div>
              <Link href="/products" className="text-[14px] font-semibold text-blue">
                مشاهده همه محصولات ←
              </Link>
            </div>
          </Reveal>
          <Reveal delay={0.08}>
            <CategoryGrid variant="home" />
          </Reveal>
        </div>
      </section>

      <WhyMetalCenter />

      {/* Featured products */}
      <section className="bg-gradient-to-br from-[#FFF4E6] via-white to-[#EEF4FF] px-6 py-14 dark:bg-white/[0.02]">
        <div className="mx-auto max-w-[1240px]">
          <Reveal>
            <div className="mb-8 flex items-end justify-between">
              <h2 className="text-[26px] font-extrabold">محصولات پرطرفدار</h2>
              <Link href="/products" className="text-[14px] font-semibold text-blue">همه ←</Link>
            </div>
          </Reveal>
          <Reveal delay={0.08} className="grid grid-cols-2 gap-4 sm:grid-cols-4">
            {dailyPrices.map((p) => (
              <ProductCard key={p.name} product={{ name: p.name, factory: p.factory, price: p.price, badge: "موجود" }} />
            ))}
          </Reveal>
        </div>
      </section>

      <BuyingSteps />

      <FactorySlider />

      {/* CTA */}
      <section className="bg-gradient-to-br from-[#EEF4FF] via-[#F3EEFF] to-[#E9FBF4] px-6 py-16 dark:bg-white/[0.02]">
        <Reveal className="mx-auto max-w-[1240px] rounded-card bg-blue px-8 py-12 text-center text-white">
          <h2 className="mb-2 text-2xl font-extrabold">حساب کاربری خود را بسازید</h2>
          <p className="mb-6 text-[#DCE7FA]">مدیریت استعلام‌ها، پیش‌فاکتورها و هشدار قیمت — همه در یک داشبورد.</p>
          <Link href="/login" className="inline-block rounded-btn bg-white px-6 py-3.5 font-semibold text-blue">
            ثبت‌نام رایگان
          </Link>
        </Reveal>
      </section>
    </>
  );
}
