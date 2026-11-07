import { supabase } from "./supabase";
import type { FactoryGroup, PriceRow } from "./data";
import { type ColCfg, effectiveConfig, isAttrKey, attrId, BUILTIN_LABELS } from "./columnConfig";

// داده‌ی لیست قیمت را از Supabase می‌خواند و به شکلی تبدیل می‌کند که صفحه‌ی قیمت نیاز دارد.
// هیچ عدد ساختگی تولید نمی‌شود: تغییر قیمت فقط وقتی نشان داده می‌شود که تاریخچه‌ی واقعی باشد.

type DbPrice = { price: number | string; change_percent: number | string | null; recorded_at: string };
type CatSrc = {
  name: string;
  slug: string;
  price_columns: string[] | null;
  hidden_fields: string[] | null;
  table_config: ColCfg[] | null;
};
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
  categories: (CatSrc & { parent: CatSrc | null }) | null;
  factories: { name: string; slug: string; logo_url: string | null } | null;
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

// تنظیم ستون‌های دسته‌ی این محصول
function cfgOf(p: DbProduct): ColCfg[] {
  return effectiveConfig(p.categories, p.categories?.parent);
}

// کلیدهای ستون‌هایی که دسته پنهان کرده
function hiddenOf(p: DbProduct): string[] {
  return cfgOf(p).filter((c) => c.hidden).map((c) => c.key);
}

// برچسب ستون‌های ثابت (مثلاً «گرید») طبق تنظیم دسته؛ اگر نبود، همان نام پیش‌فرض
function labelOf(p: DbProduct, key: string) {
  return cfgOf(p).find((c) => c.key === key)?.label ?? BUILTIN_LABELS[key] ?? key;
}

// نام ستون‌های اختصاصی نمایش‌داده‌شده (برای فیلتر)
function columnsOf(p: DbProduct): string[] {
  return cfgOf(p)
    .filter((c) => isAttrKey(c.key) && !c.hidden)
    .map((c) => c.label);
}

// فقط ستون‌های اختصاصی دارای مقدار، به ترتیب تنظیم دسته
function attrsOf(p: DbProduct) {
  const values = (p.attributes ?? {}) as Record<string, unknown>;
  return cfgOf(p)
    .filter((c) => isAttrKey(c.key) && !c.hidden)
    .map((c) => ({ label: c.label, value: String(values[attrId(c.key)] ?? "").trim() }))
    .filter((a) => a.value !== "");
}

export async function fetchPriceGroups(): Promise<FactoryGroup[]> {
  const { data, error } = await supabase
    .from("products")
    .select(
      "id,name,size,weight_kg,in_stock,call_for_price,grade,loading_place,price_unit,attributes,categories(name,slug,price_columns,hidden_fields,table_config,parent:categories!parent_id(name,slug,price_columns,hidden_fields,table_config)),factories(name,slug,logo_url),daily_prices(price,change_percent,recorded_at)"
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
        logoUrl: p.factories?.logo_url ?? undefined,
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
    const hidden = hiddenOf(p);

    const row: PriceRow = {
      id: p.id,
      name: stripSize(p.name, p.size),
      size: p.size ?? "",
      factory: factoryName,
      category: p.categories?.name,
      parentCategory: p.categories?.parent?.name,
      weight: !hidden.includes("weight_kg") && p.weight_kg != null ? String(p.weight_kg) : "—",
      grade: hidden.includes("grade") ? "" : p.grade ?? "",
      loadingPlace: hidden.includes("loading_place") ? "" : p.loading_place ?? "",
      unit: hidden.includes("unit") ? "" : p.price_unit ?? "",
      colLabels: { grade: labelOf(p, "grade"), loadingPlace: labelOf(p, "loading_place") },
      price: p.call_for_price ? 0 : price,
      change: hasChange ? Number(latest.change_percent) : 0,
      hasChange,
      updatedAt: latest?.recorded_at,
      callForPrice: p.call_for_price === true,
      stock: p.in_stock === false ? "ناموجود" : price ? "موجود" : "نامشخص",
      attrs: attrsOf(p),
      columns: columnsOf(p),
      // فقط ۹۰ نقطه‌ی آخر برای نمودار؛ داده‌ی کمتر یعنی صفحه‌ی سریع‌تر
      history: [...prices].reverse().slice(-90).map((x) => ({ price: Number(x.price), at: x.recorded_at })),
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
