import { supabase } from "@/lib/supabase";
import PriceTable, { PriceRow } from "@/components/price/PriceTable";

export const metadata = { title: "قیمت روز فولاد", description: "قیمت لحظه‌ای میلگرد، تیرآهن، ورق و پروفیل به تفکیک کارخانه." };
export const revalidate = 0;

async function getPrices(): Promise<PriceRow[]> {
  const { data, error } = await supabase
    .from("daily_prices")
    .select("price, change_percent, products(name, factories(name))")
    .order("recorded_at", { ascending: false });

  const fallback: PriceRow[] = [
    { name: "میلگرد A3 سایز ۱۴", factory: "ذوب آهن اصفهان", price: 29850, change: 1.2 },
    { name: "تیرآهن IPE ۱۴", factory: "فولاد ناب تبریز", price: 41200, change: 0.6 },
    { name: "ورق روغنی ۲ میل", factory: "فولاد مبارکه", price: 52900, change: -0.8 },
    { name: "قوطی ۴۰×۴۰", factory: "گروه ملی صنعتی", price: 33100, change: 2.1 },
  ];

  if (error || !data || data.length === 0) return fallback;

  return data.map((row: any) => ({
    name: row.products?.name ?? "—",
    factory: row.products?.factories?.name ?? "—",
    price: Number(row.price),
    change: Number(row.change_percent),
  }));
}

export default async function PricesPage() {
  const prices = await getPrices();

  return (
    <div className="mx-auto max-w-[1240px] px-6 py-10">
      <div className="mb-6 flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="mb-2 text-[28px] font-extrabold">قیمت روز فولاد</h1>
          <p className="max-w-[560px] text-[14.5px] text-ink/50 dark:text-white/40">
            قیمت لحظه‌ای بر اساس کارخانه و سایز — قابل جستجو، مرتب‌سازی و مقایسه.
          </p>
        </div>
        <span className="inline-flex items-center gap-2 rounded-full border border-success/30 bg-success/10 px-3 py-1.5 text-xs font-semibold text-success">
          ● آخرین به‌روزرسانی: ۱۵ دقیقه پیش
        </span>
      </div>

      <PriceTable rows={prices} />

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
