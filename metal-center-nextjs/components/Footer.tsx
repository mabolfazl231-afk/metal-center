import Link from "next/link";
import Image from "next/image";
import { Instagram, Send, Linkedin, MapPin, Phone, Mail, Download } from "lucide-react";

const COLUMNS = [
  {
    title: "محصولات",
    links: [
      { href: "/products", label: "میلگرد" },
      { href: "/products", label: "تیرآهن" },
      { href: "/products", label: "ورق" },
      { href: "/products", label: "پروفیل و قوطی" },
    ],
  },
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
    title: "خدمات",
    links: [
      { href: "/services", label: "خدمات صنعتی" },
      { href: "/export", label: "صادرات" },
      { href: "/assistant", label: "دستیار هوشمند" },
    ],
  },
  {
    title: "شرکت",
    links: [
      { href: "/about", label: "درباره ما" },
      { href: "/contact", label: "تماس با ما" },
    ],
  },
];

export default function Footer() {
  return (
    <footer className="mt-10 bg-navy pt-14 text-[#B9C6DC]">
      <div className="mx-auto max-w-[1240px] px-6">
        <div className="grid grid-cols-1 gap-10 border-b border-white/10 pb-10 sm:grid-cols-2 md:grid-cols-6">
          <div className="md:col-span-2">
            <div className="mb-3 flex items-center gap-2.5 text-[19px] font-extrabold text-white">
              <Image src="/logo.png" alt="متال سنتر" width={36} height={36} className="rounded-[10px]" />
              متال سنتر
            </div>
            <p className="mb-5 max-w-[280px] text-[13px] leading-8">
              پلتفرم هوشمند قیمت‌گذاری، تأمین و خرید فولاد برای پیمانکاران و صنعتگران.
            </p>
            <div className="space-y-2 text-[12.5px]">
              <div className="flex items-center gap-2"><Phone size={14} /> 021-9199-0000</div>
              <div className="flex items-center gap-2"><Mail size={14} /> info@metalcenter.ir</div>
              <div className="flex items-center gap-2"><MapPin size={14} /> تهران، خیابان آزادی</div>
            </div>
          </div>

          {COLUMNS.map((col) => (
            <div key={col.title}>
              <h4 className="mb-3.5 text-[13px] font-bold text-white">{col.title}</h4>
              {col.links.map((l) => (
                <Link key={l.label} href={l.href} className="block py-1.5 text-[13.5px] transition-colors hover:text-white">
                  {l.label}
                </Link>
              ))}
            </div>
          ))}
        </div>

        <div className="flex flex-wrap items-center justify-between gap-4 py-6">
          <div className="flex gap-2.5">
            {[Instagram, Send, Linkedin].map((Icon, i) => (
              <a key={i} href="#" className="flex h-9 w-9 items-center justify-center rounded-xl bg-white/5 transition-colors hover:bg-white/10">
                <Icon size={16} />
              </a>
            ))}
          </div>
          <button className="flex items-center gap-2 rounded-btn border border-white/15 px-4 py-2.5 text-xs font-semibold text-white hover:bg-white/5">
            <Download size={14} /> دانلود کاتالوگ محصولات (PDF)
          </button>
        </div>

        <div className="flex flex-wrap items-center justify-between gap-2.5 border-t border-white/10 py-5 text-[12.5px] text-[#6F7F9C]">
          <span>© ۱۴۰۴ متال سنتر. تمامی حقوق محفوظ است.</span>
          <span>ساخته‌شده برای صنعت فولاد ایران</span>
        </div>
      </div>
    </footer>
  );
}
