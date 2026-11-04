"use client";

import { useEffect, useMemo, useState } from "react";
import { supabase } from "@/lib/supabase";

type Option = { id: string; name: string };
type Product = {
  id: string;
  name: string;
  size: string | null;
  category_id: string | null;
  categories: { name: string } | null;
  factories: { name: string } | null;
  daily_prices: { price: number | string; recorded_at: string }[] | null;
};
type PriceList = { id: string; title: string; list_date: string; status: "draft" | "published" | "archived"; created_at: string };
type Msg = { type: "ok" | "err"; text: string } | null;

const INPUT = "rounded-lg border border-black/10 bg-white px-3 py-2 text-sm outline-none focus:border-blue";
const BTN = "rounded-lg px-3 py-2 text-xs font-bold transition disabled:opacity-40";
const STATUS_LABEL: Record<PriceList["status"], string> = { draft: "پیش‌نویس", published: "منتشرشده", archived: "آرشیو" };

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

function latestOf(p: Product): string {
  const list = [...(p.daily_prices ?? [])].sort((a, b) => (a.recorded_at < b.recorded_at ? 1 : -1));
  return list[0] ? String(Math.round(Number(list[0].price))) : "";
}

// انتشار: قیمت‌ها به تاریخچه‌ی قیمت اضافه و روی سایت نمایش داده می‌شوند
async function publishItems(listId: string, items: { product_id: string; price: number }[]) {
  for (const part of chunk(items)) {
    const { error } = await supabase
      .from("daily_prices")
      .insert(part.map((i) => ({ product_id: i.product_id, price: i.price })));
    if (error) throw new Error(error.message);
    const { error: e2 } = await supabase
      .from("products")
      .update({ call_for_price: false })
      .in("id", part.map((i) => i.product_id));
    if (e2) throw new Error(e2.message);
  }
  const { error } = await supabase.from("price_lists").update({ status: "published" }).eq("id", listId);
  if (error) throw new Error(error.message);
}

export default function PriceListBuilder() {
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Option[]>([]);
  const [lists, setLists] = useState<PriceList[]>([]);
  const [title, setTitle] = useState("");
  const [catId, setCatId] = useState("");
  const [q, setQ] = useState("");
  const [picked, setPicked] = useState<Record<string, string>>({});
  const [busy, setBusy] = useState(false);
  const [msg, setMsg] = useState<Msg>(null);

  function flash(type: "ok" | "err", text: string) {
    setMsg({ type, text });
  }

  async function load() {
    const [p, c, l] = await Promise.all([
      supabase
        .from("products")
        .select("id,name,size,category_id,categories(name),factories(name),daily_prices(price,recorded_at)")
        .order("name"),
      supabase.from("categories").select("id,name").order("name"),
      supabase.from("price_lists").select("id,title,list_date,status,created_at").order("created_at", { ascending: false }),
    ]);
    const err = p.error || c.error || l.error;
    if (err) return flash("err", "خواندن اطلاعات ناموفق بود: " + err.message);
    setProducts((p.data ?? []) as unknown as Product[]);
    setCategories(c.data ?? []);
    setLists((l.data ?? []) as PriceList[]);
  }

  useEffect(() => {
    load();
  }, []);

  const filtered = useMemo(() => {
    const term = q.trim().toLowerCase();
    return products.filter(
      (p) => (!catId || p.category_id === catId) && (!term || (p.name + " " + (p.size ?? "")).toLowerCase().includes(term))
    );
  }, [products, catId, q]);

  function togglePick(p: Product) {
    setPicked((prev) => {
      const next = { ...prev };
      if (next[p.id] !== undefined) delete next[p.id];
      else next[p.id] = latestOf(p);
      return next;
    });
  }

  function pickAllFiltered() {
    setPicked((prev) => {
      const next = { ...prev };
      for (const p of filtered) if (next[p.id] === undefined) next[p.id] = latestOf(p);
      return next;
    });
  }

  async function createList(publish: boolean) {
    const entries = Object.entries(picked).map(([product_id, v]) => ({ product_id, price: parseNum(v) }));
    if (!entries.length) return flash("err", "حداقل یک محصول انتخاب کن.");
    if (entries.some((e) => !e.price)) return flash("err", "برای همه‌ی محصولات انتخاب‌شده قیمت معتبر وارد کن.");
    const name = title.trim() || `لیست قیمت ${new Date().toLocaleDateString("fa-IR")}`;
    if (publish && !window.confirm(`این لیست با ${entries.length} قیمت منتشر شود و روی سایت نمایش داده شود؟`)) return;

    setBusy(true);
    try {
      const { data, error } = await supabase
        .from("price_lists")
        .insert({ title: name, status: "draft" })
        .select("id")
        .single();
      if (error || !data) throw new Error(error?.message ?? "ساخت لیست ناموفق بود");

      const items = entries.map((e) => ({ price_list_id: data.id, product_id: e.product_id, price: e.price as number }));
      for (const part of chunk(items)) {
        const { error: ie } = await supabase.from("price_list_items").insert(part);
        if (ie) throw new Error(ie.message);
      }
      if (publish) {
        await publishItems(data.id, entries.map((e) => ({ product_id: e.product_id, price: e.price as number })));
      }
      setTitle("");
      setPicked({});
      flash("ok", publish ? "لیست منتشر شد و روی سایت نمایش داده می‌شود." : "پیش‌نویس ذخیره شد.");
    } catch (err) {
      flash("err", "ساخت لیست ناموفق بود: " + (err as Error).message);
    } finally {
      setBusy(false);
      load();
    }
  }

  async function publishDraft(l: PriceList) {
    if (!window.confirm(`«${l.title}» منتشر شود و قیمت‌هایش روی سایت بیاید؟`)) return;
    setBusy(true);
    try {
      const { data, error } = await supabase.from("price_list_items").select("product_id,price").eq("price_list_id", l.id);
      if (error) throw new Error(error.message);
      await publishItems(l.id, (data ?? []).map((i) => ({ product_id: i.product_id, price: Number(i.price) })));
      flash("ok", "لیست منتشر شد.");
    } catch (err) {
      flash("err", "انتشار ناموفق بود: " + (err as Error).message);
    } finally {
      setBusy(false);
      load();
    }
  }

  async function setStatus(l: PriceList, status: PriceList["status"]) {
    const { error } = await supabase.from("price_lists").update({ status }).eq("id", l.id);
    if (error) return flash("err", "تغییر وضعیت ناموفق بود: " + error.message);
    load();
  }

  async function deleteList(l: PriceList) {
    if (!window.confirm(`«${l.title}» حذف شود؟`)) return;
    const { error } = await supabase.from("price_lists").delete().eq("id", l.id);
    if (error) return flash("err", "حذف ناموفق بود: " + error.message);
    flash("ok", "لیست حذف شد.");
    load();
  }

  async function printList(l: PriceList) {
    const { data, error } = await supabase
      .from("price_list_items")
      .select("price, products(name,size,factories(name))")
      .eq("price_list_id", l.id);
    if (error) return flash("err", "چاپ ناموفق بود: " + error.message);
    const rows = (data ?? [])
      .map((i: any) => `<tr><td>${i.products?.factories?.name ?? ""}</td><td>${i.products?.name ?? ""} ${i.products?.size ?? ""}</td><td>${Math.round(Number(i.price)).toLocaleString("fa-IR")} ت</td></tr>`)
      .join("");
    const w = window.open("", "_blank");
    if (!w) return flash("err", "پنجره‌ی چاپ باز نشد؛ بلاک پاپ‌آپ را غیرفعال کن.");
    w.document.write(`<html dir="rtl"><head><meta charset="utf-8"><title>${l.title}</title>
      <style>body{font-family:sans-serif;padding:24px}table{width:100%;border-collapse:collapse}td,th{border-bottom:1px solid #ddd;padding:8px;text-align:right}h1{font-size:20px}</style></head>
      <body><h1>${l.title}</h1><p>تاریخ: ${new Date(l.list_date).toLocaleDateString("fa-IR")}</p>
      <table><tr><th>کارخانه</th><th>محصول</th><th>قیمت</th></tr>${rows}</table></body></html>`);
    w.document.close();
    w.print();
  }

  return (
    <div>
      <h1 className="mb-1 text-xl font-extrabold">لیست‌های قیمت</h1>
      <p className="mb-5 text-sm text-ink/50">
        یک لیست جدید بساز: محصول‌ها را انتخاب کن، قیمت هرکدام را بنویس، و بعد پیش‌نویس ذخیره یا منتشر کن. لیست منتشرشده قیمت‌هایش را روی سایت و در تاریخچه ثبت می‌کند.
      </p>

      {msg && (
        <div className={`mb-5 rounded-xl px-4 py-3 text-sm font-semibold ${msg.type === "ok" ? "bg-success/10 text-success" : "bg-danger/10 text-danger"}`}>
          {msg.text}
        </div>
      )}

      {/* ساخت لیست جدید */}
      <section className="mb-8 rounded-card border border-black/5 bg-white p-5">
        <div className="mb-4 grid gap-2 md:grid-cols-[1fr_200px_1fr]">
          <input className={INPUT} placeholder={`عنوان لیست (پیش‌فرض: لیست قیمت امروز)`} value={title} onChange={(e) => setTitle(e.target.value)} />
          <select className={INPUT} value={catId} onChange={(e) => setCatId(e.target.value)}>
            <option value="">همه‌ی دسته‌ها</option>
            {categories.map((c) => (
              <option key={c.id} value={c.id}>{c.name}</option>
            ))}
          </select>
          <input className={INPUT} placeholder="جستجو در نام یا سایز" value={q} onChange={(e) => setQ(e.target.value)} />
        </div>

        <div className="mb-3 flex flex-wrap items-center gap-2 text-xs">
          <span className="font-bold">{Object.keys(picked).length} محصول انتخاب شده</span>
          <button onClick={pickAllFiltered} className={`${BTN} bg-blue/10 text-blue`}>انتخاب همه‌ی نتایج</button>
          <button onClick={() => setPicked({})} className={`${BTN} bg-black/5`}>پاک کردن انتخاب</button>
          <div className="mr-auto flex gap-2">
            <button disabled={busy} onClick={() => createList(false)} className={`${BTN} bg-black/5 text-ink`}>ذخیره پیش‌نویس</button>
            <button disabled={busy} onClick={() => createList(true)} className={`${BTN} bg-blue text-white`}>انتشار لیست</button>
          </div>
        </div>

        <div className="max-h-[420px] overflow-auto rounded-xl border border-black/5">
          <table className="w-full text-right text-sm">
            <thead className="sticky top-0 bg-white text-xs text-ink/60">
              <tr>
                <th className="p-2 w-10"></th>
                <th className="p-2">محصول</th>
                <th className="p-2">کارخانه</th>
                <th className="p-2 w-40">قیمت (تومان)</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((p) => {
                const on = picked[p.id] !== undefined;
                return (
                  <tr key={p.id} className={`border-t border-black/5 ${on ? "bg-blue/[0.04]" : ""}`}>
                    <td className="p-2">
                      <input type="checkbox" checked={on} onChange={() => togglePick(p)} className="accent-blue" />
                    </td>
                    <td className="p-2 font-bold">{p.name} <span className="text-xs text-ink/40">{p.size}</span></td>
                    <td className="p-2 text-xs">{p.factories?.name ?? "—"}</td>
                    <td className="p-2">
                      {on && (
                        <input
                          className="w-full rounded-lg border border-black/10 px-2 py-1.5 text-sm outline-none focus:border-blue"
                          value={picked[p.id]}
                          onChange={(e) => setPicked((prev) => ({ ...prev, [p.id]: e.target.value }))}
                          placeholder="قیمت"
                        />
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </section>

      {/* لیست‌های ساخته‌شده */}
      <section className="rounded-card border border-black/5 bg-white p-5">
        <h2 className="mb-4 text-sm font-extrabold">لیست‌های قبلی ({lists.length})</h2>
        {lists.length === 0 && <p className="py-6 text-center text-sm text-ink/40">هنوز لیستی ساخته نشده است.</p>}
        <div className="space-y-2">
          {lists.map((l) => (
            <div key={l.id} className="flex flex-wrap items-center justify-between gap-2 rounded-xl border border-black/5 p-3">
              <div>
                <div className="text-sm font-bold">{l.title}</div>
                <div className="text-[11px] text-ink/40">
                  {new Date(l.list_date).toLocaleDateString("fa-IR")} · {STATUS_LABEL[l.status]}
                </div>
              </div>
              <div className="flex flex-wrap gap-1.5">
                {l.status === "draft" && (
                  <button disabled={busy} onClick={() => publishDraft(l)} className={`${BTN} bg-blue text-white`}>انتشار</button>
                )}
                {l.status === "published" && (
                  <button onClick={() => setStatus(l, "archived")} className={`${BTN} bg-black/5`}>بایگانی</button>
                )}
                <button onClick={() => printList(l)} className={`${BTN} bg-black/5`}>چاپ / PDF</button>
                {l.status === "draft" && (
                  <button onClick={() => deleteList(l)} className={`${BTN} bg-danger/10 text-danger`}>حذف</button>
                )}
              </div>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
