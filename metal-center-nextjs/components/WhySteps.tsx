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

export function WhyMetalCenter() {
  return (
    <section className="bg-white px-6 py-16 dark:bg-canvas-dark">
      <div className="mx-auto max-w-[1240px]">
        <div className="mb-10 text-center">
          <span className="mb-2 block text-[12.5px] font-bold text-blue">چرا متال سنتر</span>
          <h2 className="text-[26px] font-extrabold">پلتفرمی که به آن اعتماد می‌کنید</h2>
        </div>
        <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
          {WHY_ITEMS.map((item) => (
            <div
              key={item.title}
              className="rounded-card border border-border-light bg-white p-6 text-center shadow-soft transition-all hover:-translate-y-1 hover:shadow-lifted dark:border-border-dark dark:bg-surface-dark"
            >
              <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-blue/10 to-blue/5">
                <item.icon size={26} className="text-blue" />
              </div>
              <div className="mb-1.5 font-bold">{item.title}</div>
              <p className="text-xs leading-6 text-ink/50 dark:text-white/40">{item.desc}</p>
            </div>
          ))}
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
