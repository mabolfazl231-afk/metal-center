import { articles as fallbackArticles } from "@/lib/data";
import { fetchArticles, toFa } from "@/lib/cms";

export const metadata = { title: "مرکز دانش فولاد", description: "راهنمای خرید، تحلیل بازار و استانداردهای صنعت فولاد." };
export const revalidate = 60;

export default async function KnowledgePage() {
  const db = await fetchArticles();
  // هر مقاله به یک شکل یکسان تبدیل می‌شود تا نمایش یکی باشد
  const list = db
    ? db.map((a) => ({ id: a.id, title: a.title, tag: a.tag, time: `${toFa(a.read_minutes)} دقیقه`, excerpt: a.excerpt, body: a.body, cover: a.cover_url }))
    : fallbackArticles.map((a) => ({ id: a.title, title: a.title, tag: a.tag, time: a.time, excerpt: "", body: "", cover: null }));

  return (
    <div className="mx-auto max-w-[1240px] px-6 py-10">
      <div className="mb-10 text-center">
        <h1 className="mb-2 text-[28px] font-extrabold">مرکز دانش فولاد</h1>
        <p className="mx-auto max-w-[520px] text-[14.5px] text-ink/50 dark:text-white/40">
          راهنمای خرید، تحلیل بازار، استانداردها و مقایسه محصولات.
        </p>
      </div>
      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
        {list.map((a) => (
          <article key={a.id} className="overflow-hidden rounded-card border border-border-light bg-white shadow-soft dark:border-border-dark dark:bg-surface-dark">
            <div className="relative h-[150px] bg-gradient-to-br from-[#EAF0FA] to-[#DCE7FA]">
              {a.cover && (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={a.cover} alt="" className="absolute inset-0 h-full w-full object-cover" />
              )}
              <span className="absolute start-2.5 top-2.5 rounded-full bg-white px-2.5 py-1 text-[10.5px] font-bold text-blue">
                {a.tag}
              </span>
            </div>
            <div className="p-4">
              <h3 className="mb-2 text-sm font-bold leading-6">{a.title}</h3>
              {a.excerpt && <p className="mb-2 text-[12.5px] leading-6 text-ink/60 dark:text-white/50">{a.excerpt}</p>}
              <div className="text-[11.5px] text-ink/50 dark:text-white/40">{a.time} مطالعه</div>
              {a.body && (
                <details className="mt-3">
                  <summary className="cursor-pointer text-xs font-bold text-blue">ادامه مطلب</summary>
                  <p className="mt-2 whitespace-pre-line text-[13px] leading-7">{a.body}</p>
                </details>
              )}
            </div>
          </article>
        ))}
      </div>
    </div>
  );
}
