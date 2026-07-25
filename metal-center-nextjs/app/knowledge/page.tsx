import { articles } from "@/lib/data";

export const metadata = { title: "مرکز دانش فولاد", description: "راهنمای خرید، تحلیل بازار و استانداردهای صنعت فولاد." };

export default function KnowledgePage() {
  return (
    <div className="mx-auto max-w-[1240px] px-6 py-10">
      <div className="mb-10 text-center">
        <h1 className="mb-2 text-[28px] font-extrabold">مرکز دانش فولاد</h1>
        <p className="mx-auto max-w-[520px] text-[14.5px] text-ink/50">
          راهنمای خرید، تحلیل بازار، استانداردها و مقایسه محصولات.
        </p>
      </div>
      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
        {articles.map((a) => (
          <article key={a.title} className="overflow-hidden rounded-card border border-black/5 bg-white shadow-soft">
            <div className="relative h-[150px] bg-gradient-to-br from-[#EAF0FA] to-[#DCE7FA]">
              <span className="absolute start-2.5 top-2.5 rounded-full bg-white px-2.5 py-1 text-[10.5px] font-bold text-blue">
                {a.tag}
              </span>
            </div>
            <div className="p-4">
              <h3 className="mb-2 text-sm font-bold leading-6">{a.title}</h3>
              <div className="text-[11.5px] text-ink/50">{a.time} مطالعه</div>
            </div>
          </article>
        ))}
      </div>
    </div>
  );
}
