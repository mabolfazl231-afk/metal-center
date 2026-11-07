import { factories as staticFactories } from "@/lib/data";
import { fetchFactoryCards, fetchPage, type FactoryCard } from "@/lib/cms";
import PageBanner from "@/components/PageBanner";
import FactoryLogo from "@/components/factories/FactoryLogo";

export const metadata = { title: "کارخانه‌های تأییدشده", description: "شبکه‌ای از کارخانه‌های معتبر آهن‌آلات در سراسر ایران." };
export const revalidate = 60;

// فهرست ثابت، وقتی هنوز کارخانه‌ای در پنل ثبت نشده است
const FALLBACK: FactoryCard[] = staticFactories.map((f) => ({ name: f.name, slug: f.slug, logoUrl: null, location: null }));

export default async function FactoriesPage() {
  const [db, page] = await Promise.all([fetchFactoryCards(), fetchPage("factories")]);
  const list = db ?? FALLBACK;
  const infoOf = (f: FactoryCard) => {
    const s = staticFactories.find((x) => x.name === f.name);
    return s ? s.cats : f.location ?? "";
  };
  const productsOf = (f: FactoryCard) => staticFactories.find((x) => x.name === f.name)?.products;

  return (
    <div className="mx-auto max-w-[1240px] px-6 py-10">
      <PageBanner
        page={page}
        fallbackTitle="کارخانه‌های تأییدشده"
        fallbackSubtitle="شبکه‌ای از تولیدکنندگان معتبر آهن‌آلات با گواهی استاندارد و سابقه تأمین."
      />
      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
        {list.map((f) => (
          <div key={f.name} className="overflow-hidden rounded-card border border-border-light bg-white shadow-soft dark:border-border-dark dark:bg-surface-dark">
            <div className="relative h-[100px] bg-gradient-to-br from-[#123a6e] to-blue">
              <span className="absolute end-2.5 top-2.5 rounded-full bg-white/15 px-2.5 py-1 text-[10.5px] font-bold text-white backdrop-blur">
                ✓ تأییدشده
              </span>
            </div>
            <div className="p-5">
              <div className="-mt-9 mb-3 flex h-12 w-14 items-center justify-center overflow-hidden rounded-xl border-4 border-white bg-white p-1 text-sm font-extrabold text-blue shadow-soft">
                {f.logoUrl ? (
                  <FactoryLogo slug={f.slug} name={f.name} url={f.logoUrl} />
                ) : (
                  f.name.slice(0, 2)
                )}
              </div>
              <div className="font-bold">{f.name}</div>
              <div className="mt-1 text-xs text-ink/50 dark:text-white/40">{infoOf(f)}</div>
              {productsOf(f) !== undefined && (
                <div className="mt-3 border-t border-black/5 pt-3 text-xs text-ink/50 dark:text-white/40">
                  <b className="text-ink">{productsOf(f)}</b> محصول فعال
                </div>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
