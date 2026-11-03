import { supabase } from "./supabase";
import type { FactoryGroup, PriceRow } from "./data";

// داده‌ی لیست قیمت را از Supabase می‌خواند و به همان شکلی تبدیل می‌کند که صفحه‌ی قیمت نیاز دارد.
// اگر دیتابیس خطا بدهد یا خالی باشد، صفحه باید به داده‌ی داخل کد (factoryPriceGroups) برگردد.

type DbPrice = { price: number | string; change_percent: number | string | null; recorded_at: string };
type DbProduct = {
  id: string;
  name: string;
  size: string | null;
  weight_kg: number | string | null;
  in_stock: boolean | null;
  call_for_price: boolean | null;
  categories: { name: string; slug: string } | null;
  factories: { name: string; slug: string } | null;
  daily_prices: DbPrice[] | null;
};

function shortNameOf(name: string) {
  const words = name.split(" ").filter((w) => w && w !== "فولاد");
  return (words[0] ?? name).slice(0, 2);
}

// نام محصول در دیتابیس به شکل «میلگرد — آجدار Ø 8» است؛ سایز را از انتهای نام برمی‌داریم
function stripSize(name: string, size: string | null) {
  if (size && name.endsWith(" " + size)) return name.slice(0, -(size.length + 1));
  return name;
}

export async function fetchPriceGroups(): Promise<FactoryGroup[]> {
  const { data, error } = await supabase
    .from("products")
    .select(
      "id,name,size,weight_kg,in_stock,call_for_price,categories(name,slug),factories(name,slug),daily_prices(price,change_percent,recorded_at)"
    )
    .eq("visible", true)
    .order("name", { ascending: true })
    .limit(2000);

  if (error) throw error;

  const map = new Map<string, FactoryGroup>();

  for (const p of (data ?? []) as unknown as DbProduct[]) {
    const factoryName = p.factories?.name ?? "بدون کارخانه";
    let g = map.get(factoryName);
    if (!g) {
      g = {
        factory: factoryName,
        shortName: shortNameOf(factoryName),
        updatedAgo: "—",
        totalStock: "—",
        totalChange: 0,
        delivery: "به‌زودی اعلام می‌شود",
        rows: [],
      };
      map.set(factoryName, g);
    }

    // جدیدترین قیمت اول
    const prices = [...(p.daily_prices ?? [])].sort((a, b) => (a.recorded_at < b.recorded_at ? 1 : -1));
    const latest = prices[0];
    const price = latest ? Number(latest.price) : 0;
    const change = latest ? Number(latest.change_percent ?? 0) : 0;

    if (latest && g.updatedAgo === "—") {
      g.updatedAgo = new Date(latest.recorded_at).toLocaleDateString("fa-IR");
    }

    const row: PriceRow = {
      name: stripSize(p.name, p.size),
      size: p.size ?? "",
      weight: p.weight_kg != null ? String(p.weight_kg) : "—",
      price: p.call_for_price ? 0 : price,
      change,
      callForPrice: p.call_for_price === true,
      stock: p.in_stock === false ? "ناموجود" : price ? "موجود" : "نامشخص",
      aiPrediction: "ثابت",
      history: [...prices].reverse().slice(-500).map((x) => ({ price: Number(x.price), at: x.recorded_at })),
      spark:
        prices.length > 1
          ? prices.slice(0, 12).reverse().map((x) => Number(x.price))
          : [price || 1, price || 1],
    };
    g.rows.push(row);
  }

  return Array.from(map.values());
}
