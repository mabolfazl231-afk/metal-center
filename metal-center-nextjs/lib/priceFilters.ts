import type { FactoryGroup, PriceRow } from "./data";

// منطق فیلتر، مرتب‌سازی و لینک اشتراک لیست قیمت (بدون وابستگی به React)

export const ALL = "همه";
export type SortKey = "default" | "price-asc" | "price-desc" | "name";

export type Filters = {
  category: string; // نام دسته یا "همه"
  factory: string; // نام کارخانه یا "همه"
  grade: string;
  place: string; // محل بارگیری
  query: string;
  sort: SortKey;
  attrs: Record<string, string>; // مشخصات اختصاصی دسته، مثلاً {"ضخامت": "2"}
};

export const EMPTY_FILTERS: Filters = {
  category: ALL,
  factory: ALL,
  grade: ALL,
  place: ALL,
  query: "",
  sort: "default",
  attrs: {},
};

type Cat = { name: string; slug: string };

// کلید یکتای هر ردیف (برای انتخاب مقایسه)
export const keyOf = (r: PriceRow) => r.id ?? `${r.factory ?? ""}|${r.name}|${r.size}`;

// خواندن وضعیت از آدرس صفحه، برای لینک اشتراک‌گذاری
export function parseState(search: string, categories: Cat[]): { filters: Filters; vat: boolean } {
  const p = new URLSearchParams(search);
  const catName = categories.find((c) => c.slug === p.get("cat"))?.name ?? ALL;
  const sortParam = p.get("sort");
  const sortOptions: string[] = ["price-asc", "price-desc", "name"];
  const sort: SortKey = sortParam && sortOptions.includes(sortParam) ? (sortParam as SortKey) : "default";
  const attrs: Record<string, string> = {};
  p.forEach((value, key) => {
    if (key.startsWith("a_")) attrs[key.slice(2)] = value;
  });
  return {
    filters: {
      category: catName,
      factory: p.get("factory") ?? ALL,
      grade: p.get("grade") ?? ALL,
      place: p.get("place") ?? ALL,
      query: p.get("q") ?? "",
      sort,
      attrs,
    },
    vat: p.get("vat") === "1",
  };
}

// ساخت آدرس از وضعیت فعلی (برای کپی لینک)
export function toSearch(f: Filters, categories: Cat[], vat: boolean): string {
  const p = new URLSearchParams();
  const slug = categories.find((c) => c.name === f.category)?.slug;
  if (slug) p.set("cat", slug);
  if (f.factory !== ALL) p.set("factory", f.factory);
  if (f.grade !== ALL) p.set("grade", f.grade);
  if (f.place !== ALL) p.set("place", f.place);
  if (f.query.trim()) p.set("q", f.query.trim());
  if (f.sort !== "default") p.set("sort", f.sort);
  Object.entries(f.attrs).forEach(([k, v]) => {
    if (v) p.set("a_" + k, v);
  });
  if (vat) p.set("vat", "1");
  return p.toString();
}

// قیمت‌های صفر، «تماس» و «استعلام» همیشه آخر لیست می‌آیند
function sortRows(rows: PriceRow[], sort: SortKey): PriceRow[] {
  const copy = [...rows];
  const value = (r: PriceRow) => (r.callForPrice || !r.price ? null : r.price);
  const byPrice = (dir: 1 | -1) => (a: PriceRow, b: PriceRow) => {
    const x = value(a);
    const y = value(b);
    if (x === null && y === null) return 0;
    if (x === null) return 1;
    if (y === null) return -1;
    return dir * (x - y);
  };
  if (sort === "price-asc") copy.sort(byPrice(1));
  if (sort === "price-desc") copy.sort(byPrice(-1));
  if (sort === "name") copy.sort((a, b) => (a.name + a.size).localeCompare(b.name + b.size, "fa"));
  return copy;
}

export function applyFilters(groups: FactoryGroup[], f: Filters): FactoryGroup[] {
  const q = f.query.trim().toLowerCase();
  const attrEntries = Object.entries(f.attrs).filter(([, v]) => v);

  return groups
    .filter((g) => f.factory === ALL || g.factory === f.factory)
    .map((g) => {
      const rows = g.rows.filter((r) => {
        if (f.category !== ALL) {
          const ok = r.category ? r.category === f.category : r.name.includes(f.category);
          if (!ok) return false;
        }
        if (f.grade !== ALL && r.grade !== f.grade) return false;
        if (f.place !== ALL && r.loadingPlace !== f.place) return false;
        if (q) {
          const haystack = `${r.name} ${r.size} ${r.grade ?? ""} ${(r.attrs ?? []).map((a) => a.value).join(" ")}`.toLowerCase();
          if (!haystack.includes(q)) return false;
        }
        return attrEntries.every(([label, value]) => (r.attrs ?? []).some((a) => a.label === label && a.value === value));
      });
      return { ...g, rows: sortRows(rows, f.sort) };
    })
    .filter((g) => g.rows.length > 0);
}

// مقادیر یکتا برای ساخت فیلترهای انتخابی
export function distinct(groups: FactoryGroup[], pick: (r: PriceRow) => string | undefined): string[] {
  const set = new Set<string>();
  groups.forEach((g) => g.rows.forEach((r) => {
    const v = pick(r)?.trim();
    if (v) set.add(v);
  }));
  return Array.from(set).sort((a, b) => a.localeCompare(b, "fa"));
}
