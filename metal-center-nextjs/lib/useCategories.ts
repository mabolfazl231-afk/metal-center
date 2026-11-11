"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import { categories as staticCategories } from "@/lib/data";

// دسته‌های اصلی و دسته‌بندی‌های زیرشان از Supabase خوانده می‌شوند.
// اگر دیتابیس خالی یا خطادار باشد، همان فهرست ثابت قبلی استفاده می‌شود تا سایت خالی نشود.

export type CatChild = { name: string; slug: string; image: string };
export type CatNode = {
  name: string;
  slug: string;
  color: string;
  image: string;        // عکس دلخواه از پنل؛ اگر خالی باشد، عکس پیش‌فرض یا آیکون نمایش داده می‌شود
  showOnHome: boolean;  // آیا این دسته در صفحه‌ی اصلی نشان داده شود
  count: string;
  sizes: string[];
  children: CatChild[];
};
export type FlatCat = { name: string; slug: string; parentName: string | null };

type Row = {
  id: string;
  name: string;
  slug: string;
  parent_id: string | null;
  sort_order: number | null;
  color: string | null;
  image_url: string | null;
  show_on_home: boolean | null;
};

const staticNodes: CatNode[] = staticCategories.map((c) => ({
  name: c.name,
  slug: c.slug,
  color: c.color,
  image: "",
  showOnHome: true,
  count: c.count,
  sizes: c.sizes,
  children: [],
}));

const staticFlat: FlatCat[] = staticCategories.map((c) => ({ name: c.name, slug: c.slug, parentName: null }));

function byOrder(a: { sort_order: number | null; name: string }, b: { sort_order: number | null; name: string }) {
  return (a.sort_order ?? 0) - (b.sort_order ?? 0) || a.name.localeCompare(b.name, "fa");
}

// رنگ و عکس از تنظیمات پنل می‌آید؛ اگر خالی بود، از فهرست ثابت (با همان نام) استفاده می‌شود
function buildFromRows(rows: Row[]) {
  const sorted = [...rows].sort(byOrder);
  const ids = new Set(rows.map((r) => r.id));
  const roots = sorted.filter((r) => !r.parent_id || !ids.has(r.parent_id));

  const nodes: CatNode[] = roots.map((r) => {
    const meta = staticCategories.find((c) => c.name === r.name);
    return {
      name: r.name,
      slug: r.slug,
      color: r.color || meta?.color || "#0A3D91",
      image: r.image_url ?? "",
      showOnHome: r.show_on_home === true,
      count: meta?.count ?? "",
      sizes: meta?.sizes ?? [],
      children: sorted
        .filter((k) => k.parent_id === r.id)
        .map((k) => ({ name: k.name, slug: k.slug, image: k.image_url ?? "" })),
    };
  });

  const flat: FlatCat[] = [];
  for (const r of roots) {
    flat.push({ name: r.name, slug: r.slug, parentName: null });
    for (const k of sorted.filter((x) => x.parent_id === r.id)) {
      flat.push({ name: k.name, slug: k.slug, parentName: r.name });
    }
  }
  return { nodes, flat };
}

export function useCategories() {
  const [data, setData] = useState<{ nodes: CatNode[]; flat: FlatCat[] }>({ nodes: staticNodes, flat: staticFlat });
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const { data: rows, error } = await supabase
          .from("categories")
          .select("id,name,slug,parent_id,sort_order,color,image_url,show_on_home");
        if (!cancelled && !error && rows && rows.length > 0) setData(buildFromRows(rows as Row[]));
      } catch {
        // فهرست ثابت می‌ماند
      } finally {
        if (!cancelled) setLoaded(true);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  return { ...data, loaded };
}

// کارخانه‌هایی که محصولات هر دسته به آن‌ها وصل است.
// کلید = نام خود دسته (اصلی یا زیرمجموعه)؛ کارخانه‌ها در دسته‌ی اصلی هم جمع می‌شوند.
export type CatFactory = { name: string; slug: string; logoUrl: string | null };
export function useFactoriesByCategory() {
  const [map, setMap] = useState<Record<string, CatFactory[]>>({});

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const [cats, prods] = await Promise.all([
          supabase.from("categories").select("id,name,parent_id"),
          supabase.from("products").select("category_id,factories(name,slug,logo_url)").eq("visible", true).limit(2000),
        ]);
        if (cancelled || cats.error || prods.error) return;

        const byId = new Map((cats.data ?? []).map((c) => [c.id as string, c]));
        const out: Record<string, CatFactory[]> = {};
        const rows = (prods.data ?? []) as unknown as {
          category_id: string | null;
          factories: { name: string; slug: string; logo_url: string | null } | null;
        }[];

        const push = (key: string, f: CatFactory) => {
          const list = out[key] ?? (out[key] = []);
          if (!list.some((x) => x.name === f.name)) list.push(f);
        };

        for (const p of rows) {
          const cat = p.category_id ? byId.get(p.category_id) : undefined;
          if (!cat || !p.factories) continue;
          const catName = cat.name as string;
          const rootId = cat.parent_id && byId.has(cat.parent_id) ? cat.parent_id : cat.id;
          const rootName = byId.get(rootId)?.name as string | undefined;
          if (!rootName) continue;
          const f: CatFactory = { name: p.factories.name, slug: p.factories.slug, logoUrl: p.factories.logo_url };
          push(catName, f);
          if (rootName !== catName) push(rootName, f);
        }
        if (!cancelled) setMap(out);
      } catch {
        // بدون کارخانه نشان داده می‌شود
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  return map;
}
