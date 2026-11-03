import { Phone, Mail, Send, Instagram, Linkedin, Clock } from "lucide-react";
import type { CSSProperties } from "react";
import { PHONES, EMAIL, SOCIAL, WORKING_HOURS } from "@/lib/site";
import Reveal from "@/components/Reveal";
import ContactForm from "@/components/contact/ContactForm";

export const metadata = { title: "تماس با ما", description: "راه‌های ارتباطی با تیم متال سنتر." };

const SOCIALS = [
  { label: "تلگرام", href: SOCIAL.telegram, Icon: Send },
  { label: "اینستاگرام", href: SOCIAL.instagram, Icon: Instagram },
  { label: "لینکدین", href: SOCIAL.linkedin, Icon: Linkedin },
];

export default function ContactPage() {
  return (
    <div className="mx-auto max-w-[1240px] px-6 py-12">
      <Reveal className="mb-10 text-center">
        <h1 className="mb-2 text-[28px] font-extrabold">تماس با متال سنتر</h1>
        <p className="mx-auto max-w-[520px] text-[14.5px] text-ink/50 dark:text-white/40">
          سوالی دارید؟ با یکی از راه‌های زیر تماس بگیرید یا پیام بگذارید.
        </p>
      </Reveal>

      <div className="grid items-start gap-6 lg:grid-cols-[minmax(0,5fr)_minmax(0,6fr)] lg:gap-8">
        {/* ستون اول (سمت راست در RTL): اطلاعات تماس */}
        <Reveal className="space-y-5">
          <div className="relative overflow-hidden rounded-card bg-gradient-to-br from-navy to-[#0A2547] p-7 text-white shadow-lifted">
            <div className="pointer-events-none absolute -end-10 -top-10 h-40 w-40 rounded-full bg-[#1E5BC6]/30 blur-3xl" />
            <h2 className="relative mb-1 text-lg font-extrabold">راه‌های ارتباطی</h2>
            <p className="relative mb-5 text-sm text-[#B9C6DC]">روی هر مورد بزنید تا مستقیم تماس یا ایمیل باز شود.</p>

            <div className="relative space-y-2.5">
              {PHONES.map((p) => (
                <a key={p.tel} href={`tel:${p.tel}`} className="flex items-center gap-3 rounded-2xl bg-white/10 px-4 py-3 transition hover:bg-white/15">
                  <span className="icon-3d flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-xl" style={{ "--tile": "#1E5BC6" } as CSSProperties}>
                    <Phone size={17} />
                  </span>
                  <span className="text-sm font-bold" dir="ltr">{p.display}</span>
                </a>
              ))}
              <a href={`mailto:${EMAIL}`} className="flex items-center gap-3 rounded-2xl bg-white/10 px-4 py-3 transition hover:bg-white/15">
                <span className="icon-3d flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-xl" style={{ "--tile": "#7048E8" } as CSSProperties}>
                  <Mail size={17} />
                </span>
                <span className="break-all text-sm font-bold" dir="ltr">{EMAIL}</span>
              </a>
            </div>
          </div>

          <div className="rounded-card border border-border-light bg-white p-6 shadow-soft dark:border-border-dark dark:bg-surface-dark">
            <h3 className="mb-4 flex items-center gap-2 font-bold">
              <Clock size={17} className="text-blue" /> ساعات کاری
            </h3>
            <div className="space-y-2 text-sm">
              {WORKING_HOURS.map((w) => (
                <div key={w.days} className="flex justify-between gap-4 border-b border-black/5 pb-2 last:border-0 dark:border-white/10">
                  <span className="font-bold">{w.days}</span>
                  <span className="text-ink/60 dark:text-white/60">{w.hours}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="flex flex-wrap gap-3">
            {SOCIALS.map(({ label, href, Icon }) => (
              <a
                key={label}
                href={href}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2 rounded-pill border border-border-light bg-white px-5 py-2.5 text-sm font-bold shadow-soft transition hover:-translate-y-0.5 hover:bg-blue hover:text-white dark:border-border-dark dark:bg-surface-dark"
              >
                <Icon size={16} /> {label}
              </a>
            ))}
          </div>
        </Reveal>

        {/* ستون دوم (سمت چپ در RTL): فرم پیام — پیام‌ها در پنل ادمین دیده می‌شوند */}
        <Reveal delay={0.1}>
          <ContactForm />
        </Reveal>
      </div>
    </div>
  );
}
