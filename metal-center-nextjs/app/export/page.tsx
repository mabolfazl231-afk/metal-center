import { incoterms } from "@/lib/data";
import { fetchPage } from "@/lib/cms";
import PageBanner from "@/components/PageBanner";

export const metadata = { title: "صادرات آهن‌آلات", description: "صادرات آهن‌آلات با اینکوترمز استاندارد و مستندسازی کامل گمرکی." };
export const revalidate = 60;

export default async function ExportPage() {
  const page = await fetchPage("export");
  return (
    <div className="mx-auto max-w-[1240px] px-6 py-10">
      <PageBanner
        page={page}
        fallbackTitle="پلتفرم صادرات آهن‌آلات متال سنتر"
        fallbackSubtitle="از مستندسازی گمرکی تا حمل بین‌المللی — تیم صادرات ما فرآیند خرید و ارسال آهن‌آلات به خارج از کشور را ساده می‌کند."
      />

      <h2 className="mb-5 text-lg font-extrabold">اینکوترمز پشتیبانی‌شده</h2>
      <div className="grid grid-cols-2 gap-3.5 lg:grid-cols-4">
        {incoterms.map((t) => (
          <div key={t.code} className="rounded-2xl border border-border-light bg-white dark:border-border-dark dark:bg-surface-dark p-4">
            <div className="mb-1.5 text-base font-extrabold text-blue">{t.code}</div>
            <div className="text-xs leading-6 text-ink/50 dark:text-white/40">{t.desc}</div>
          </div>
        ))}
      </div>
    </div>
  );
}
