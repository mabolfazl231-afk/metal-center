"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import { categories as staticCategories } from "@/lib/data";

// دسته‌های اصلی و زیرمجموعه‌ها از Supabase خوانده می‌شوند.
// اگر دیتابیس خالی یا خطادار باشد، همان فهرست ثابت قبلی استفاده می‌شود تا سایت خالی نشود.

export type CatChild = { name: string; slug: string };
export type CatNode = {
  name: string;
  slug: string;
  color: string;
  count: string;
  sizes: string[];
  children: CatChild[];
};
export type FlatCat = { name: string; slug: string; parentName: string | null };

type Row = { id: string; name: string; slug: string; parent_id: string | null; sort_order: number | null };

const staticNodes: CatNode[] = staticCategories.map((c) => ({
  name: c.name,
  slug: c.slug,
  color: c.color,
  count: c.count,
  sizes: c.sizes,
  children: [],
}));

const staticFlat: FlatCat[] = staticCategories.map((c) => ({ name: c.name, slug: c.slug, parentName: null }));

function byOrder(a: { sort_order: number | null; name: string }, b: { sort_order: number | null; name: string }) {
  return (a.sort_order ?? 0) - (b.sort_order ?? 0) || a.name.localeCompare(b.name, "fa");
}

// ظاهر دسته (رنگ، تعداد، سایزها) از فهرست ثابت می‌آید، اگر نام همان دسته باشد
function buildFromRows(rows: Row[]) {
  const sorted = [...rows].sort(byOrder);
  const ids = new Set(rows.map((r) => r.id));
  const roots = sorted.filter((r) => !r.parent_id || !ids.has(r.parent_id));

  const nodes: CatNode[] = roots.map((r) => {
    const meta = staticCategories.find((c) => c.name === r.name);
    return {
      name: r.name,
      slug: r.slug,
      color: meta?.color ?? "#0A3D91",
      count: meta?.count ?? "",
      sizes: meta?.sizes ?? [],
      children: sorted.filter((k) => k.parent_id === r.id).map((k) => ({ name: k.name, slug: k.slug })),
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
        const { data: rows, error } = await supabase.from("categories").select("id,name,slug,parent_id,sort_order");
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
