"use client";

import { useEffect, useState, type FormEvent } from "react";
import { supabase } from "@/lib/supabase";

type Option = { id: string; name: string };
type Product = {
  id: string;
  name: string;
  size: string | null;
  standard: string | null;
  in_stock: boolean;
  visible: boolean;
  category_id: string | null;
  factory_id: string | null;
  categories: { name: string } | null;
  factories: { name: string } | null;
};

const EMPTY_FORM = { name: "", size: "", standard: "", category_id: "", factory_id: "", price: "" };

export default function CatalogManager({ mode }: { mode: "products" | "prices" }) {
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Option[]>([]);
  const [factories, setFactories] = useState<Option[]>([]);
  const [latestPrice, setLatestPrice] = useState<Record<string, number>>({});
  const [drafts, setDrafts] = useState<Record<string, string>>({});
  const [form, setForm] = useState(EMPTY_FORM);
  const [busy, setBusy] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [msg, setMsg] = useState<{ type: "ok" | "err"; text: string } | null>(null);

  function flash(type: "ok" | "err", text: string) {
    setMsg({ type, text });
  }

  async function load() {
    setLoading(true);
    const [p, c, f, d] = await Promise.all([
      supabase
        .from("products")
        .select("id,name,size,standard,in_stock,visible,category_id,factory_id,categories(name),factories(name)")
        .order("name"),
      supabase.from("categories").select("id,name").order("name"),
      supabase.from("factories").select("id,name").order("name"),
      supabase.from("daily_prices").select("product_id,price,recorded_at").order("recorded_at", { ascending: false }),
    ]);
    setLoading(false);
    const error = p.error || c.error || f.error || d.error;
    if (error) return flash("err", "خواندن اطلاعات ناموفق بود: " + error.message);

    setProducts((p.data ?? []) as unknown as Product[]);
    setCategories(c.data ?? []);
    setFactories(f.data ?? []);

    // آخرین قیمت هر محصول (ردیف‌ها از جدیدترین به قدیمی‌ترین مرتب‌اند)
    const latest: Record<string, number> = {};
    for (const row of d.data ?? []) {
      if (latest[row.product_id] === undefined) latest[row.product_id] = Number(row.price);
    }
    setLatestPrice(latest);
  }

  useEffect(() => {
    load();
  }, []);

  async function savePrice(id: string) {
    const value = Number((drafts[id] ?? "").replace(/,/g, "").trim());
    if (!value || value <= 0) return flash("err", "یک قیمت معتبر بالاتر از صفر وارد کن.");
    setBusy(id);
    const { error } = await supabase.from("daily_prices").insert({ product_id: id, price: value });
    setBusy(null);
    if (error) return flash("err", "ذخیره‌ی قیمت ناموفق بود: " + error.message);
    setDrafts((d) => ({ ...d, [id]: "" }));
    flash("ok", "قیمت جدید ذخیره شد.");
    load();
  }

  async function toggle(id: string, field: "in_stock" | "visible", value: boolean) {
    setBusy(id);
    const { error } = await supabase.from("products").update({ [field]: value }).eq("id", id);
    setBusy(null);
    if (error) return flash("err", "تغییر ذخیره نشد: " + error.message);
    setProducts((list) => list.map((p) => (p.id === id ? { ...p, [field]: value } : p)));
  }

  async function addProduct(e: FormEvent) {
    e.preventDefault();
    if (!form.name.trim()) return flash("err", "نام محصول را وارد کن.");
    setBusy("new");
    const slug = `${form.name.trim().replace(/\s+/g, "-")}-${Date.now().toString(36)}`;
    const { data, error } = await supabase
      .from("products")
      .insert({
        name: form.name.trim(),
        slug,
        size: form.size.trim() || null,
        standard: form.standard.trim() || null,
        category_id: form.category_id || null,
        factory_id: form.factory_id || null,
        in_stock: true,
        visible: true,
      })
      .select("id")
      .single();

    if (error || !data) {
      setBusy(null);
      return flash("err", "افزودن محصول ناموفق بود: " + (error?.message ?? ""));
    }

    const price = Number(form.price.replace(/,/g, "").trim());
    if (price > 0) {
      await supabase.from("daily_prices").insert({ product_id: data.id, price });
    }
    setBusy(null);
    setForm(EMPTY_FORM);
    flash("ok", "محصول اضافه شد.");
    load();
  }

  const input =
    "w-full rounded-lg border border-black/10 bg-white px-3 py-2 text-sm outline-none focus:border-blue";

  return (
    <div>
      <h1 className="mb-1 text-xl font-extrabold">{mode === "products" ? "محصولات" : "قیمت‌گذاری"}</h1>
      <p className="mb-5 text-sm text-ink/50">
        تغییرات همین‌جا در Supabase ذخیره می‌شوند. قیمت جدید به‌عنوان یک ثبت تازه ذخیره می‌شود و تاریخچه حفظ می‌شود.
      </p>

      {msg && (
        <div className={`mb-5 rounded-xl px-4 py-3 text-sm font-semibold ${msg.type === "ok" ? "bg-success/10 text-success" : "bg-danger/10 text-danger"}`}>
          {msg.text}
        </div>
      )}

      {mode === "products" && (
        <form onSubmit={addProduct} className="mb-8 grid gap-3 rounded-card border border-black/5 bg-white p-5 md:grid-cols-3">
          <div className="text-sm font-extrabold md:col-span-3">افزودن محصول جدید</div>
          <input className={input} placeholder="نام محصول (مثلاً میلگرد A3 سایز ۱۶)" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} required />
          <input className={input} placeholder="سایز (مثلاً ۱۶ میلی‌متر)" value={form.size} onChange={(e) => setForm({ ...form, size: e.target.value })} />
          <input className={input} placeholder="استاندارد (مثلاً A3)" value={form.standard} onChange={(e) => setForm({ ...form, standard: e.target.value })} />
          <select className={input} value={form.category_id} onChange={(e) => setForm({ ...form, category_id: e.target.value })}>
            <option value="">دسته‌بندی</option>
            {categories.map((c) => (
              <option key={c.id} value={c.id}>{c.name}</option>
            ))}
          </select>
          <select className={input} value={form.factory_id} onChange={(e) => setForm({ ...form, factory_id: e.target.value })}>
            <option value="">کارخانه</option>
            {factories.map((f) => (
              <option key={f.id} value={f.id}>{f.name}</option>
            ))}
          </select>
          <input className={input} placeholder="قیمت اولیه (تومان، اختیاری)" inputMode="numeric" value={form.price} onChange={(e) => setForm({ ...form, price: e.target.value })} />
          <button disabled={busy === "new"} className="rounded-lg bg-blue py-2.5 text-sm font-bold text-white disabled:opacity-60 md:col-span-3">
            {busy === "new" ? "در حال افزودن..." : "+ افزودن محصول"}
          </button>
        </form>
      )}

      {loading ? (
        <p className="text-sm text-ink/50">در حال خواندن از دیتابیس...</p>
      ) : products.length === 0 ? (
        <p className="text-sm text-ink/50">هنوز محصولی ثبت نشده است.</p>
      ) : (
        <div className="overflow-x-auto rounded-card border border-black/5 bg-white">
          <table className="w-full min-w-[760px] text-sm">
            <thead>
              <tr className="bg-steel text-xs text-ink/50">
                <th className="p-3 text-start">محصول</th>
                <th className="p-3 text-start">کارخانه</th>
                <th className="p-3 text-start">سایز</th>
                <th className="p-3 text-start">قیمت فعلی</th>
                <th className="p-3 text-start">قیمت جدید</th>
                <th className="p-3 text-start">موجود</th>
                <th className="p-3 text-start">نمایش در سایت</th>
              </tr>
            </thead>
            <tbody>
              {products.map((p) => (
                <tr key={p.id} className="border-t border-black/5">
                  <td className="p-3 font-bold">{p.name}</td>
                  <td className="p-3 text-ink/60">{p.factories?.name ?? "—"}</td>
                  <td className="p-3">{p.size ?? "—"}</td>
                  <td className="p-3 font-extrabold">
                    {latestPrice[p.id] ? latestPrice[p.id].toLocaleString("fa-IR") + " ت" : "بدون قیمت"}
                  </td>
                  <td className="p-3">
                    <div className="flex gap-2">
                      <input
                        className="w-28 rounded-lg border border-black/10 px-2 py-1.5 text-sm"
                        inputMode="numeric"
                        placeholder="قیمت"
                        value={drafts[p.id] ?? ""}
                        onChange={(e) => setDrafts({ ...drafts, [p.id]: e.target.value })}
                      />
                      <button
                        onClick={() => savePrice(p.id)}
                        disabled={busy === p.id}
                        className="rounded-lg bg-blue px-3 text-xs font-bold text-white disabled:opacity-60"
                      >
                        ذخیره
                      </button>
                    </div>
                  </td>
                  <td className="p-3">
                    <input type="checkbox" checked={p.in_stock} disabled={busy === p.id} onChange={(e) => toggle(p.id, "in_stock", e.target.checked)} className="h-4 w-4" />
                  </td>
                  <td className="p-3">
                    <input type="checkbox" checked={p.visible} disabled={busy === p.id} onChange={(e) => toggle(p.id, "visible", e.target.checked)} className="h-4 w-4" />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
