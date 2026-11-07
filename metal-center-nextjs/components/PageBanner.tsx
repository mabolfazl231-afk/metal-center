import type { SitePage } from "@/lib/cms";

// بنر بالای هر صفحه: اگر در پنل «صفحات سایت» بنر و متن ثبت شده باشد نمایش داده می‌شود،
// وگرنه همان عنوان و توضیح پیش‌فرض کد.
export default function PageBanner({
  page,
  fallbackTitle,
  fallbackSubtitle = "",
}: {
  page: SitePage | null;
  fallbackTitle: string;
  fallbackSubtitle?: string;
}) {
  const title = page?.title || fallbackTitle;
  const subtitle = page?.subtitle || fallbackSubtitle;
  const hasBanner = !!page?.banner_url;

  return (
    <div className="mb-10">
      <div
        className={`relative overflow-hidden rounded-card px-6 py-12 text-center text-white shadow-lifted sm:py-16 ${
          hasBanner ? "bg-navy" : "bg-gradient-to-l from-navy to-blue"
        }`}
      >
        {hasBanner && (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={page!.banner_url!} alt="" className="absolute inset-0 h-full w-full object-cover opacity-45" />
        )}
        <div className="relative">
          <h1 className="mb-3 text-[26px] font-extrabold sm:text-[32px]">{title}</h1>
          {subtitle && <p className="mx-auto max-w-[560px] text-[14.5px] leading-7 text-white/80">{subtitle}</p>}
        </div>
      </div>
      {page?.body && <div className="mx-auto mt-8 max-w-[860px] whitespace-pre-line text-[15px] leading-8 text-ink/70 dark:text-white/70">{page.body}</div>}
    </div>
  );
}
