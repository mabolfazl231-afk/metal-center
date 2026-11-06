"use client";

import { useEffect, useState } from "react";
import { ArrowUp, ArrowDown, Copy, Pencil, Plus, Trash2, X } from "lucide-react";
import { supabase } from "@/lib/supabase";

// جدول قیمت به شکل اکسل: هر سلول بعد از خروج از آن فقط برای همان محصول ذخیره می‌شود.
// ستون‌های اختصاصی و فیلدهای ثابت هر دسته را می‌توان جدا تنظیم کرد.

type Cat = {
  id: string;
  name: string;
  parent_id: string | null;
  price_columns: string[] | null;
  hidden_fields: string[] | null;
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

// فیلدهای ثابتی که دسته می‌تواند مخفی کند
const FIXED = [
  { key: "grade", label: "گرید" },
  { key: "loading_place", label: "محل بارگیری" },
  { key: "price_unit", label: "واحد" },
];

const INPUT = "w-full min-w-[90px] rounded-md border border-black/10 bg-white px-2 py-1.5 text-xs outline-none focus:border-blue";
const BTN = "rounded-lg px-2.5 py-1.5 text-xs font-bold transition disabled:opacity-40";
const ICON = "flex h-7 w-7 items-center justify-center rounded-md bg-black/5 transition disabled:opacity-30";

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
  const [busy, setBusy] = useState(false);
  const [msg, setMsg] = useState<Msg>(null);
  const [newCol, setNewCol] = useState("");
  const [targetFor, setTargetFor] = useState<Record<string, string>>({});

  function flash(type: "ok" | "err", text: string) {
    setMsg({ type, text });
  }

  async function load() {
    const [c, f, p] = await Promise.all([
      supabase.from("categories").select("id,name,parent_id,price_columns,hidden_fields,sort_order").order("sort_order").order("name"),
      supabase.from("factories").select("id,name").order("name"),
      supabase
        .from("products")
        .select("id,name,size,weight_kg,grade,loading_place,price_unit,factory_id,category_id,attributes,daily_prices(price,recorded_at)")
        .order("name")
        .limit(2000),
    ]);
    const err = c.error || f.error || p.error;
    if (err) return flash("err", "خواندن اطلاعات ناموفق بود. اگر خطای ستون می‌بینی، فایل 0011 را در Supabase اجرا کن. (" + err.message + ")");
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

  // فیلتر: دسته (با زیرمجموعه‌ها)، کارخانه، و نام محصول — هرکدام جدا
  const visible = rows.filter((p) => {
    if (sel !== "all" && !(p.category_id === sel || (p.category_id !== null && childIds.includes(p.category_id)))) return false;
    if (facFilter === "none" && p.factory_id) return false;
    if (facFilter !== "all" && facFilter !== "none" && p.factory_id !== facFilter) return false;
    if (q.trim() && !p.name.includes(q.trim())) return false;
    return true;
  });

  // ستون‌های اختصاصی و فیلدهای مخفی: خود دسته، و اگر خالی بود، والدش
  const cols: string[] = selCat ? (selCat.price_columns?.length ? selCat.price_columns : parentCat?.price_columns ?? []) : [];
  const hidden: string[] = selCat ? (selCat.hidden_fields?.length ? selCat.hidden_fields : parentCat?.hidden_fields ?? []) : [];
  const shownFixed = FIXED.filter((f) => !hidden.includes(f.key));

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

  async function saveText(p: Prod, field: "name" | "size" | "grade" | "loading_place" | "price_unit", value: string) {
    const v = value.trim() || null;
    if (field === "name" && !v) return flash("err", "نام محصول نمی‌تواند خالی باشد.");
    if ((p[field] ?? null) === v) return;
    if (await patchProduct(p.id, { [field]: v } as Partial<Prod>)) flash("ok", "ذخیره شد.");
  }

  async function saveFactory(p: Prod, value: string) {
    const v = value || null;
    if (p.factory_id === v) return;
    if (await patchProduct(p.id, { factory_id: v })) flash("ok", "کارخانه ذخیره شد.");
  }

  async function saveAttr(p: Prod, label: string, value: string) {
    const v = value.trim();
    if ((p.attributes?.[label] ?? "") === v) return;
    if (await patchProduct(p.id, { attributes: { ...(p.attributes ?? {}), [label]: v } })) flash("ok", "ذخیره شد.");
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

  // ---------- تنظیمات دسته: ستون‌ها و فیلدهای ثابت ----------
  async function updateCat(patch: Partial<Cat>) {
    if (!selCat) return false;
    setBusy(true);
    const { error } = await supabase.from("categories").update(patch).eq("id", selCat.id);
    setBusy(false);
    if (error) {
      flash("err", "ذخیره نشد: " + error.message);
      return false;
    }
    setCats((list) => list.map((c) => (c.id === selCat.id ? { ...c, ...patch } : c)));
    flash("ok", "تنظیمات دسته ذخیره شد.");
    return true;
  }

  function setCols(next: string[]) {
    return updateCat({ price_columns: next });
  }

  function addColumn() {
    const label = newCol.trim();
    if (!label) return;
    if (!selCat) return flash("err", "اول یک دسته یا زیرمجموعه را انتخاب کن.");
    if (cols.includes(label)) return flash("err", "این ستون قبلاً وجود دارد.");
    setNewCol("");
    setCols([...cols, label]);
  }

  function moveCol(i: number, dir: -1 | 1) {
    const j = i + dir;
    if (j < 0 || j >= cols.length) return;
    const next = [...cols];
    [next[i], next[j]] = [next[j], next[i]];
    setCols(next);
  }

  function removeCol(label: string) {
    if (!window.confirm(`ستون «${label}» از جدول این دسته حذف شود؟ مقدار‌های ثبت‌شده‌ی آن در محصولات می‌ماند.`)) return;
    setCols(cols.filter((x) => x !== label));
  }

  // تغییر نام ستون: مقدار همه‌ی ردیف‌های دیده‌شده هم منتقل می‌شود
  async function renameCol(old: string) {
    const label = window.prompt("نام جدید ستون:", old)?.trim();
    if (!label || label === old) return;
    if (cols.includes(label)) return flash("err", "این نام قبلاً استفاده شده است.");
    setBusy(true);
    for (const p of visible) {
      if (!p.attributes || !(old in p.attributes)) continue;
      const attrs: Record<string, string> = { ...p.attributes, [label]: p.attributes[old] };
      delete attrs[old];
      const { error } = await supabase.from("products").update({ attributes: attrs }).eq("id", p.id);
      if (error) {
        setBusy(false);
        return flash("err", "تغییر نام انجام نشد: " + error.message);
      }
    }
    setBusy(false);
    await setCols(cols.map((x) => (x === old ? label : x)));
    load();
  }

  function toggleFixed(key: string) {
    if (!selCat) return;
    const base = selCat.hidden_fields?.length ? selCat.hidden_fields : parentCat?.hidden_fields ?? [];
    const next = base.includes(key) ? base.filter((x) => x !== key) : [...base, key];
    updateCat({ hidden_fields: next });
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
    flash("ok", "سطر جدید اضافه شد. نام و قیمتش را در همان ردیف عوض کن.");
    load();
  }

  // انتقال یا کپی یک محصول به زیرمجموعه‌ی دیگر (فقط همان محصول)
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

  return (
    <div>
      <div className="mb-4">
        <h1 className="mb-1 text-xl font-extrabold">جدول قیمت (مثل اکسل)</h1>
        <p className="text-sm text-ink/50">
          هر سلول را عوض کنی و بیرون بیایی، فقط همان محصول ذخیره می‌شود. ستون‌ها و فیلدهای ثابت را برای هر دسته جدا تنظیم کن.
        </p>
      </div>

      {msg && (
        <div className={`mb-4 rounded-xl px-4 py-3 text-sm font-semibold ${msg.type === "ok" ? "bg-success/10 text-success" : "bg-danger/10 text-danger"}`}>
          {msg.text}
        </div>
      )}

      {/* فیلترها: دسته، کارخانه، نام محصول — جدا از هم */}
      <div className="mb-4 flex flex-wrap items-center gap-3">
        <select className="rounded-lg border border-black/10 bg-white px-3 py-2 text-sm outline-none focus:border-blue" value={sel} onChange={(e) => setSel(e.target.value)}>
          <option value="all">همه‌ی دسته‌ها</option>
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
        <select className="rounded-lg border border-black/10 bg-white px-3 py-2 text-sm outline-none focus:border-blue" value={facFilter} onChange={(e) => setFacFilter(e.target.value)}>
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
          onChange={(e) => setQ(e.target.value)}
        />
        <button disabled={busy || !selCat} onClick={addRow} className={`${BTN} flex items-center gap-1 bg-blue text-white`}>
          <Plus size={13} /> سطر جدید
        </button>
        <span className="text-xs text-ink/45">{visible.length.toLocaleString("fa-IR")} سطر</span>
      </div>

      {/* تنظیمات دسته */}
      {selCat && (
        <div className="mb-5 grid gap-4 rounded-card border border-black/5 bg-white p-4 lg:grid-cols-2">
          <div>
            <div className="mb-3 text-xs font-extrabold text-blue">
              ستون‌های اختصاصی «{selCat.name}»
              {!selCat.price_columns?.length && parentCat && <span className="font-normal text-ink/45"> (از «{parentCat.name}» گرفته شده)</span>}
            </div>
            <div className="mb-3 flex flex-wrap gap-2">
              {cols.length === 0 && <span className="text-xs text-ink/40">هنوز ستونی ندارد.</span>}
              {cols.map((label, i) => (
                <span key={label} className="flex items-center gap-1 rounded-pill bg-steel py-1 pe-1 ps-3 text-xs font-bold">
                  {label}
                  <button disabled={busy || i === 0} onClick={() => moveCol(i, -1)} className={ICON} aria-label="جابه‌جایی به قبل"><ArrowUp size={12} /></button>
                  <button disabled={busy || i === cols.length - 1} onClick={() => moveCol(i, 1)} className={ICON} aria-label="جابه‌جایی به بعد"><ArrowDown size={12} /></button>
                  <button disabled={busy} onClick={() => renameCol(label)} className={ICON} aria-label="تغییر نام"><Pencil size={12} /></button>
                  <button disabled={busy} onClick={() => removeCol(label)} className={`${ICON} text-danger`} aria-label="حذف ستون"><X size={12} /></button>
                </span>
              ))}
            </div>
            <div className="flex gap-2">
              <input
                className="flex-1 rounded-lg border border-black/10 bg-white px-3 py-2 text-sm outline-none focus:border-blue"
                placeholder="ستون جدید، مثلاً: وزن هر شاخه ۱۲ متری"
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
          </div>

          <div>
            <div className="mb-3 text-xs font-extrabold text-blue">فیلدهای ثابت برای «{selCat.name}»</div>
            <p className="mb-3 text-[11px] text-ink/45">تیک‌هایی که برداری، در جدول سایت برای این دسته نشان داده نمی‌شوند.</p>
            <div className="flex flex-wrap gap-2">
              {FIXED.map((f) => {
                const isHidden = hidden.includes(f.key);
                return (
                  <button
                    key={f.key}
                    disabled={busy}
                    onClick={() => toggleFixed(f.key)}
                    className={`rounded-pill px-3 py-1.5 text-xs font-bold transition ${isHidden ? "bg-black/5 text-ink/40 line-through" : "bg-success/10 text-success"}`}
                  >
                    {f.label} {isHidden ? "(مخفی)" : "(نمایش)"}
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* جدول */}
      <div className="overflow-x-auto rounded-card border border-black/5 bg-white">
        <table className="min-w-[1100px] w-full text-right text-xs">
          <thead className="sticky top-0 bg-steel text-[11px] font-extrabold text-ink/60">
            <tr>
              <th className="p-2.5">#</th>
              <th className="p-2.5">نام محصول</th>
              <th className="p-2.5">سایز</th>
              <th className="p-2.5">کارخانه</th>
              {shownFixed.map((f) => (
                <th key={f.key} className="p-2.5">{f.label}</th>
              ))}
              <th className="p-2.5">قیمت (تومان)</th>
              {cols.map((label) => (
                <th key={label} className="p-2.5">{label}</th>
              ))}
              <th className="p-2.5">انتقال / کپی</th>
              <th className="p-2.5">حذف</th>
            </tr>
          </thead>
          <tbody>
            {visible.length === 0 && (
              <tr>
                <td colSpan={8 + shownFixed.length + cols.length} className="p-8 text-center text-ink/40">
                  ردیفی با این فیلترها نیست.
                </td>
              </tr>
            )}
            {visible.map((p, idx) => {
              const price = latest(p);
              return (
                <tr key={p.id} className="border-t border-black/5">
                  <td className="p-2 text-ink/40">{(idx + 1).toLocaleString("fa-IR")}</td>
                  <td className="p-2">
                    <input key={`${p.id}-name-${p.name}`} defaultValue={p.name} className={INPUT} onBlur={(e) => saveText(p, "name", e.target.value)} />
                  </td>
                  <td className="p-2">
                    <input key={`${p.id}-size-${p.size}`} defaultValue={p.size ?? ""} className={INPUT} onBlur={(e) => saveText(p, "size", e.target.value)} />
                  </td>
                  <td className="p-2">
                    <select key={`${p.id}-fac-${p.factory_id}`} defaultValue={p.factory_id ?? ""} className={INPUT} onChange={(e) => saveFactory(p, e.target.value)}>
                      <option value="">بدون کارخانه</option>
                      {factories.map((f) => (
                        <option key={f.id} value={f.id}>{f.name}</option>
                      ))}
                    </select>
                  </td>
                  {shownFixed.map((f) => {
                    const stored = f.key === "grade" ? p.grade : f.key === "loading_place" ? p.loading_place : p.price_unit;
                    return (
                      <td key={f.key} className="p-2">
                        <input
                          key={`${p.id}-${f.key}-${stored}`}
                          defaultValue={stored ?? ""}
                          className={INPUT}
                          onBlur={(e) => saveText(p, f.key as "grade" | "loading_place" | "price_unit", e.target.value)}
                        />
                      </td>
                    );
                  })}
                  <td className="p-2">
                    <input
                      key={`${p.id}-price-${price}`}
                      defaultValue={price !== null ? String(price) : ""}
                      placeholder="—"
                      inputMode="decimal"
                      className={INPUT}
                      onBlur={(e) => savePrice(p, e.target.value)}
                    />
                  </td>
                  {cols.map((label) => (
                    <td key={label} className="p-2">
                      <input
                        key={`${p.id}-attr-${label}-${p.attributes?.[label] ?? ""}`}
                        defaultValue={p.attributes?.[label] ?? ""}
                        className={INPUT}
                        onBlur={(e) => saveAttr(p, label, e.target.value)}
                      />
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
                      <button disabled={busy} onClick={() => transferRow(p, true)} className={`${ICON}`} aria-label="کپی">
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
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
