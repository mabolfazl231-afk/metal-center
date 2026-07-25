import Link from "next/link";
import Image from "next/image";

const COLUMNS = [
  {
    title: "پلتفرم",
    links: [
      { href: "/prices", label: "قیمت روز" },
      { href: "/rfq", label: "استعلام قیمت" },
      { href: "/factories", label: "کارخانه‌ها" },
      { href: "/knowledge", label: "مرکز دانش" },
    ],
  },
  {
    title: "شرکت",
    links: [
      { href: "/about", label: "درباره ما" },
      { href: "/export", label: "صادرات" },
      { href: "/contact", label: "تماس با ما" },
      { href: "/services", label: "خدمات" },
    ],
  },
];

export default function Footer() {
  return (
    <footer className="mt-10 bg-navy py-14 text-[#B9C6DC]">
      <div className="mx-auto max-w-[1240px] px-6">
        <div className="grid grid-cols-1 gap-8 border-b border-white/10 pb-9 sm:grid-cols-2 md:grid-cols-4">
          <div>
            <div className="mb-3 flex items-center gap-2.5 text-[19px] font-extrabold text-white">
              <Image src="/logo.png" alt="متال سنتر" width={34} height={34} className="rounded-[10px]" />
              متال سنتر
            </div>
            <p className="max-w-[260px] text-[13px] leading-8">
              پلتفرم هوشمند قیمت‌گذاری، تأمین و خرید فولاد برای پیمانکاران و صنعتگران.
            </p>
          </div>
          {COLUMNS.map((col) => (
            <div key={col.title}>
              <h4 className="mb-3.5 text-[13px] font-bold text-white">{col.title}</h4>
              {col.links.map((l) => (
                <Link key={l.href} href={l.href} className="block py-1.5 text-[13.5px] hover:text-white">
                  {l.label}
                </Link>
              ))}
            </div>
          ))}
        </div>
        <div className="flex flex-wrap items-center justify-between gap-2.5 pt-5 text-[12.5px] text-[#6F7F9C]">
          <span>© ۱۴۰۴ متال سنتر. تمامی حقوق محفوظ است.</span>
          <span>ساخته‌شده برای صنعت فولاد ایران</span>
        </div>
      </div>
    </footer>
  );
}
