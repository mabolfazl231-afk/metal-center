export const metadata = { title: "درباره ما", description: "درباره مأموریت، چشم‌انداز و ارزش‌های متال سنتر." };

const values = ["اعتماد", "دقت", "شفافیت", "نوآوری", "موفقیت مشتری"];

export default function AboutPage() {
  return (
    <div className="mx-auto max-w-[1240px] px-6 py-10">
      <div className="mx-auto mb-10 max-w-[640px] text-center">
        <h1 className="mb-3 text-[29px] font-extrabold">درباره متال سنتر</h1>
        <p className="text-[14.5px] leading-8 text-ink/50 dark:text-white/40">
          متال سنتر با هدف ساده‌سازی فرآیند خرید فولاد برای پیمانکاران، تولیدکنندگان و بازرگانان ایرانی
          راه‌اندازی شده — با تکیه بر شفافیت قیمت، سرعت پاسخ‌گویی و شبکه‌ای از کارخانه‌های معتبر.
        </p>
      </div>

      <div className="mb-10 grid grid-cols-1 gap-5 sm:grid-cols-2">
        <div className="rounded-card border border-border-light bg-white dark:border-border-dark dark:bg-surface-dark p-7">
          <h3 className="mb-2.5 font-bold">مأموریت ما</h3>
          <p className="text-[13.5px] leading-8 text-ink/50 dark:text-white/40">
            ارائه اطلاعات قیمتی دقیق، خدمات تأمین و ابزارهای خرید هوشمند برای خریداران فولاد در سراسر ایران.
          </p>
        </div>
        <div className="rounded-card border border-border-light bg-white dark:border-border-dark dark:bg-surface-dark p-7">
          <h3 className="mb-2.5 font-bold">چشم‌انداز ما</h3>
          <p className="text-[13.5px] leading-8 text-ink/50 dark:text-white/40">
            تبدیل‌شدن به پیشروترین پلتفرم هوشمند فولاد و صنایع فلزی در منطقه.
          </p>
        </div>
      </div>

      <h2 className="mb-5 text-center text-lg font-extrabold">ارزش‌های اصلی</h2>
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-5">
        {values.map((v) => (
          <div key={v} className="rounded-2xl border border-border-light bg-white dark:border-border-dark dark:bg-surface-dark p-4 text-center text-sm font-bold">
            {v}
          </div>
        ))}
      </div>
    </div>
  );
}
