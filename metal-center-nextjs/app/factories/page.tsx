import { factories } from "@/lib/data";

export const metadata = { title: "کارخانه‌های تأییدشده", description: "شبکه‌ای از کارخانه‌های معتبر فولاد در سراسر ایران." };

export default function FactoriesPage() {
  return (
    <div className="mx-auto max-w-[1240px] px-6 py-10">
      <h1 className="mb-2 text-[28px] font-extrabold">کارخانه‌های تأییدشده</h1>
      <p className="mb-8 max-w-[560px] text-[14.5px] text-ink/50">
        شبکه‌ای از تولیدکنندگان معتبر فولاد با گواهی استاندارد و سابقه تأمین.
      </p>
      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
        {factories.map((f) => (
          <div key={f.name} className="overflow-hidden rounded-card border border-black/5 bg-white shadow-soft">
            <div className="relative h-[100px] bg-gradient-to-br from-[#123a6e] to-blue">
              <span className="absolute end-2.5 top-2.5 rounded-full bg-white/15 px-2.5 py-1 text-[10.5px] font-bold text-white backdrop-blur">
                ✓ تأییدشده
              </span>
            </div>
            <div className="p-5">
              <div className="-mt-9 mb-3 flex h-12 w-12 items-center justify-center rounded-xl border-4 border-white bg-white text-sm font-extrabold text-blue shadow-soft">
                {f.name.slice(0, 2)}
              </div>
              <div className="font-bold">{f.name}</div>
              <div className="mt-1 text-xs text-ink/50">{f.location}</div>
              <div className="mt-3 border-t border-black/5 pt-3 text-xs text-ink/50">
                <b className="text-ink">{f.products}</b> محصول فعال
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
