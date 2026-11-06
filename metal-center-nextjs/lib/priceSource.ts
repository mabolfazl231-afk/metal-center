import { supabase } from "./supabase";
import type { FactoryGroup, PriceRow } from "./data";

// داده‌ی لیست قیمت را از Supabase می‌خواند و به شکلی تبدیل می‌کند که صفحه‌ی قیمت نیاز دارد.
// هیچ عدد ساختگی تولید نمی‌شود: تغییر قیمت فقط وقتی نشان داده می‌شود که تاریخچه‌ی واقعی باشد.

type DbPrice = { price: number | string; change_percent: number | string | null; recorded_at: string };
type DbProduct = {
  id: string;
  name: string;
  size: string | null;
  weight_kg: number | string | null;
  in_stock: boolean | null;
  call_for_price: boolean | null;
  grade: string | null;
  loading_place: string | null;
  price_unit: string | null;
  attributes: Record<string, unknown> | null;
  categories: {
    name: string;
    slug: string;
    price_columns: string[] | null;
    parent: { name: string; price_columns: string[] | null } | null;
  } | null;
  factories: { name: string; slug: string } | null;
  daily_prices: DbPrice[] | null;
};

function shortNameOf(name: string) {
  const words = name.split(" ").filter((w) => w && w !== "فولاد");
  return (words[0] ?? name).slice(0, 2);
}

// نام محصول در دیتابیس ممکن است سایز را در انتهایش داشته باشد؛ آن را جدا می‌کنیم
function stripSize(name: string, size: string | null) {
  if (size && name.endsWith(" " + size)) return name.slice(0, -(size.length + 1));
  return name;
}

// ستون‌های زیرمجموعه؛ اگر زیرمجموعه ستون ندارد، ستون‌های دسته‌ی اصلی استفاده می‌شود
function columnsOf(p: DbProduct): string[] {
  const own = p.categories?.price_columns ?? [];
  if (own.length > 0) return own;
  return p.categories?.parent?.price_columns ?? [];
}

// فقط ستون‌های دارای مقدار را برمی‌گرداند و به ترتیب ستون‌های دسته مرتب می‌کند
function attrsOf(p: DbProduct) {
  const values = (p.attributes ?? {}) as Record<string, unknown>;
  const columns = columnsOf(p);
  return columns
    .map((label) => ({ label, value: String(values[label] ?? "").trim() }))
    .filter((a) => a.value !== "");
}

export async function fetchPriceGroups(): Promise<FactoryGroup[]> {
  const { data, error } = await supabase
    .from("products")
    .select(
      "id,name,size,weight_kg,in_stock,call_for_price,grade,loading_place,price_unit,attributes,categories(name,slug,price_columns,parent:categories!parent_id(name,price_columns)),factories(name,slug),daily_prices(price,change_percent,recorded_at)"
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
        delivery: undefined,
        rows: [],
      };
      map.set(factoryName, g);
    }

    // جدیدترین قیمت اول
    const prices = [...(p.daily_prices ?? [])].sort((a, b) => (a.recorded_at < b.recorded_at ? 1 : -1));
    const latest = prices[0];
    const price = latest ? Number(latest.price) : 0;
    const hasChange = prices.length >= 2 && latest.change_percent != null;

    const row: PriceRow = {
      id: p.id,
      name: stripSize(p.name, p.size),
      size: p.size ?? "",
      factory: factoryName,
      category: p.categories?.name,
      parentCategory: p.categories?.parent?.name,
      weight: p.weight_kg != null ? String(p.weight_kg) : "—",
      grade: p.grade ?? "",
      loadingPlace: p.loading_place ?? "",
      unit: p.price_unit ?? "",
      price: p.call_for_price ? 0 : price,
      change: hasChange ? Number(latest.change_percent) : 0,
      hasChange,
      updatedAt: latest?.recorded_at,
      callForPrice: p.call_for_price === true,
      stock: p.in_stock === false ? "ناموجود" : price ? "موجود" : "نامشخص",
      attrs: attrsOf(p),
      columns: columnsOf(p),
      history: [...prices].reverse().slice(-500).map((x) => ({ price: Number(x.price), at: x.recorded_at })),
      spark: prices.length > 1 ? prices.slice(0, 12).reverse().map((x) => Number(x.price)) : [],
    };
    g.rows.push(row);
  }

  // سربرگ هر کارخانه: آخرین زمان به‌روزرسانی واقعی همان کارخانه
  for (const g of map.values()) {
    const times = g.rows.map((r) => r.updatedAt).filter(Boolean) as string[];
    if (times.length > 0) {
      g.updatedAgo = new Date(times.sort().pop() as string).toLocaleString("fa-IR", { dateStyle: "short", timeStyle: "short" });
    }
  }

  return Array.from(map.values());
}
