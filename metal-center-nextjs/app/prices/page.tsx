import { supabase } from "@/lib/supabase";
import { dailyPrices as fallbackPrices } from "@/lib/data";

export const metadata = { title: "قیمت روز فولاد", description: "قیمت لحظه‌ای میلگرد، تیرآهن، ورق و پروفیل به تفکیک کارخانه." };
export const revalidate = 0; // همیشه آخرین قیمت از دیتابیس خونده بشه

async function getPrices() {
  const { data, error } = await supabase
    .from("daily_prices")
    .select("price, change_percent, products(name, factories(name))")
    .order("recorded_at", { ascending: false });

  if (error || !data || data.length === 0) {
    // اگر دیتابیس هنوز خالیه یا خطا داد، از داده نمونه استفاده کن
    return fallbackPrices.map((p) => ({
      name: p.name,
      factory: p.factory,
      price: p.price,
      change: p.change,
      dir: p.dir,
    }));
  }

  return data.map((row: any) => ({
    name: row.products?.name ?? "—",
    factory: row.products?.factories?.name ?? "—",
    price: Number(row.price).toLocaleString("fa-IR"),
    change: `${row.change_percent > 0 ? "+" : ""}${row.change_percent}%`,
    dir: row.change_percent >= 0 ? "up" : "down",
  }));
}

export default async function PricesPage() {
  const prices = await getPrices();

  return (
    <div className="mx-auto max-w-[1240px] px-6 py-10">
      <div className="mb-6 flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="mb-2 text-[28px] font-extrabold">قیمت روز فولاد</h1>
          <p className="max-w-[560px] text-[14.5px] text-ink/50">
            قیمت لحظه‌ای بر اساس کارخانه و سایز، به‌همراه روند تغییرات.
          </p>
        </div>
        <span className="inline-flex items-center gap-2 rounded-full border border-success/30 bg-success/10 px-3 py-1.5 text-xs font-semibold text-success">
          ● آخرین به‌روزرسانی: ۱۵ دقیقه پیش
        </span>
      </div>

      <div className="overflow-hidden rounded-card border border-black/5 bg-white">
        <table className="w-full text-sm">
          <thead>
            <tr className="bg-steel text-xs text-ink/50">
              <th className="p-4 text-start font-semibold">محصول</th>
              <th className="p-4 text-start font-semibold">کارخانه</th>
              <th className="p-4 text-start font-semibold">قیمت</th>
              <th className="p-4 text-start font-semibold">تغییر ۲۴ ساعت</th>
            </tr>
          </thead>
          <tbody>
            {prices.map((p) => (
              <tr key={p.name} className="border-t border-black/5 hover:bg-steel">
                <td className="p-4 font-bold">{p.name}</td>
                <td className="p-4 text-ink/50">{p.factory}</td>
                <td className="p-4">{p.price} تومان</td>
                <td className={`p-4 font-bold ${p.dir === "up" ? "text-success" : "text-danger"}`}>
                  {p.dir === "up" ? "▲" : "▼"} {p.change}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="mt-10 rounded-card bg-gradient-to-b from-navy to-[#0A2547] p-8 text-center text-white">
        <h2 className="mb-2 text-xl font-extrabold">هشدار قیمت فعال کن</h2>
        <p className="mb-5 text-sm text-[#B9C6DC]">
          وقتی قیمت محصول موردنظرت به حد تعیین‌شده رسید، اعلان دریافت کن.
        </p>
        <div className="mx-auto flex max-w-md gap-2">
          <input
            type="text"
            placeholder="ایمیل یا شماره موبایل"
            className="flex-1 rounded-btn px-4 py-3 text-sm text-ink"
          />
          <button className="rounded-btn bg-white px-5 py-3 text-sm font-bold text-navy">فعال‌سازی</button>
        </div>
      </div>
    </div>
  );
}
