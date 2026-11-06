import type { Metadata } from "next";
import Link from "next/link";
import WeightCalculator from "@/components/weight/WeightCalculator";

const PATH = "/steel-weight-calculator";

export const metadata: Metadata = {
  title: "ماشین حساب وزن فولاد آنلاین",
  description:
    "ماشین حساب رایگان وزن فولاد: وزن میلگرد، ورق، قوطی، نبشی، تیرآهن IPE و ناودانی UPN را با فرمول استاندارد و چگالی ۷۸۵۰ کیلوگرم بر متر مکعب محاسبه کنید.",
  keywords: [
    "ماشین حساب وزن فولاد",
    "محاسبه وزن میلگرد",
    "وزن ورق فولادی",
    "محاسبه وزن قوطی",
    "وزن تیرآهن IPE",
    "وزن نبشی",
    "وزن ناودانی UPN",
    "فرمول وزن فولاد",
  ],
  alternates: { canonical: PATH },
  openGraph: {
    title: "ماشین حساب وزن فولاد آنلاین | متال سنتر",
    description: "وزن میلگرد، ورق، قوطی، نبشی، تیرآهن و ناودانی را در چند ثانیه محاسبه کنید.",
    url: PATH,
    type: "website",
    locale: "fa_IR",
  },
};

const FAQS = [
  {
    q: "چگالی فولاد برای محاسبه‌ی وزن چقدر است؟",
    a: "در محاسبات متداول وزن فولاد، چگالی ۷۸۵۰ کیلوگرم بر متر مکعب در نظر گرفته می‌شود.",
  },
  {
    q: "آیا وزن محاسبه‌شده با وزن باسکول برابر است؟",
    a: "خیر. وزن محاسباتی بر اساس ابعاد اسمی است و ممکن است به دلیل تلرانس تولید و مشخصات واقعی محصول با وزن باسکول اختلاف داشته باشد.",
  },
  {
    q: "وزن میلگرد چگونه محاسبه می‌شود؟",
    a: "وزن میلگرد با قطر و طول آن و بر اساس سطح مقطع دایره‌ای محاسبه می‌شود: ۰٫۰۰۶۱۶۵۳۷۵ × قطر² × طول.",
  },
  {
    q: "وزن ورق گالوانیزه چگونه محاسبه می‌شود؟",
    a: "وزن پایه‌ی ورق از ضخامت، عرض، طول و چگالی فولاد به دست می‌آید. برای وزن دقیق‌تر باید وزن پوشش روی هم در نظر گرفته شود.",
  },
  {
    q: "آیا وزن یک شاخه با وزن یک بندیل میلگرد برابر است؟",
    a: "خیر. وزن بندیل از مجموع وزن شاخه‌های موجود در آن به دست می‌آید و به تعداد شاخه‌ها بستگی دارد.",
  },
  {
    q: "آیا می‌توان وزن پروفیل را بدون دانستن ضخامت محاسبه کرد؟",
    a: "خیر. ضخامت یکی از پارامترهای اصلی محاسبه‌ی سطح مقطع فولاد و وزن پروفیل است.",
  },
];

export default function SteelWeightPage() {
  const jsonLd = [
    {
      "@context": "https://schema.org",
      "@type": "WebApplication",
      name: "ماشین حساب وزن فولاد متال سنتر",
      url: PATH,
      applicationCategory: "UtilitiesApplication",
      operatingSystem: "Any",
      inLanguage: "fa",
      offers: { "@type": "Offer", price: "0", priceCurrency: "IRR" },
    },
    {
      "@context": "https://schema.org",
      "@type": "FAQPage",
      mainEntity: FAQS.map((f) => ({
        "@type": "Question",
        name: f.q,
        acceptedAnswer: { "@type": "Answer", text: f.a },
      })),
    },
  ];

  return (
    <div className="mx-auto max-w-[1240px] px-4 py-8 sm:px-6 sm:py-10">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />

      {/* بنر صفحه: فایل از public/steel-weight-banner.webp خوانده می‌شود */}
      <div className="mb-8 overflow-hidden rounded-card shadow-lifted">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src="/steel-weight-banner.webp"
          alt="ماشین حساب وزن آهن‌آلات متال سنتر برای میلگرد، تیرآهن، ورق و مقاطع فولادی"
          width={1942}
          height={809}
          className="block h-auto w-full"
        />
      </div>

      {/* سربرگ */}
      <header className="mb-8 rounded-card bg-navy p-7 text-white sm:p-10">
        <nav className="mb-4 text-xs text-[#B9C6DC]">
          <Link href="/" className="hover:text-white">خانه</Link> <span className="mx-1">/</span> ماشین حساب وزن فولاد
        </nav>
        <h1 className="mb-3 text-2xl font-extrabold leading-relaxed sm:text-3xl">ماشین حساب وزن فولاد (آنلاین و رایگان)</h1>
        <p className="max-w-[720px] text-sm leading-7 text-[#B9C6DC] sm:text-base">
          وزن میلگرد، ورق، قوطی، نبشی، تیرآهن IPE و ناودانی UPN را با فرمول استاندارد و چگالی ۷۸۵۰ کیلوگرم بر متر مکعب
          محاسبه کنید. نوع محصول را انتخاب کنید، ابعاد و طول را وارد کنید و وزن کل را ببینید.
        </p>
      </header>

      {/* ماشین حساب */}
      <section aria-label="ماشین حساب وزن" className="mb-12">
        <WeightCalculator />
      </section>

      <div className="grid gap-10 lg:grid-cols-[1fr_300px]">
        <div className="min-w-0 space-y-12">
          {/* فرمول‌ها */}
          <section>
            <h2 className="mb-3 text-xl font-extrabold">فرمول محاسبه‌ی وزن فولاد</h2>
            <p className="mb-6 text-sm leading-8 text-ink/70">
              وزن تئوری فولاد بر اساس حجم مقطع و چگالی آن محاسبه می‌شود. در همه‌ی فرمول‌های زیر چگالی ۷۸۵۰ کیلوگرم بر متر
              مکعب است. قطر، ضخامت و ابعاد مقطع بر حسب میلی‌متر و طول بر حسب متر وارد می‌شوند.
            </p>

            <div className="grid gap-4 md:grid-cols-2">
              {[
                {
                  title: "میلگرد ساده و آجدار",
                  formula: "W = 0.006165375 × d² × L",
                  note: "d: قطر (mm) — L: طول (m)",
                },
                {
                  title: "ورق (سیاه، روغنی، گالوانیزه، آجدار)",
                  formula: "W = 0.00785 × t × w × L",
                  note: "t: ضخامت (mm) — w: عرض (mm) — L: طول (m)",
                },
                {
                  title: "قوطی و پروفیل مربع و مستطیل",
                  formula: "W = 0.00785 × [w·h − (w−2t)·(h−2t)] × L",
                  note: "w، h و t بر حسب mm — L: طول (m)",
                },
                {
                  title: "نبشی مساوی",
                  formula: "W = 0.00785 × T × (2h − T) × L",
                  note: "تخمین هندسی؛ وزن استاندارد کارخانه دقیق‌تر است",
                },
                {
                  title: "نبشی نامساوی",
                  formula: "W = 0.00785 × T × (h + b − T) × L",
                  note: "تخمین هندسی؛ وزن استاندارد کارخانه دقیق‌تر است",
                },
                {
                  title: "تیرآهن IPE و ناودانی UPN",
                  formula: "W = وزن استاندارد هر متر × L",
                  note: "وزن هر متر از جدول استاندارد EN / DIN خوانده می‌شود",
                },
              ].map((f) => (
                <div key={f.title} className="rounded-card border border-black/5 bg-white p-5 shadow-soft dark:border-border-dark dark:bg-surface-dark">
                  <h3 className="mb-3 text-sm font-extrabold text-blue">{f.title}</h3>
                  <div dir="ltr" className="mb-3 overflow-x-auto rounded-xl bg-steel px-3 py-2.5 font-mono text-xs text-navy dark:bg-canvas-dark dark:text-white">
                    {f.formula}
                  </div>
                  <p className="text-xs leading-6 text-ink/55">{f.note}</p>
                </div>
              ))}
            </div>
          </section>

          {/* انواع وزن */}
          <section>
            <h2 className="mb-3 text-xl font-extrabold">تفاوت وزن تئوری، استاندارد و باسکول</h2>
            <p className="mb-5 text-sm leading-8 text-ink/70">
              وزن محصول فولادی را می‌توان به سه شکل تعریف کرد. برای خرید و فروش قطعی، ملاک نهایی وزنی است که کارخانه یا
              باسکول اعلام می‌کند.
            </p>
            <div className="grid gap-3 md:grid-cols-3">
              {[
                { t: "وزن تئوری", d: "محاسبه‌شده بر اساس ابعاد اسمی و فرمول هندسی. همین ماشین حساب این را نشان می‌دهد." },
                { t: "وزن استاندارد", d: "وزن اسمی اعلام‌شده در جداول استاندارد یا کاتالوگ کارخانه." },
                { t: "وزن باسکول", d: "وزن اندازه‌گیری‌شده‌ی محصول در زمان توزین." },
              ].map((x) => (
                <div key={x.t} className="rounded-card bg-steel p-5 dark:bg-surface-dark">
                  <div className="mb-2 text-sm font-extrabold text-navy dark:text-white">{x.t}</div>
                  <p className="text-xs leading-6 text-ink/60">{x.d}</p>
                </div>
              ))}
            </div>
          </section>

          {/* راهنمای استفاده */}
          <section>
            <h2 className="mb-4 text-xl font-extrabold">چگونه از ماشین حساب وزن استفاده کنیم؟</h2>
            <ol className="grid gap-3 text-sm leading-7 text-ink/75">
              {[
                "نوع محصول فولادی را انتخاب کنید: میلگرد، ورق، قوطی، نبشی، تیرآهن یا ناودانی.",
                "سایز، ضخامت یا ابعاد مقطع را وارد کنید. برای تیرآهن و ناودانی فقط سایز را انتخاب کنید.",
                "طول را به متر وارد کنید. برای ورق، عرض را به میلی‌متر بنویسید.",
                "اگر چند شاخه یا چند ورق دارید، تعداد را وارد کنید تا وزن کل محاسبه شود.",
                "وزن کل بر حسب کیلوگرم را ببینید و برای قیمت، استعلام بگیرید.",
              ].map((s, i) => (
                <li key={i} className="flex gap-3">
                  <span className="flex h-7 w-7 flex-shrink-0 items-center justify-center rounded-full bg-blue text-xs font-extrabold text-white">
                    {(i + 1).toLocaleString("fa-IR")}
                  </span>
                  <span>{s}</span>
                </li>
              ))}
            </ol>
          </section>

          {/* سوالات متداول */}
          <section>
            <h2 className="mb-4 text-xl font-extrabold">سوالات متداول درباره‌ی وزن فولاد</h2>
            <div className="space-y-3">
              {FAQS.map((f) => (
                <details key={f.q} className="group rounded-card border border-black/5 bg-white p-5 dark:border-border-dark dark:bg-surface-dark">
                  <summary className="cursor-pointer list-none text-sm font-extrabold">{f.q}</summary>
                  <p className="mt-3 text-sm leading-7 text-ink/70">{f.a}</p>
                </details>
              ))}
            </div>
          </section>

          {/* ارتباط با سایر بخش‌ها */}
          <section className="rounded-card bg-navy p-7 text-white sm:p-9">
            <h2 className="mb-2 text-lg font-extrabold">وزن را محاسبه کردی، قیمتش را ببین</h2>
            <p className="mb-5 text-sm leading-7 text-[#B9C6DC]">
              قیمت روز محصولات را در لیست قیمت ببین یا برای خرید مستقیم استعلام بگیر.
            </p>
            <div className="flex flex-wrap gap-3">
              <Link href="/prices" className="rounded-btn bg-white px-5 py-2.5 text-sm font-bold text-navy">لیست قیمت روز</Link>
              <Link href="/rfq" className="rounded-btn border border-white/30 px-5 py-2.5 text-sm font-bold text-white">استعلام قیمت</Link>
              <Link href="/knowledge" className="rounded-btn border border-white/30 px-5 py-2.5 text-sm font-bold text-white">مرکز دانش فولاد</Link>
            </div>
          </section>
        </div>

        {/* ستون کناری */}
        <aside className="hidden lg:block">
          <div className="sticky top-24 space-y-4 rounded-card border border-black/5 bg-white p-5 dark:border-border-dark dark:bg-surface-dark">
            <div className="text-sm font-extrabold">دسترسی سریع</div>
            <Link href="/products" className="block text-sm text-blue hover:underline">محصولات فولادی</Link>
            <Link href="/prices" className="block text-sm text-blue hover:underline">لیست قیمت</Link>
            <Link href="/rfq" className="block text-sm text-blue hover:underline">استعلام قیمت</Link>
            <Link href="/knowledge" className="block text-sm text-blue hover:underline">مرکز دانش</Link>
          </div>
        </aside>
      </div>
    </div>
  );
}
