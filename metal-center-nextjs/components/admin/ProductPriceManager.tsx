"use client";

import { useEffect, useMemo, useState, type FormEvent } from "react";
import { supabase } from "@/lib/supabase";

type Option = { id: string; name: string };

type Row = {
  id: string;
  name: string;
  size: string | null;
  standard: string | null;
  weight_kg: number | string | null;
  in_stock: boolean;
  visible: boolean;
  call_for_price: boolean;
  category_id: string | null;
  factory_id: string | null;
  attributes: Record<string, string> | null;
  categories: { name: string; price_columns: string[] | null } | null;
  factories: { name: string } | null;
  daily_prices: { price: number | string; recorded_at: string }[] | null;
};

type CatOption = Option & { price_columns: string[] | null };

type Msg = { type: "ok" | "err"; text: string } | null;

const INPUT = "w-full rounded-lg border border-black/10 bg-white px-3 py-2 text-sm outline-none focus:border-blue";
const BTN = "rounded-lg px-3 py-2 text-xs font-bold transition disabled:opacity-40";
const EMPTY_ADD = { name: "", size: "", standard: "", weight: "", category_id: "", factory_id: "", price: "" };
const EMPTY_EDIT = { name: "", size: "", standard: "", weight: "", category_id: "", factory_id: "" };

// تبدیل ارقام فارسی و کاما به عدد؛ اگر معتبر نبود null برمی‌گرداند
function parseNum(v: string): number | null {
  const fa = "۰۱۲۳۴۵۶۷۸۹";
  const latin = v.replace(/[,٬\s]/g, "").replace(/[۰-۹]/g, (d) => String(fa.indexOf(d)));
  const n = Number(latin);
  return Number.isFinite(n) && n > 0 ? n : null;
}

function chunk<T>(arr: T[], size = 300): T[][] {
  const out: T[][] = [];
  for (let i = 0; i < arr.length; i += size) out.push(arr.slice(i, i + size));
  return out;
}

function latestPrice(r: Row): number | null {
  const list = [...(r.daily_prices ?? [])].sort((a, b) => (a.recorded_at < b.recorded_at ? 1 : -1));
  return list[0] ? Number(list[0].price) : null;
}

export default function ProductPriceManager() {
  const [rows, setRows] = useState<Row[]>([]);
  const [categories, setCategories] = useState<CatOption[]>([]);
  const [editAttrs, setEditAttrs] = useState<Record<string, string>>({});
  const [factories, setFactories] = useState<Option[]>([]);
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState(false);
  const [msg, setMsg] = useState<Msg>(null);

  const [q, setQ] = useState("");
  const [catId, setCatId] = useState("");
  const [facId, setFacId] = useState("");
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [drafts, setDrafts] = useState<Record<string, string>>({});
  const [bulkPrice, setBulkPrice] = useState("");
  const [editing, setEditing] = useState<Row | null>(null);
  const [editForm, setEditForm] = useState(EMPTY_EDIT);
  const [addForm, setAddForm] = useState(EMPTY_ADD);

  function flash(type: "ok" | "err", text: string) {
    setMsg({ type, text });
  }

  async function load() {
    setLoading(true);
    const [p, c, f] = await Promise.all([
      supabase
        .from("products")
        .select(
          "id,name,size,standard,weight_kg,in_stock,visible,call_for_price,category_id,factory_id,attributes,categories(name,price_columns),factories(name),daily_prices(price,recorded_at)"
        )
        .order("name"),
      supabase.from("categories").select("id,name,price_columns").order("name"),
      supabase.from("factories").select("id,name").order("name"),
    ]);
    setLoading(false);
    const err = p.error || c.error || f.error;
    if (err) return flash("err", "خواندن اطلاعات ناموفق بود: " + err.message);
    setRows((p.data ?? []) as unknown as Row[]);
    setCategories(c.data ?? []);
    setFactories(f.data ?? []);
  }

  useEffect(() => {
    load();
  }, []);

  const filtered = useMemo(() => {
    const term = q.trim().toLowerCase();
    return rows.filter(
      (r) =>
        (!catId || r.category_id === catId) &&
        (!facId || r.factory_id === facId) &&
        (!term || (r.name + " " + (r.size ?? "")).toLowerCase().includes(term))
    );
  }, [rows, q, catId, facId]);

  const allFilteredSelected = filtered.length > 0 && filtered.every((r) => selected.has(r.id));

  // ستون‌های اختصاصی دسته‌ی انتخاب‌شده در پنجره‌ی ویرایش
  const editCols = categories.find((c) => c.id === editForm.category_id)?.price_columns ?? [];

  function toggleOne(id: string) {
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }

  function toggleAllFiltered() {
    if (allFilteredSelected) {
      setSelected(new Set());
    } else {
      setSelected(new Set(filtered.map((r) => r.id)));
    }
  }

  // ثبت قیمت تکی: یک ردیف تازه در تاریخچه ساخته می‌شود
  async function savePrice(id: string) {
    const v = parseNum(drafts[id] ?? "");
    if (!v) return flash("err", "یک قیمت معتبر بالاتر از صفر وارد کن.");
    setBusy(true);
    const { error } = await supabase.from("daily_prices").insert({ product_id: id, price: v });
    if (error) {
      setBusy(false);
      return flash("err", "ثبت قیمت ناموفق بود: " + error.message);
    }
    await supabase.from("products").update({ call_for_price: false }).eq("id", id);
    setBusy(false);
    setDrafts((d) => ({ ...d, [id]: "" }));
    flash("ok", "قیمت ثبت شد.");
    load();
  }

  // تغییر یک فیلد محصول (موجودی، نمایش، قیمت تماس)
  async function setField(id: string, patch: Record<string, unknown>) {
    const { error } = await supabase.from("products").update(patch).eq("id", id);
    if (error) return flash("err", "تغییر ذخیره نشد: " + error.message);
    setRows((list) => list.map((r) => (r.id === id ? ({ ...r, ...patch } as Row) : r)));
  }

  // قیمت گروهی برای همه‌ی ردیف‌های انتخاب‌شده
  async function applyBulkPrice() {
    const v = parseNum(bulkPrice);
    const ids = [...selected];
    if (!v) return flash("err", "قیمت گروهی معتبر وارد کن.");
    if (!ids.length) return flash("err", "هیچ محصولی انتخاب نشده.");
    if (!window.confirm(`قیمت ${v.toLocaleString("fa-IR")} برای ${ids.length} محصول ثبت شود؟`)) return;
    setBusy(true);
    for (const part of chunk(ids)) {
      const { error } = await supabase
        .from("daily_prices")
        .insert(part.map((id) => ({ product_id: id, price: v })));
      if (error) {
        setBusy(false);
        return flash("err", "ثبت گروهی ناموفق بود: " + error.message);
      }
      await supabase.from("products").update({ call_for_price: false }).in("id", part);
    }
    setBusy(false);
    setBulkPrice("");
    setSelected(new Set());
    flash("ok", `قیمت برای ${ids.length} محصول ثبت شد.`);
    load();
  }

  // قیمت تماس گروهی (روشن یا خاموش) برای همه‌ی ردیف‌های انتخاب‌شده
  async function applyCallForPrice(on: boolean) {
    const ids = [...selected];
    if (!ids.length) return flash("err", "هیچ محصولی انتخاب نشده.");
    const text = on ? "«قیمت تماس بگیرید» روی" : "«قیمت تماس» از";
    if (!window.confirm(`${text} ${ids.length} محصول اعمال شود؟`)) return;
    setBusy(true);
    for (const part of chunk(ids)) {
      const { error } = await supabase.from("products").update({ call_for_price: on }).in("id", part);
      if (error) {
        setBusy(false);
        return flash("err", "تغییر گروهی ناموفق بود: " + error.message);
      }
    }
    setBusy(false);
    setSelected(new Set());
    flash("ok", `روی ${ids.length} محصول اعمال شد.`);
    load();
  }

  function openEdit(r: Row) {
    setEditing(r);
    setEditAttrs(r.attributes ?? {});
    setEditForm({
      name: r.name,
      size: r.size ?? "",
      standard: r.standard ?? "",
      weight: r.weight_kg == null ? "" : String(r.weight_kg),
      category_id: r.category_id ?? "",
      factory_id: r.factory_id ?? "",
    });
  }

  async function saveEdit() {
    if (!editing) return;
    const name = editForm.name.trim();
    if (!name) return flash("err", "نام محصول نمی‌تواند خالی باشد.");
    const weight = editForm.weight.trim() === "" ? null : Number(editForm.weight.replace(",", "."));
    setBusy(true);
    const { error } = await supabase
      .from("products")
      .update({
        name,
        size: editForm.size.trim() || null,
        standard: editForm.standard.trim() || null,
        weight_kg: weight,
        category_id: editForm.category_id || null,
        factory_id: editForm.factory_id || null,
        // فقط ستون‌های پرشده ذخیره می‌شوند
        attributes: Object.fromEntries(
          Object.entries(editAttrs)
            .map(([k, v]) => [k, v.trim()] as const)
            .filter(([, v]) => v !== "")
        ),
      })
      .eq("id", editing.id);
    setBusy(false);
    if (error) return flash("err", "ذخیره‌ی مشخصات ناموفق بود: " + error.message);
    setEditing(null);
    flash("ok", "مشخصات محصول ذخیره شد.");
    load();
  }

  async function addProduct(e: FormEvent) {
    e.preventDefault();
    if (!addForm.name.trim()) return flash("err", "نام محصول را وارد کن.");
    setBusy(true);
    const slug = `${addForm.name.trim().replace(/\s+/g, "-")}-${Date.now().toString(36)}`;
    const { data, error } = await supabase
      .from("products")
      .insert({
        name: addForm.name.trim(),
        slug,
        size: addForm.size.trim() || null,
        standard: addForm.standard.trim() || null,
        weight_kg: addForm.weight.trim() ? Number(addForm.weight.replace(",", ".")) : null,
        category_id: addForm.category_id || null,
        factory_id: addForm.factory_id || null,
        in_stock: true,
        visible: true,
      })
      .select("id")
      .single();
    if (error || !data) {
      setBusy(false);
      return flash("err", "افزودن محصول ناموفق بود: " + (error?.message ?? ""));
    }
    const price = parseNum(addForm.price);
    if (price) await supabase.from("daily_prices").insert({ product_id: data.id, price });
    setBusy(false);
    setAddForm(EMPTY_ADD);
    flash("ok", "محصول اضافه شد.");
    load();
  }

  function priceCell(r: Row) {
    if (r.call_for_price) return <span className="rounded-pill bg-warning/15 px-2 py-0.5 text-[11px] font-bold text-[#B87700]">تماس بگیرید</span>;
    const p = latestPrice(r);
    return p ? <span className="font-extrabold">{Math.round(p).toLocaleString("fa-IR")}</span> : <span className="text-xs text-ink/40">استعلام</span>;
  }

  return (
    <div>
      <h1 className="mb-1 text-xl font-extrabold">محصولات و قیمت‌ها</h1>
      <p className="mb-5 text-sm text-ink/50">
        هر تغییر قیمت به‌عنوان یک ثبت تازه ذخیره می‌شود و تاریخچه‌ی نمودار را تشکیل می‌دهد. برای تغییر گروهی، ردیف‌ها را تیک بزن.
      </p>

      {msg && (
        <div className={`mb-5 rounded-xl px-4 py-3 text-sm font-semibold ${msg.type === "ok" ? "bg-success/10 text-success" : "bg-danger/10 text-danger"}`}>
          {msg.text}
        </div>
      )}

      <details className="mb-5 rounded-card border border-black/5 bg-white p-4">
        <summary className="cursor-pointer text-sm font-extrabold">+ افزودن محصول جدید</summary>
        <form onSubmit={addProduct} className="mt-4 grid gap-3 md:grid-cols-4">
          <input className={INPUT} placeholder="نام محصول" value={addForm.name} onChange={(e) => setAddForm({ ...addForm, name: e.target.value })} required />
          <input className={INPUT} placeholder="سایز (مثلاً ۱۶ میلی‌متر)" value={addForm.size} onChange={(e) => setAddForm({ ...addForm, size: e.target.value })} />
          <input className={INPUT} placeholder="وزن (کیلوگرم بر متر)" value={addForm.weight} onChange={(e) => setAddForm({ ...addForm, weight: e.target.value })} />
          <input className={INPUT} placeholder="استاندارد (مثلاً A3)" value={addForm.standard} onChange={(e) => setAddForm({ ...addForm, standard: e.target.value })} />
          <select className={INPUT} value={addForm.category_id} onChange={(e) => setAddForm({ ...addForm, category_id: e.target.value })}>
            <option value="">دسته‌بندی</option>
            {categories.map((c) => (
              <option key={c.id} value={c.id}>{c.name}</option>
            ))}
          </select>
          <select className={INPUT} value={addForm.factory_id} onChange={(e) => setAddForm({ ...addForm, factory_id: e.target.value })}>
            <option value="">کارخانه</option>
            {factories.map((f) => (
              <option key={f.id} value={f.id}>{f.name}</option>
            ))}
          </select>
          <input className={INPUT} placeholder="قیمت اولیه (اختیاری)" value={addForm.price} onChange={(e) => setAddForm({ ...addForm, price: e.target.value })} />
          <button disabled={busy} className={`${BTN} bg-blue text-white`}>افزودن</button>
        </form>
      </details>

      {/* فیلترها */}
      <div className="mb-3 grid gap-2 md:grid-cols-[1fr_200px_220px]">
        <input className={INPUT} placeholder="جستجو در نام یا سایز..." value={q} onChange={(e) => setQ(e.target.value)} />
        <select className={INPUT} value={catId} onChange={(e) => setCatId(e.target.value)}>
          <option value="">همه‌ی دسته‌ها</option>
          {categories.map((c) => (
            <option key={c.id} value={c.id}>{c.name}</option>
          ))}
        </select>
        <select className={INPUT} value={facId} onChange={(e) => setFacId(e.target.value)}>
          <option value="">همه‌ی کارخانه‌ها</option>
          {factories.map((f) => (
            <option key={f.id} value={f.id}>{f.name}</option>
          ))}
        </select>
      </div>
      <div className="mb-3 text-xs text-ink/50">نمایش {filtered.length} از {rows.length} محصول</div>

      {/* نوار عملیات گروهی */}
      {selected.size > 0 && (
        <div className="sticky top-2 z-10 mb-3 flex flex-wrap items-center gap-2 rounded-card border border-blue/30 bg-white p-3 shadow-lifted">
          <span className="text-sm font-extrabold text-blue">{selected.size} محصول انتخاب شده</span>
          <input
            className="w-44 rounded-lg border border-black/10 px-3 py-2 text-sm outline-none focus:border-blue"
            placeholder="قیمت گروهی (تومان)"
            value={bulkPrice}
            onChange={(e) => setBulkPrice(e.target.value)}
          />
          <button disabled={busy} onClick={applyBulkPrice} className={`${BTN} bg-blue text-white`}>ثبت قیمت گروهی</button>
          <button disabled={busy} onClick={() => applyCallForPrice(true)} className={`${BTN} bg-warning/20 text-[#B87700]`}>قیمت تماس بگیرید</button>
          <button disabled={busy} onClick={() => applyCallForPrice(false)} className={`${BTN} bg-black/5 text-ink`}>حذف قیمت تماس</button>
          <button disabled={busy} onClick={() => setSelected(new Set())} className={`${BTN} mr-auto text-ink/60`}>لغو انتخاب</button>
        </div>
      )}

      {loading ? (
        <p className="py-10 text-center text-sm text-ink/40">در حال بارگذاری...</p>
      ) : (
        <div className="overflow-x-auto rounded-card border border-black/5 bg-white">
          <table className="w-full min-w-[1000px] text-right text-sm">
            <thead className="bg-black/[0.03] text-xs text-ink/60">
              <tr>
                <th className="p-3">
                  <input type="checkbox" checked={allFilteredSelected} onChange={toggleAllFiltered} className="accent-blue" aria-label="انتخاب همه" />
                </th>
                <th className="p-3">محصول</th>
                <th className="p-3">سایز</th>
                <th className="p-3">وزن</th>
                <th className="p-3">کارخانه</th>
                <th className="p-3">قیمت فعلی</th>
                <th className="p-3">قیمت جدید</th>
                <th className="p-3">وضعیت</th>
                <th className="p-3"></th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((r) => (
                <tr key={r.id} className="border-t border-black/5">
                  <td className="p-3">
                    <input type="checkbox" checked={selected.has(r.id)} onChange={() => toggleOne(r.id)} className="accent-blue" />
                  </td>
                  <td className="p-3">
                    <div className="font-bold">{r.name}</div>
                    <div className="text-[11px] text-ink/40">{r.categories?.name ?? "بدون دسته"}</div>
                    {Object.entries(r.attributes ?? {})
                      .filter(([, v]) => v)
                      .map(([k, v]) => (
                        <span key={k} className="me-1 mt-1 inline-block rounded-md bg-steel px-1.5 py-0.5 text-[10.5px] text-ink/60">
                          {k}: <span dir="ltr">{v}</span>
                        </span>
                      ))}
                  </td>
                  <td className="p-3">{r.size ?? "—"}</td>
                  <td className="p-3">{r.weight_kg ?? "—"}</td>
                  <td className="p-3 text-xs">{r.factories?.name ?? "—"}</td>
                  <td className="p-3">{priceCell(r)}</td>
                  <td className="p-3">
                    <div className="flex items-center gap-1">
                      <input
                        className="w-28 rounded-lg border border-black/10 px-2 py-1.5 text-sm outline-none focus:border-blue"
                        placeholder="قیمت"
                        value={drafts[r.id] ?? ""}
                        onChange={(e) => setDrafts((d) => ({ ...d, [r.id]: e.target.value }))}
                      />
                      <button disabled={busy} onClick={() => savePrice(r.id)} className={`${BTN} bg-blue text-white`}>ثبت</button>
                    </div>
                  </td>
                  <td className="p-3">
                    <div className="flex flex-wrap gap-1 text-[11px] font-bold">
                      <button onClick={() => setField(r.id, { in_stock: !r.in_stock })} className={`rounded-pill px-2 py-1 ${r.in_stock ? "bg-success/10 text-success" : "bg-danger/10 text-danger"}`}>
                        {r.in_stock ? "موجود" : "ناموجود"}
                      </button>
                      <button onClick={() => setField(r.id, { visible: !r.visible })} className={`rounded-pill px-2 py-1 ${r.visible ? "bg-blue/10 text-blue" : "bg-black/5 text-ink/50"}`}>
                        {r.visible ? "نمایش" : "مخفی"}
                      </button>
                      <button onClick={() => setField(r.id, { call_for_price: !r.call_for_price })} className={`rounded-pill px-2 py-1 ${r.call_for_price ? "bg-warning/20 text-[#B87700]" : "bg-black/5 text-ink/50"}`}>
                        {r.call_for_price ? "تماس" : "قیمت"}
                      </button>
                    </div>
                  </td>
                  <td className="p-3">
                    <button onClick={() => openEdit(r)} className={`${BTN} bg-black/5 text-ink`}>ویرایش</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {filtered.length === 0 && <p className="py-10 text-center text-sm text-ink/40">محصولی با این فیلتر پیدا نشد.</p>}
        </div>
      )}

      {/* پنجره‌ی ویرایش مشخصات */}
      {editing && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4" onClick={() => setEditing(null)}>
          <div className="w-full max-w-lg rounded-card bg-white p-6" onClick={(e) => e.stopPropagation()}>
            <h2 className="mb-4 text-base font-extrabold">ویرایش مشخصات</h2>
            <div className="grid gap-3">
              <label className="text-xs font-bold text-ink/60">نام محصول</label>
              <input className={INPUT} value={editForm.name} onChange={(e) => setEditForm({ ...editForm, name: e.target.value })} />
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-bold text-ink/60">سایز</label>
                  <input className={INPUT} value={editForm.size} onChange={(e) => setEditForm({ ...editForm, size: e.target.value })} />
                </div>
                <div>
                  <label className="text-xs font-bold text-ink/60">وزن (کیلوگرم بر متر)</label>
                  <input className={INPUT} value={editForm.weight} onChange={(e) => setEditForm({ ...editForm, weight: e.target.value })} />
                </div>
              </div>
              <label className="text-xs font-bold text-ink/60">استاندارد</label>
              <input className={INPUT} value={editForm.standard} onChange={(e) => setEditForm({ ...editForm, standard: e.target.value })} />
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-bold text-ink/60">دسته</label>
                  <select className={INPUT} value={editForm.category_id} onChange={(e) => setEditForm({ ...editForm, category_id: e.target.value })}>
                    <option value="">بدون دسته</option>
                    {categories.map((c) => (
                      <option key={c.id} value={c.id}>{c.name}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="text-xs font-bold text-ink/60">کارخانه</label>
                  <select className={INPUT} value={editForm.factory_id} onChange={(e) => setEditForm({ ...editForm, factory_id: e.target.value })}>
                    <option value="">بدون کارخانه</option>
                    {factories.map((f) => (
                      <option key={f.id} value={f.id}>{f.name}</option>
                    ))}
                  </select>
                </div>
              </div>
            </div>
            {editCols.length > 0 && (
              <div className="mt-4 grid gap-3 rounded-xl bg-steel p-3">
                <div className="text-xs font-extrabold text-blue">
                  مشخصات اختصاصی «{categories.find((c) => c.id === editForm.category_id)?.name}»
                </div>
                <div className="grid grid-cols-2 gap-3">
                  {editCols.map((col) => (
                    <div key={col}>
                      <label className="text-xs font-bold text-ink/60">{col}</label>
                      <input
                        className={INPUT}
                        value={editAttrs[col] ?? ""}
                        onChange={(e) => setEditAttrs({ ...editAttrs, [col]: e.target.value })}
                      />
                    </div>
                  ))}
                </div>
              </div>
            )}
            <div className="mt-5 flex justify-end gap-2">
              <button onClick={() => setEditing(null)} className={`${BTN} bg-black/5 text-ink`}>انصراف</button>
              <button disabled={busy} onClick={saveEdit} className={`${BTN} bg-blue text-white`}>ذخیره</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
