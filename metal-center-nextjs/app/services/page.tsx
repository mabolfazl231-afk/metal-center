import Link from "next/link";
import { services as fallbackServices } from "@/lib/data";
import { fetchServices, SERVICE_ICONS, type Service } from "@/lib/cms";

export const metadata = { title: "خدمات", description: "برش، خم‌کاری، گالوانیزه، لجستیک و صادرات فولاد." };
export const revalidate = 60;

// خدمات پیش‌فرض، وقتی در پنل ادمین خدمتی ثبت نشده است
const DEFAULT_LIST: Service[] = fallbackServices.map((s) => ({
  id: s.title,
  title: s.title,
  description: s.desc,
  icon: "Wrench",
  sort_order: 0,
  active: true,
}));

export default async function ServicesPage() {
  const db = await fetchServices();
  const list = db ?? DEFAULT_LIST;

  return (
    <div className="mx-auto max-w-[1240px] px-6 py-10">
      <div className="mb-10 text-center">
        <h1 className="mb-2 text-[28px] font-extrabold">خدمات متال سنتر</h1>
        <p className="mx-auto max-w-[540px] text-[14.5px] text-ink/50 dark:text-white/40">
          فراتر از خرید و فروش — خدمات تکمیلی برای آماده‌سازی و تحویل محصول فولادی شما.
        </p>
      </div>
      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
        {list.map((s) => {
          const Icon = SERVICE_ICONS[s.icon] ?? SERVICE_ICONS.Wrench;
          return (
            <div key={s.id} className="rounded-card border border-border-light bg-white p-6 shadow-soft dark:border-border-dark dark:bg-surface-dark">
              <span className="mb-4 flex h-11 w-11 items-center justify-center rounded-xl bg-blue/10 text-blue">
                <Icon size={20} />
              </span>
              <h3 className="mb-2 font-bold">{s.title}</h3>
              <p className="mb-4 text-[13px] leading-7 text-ink/50 dark:text-white/40">{s.description}</p>
              <Link href="/rfq" className="text-xs font-bold text-blue">
                درخواست این خدمت ←
              </Link>
            </div>
          );
        })}
      </div>
    </div>
  );
}
