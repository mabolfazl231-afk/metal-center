export const metadata = { title: "تماس با ما", description: "راه‌های ارتباطی با تیم متال سنتر." };

const info = [
  { t1: "تلفن پشتیبانی", t2: "021-9199-0000" },
  { t1: "ایمیل", t2: "info@metalcenter.ir" },
  { t1: "آدرس دفتر مرکزی", t2: "تهران، خیابان آزادی" },
  { t1: "ساعات کاری", t2: "شنبه تا پنج‌شنبه ۸-۱۷" },
];

export default function ContactPage() {
  return (
    <div className="mx-auto max-w-[1240px] px-6 py-10">
      <div className="mb-8 text-center">
        <h1 className="mb-2 text-[28px] font-extrabold">تماس با متال سنتر</h1>
        <p className="mx-auto max-w-[520px] text-[14.5px] text-ink/50">
          سوالی دارید؟ تیم ما آماده پاسخ‌گویی است.
        </p>
      </div>

      <div className="mb-10 grid grid-cols-2 gap-3.5 lg:grid-cols-4">
        {info.map((i) => (
          <div key={i.t1} className="rounded-2xl border border-black/5 bg-white p-5 text-center">
            <div className="mb-1 text-sm font-bold">{i.t1}</div>
            <div className="text-xs text-ink/50" dir="ltr">{i.t2}</div>
          </div>
        ))}
      </div>

      <div className="mx-auto max-w-[640px] rounded-card border border-black/5 bg-white p-7">
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
