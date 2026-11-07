"use client";

import { useEffect, useState, type ReactNode } from "react";
import { ArrowUp, ArrowDown, Copy, Eye, EyeOff, Pencil, Plus, Trash2, X } from "lucide-react";
import { supabase } from "@/lib/supabase";
import {
  CORE_KEYS,
  DEFAULT_CONFIG,
  attrId,
  effectiveConfig,
  isAttrKey,
  type ColCfg,
} from "@/lib/columnConfig";

// جدول قیمت به شکل اکسل. ستون‌ها برای هر دسته جدا تنظیم می‌شوند: ترتیب، نام، نمایش یا پنهان.
// هر سلول فقط برای همان محصول ذخیره می‌شود. جدول صفحه‌بندی شده تا سبک بماند.

type Cat = {
  id: string;
  name: string;
  parent_id: string | null;
  price_columns: string[] | null;
  hidden_fields: string[] | null;
  table_config: ColCfg[] | null;
  sort_order: number | null;
};
type Fac = { id: string; name: string };
type Price = { price: number | string; recorded_at: string };
type Prod = {
  id: string;
  name: string;
  size: string | null;
  weight_kg: number | null;
  grade: string | null;
  loading_place: string | null;
  price_unit: string | null;
  factory_id: string | null;
  category_id: string | null;
  attributes: Record<string, string> | null;
  daily_prices: Price[] | null;
};
type Msg = { type: "ok" | "err"; text: string } | null;

const PAGE = 100;
const INPUT = "w-full min-w-[90px] rounded-md border border-black/10 bg-white px-2 py-1.5 text-xs outline-none focus:border-blue";
const BTN = "rounded-lg px-2.5 py-1.5 text-xs font-bold transition disabled:opacity-40";
const ICON = "flex h-7 w-7 items-center justify-center rounded-md bg-black/5 transition disabled:opacity-30";

// فیلدهای متنی که مستقیم در جدول products ذخیره می‌شوند
const TEXT_FIELD: Record<string, "size" | "grade" | "loading_place" | "price_unit"> = {
  size: "size",
  grade: "grade",
  loading_place: "loading_place",
  unit: "price_unit",
};

// تبدیل ارقام فارسی و کاما به عدد؛ اگر معتبر نبود null
function parseNum(v: string): number | null {
  const fa = "۰۱۲۳۴۵۶۷۸۹";
  const latin = v.replace(/[,٬\s]/g, "").replace(/[۰-۹]/g, (d) => String(fa.indexOf(d)));
  const n = Number(latin);
  return latin !== "" && Number.isFinite(n) && n > 0 ? n : null;
}

function latest(p: Prod): number | null {
  const list = [...(p.daily_prices ?? [])].sort((a, b) => (a.recorded_at < b.recorded_at ? 1 : -1));
  return list[0] ? Number(list[0].price) : null;
}

export default function PriceSheet() {
  const [cats, setCats] = useState<Cat[]>([]);
  const [factories, setFactories] = useState<Fac[]>([]);
  const [rows, setRows] = useState<Prod[]>([]);
  const [sel, setSel] = useState("all");
  const [facFilter, setFacFilter] = useState("all");
  const [q, setQ] = useState("");
  const [page, setPage] = useState(0);
  const [busy, setBusy] = useState(false);
  const [msg, setMsg] = useState<Msg>(null);
  const [newCol, setNewCol] = useState("");
  const [targetFor, setTargetFor] = useState<Record<string, string>>({});

  function flash(type: "ok" | "err", text: string) {
    setMsg({ type, text });
  }

  async function load() {
    const [c, f, p] = await Promise.all([
      supabase
        .from("categories")
        .select("id,name,parent_id,price_columns,hidden_fields,table_config,sort_order")
        .order("sort_order")
        .order("name"),
      supabase.from("factories").select("id,name").order("name"),
      supabase
        .from("products")
        .select("id,name,size,weight_kg,grade,loading_place,price_unit,factory_id,category_id,attributes,daily_prices(price,recorded_at)")
        .order("name")
        .limit(3000),
    ]);
    const err = c.error || f.error || p.error;
    if (err) return flash("err", "خواندن اطلاعات ناموفق بود. اگر خطای ستون می‌بینی، فایل 0012 را در Supabase اجرا کن. (" + err.message + ")");
    setCats((c.data ?? []) as Cat[]);
    setFactories((f.data ?? []) as Fac[]);
    setRows((p.data ?? []) as unknown as Prod[]);
  }

  useEffect(() => {
    load();
  }, []);

  const catById = new Map(cats.map((c) => [c.id, c]));
  const selCat = sel === "all" ? null : catById.get(sel) ?? null;
  const parentCat = selCat?.parent_id ? catById.get(selCat.parent_id) : undefined;
  const childIds = sel === "all" ? [] : cats.filter((c) => c.parent_id === sel).map((c) => c.id);

  // تنظیم ستون‌ها: دسته‌ی انتخاب‌شده، یا پیش‌فرض وقتی «همه» انتخاب شده
  const cfg: ColCfg[] = selCat ? effectiveConfig(selCat, parentCat) : DEFAULT_CONFIG;
  const shown = cfg.filter((c) => !c.hidden);

  // فیلترها جدا از هم: دسته (با زیرمجموعه‌ها)، کارخانه، نام محصول
  const filtered = rows.filter((p) => {
    if (sel !== "all" && !(p.category_id === sel || (p.category_id !== null && childIds.includes(p.category_id)))) return false;
    if (facFilter === "none" && p.factory_id) return false;
    if (facFilter !== "all" && facFilter !== "none" && p.factory_id !== facFilter) return false;
    if (q.trim() && !p.name.includes(q.trim())) return false;
    return true;
  });
  const pages = Math.max(1, Math.ceil(filtered.length / PAGE));
  const currentPage = Math.min(page, pages - 1);
  const pageRows = filtered.slice(currentPage * PAGE, currentPage * PAGE + PAGE);

  // ---------- ذخیره‌ی سلول‌ها: فقط همان محصول ----------
  async function patchProduct(id: string, patch: Partial<Prod>) {
    const { error } = await supabase.from("products").update(patch).eq("id", id);
    if (error) {
      flash("err", "ذخیره نشد: " + error.message);
      return false;
    }
    setRows((list) => list.map((r) => (r.id === id ? { ...r, ...patch } : r)));
    return true;
  }

  async function saveProductField(p: Prod, field: "name" | "size" | "grade" | "loading_place" | "price_unit", value: string) {
    const v = value.trim() || null;
    if (field === "name" && !v) return flash("err", "نام محصول نمی‌تواند خالی باشد.");
    if ((p[field] ?? null) === v) return;
    if (await patchProduct(p.id, { [field]: v } as Partial<Prod>)) flash("ok", "ذخیره شد.");
  }

  async function saveWeight(p: Prod, value: string) {
    const n = value.trim() === "" ? null : parseNum(value);
    if (value.trim() !== "" && n === null) return flash("err", "وزن باید عدد باشد.");
    if ((p.weight_kg ?? null) === n) return;
    if (await patchProduct(p.id, { weight_kg: n })) flash("ok", "ذخیره شد.");
  }

  async function saveFactory(p: Prod, value: string) {
    const v = value || null;
    if (p.factory_id === v) return;
    if (await patchProduct(p.id, { factory_id: v })) flash("ok", "کارخانه ذخیره شد.");
  }

  async function saveAttr(p: Prod, key: string, value: string) {
    const id = attrId(key);
    const v = value.trim();
    if ((p.attributes?.[id] ?? "") === v) return;
    if (await patchProduct(p.id, { attributes: { ...(p.attributes ?? {}), [id]: v } })) flash("ok", "ذخیره شد.");
  }

  async function savePrice(p: Prod, value: string) {
    if (value.trim() === "") return;
    const n = parseNum(value);
    if (n === null) return flash("err", "قیمت باید عدد باشد.");
    if (latest(p) === n) return;
    const { error } = await supabase.from("daily_prices").insert({ product_id: p.id, price: n });
    if (error) return flash("err", "قیمت ذخیره نشد: " + error.message);
    const now = new Date().toISOString();
    setRows((list) =>
      list.map((r) => (r.id === p.id ? { ...r, daily_prices: [{ price: n, recorded_at: now }, ...(r.daily_prices ?? [])] } : r))
    );
    flash("ok", "قیمت ثبت شد.");
  }

  // ---------- تنظیم ستون‌های دسته ----------
  // هر تغییر، کل فهرست ستون‌های دسته را ذخیره می‌کند
  async function saveCfg(next: ColCfg[]) {
    if (!selCat) return;
    setBusy(true);
    const { error } = await supabase.from("categories").update({ table_config: next }).eq("id", selCat.id);
    setBusy(false);
    if (error) return flash("err", "ذخیره ستون‌ها ناموفق بود: " + error.message);
    setCats((list) => list.map((c) => (c.id === selCat.id ? { ...c, table_config: next } : c)));
    flash("ok", "ستون‌ها ذخیره شد.");
  }

  function moveCol(i: number, dir: -1 | 1) {
    const j = i + dir;
    if (j < 0 || j >= cfg.length) return;
    const next = [...cfg];
    [next[i], next[j]] = [next[j], next[i]];
    saveCfg(next);
  }

  function renameCol(i: number) {
    const label = window.prompt("نام جدید ستون:", cfg[i].label)?.trim();
    if (!label || label === cfg[i].label) return;
    saveCfg(cfg.map((c, k) => (k === i ? { ...c, label } : c)));
  }

  function toggleHidden(i: number) {
    saveCfg(cfg.map((c, k) => (k === i ? { ...c, hidden: !c.hidden } : c)));
  }

  function deleteAttrCol(i: number) {
    if (!window.confirm(`ستون «${cfg[i].label}» از جدول حذف شود؟ مقدارهای ثبت‌شده در محصولات می‌ماند.`)) return;
    saveCfg(cfg.filter((_, k) => k !== i));
  }

  function addColumn() {
    const label = newCol.trim();
    if (!label) return;
    if (!selCat) return flash("err", "اول یک دسته یا زیرمجموعه را انتخاب کن.");
    if (cfg.some((c) => c.label === label)) return flash("err", "این ستون قبلاً وجود دارد.");
    setNewCol("");
    saveCfg([...cfg, { key: `attr:${Date.now().toString(36)}`, label }]);
  }

  // ---------- سطرها ----------
  async function addRow() {
    if (!selCat) return flash("err", "برای افزودن سطر، اول یک دسته را انتخاب کن.");
    setBusy(true);
    const { error } = await supabase.from("products").insert({
      name: "محصول جدید",
      slug: `new-${Date.now().toString(36)}`,
      category_id: selCat.id,
      in_stock: true,
      visible: true,
    });
    setBusy(false);
    if (error) return flash("err", "افزودن سطر ناموفق بود: " + error.message);
    flash("ok", "سطر جدید اضافه شد.");
    load();
  }

  // انتقال یا کپی یک محصول به دسته‌ی دیگر؛ فقط همان محصول تغییر می‌کند
  async function transferRow(p: Prod, copy: boolean) {
    const targetId = targetFor[p.id];
    if (!targetId) return flash("err", "اول دسته‌ی مقصد را انتخاب کن.");
    if (targetId === p.category_id && !copy) return flash("err", "محصول از قبل در این دسته است.");
    const target = catById.get(targetId);
    if (copy) {
      setBusy(true);
      const { data, error } = await supabase
        .from("products")
        .insert({
          name: p.name,
          slug: `${p.name.trim().replace(/\s+/g, "-")}-${Date.now().toString(36)}`,
          size: p.size,
          weight_kg: p.weight_kg,
          grade: p.grade,
          loading_place: p.loading_place,
          price_unit: p.price_unit,
          factory_id: p.factory_id,
          category_id: targetId,
          attributes: p.attributes ?? {},
          in_stock: true,
          visible: true,
        })
        .select("id")
        .single();
      if (error || !data) {
        setBusy(false);
        return flash("err", "کپی ناموفق بود: " + (error?.message ?? ""));
      }
      const last = latest(p);
      if (last !== null) await supabase.from("daily_prices").insert({ product_id: data.id, price: last });
      setBusy(false);
      flash("ok", `کپی شد به «${target?.name ?? ""}».`);
      return load();
    }
    if (await patchProduct(p.id, { category_id: targetId })) {
      flash("ok", `به «${target?.name ?? ""}» منتقل شد.`);
      load();
    }
  }

  async function removeRow(p: Prod) {
    if (!window.confirm(`«${p.name}» حذف شود؟ این کار برگشت ندارد.`)) return;
    const { count, error: cErr } = await supabase
      .from("rfq_items")
      .select("id", { count: "exact", head: true })
      .eq("product_id", p.id);
    if (cErr) return flash("err", "بررسی استعلام‌ها ناموفق بود: " + cErr.message);
    if ((count ?? 0) > 0) return flash("err", "این محصول در استعلام‌ها استفاده شده و حذف نمی‌شود.");
    const { error } = await supabase.from("products").delete().eq("id", p.id);
    if (error) return flash("err", "حذف نشد: " + error.message);
    setRows((list) => list.filter((x) => x.id !== p.id));
    flash("ok", "سطر حذف شد.");
  }

  // محتوای هر سلول بر اساس نوع ستون
  function renderCell(p: Prod, c: ColCfg): ReactNode {
    const k = c.key;
    if (k === "name") {
      return <input key={`${p.id}-name-${p.name}`} defaultValue={p.name} className={INPUT} onBlur={(e) => saveProductField(p, "name", e.target.value)} />;
    }
    if (k === "factory") {
      return (
        <select key={`${p.id}-fac-${p.factory_id}`} defaultValue={p.factory_id ?? ""} className={INPUT} onChange={(e) => saveFactory(p, e.target.value)}>
          <option value="">بدون کارخانه</option>
          {factories.map((f) => (
            <option key={f.id} value={f.id}>{f.name}</option>
          ))}
        </select>
      );
    }
    if (k === "price") {
      const price = latest(p);
      return (
        <input
          key={`${p.id}-price-${price}`}
          defaultValue={price !== null ? String(price) : ""}
          placeholder="—"
          inputMode="decimal"
          className={INPUT}
          onBlur={(e) => savePrice(p, e.target.value)}
        />
      );
    }
    if (k === "weight_kg") {
      return (
        <input key={`${p.id}-w-${p.weight_kg}`} defaultValue={p.weight_kg ?? ""} inputMode="decimal" className={INPUT} onBlur={(e) => saveWeight(p, e.target.value)} />
      );
    }
    if (TEXT_FIELD[k]) {
      const field = TEXT_FIELD[k];
      const stored = p[field === "price_unit" ? "price_unit" : field] ?? "";
      return (
        <input key={`${p.id}-${k}-${stored}`} defaultValue={stored} className={INPUT} onBlur={(e) => saveProductField(p, field, e.target.value)} />
      );
    }
    if (isAttrKey(k)) {
      const stored = p.attributes?.[attrId(k)] ?? "";
      return <input key={`${p.id}-${k}-${stored}`} defaultValue={stored} className={INPUT} onBlur={(e) => saveAttr(p, k, e.target.value)} />;
    }
    return null;
  }

  return (
    <div>
      <div className="mb-4">
        <h1 className="mb-1 text-xl font-extrabold">جدول قیمت (مثل اکسل)</h1>
        <p className="text-sm text-ink/50">
          ستون‌ها را برای هر دسته جدا تنظیم کن: ترتیب، نام، و پنهان یا نمایش. هر سلول را عوض کنی و بیرون بیایی، فقط همان محصول ذخیره می‌شود.
        </p>
      </div>

      {msg && (
        <div className={`mb-4 rounded-xl px-4 py-3 text-sm font-semibold ${msg.type === "ok" ? "bg-success/10 text-success" : "bg-danger/10 text-danger"}`}>
          {msg.text}
        </div>
      )}

      {/* فیلترها */}
      <div className="mb-4 flex flex-wrap items-center gap-3">
        <select
          className="rounded-lg border border-black/10 bg-white px-3 py-2 text-sm outline-none focus:border-blue"
          value={sel}
          onChange={(e) => {
            setSel(e.target.value);
            setPage(0);
          }}
        >
          <option value="all">همه‌ی دسته‌ها (ستون‌های پیش‌فرض)</option>
          {cats
            .filter((c) => !c.parent_id)
            .map((c) => (
              <optgroup key={c.id} label={c.name}>
                <option value={c.id}>{c.name} (همه‌ی زیرمجموعه‌ها)</option>
                {cats.filter((k) => k.parent_id === c.id).map((k) => (
                  <option key={k.id} value={k.id}>{k.name}</option>
                ))}
              </optgroup>
            ))}
        </select>
        <select
          className="rounded-lg border border-black/10 bg-white px-3 py-2 text-sm outline-none focus:border-blue"
          value={facFilter}
          onChange={(e) => {
            setFacFilter(e.target.value);
            setPage(0);
          }}
        >
          <option value="all">همه‌ی کارخانه‌ها</option>
          <option value="none">بدون کارخانه</option>
          {factories.map((f) => (
            <option key={f.id} value={f.id}>{f.name}</option>
          ))}
        </select>
        <input
          className="min-w-[180px] rounded-lg border border-black/10 bg-white px-3 py-2 text-sm outline-none focus:border-blue"
          placeholder="جستجوی نام محصول"
          value={q}
          onChange={(e) => {
            setQ(e.target.value);
            setPage(0);
          }}
        />
        <button disabled={busy || !selCat} onClick={addRow} className={`${BTN} flex items-center gap-1 bg-blue text-white`}>
          <Plus size={13} /> سطر جدید
        </button>
        <span className="text-xs text-ink/45">{filtered.length.toLocaleString("fa-IR")} سطر</span>
      </div>

      {/* تنظیم ستون‌ها */}
      <div className="mb-5 rounded-card border border-black/5 bg-white p-4">
        {!selCat ? (
          <p className="text-xs text-ink/50">برای تغییر ستون‌ها، اول یک دسته یا زیرمجموعه را از بالا انتخاب کن.</p>
        ) : (
          <>
            <div className="mb-3 text-xs font-extrabold text-blue">
              ستون‌های «{selCat.name}»
              {!selCat.table_config?.length && parentCat && <span className="font-normal text-ink/45"> (از «{parentCat.name}» گرفته شده؛ با اولین تغییر، برای این دسته ذخیره می‌شود)</span>}
            </div>
            <div className="mb-3 flex flex-wrap gap-2">
              {cfg.map((c, i) => {
                const core = CORE_KEYS.includes(c.key);
                const attr = isAttrKey(c.key);
                return (
                  <span
                    key={c.key + i}
                    className={`flex items-center gap-1 rounded-pill py-1 pe-1 ps-3 text-xs font-bold ${c.hidden ? "bg-black/5 text-ink/35 line-through" : "bg-steel"}`}
                  >
                    {c.label}
                    <button disabled={busy || i === 0} onClick={() => moveCol(i, -1)} className={ICON} aria-label="جابه‌جایی به قبل"><ArrowUp size={12} /></button>
                    <button disabled={busy || i === cfg.length - 1} onClick={() => moveCol(i, 1)} className={ICON} aria-label="جابه‌جایی به بعد"><ArrowDown size={12} /></button>
                    <button disabled={busy} onClick={() => renameCol(i)} className={ICON} aria-label="تغییر نام"><Pencil size={12} /></button>
                    {!core && (
                      <button disabled={busy} onClick={() => toggleHidden(i)} className={ICON} aria-label={c.hidden ? "نمایش" : "پنهان کردن"}>
                        {c.hidden ? <Eye size={12} /> : <EyeOff size={12} />}
                      </button>
                    )}
                    {attr && (
                      <button disabled={busy} onClick={() => deleteAttrCol(i)} className={`${ICON} text-danger`} aria-label="حذف ستون"><X size={12} /></button>
                    )}
                  </span>
                );
              })}
            </div>
            <div className="flex max-w-md gap-2">
              <input
                className="flex-1 rounded-lg border border-black/10 bg-white px-3 py-2 text-sm outline-none focus:border-blue"
                placeholder="ستون جدید، مثلاً: ابعاد یا وزن هر شاخه ۱۲ متری"
                value={newCol}
                onChange={(e) => setNewCol(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    e.preventDefault();
                    addColumn();
                  }
                }}
              />
              <button disabled={busy} onClick={addColumn} className={`${BTN} flex items-center gap-1 bg-blue text-white`}>
                <Plus size={13} /> ستون
              </button>
            </div>
            <p className="mt-2 text-[11px] text-ink/45">
              نام، سایز، کارخانه و قیمت ستون‌های اصلی‌اند و پنهان نمی‌شوند. بقیه‌ی ستون‌ها را می‌توانی پنهان، جابه‌جا یا تغییر نام بدهی.
              ستون پنهان‌شده در جدول سایت هم دیده نمی‌شود؛ دوباره با آیکون چشم نمایشش بده.
            </p>
          </>
        )}
      </div>

      {/* جدول */}
      <div className="overflow-x-auto rounded-card border border-black/5 bg-white">
        <table className="w-full min-w-[900px] text-right text-xs">
          <thead className="sticky top-0 bg-steel text-[11px] font-extrabold text-ink/60">
            <tr>
              <th className="p-2.5">#</th>
              {shown.map((c) => (
                <th key={c.key + c.label} className="p-2.5">{c.label}</th>
              ))}
              <th className="p-2.5">انتقال / کپی</th>
              <th className="p-2.5">حذف</th>
            </tr>
          </thead>
          <tbody>
            {pageRows.length === 0 && (
              <tr>
                <td colSpan={shown.length + 3} className="p-8 text-center text-ink/40">
                  ردیفی با این فیلترها نیست.
                </td>
              </tr>
            )}
            {pageRows.map((p, idx) => (
              <tr key={p.id} className="border-t border-black/5">
                <td className="p-2 text-ink/40">{(currentPage * PAGE + idx + 1).toLocaleString("fa-IR")}</td>
                {shown.map((c) => (
                  <td key={c.key + c.label} className="p-2">
                    {renderCell(p, c)}
                  </td>
                ))}
                <td className="p-2">
                  <div className="flex min-w-[200px] items-center gap-1">
                    <select
                      className={INPUT}
                      value={targetFor[p.id] ?? ""}
                      onChange={(e) => setTargetFor({ ...targetFor, [p.id]: e.target.value })}
                    >
                      <option value="">انتخاب دسته…</option>
                      {cats.map((c) => (
                        <option key={c.id} value={c.id}>
                          {c.parent_id ? `${catById.get(c.parent_id)?.name ?? ""} › ${c.name}` : c.name}
                        </option>
                      ))}
                    </select>
                    <button disabled={busy} onClick={() => transferRow(p, false)} className={`${BTN} bg-blue text-white`}>انتقال</button>
                    <button disabled={busy} onClick={() => transferRow(p, true)} className={ICON} aria-label="کپی">
                      <Copy size={12} />
                    </button>
                  </div>
                </td>
                <td className="p-2">
                  <button disabled={busy} onClick={() => removeRow(p)} className={`${ICON} bg-danger/10 text-danger`} aria-label="حذف سطر">
                    <Trash2 size={13} />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* صفحه‌بندی */}
      {pages > 1 && (
        <div className="mt-4 flex items-center justify-center gap-3 text-xs">
          <button disabled={currentPage === 0} onClick={() => setPage(currentPage - 1)} className={`${BTN} bg-black/5`}>صفحه‌ی قبل</button>
          <span className="font-bold">
            صفحه {(currentPage + 1).toLocaleString("fa-IR")} از {pages.toLocaleString("fa-IR")}
          </span>
          <button disabled={currentPage >= pages - 1} onClick={() => setPage(currentPage + 1)} className={`${BTN} bg-black/5`}>صفحه‌ی بعد</button>
        </div>
      )}
    </div>
  );
}
