// تنظیم ستون‌های جدول قیمت برای هر دسته: ترتیب، نام، و نمایش یا پنهان بودن هر ستون.
// این فایل بین پنل ادمین و لیست قیمت سایت مشترک است.

export type ColCfg = { key: string; label: string; hidden?: boolean };

// ستون‌هایی که در دیتابیس به فیلد محصول متصل‌اند
export const BUILTIN_LABELS: Record<string, string> = {
  name: "نام محصول",
  size: "سایز",
  factory: "کارخانه",
  grade: "گرید",
  loading_place: "محل بارگیری",
  unit: "واحد",
  weight_kg: "وزن (kg/m)",
  price: "قیمت (تومان)",
};

// این‌ها بدون آن‌ها جدول معنی ندارد؛ نمی‌شوند پنهان کرد
export const CORE_KEYS = ["name", "size", "factory", "price"];

export const DEFAULT_CONFIG: ColCfg[] = [
  "name",
  "size",
  "factory",
  "grade",
  "loading_place",
  "unit",
  "weight_kg",
  "price",
].map((key) => ({ key, label: BUILTIN_LABELS[key] }));

export const isAttrKey = (key: string) => key.startsWith("attr:");
export const attrId = (key: string) => key.slice(5);

type Src = {
  table_config?: ColCfg[] | null;
  price_columns?: string[] | null;
  hidden_fields?: string[] | null;
};

// تنظیم نهایی یک دسته: اول خود دسته، بعد والدش، بعد نسخه‌ی قدیمی، و در آخر پیش‌فرض
export function effectiveConfig(cat: Src | null | undefined, parent: Src | null | undefined): ColCfg[] {
  if (cat?.table_config && cat.table_config.length > 0) return cat.table_config;
  if (parent?.table_config && parent.table_config.length > 0) return parent.table_config;

  const legacy = cat && ((cat.price_columns?.length ?? 0) > 0 || (cat.hidden_fields?.length ?? 0) > 0) ? cat : parent;
  if (!legacy || ((legacy.price_columns?.length ?? 0) === 0 && (legacy.hidden_fields?.length ?? 0) === 0)) {
    return DEFAULT_CONFIG;
  }
  const hidden = legacy.hidden_fields ?? [];
  return [
    ...DEFAULT_CONFIG.map((c) => ({ ...c, hidden: hidden.includes(c.key) })),
    ...(legacy.price_columns ?? []).map((label) => ({ key: `attr:${label}`, label })),
  ];
}
