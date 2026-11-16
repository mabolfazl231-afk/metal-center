import Link from "next/link";
import Image from "next/image";
import { Instagram, Send, Linkedin, Phone, Mail, Download } from "lucide-react";
import { fetchSettings, fetchMenu } from "@/lib/cms";
import { Reveal, FlowLine } from "@/components/FooterMotion";

// پیش‌فرض، وقتی منوی فوتر در پنل ادمین خالی است
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
      { href: "/prices", label: "لیست قیمت" },
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

// سال شمسی جاری، همیشه درست
const PERSIAN_YEAR = new Intl.DateTimeFormat("fa-IR-u-ca-persian", { year: "numeric" }).format(new Date());

export default async function Footer() {
  const [s, menu] = await Promise.all([fetchSettings(), fetchMenu("footer")]);
  const columns =
    menu.length > 0 ? [{ title: "دسترسی سریع", links: menu.map((m) => ({ href: m.href, label: m.label })) }] : COLUMNS;
  const socials = [
    { label: "تلگرام", href: s.telegram, Icon: Send },
    { label: "اینستاگرام", href: s.instagram, Icon: Instagram },
    { label: "لینکدین", href: s.linkedin, Icon: Linkedin },
  ].filter((x) => x.href);

  return (
    <footer className="relative mt-12 overflow-hidden bg-navy text-[#B9C6DC]">
      <FlowLine />

      {/* روی گوشی فضای پایین برای نوار منوی شناور باز گذاشته شده */}
      <div className="mx-auto max-w-[1240px] px-6 pt-9 pb-28 md:pb-5">
        {/* بالای فوتر: برند، تماس و شبکه‌ها در یک ردیف */}
        <Reveal className="flex flex-wrap items-center justify-between gap-5 border-b border-white/10 pb-7">
          <div className="flex min-w-0 items-center gap-3">
            <Image src="/logo.png" alt="متال سنتر" width={36} height={36} className="flex-shrink-0 rounded-[10px]" />
            <div className="min-w-0">
              <div className="text-[16px] font-extrabold text-white">متال سنتر</div>
              <p className="max-w-[360px] truncate text-[12px] text-[#8A9AB8]">
                {s.site_description || "پلتفرم هوشمند قیمت‌گذاری، تأمین و خرید آهن‌آلات برای پیمانکاران و صنعتگران."}
              </p>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-x-5 gap-y-2 text-[12.5px]">
            {s.phones.map((p) => (
              <a key={p.tel} href={`tel:${p.tel}`} dir="ltr" className="flex items-center gap-1.5 transition-colors hover:text-white">
                <Phone size={13} /> {p.display}
              </a>
            ))}
            {s.email && (
              <a href={`mailto:${s.email}`} dir="ltr" className="flex items-center gap-1.5 transition-colors hover:text-white">
                <Mail size={13} /> {s.email}
              </a>
            )}
          </div>

          {socials.length > 0 && (
            <div className="flex gap-2">
              {socials.map(({ label, href, Icon }) => (
                <a
                  key={label}
                  href={href}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label={label}
                  className="flex h-8 w-8 items-center justify-center rounded-lg bg-white/5 transition-all duration-200 hover:-translate-y-0.5 hover:bg-white/10 hover:text-white"
                >
                  <Icon size={15} />
                </a>
              ))}
            </div>
          )}
        </Reveal>

        {/* لینک‌ها: فشرده، در ۴ ستون */}
        <div className="grid grid-cols-2 gap-x-8 gap-y-6 py-7 md:grid-cols-4">
          {columns.map((col, i) => (
            <Reveal key={col.title} delay={0.06 * i}>
              <h4 className="mb-3 text-[12px] font-bold text-white/90">{col.title}</h4>
              <ul className="space-y-1">
                {col.links.map((l) => (
                  <li key={`${l.href}-${l.label}`}>
                    <Link
                      href={l.href}
                      className="inline-block text-[13px] text-[#B9C6DC] transition-all duration-200 hover:-translate-x-1 hover:text-white"
                    >
                      {l.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </Reveal>
          ))}
        </div>

        {/* پایین: کپی‌رایت و کاتالوگ */}
        <Reveal className="flex flex-wrap items-center justify-between gap-3 border-t border-white/10 pt-4 pb-1 text-[12px] text-[#6F7F9C]">
          <div className="flex flex-wrap items-center gap-4">
            {/* نماد اعتماد الکترونیک (اینماد) */}
            <a
              referrerPolicy="origin"
              target="_blank"
              rel="noopener noreferrer"
              href="https://trustseal.enamad.ir/?id=8605075&Code=bIe1f0X03fgKyavuDUf7K17NbqIfa27p"
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                referrerPolicy="origin"
                src="https://trustseal.enamad.ir/logo.aspx?id=8605075&Code=bIe1f0X03fgKyavuDUf7K17NbqIfa27p"
                alt="نماد اعتماد الکترونیک"
                style={{ cursor: "pointer" }}
                className="h-[56px] w-auto"
              />
            </a>
            <span>© {PERSIAN_YEAR} متال سنتر. تمامی حقوق محفوظ است.</span>
          </div>
          {s.catalog_pdf_url ? (
            <a
              href={s.catalog_pdf_url}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-1.5 rounded-btn border border-white/15 px-3 py-2 text-[12px] font-semibold text-white transition-colors hover:bg-white/5"
            >
              <Download size={13} /> دانلود کاتالوگ (PDF)
            </a>
          ) : (
            <button disabled title="به‌زودی" className="flex items-center gap-1.5 rounded-btn border border-white/15 px-3 py-2 text-[12px] font-semibold text-white/50">
              <Download size={13} /> دانلود کاتالوگ (PDF)
            </button>
          )}
        </Reveal>
      </div>
    </footer>
  );
}
