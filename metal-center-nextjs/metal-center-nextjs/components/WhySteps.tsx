"use client";

import { motion } from "framer-motion";
import { ShieldCheck, Zap, Wallet, Headphones, ClipboardList, FileSearch, FileCheck2, CreditCard, Truck } from "lucide-react";

const WHY_ITEMS = [
  { icon: ShieldCheck, title: "کارخانه‌های تأییدشده", desc: "همه‌ی تأمین‌کنندگان با گواهی استاندارد و بررسی اعتبار." },
  { icon: Zap, title: "قیمت لحظه‌ای", desc: "به‌روزرسانی هر ۱۵ دقیقه، بدون قیمت‌های کهنه." },
  { icon: Wallet, title: "بدون واسطه", desc: "خرید مستقیم از کارخانه با شفافیت کامل قیمت." },
  { icon: Headphones, title: "پشتیبانی کارشناسی", desc: "پاسخ‌گویی سریع کارشناسان فروش در تمام مراحل." },
];

const STEPS = [
  { icon: ClipboardList, title: "انتخاب محصول", desc: "سایز و استاندارد موردنیاز را مشخص کنید." },
  { icon: FileSearch, title: "انتخاب کارخانه", desc: "از بین تأمین‌کنندگان تأییدشده انتخاب کنید." },
  { icon: FileCheck2, title: "دریافت پیش‌فاکتور", desc: "کارشناس ما بهترین پیشنهاد را ارسال می‌کند." },
  { icon: CreditCard, title: "پرداخت", desc: "پرداخت امن و ثبت سفارش نهایی." },
  { icon: Truck, title: "ارسال", desc: "تحویل درب کارگاه یا بارگیری از کارخانه." },
];

const WHY_COLORS = ["#0A3D91", "#0CA678", "#E8590C", "#7048E8"];

export function WhyMetalCenter() {
  return (
    <section className="relative overflow-hidden bg-gradient-to-b from-white via-[#F3F7FF] to-white px-6 py-20 dark:bg-canvas-dark">
      <div className="pointer-events-none absolute -top-24 start-[-80px] h-72 w-72 rounded-full bg-[#0A3D91]/10 blur-3xl" />
      <div className="pointer-events-none absolute -bottom-24 end-[-80px] h-72 w-72 rounded-full bg-[#0CA678]/10 blur-3xl" />
      <div className="relative mx-auto max-w-[1240px]">
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="mb-12 text-center"
        >
          <span className="mb-3 inline-block rounded-pill bg-blue/10 px-4 py-1.5 text-xs font-extrabold text-blue">چرا متال سنتر</span>
          <h2 className="text-[28px] font-extrabold leading-tight sm:text-[34px]">
            پلتفرمی که <span className="bg-gradient-to-l from-[#0A3D91] to-[#0CA678] bg-clip-text text-transparent">به آن اعتماد می‌کنید</span>
          </h2>
        </motion.div>

        <div className="grid grid-cols-2 gap-4 lg:grid-cols-4 sm:gap-5">
          {WHY_ITEMS.map((item, i) => {
            const color = WHY_COLORS[i % WHY_COLORS.length];
            return (
              <motion.div
                key={item.title}
                initial={{ opacity: 0, y: 24 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, amount: 0.3 }}
                transition={{ duration: 0.45, delay: i * 0.08 }}
                whileHover={{ y: -8, scale: 1.02 }}
                className="group relative overflow-hidden rounded-card border border-white bg-white p-6 text-center shadow-soft transition-shadow hover:shadow-lifted dark:bg-surface-dark"
              >
                <div
                  className="pointer-events-none absolute inset-x-0 top-0 h-1.5"
                  style={{ background: `linear-gradient(90deg, ${color}, ${color}66)` }}
                />
                <div
                  className="mx-auto mb-5 flex h-16 w-16 items-center justify-center rounded-2xl text-white shadow-glow transition-transform duration-300 group-hover:rotate-6 group-hover:scale-110"
                  style={{ background: `linear-gradient(135deg, ${color}, ${color}aa)` }}
                >
                  <item.icon size={28} />
                </div>
                <div className="mb-2 text-[15px] font-extrabold">{item.title}</div>
                <p className="text-[13px] leading-6 text-ink/60 dark:text-white/50">{item.desc}</p>
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
}

export function BuyingSteps() {
  return (
    <section className="bg-steel px-6 py-16 dark:bg-white/[0.02]">
      <div className="mx-auto max-w-[1240px]">
        <div className="mb-12 text-center">
          <span className="mb-2 block text-[12.5px] font-bold text-blue">فرآیند خرید</span>
          <h2 className="text-[26px] font-extrabold">مراحل خرید از متال سنتر</h2>
        </div>

        {/* Desktop timeline */}
        <div className="relative hidden lg:flex lg:justify-between">
          <div className="absolute inset-x-0 top-7 h-0.5 bg-border-light dark:bg-border-dark" />
          {STEPS.map((s, i) => (
            <div key={s.title} className="relative z-10 flex w-1/5 flex-col items-center text-center">
              <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-full border-4 border-steel bg-blue text-white shadow-glow dark:border-white/[0.02]">
                <s.icon size={22} />
              </div>
              <div className="mb-1 text-xs font-bold text-blue">مرحله {i + 1}</div>
              <div className="mb-1 text-sm font-bold">{s.title}</div>
              <p className="max-w-[160px] text-[11.5px] leading-6 text-ink/50 dark:text-white/40">{s.desc}</p>
            </div>
          ))}
        </div>

        {/* Mobile vertical timeline */}
        <div className="relative space-y-6 ps-8 lg:hidden">
          <div className="absolute bottom-2 start-[22px] top-2 w-0.5 bg-border-light dark:bg-border-dark" />
          {STEPS.map((s, i) => (
            <div key={s.title} className="relative">
              <div className="absolute -start-8 flex h-11 w-11 items-center justify-center rounded-full bg-blue text-white">
                <s.icon size={18} />
              </div>
              <div className="ms-2 rounded-2xl border border-border-light bg-white p-4 dark:border-border-dark dark:bg-surface-dark">
                <div className="mb-1 text-[11px] font-bold text-blue">مرحله {i + 1}</div>
                <div className="mb-1 text-sm font-bold">{s.title}</div>
                <p className="text-xs text-ink/50 dark:text-white/40">{s.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
