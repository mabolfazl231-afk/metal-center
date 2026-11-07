import Link from "next/link";
import { services as fallbackServices } from "@/lib/data";
import { fetchPage, fetchServices, SERVICE_ICONS, type Service } from "@/lib/cms";
import PageBanner from "@/components/PageBanner";

export const metadata = { title: "خدمات", description: "برش، خم‌کاری، گالوانیزه، لجستیک و صادرات آهن‌آلات." };
export const revalidate = 60;

// خدمات پیش‌فرض، وقتی در پنل ادمین خدمتی ثبت نشده است
const DEFAULT_LIST: Service[] = fallbackServices.map((s) => ({
  id: s.title,
  title: s.title,
  description: s.desc,
  icon: "Wrench",
  image_url: null,
  sort_order: 0,
  active: true,
}));

export default async function ServicesPage() {
  const [db, page] = await Promise.all([fetchServices(), fetchPage("services")]);
  const list = db ?? DEFAULT_LIST;

  return (
    <div className="mx-auto max-w-[1240px] px-6 py-10">
      <PageBanner
        page={page}
        fallbackTitle="خدمات متال سنتر"
        fallbackSubtitle="فراتر از خرید و فروش — خدمات تکمیلی برای آماده‌سازی و تحویل محصول آهن‌آلاتی شما."
      />
      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
        {list.map((s) => {
          const Icon = SERVICE_ICONS[s.icon] ?? SERVICE_ICONS.Wrench;
          return (
            <div key={s.id} className="overflow-hidden rounded-card border border-border-light bg-white shadow-soft dark:border-border-dark dark:bg-surface-dark">
              {s.image_url && (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={s.image_url} alt={s.title} loading="lazy" className="h-40 w-full object-cover" />
              )}
              <div className="p-6">
                <span className="mb-4 flex h-11 w-11 items-center justify-center rounded-xl bg-blue/10 text-blue">
                  <Icon size={20} />
                </span>
                <h3 className="mb-2 font-bold">{s.title}</h3>
                <p className="mb-4 text-[13px] leading-7 text-ink/50 dark:text-white/40">{s.description}</p>
                <Link href="/rfq" className="text-xs font-bold text-blue">
                  درخواست این خدمت ←
                </Link>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
