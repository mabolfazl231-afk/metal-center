import Link from "next/link";
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
          <div key={f.name} className="flex flex-col overflow-hidden rounded-card border border-border-light bg-white shadow-soft dark:border-border-dark dark:bg-surface-dark">
            {/* لوگو کل بالای کارت را پر می‌کند؛ کلیک، لیست قیمت همان کارخانه را باز می‌کند */}
            <Link href={`/prices?factory=${encodeURIComponent(f.name)}`} className="flex h-[170px] items-center justify-center bg-logo-white p-6">
              {f.logoUrl ? (
                <FactoryLogo slug={f.slug} name={f.name} url={f.logoUrl} />
              ) : (
                <span className="text-4xl font-extrabold text-blue">{f.name.slice(0, 2)}</span>
              )}
            </Link>
            <div className="flex flex-1 flex-col p-5">
              <Link href={`/prices?factory=${encodeURIComponent(f.name)}`} className="font-bold hover:text-blue">
                {f.name}
              </Link>
              <div className="mt-1 text-xs text-ink/50 dark:text-white/40">{infoOf(f)}</div>
              {productsOf(f) !== undefined && (
                <div className="mt-3 border-t border-black/5 pt-3 text-xs text-ink/50 dark:text-white/40">
                  <b className="text-ink dark:text-white">{productsOf(f)}</b> محصول فعال
                </div>
              )}
              <Link href={`/prices?factory=${encodeURIComponent(f.name)}`} className="mt-4 text-xs font-bold text-blue">
                مشاهده لیست قیمت ←
              </Link>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
