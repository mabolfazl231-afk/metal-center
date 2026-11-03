import { Phone, Mail, Send, Instagram, Linkedin } from "lucide-react";
import { PHONES, EMAIL, SOCIAL, WORKING_HOURS } from "@/lib/site";

export const metadata = { title: "تماس با ما", description: "راه‌های ارتباطی با تیم متال سنتر." };

const SOCIALS = [
  { label: "تلگرام", href: SOCIAL.telegram, Icon: Send },
  { label: "اینستاگرام", href: SOCIAL.instagram, Icon: Instagram },
  { label: "لینکدین", href: SOCIAL.linkedin, Icon: Linkedin },
];

export default function ContactPage() {
  return (
    <div className="mx-auto max-w-[1240px] px-6 py-10">
      <div className="mb-8 text-center">
        <h1 className="mb-2 text-[28px] font-extrabold">تماس با متال سنتر</h1>
        <p className="mx-auto max-w-[520px] text-[14.5px] text-ink/50 dark:text-white/40">
          سوالی دارید؟ با یکی از شماره‌های زیر تماس بگیرید یا پیام بگذارید.
        </p>
      </div>

      {/* شماره‌ها و ایمیل — روی هرکدام بزنی، مستقیم تماس یا ایمیل باز می‌شود */}
      <div className="mb-10 grid grid-cols-2 gap-3.5 lg:grid-cols-4">
        {PHONES.map((p) => (
          <a
            key={p.tel}
            href={`tel:${p.tel}`}
            className="flex flex-col items-center rounded-2xl border border-border-light bg-white p-5 text-center transition hover:-translate-y-0.5 hover:shadow-lifted dark:border-border-dark dark:bg-surface-dark"
          >
            <Phone size={20} className="mb-2 text-blue" />
            <div className="text-sm font-bold" dir="ltr">{p.display}</div>
          </a>
        ))}
        <a
          href={`mailto:${EMAIL}`}
          className="flex flex-col items-center rounded-2xl border border-border-light bg-white p-5 text-center transition hover:-translate-y-0.5 hover:shadow-lifted dark:border-border-dark dark:bg-surface-dark lg:col-span-4"
        >
          <Mail size={20} className="mb-2 text-blue" />
          <div className="break-all text-sm font-bold" dir="ltr">{EMAIL}</div>
        </a>
      </div>

      {/* ساعات کاری */}
      <div className="mx-auto mb-10 max-w-[640px] rounded-card border border-border-light bg-white p-6 dark:border-border-dark dark:bg-surface-dark">
        <h3 className="mb-4 text-center font-bold">ساعات کاری</h3>
        <div className="space-y-2 text-center text-sm">
          {WORKING_HOURS.map((w) => (
            <div key={w.days} className="flex justify-between gap-4 border-b border-black/5 pb-2 last:border-0 dark:border-white/10">
              <span className="font-bold">{w.days}</span>
              <span className="text-ink/60 dark:text-white/60">{w.hours}</span>
            </div>
          ))}
        </div>
      </div>

      {/* شبکه‌های اجتماعی */}
      <div className="mb-10 flex flex-wrap items-center justify-center gap-3">
        {SOCIALS.map(({ label, href, Icon }) => (
          <a
            key={label}
            href={href}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-2 rounded-pill border border-border-light bg-white px-5 py-2.5 text-sm font-bold transition hover:bg-blue hover:text-white dark:border-border-dark dark:bg-surface-dark"
          >
            <Icon size={16} /> {label}
          </a>
        ))}
      </div>

      <div className="mx-auto max-w-[640px] rounded-card border border-border-light bg-white p-7 dark:border-border-dark dark:bg-surface-dark">
        <h3 className="mb-5 font-bold">ارسال پیام</h3>
        <div className="space-y-3">
          <div className="grid grid-cols-2 gap-3">
            <input placeholder="نام و نام خانوادگی" className="rounded-xl border border-black/10 bg-steel p-3 text-sm" />
            <input placeholder="شماره موبایل" className="rounded-xl border border-black/10 bg-steel p-3 text-sm" />
          </div>
          <textarea placeholder="پیام شما" rows={4} className="w-full rounded-xl border border-black/10 bg-steel p-3 text-sm" />
          <button className="w-full rounded-btn bg-blue py-3.5 font-bold text-white hover:bg-navy">ارسال پیام</button>
        </div>
      </div>
    </div>
  );
}
