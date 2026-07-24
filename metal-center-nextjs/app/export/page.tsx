import { incoterms } from "@/lib/data";

export const metadata = { title: "صادرات فولاد", description: "صادرات فولاد با اینکوترمز استاندارد و مستندسازی کامل گمرکی." };

export default function ExportPage() {
  return (
    <div className="mx-auto max-w-[1240px] px-6 py-10">
      <div className="mb-10 rounded-card bg-navy p-10 text-center text-white">
        <h1 className="mb-3 text-2xl font-extrabold">پلتفرم صادرات فولاد متال سنتر</h1>
        <p className="mx-auto max-w-[560px] text-sm text-[#B9C6DC]">
          از مستندسازی گمرکی تا حمل بین‌المللی — تیم صادرات ما فرآیند خرید و ارسال فولاد به خارج از کشور را ساده می‌کند.
        </p>
      </div>

      <h2 className="mb-5 text-lg font-extrabold">اینکوترمز پشتیبانی‌شده</h2>
      <div className="grid grid-cols-2 gap-3.5 lg:grid-cols-4">
        {incoterms.map((t) => (
          <div key={t.code} className="rounded-2xl border border-black/5 bg-white p-4">
            <div className="mb-1.5 text-base font-extrabold text-blue">{t.code}</div>
            <div className="text-xs leading-6 text-ink/50">{t.desc}</div>
          </div>
        ))}
      </div>
    </div>
  );
}
