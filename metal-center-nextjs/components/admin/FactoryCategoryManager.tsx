"use client";

import { useEffect, useState, type FormEvent } from "react";
import { supabase } from "@/lib/supabase";

type Factory = { id: string; name: string; slug: string; location: string | null; description: string | null; verified: boolean };
type Category = { id: string; name: string; slug: string; price_columns: string[] | null };
type Msg = { type: "ok" | "err"; text: string } | null;

const INPUT = "w-full rounded-lg border border-black/10 bg-white px-3 py-2 text-sm outline-none focus:border-blue";
const BTN = "rounded-lg px-3 py-2 text-xs font-bold transition disabled:opacity-40";

function makeSlug(name: string) {
  return `${name.trim().replace(/\s+/g, "-")}-${Date.now().toString(36)}`;
}

export default function FactoryCategoryManager() {
  const [factories, setFactories] = useState<Factory[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [busy, setBusy] = useState(false);
  const [msg, setMsg] = useState<Msg>(null);

  const [fNew, setFNew] = useState({ name: "", location: "", description: "", verified: false });
  const [fEdit, setFEdit] = useState<Factory | null>(null);
  const [cNew, setCNew] = useState("");
  const [cEdit, setCEdit] = useState<Category | null>(null);
  const [cEditCols, setCEditCols] = useState("");

  // ستون‌ها را با ویرگول جدا می‌کنی، مثلاً: ضخامت، عرض، طول
  function parseColumns(text: string) {
    return text
      .split(/[,،]/)
      .map((s) => s.trim())
      .filter(Boolean);
  }

  function flash(type: "ok" | "err", text: string) {
    setMsg({ type, text });
  }

  async function load() {
    const [f, c] = await Promise.all([
      supabase.from("factories").select("id,name,slug,location,description,verified").order("name"),
      supabase.from("categories").select("id,name,slug,price_columns").order("name"),
    ]);
    const err = f.error || c.error;
    if (err) return flash("err", "خواندن اطلاعات ناموفق بود: " + err.message);
    setFactories((f.data ?? []) as Factory[]);
    setCategories((c.data ?? []) as Category[]);
  }

  useEffect(() => {
    load();
  }, []);

  async function addFactory(e: FormEvent) {
    e.preventDefault();
    if (!fNew.name.trim()) return flash("err", "نام کارخانه را وارد کن.");
    setBusy(true);
    const { error } = await supabase.from("factories").insert({
      name: fNew.name.trim(),
      slug: makeSlug(fNew.name),
      location: fNew.location.trim() || null,
      description: fNew.description.trim() || null,
      verified: fNew.verified,
    });
    setBusy(false);
    if (error) return flash("err", "افزودن کارخانه ناموفق بود: " + error.message);
    setFNew({ name: "", location: "", description: "", verified: false });
    flash("ok", "کارخانه اضافه شد.");
    load();
  }

  async function saveFactory() {
    if (!fEdit) return;
    if (!fEdit.name.trim()) return flash("err", "نام کارخانه خالی است.");
    setBusy(true);
    const { error } = await supabase
      .from("factories")
      .update({
        name: fEdit.name.trim(),
        location: fEdit.location?.trim() || null,
        description: fEdit.description?.trim() || null,
        verified: fEdit.verified,
      })
      .eq("id", fEdit.id);
    setBusy(false);
    if (error) return flash("err", "ذخیره نشد: " + error.message);
    setFEdit(null);
    flash("ok", "کارخانه ذخیره شد.");
    load();
  }

  async function deleteFactory(f: Factory) {
    if (!window.confirm(`کارخانه «${f.name}» حذف شود؟`)) return;
    const { error } = await supabase.from("factories").delete().eq("id", f.id);
    if (error)
      return flash("err", "حذف نشد. احتمالاً محصولاتی به این کارخانه وصل‌اند؛ اول کارخانه‌ی آن محصولات را عوض کن. (" + error.message + ")");
    flash("ok", "کارخانه حذف شد.");
    load();
  }

  async function addCategory(e: FormEvent) {
    e.preventDefault();
    if (!cNew.trim()) return flash("err", "نام دسته را وارد کن.");
    setBusy(true);
    const { error } = await supabase.from("categories").insert({ name: cNew.trim(), slug: makeSlug(cNew) });
    setBusy(false);
    if (error) return flash("err", "افزودن دسته ناموفق بود: " + error.message);
    setCNew("");
    flash("ok", "دسته اضافه شد.");
    load();
  }

  async function saveCategory() {
    if (!cEdit) return;
    if (!cEdit.name.trim()) return flash("err", "نام دسته خالی است.");
    setBusy(true);
    const { error } = await supabase
      .from("categories")
      .update({ name: cEdit.name.trim(), price_columns: parseColumns(cEditCols) })
      .eq("id", cEdit.id);
    setBusy(false);
    if (error) return flash("err", "ذخیره نشد: " + error.message);
    setCEdit(null);
    flash("ok", "دسته ذخیره شد.");
    load();
  }

  async function deleteCategory(c: Category) {
    if (!window.confirm(`دسته‌ی «${c.name}» حذف شود؟`)) return;
    const { error } = await supabase.from("categories").delete().eq("id", c.id);
    if (error) return flash("err", "حذف نشد. احتمالاً محصولاتی در این دسته هستند. (" + error.message + ")");
    flash("ok", "دسته حذف شد.");
    load();
  }

  return (
    <div>
      <h1 className="mb-1 text-xl font-extrabold">کارخانه‌ها و دسته‌ها</h1>
      <p className="mb-5 text-sm text-ink/50">کارخانه‌ها و دسته‌های جدید را همین‌جا اضافه، ویرایش یا حذف کن.</p>

      {msg && (
        <div className={`mb-5 rounded-xl px-4 py-3 text-sm font-semibold ${msg.type === "ok" ? "bg-success/10 text-success" : "bg-danger/10 text-danger"}`}>
          {msg.text}
        </div>
      )}

      <div className="grid gap-6 lg:grid-cols-2">
        {/* کارخانه‌ها */}
        <section className="rounded-card border border-black/5 bg-white p-5">
          <h2 className="mb-4 text-sm font-extrabold">کارخانه‌ها ({factories.length})</h2>
          <form onSubmit={addFactory} className="mb-5 grid gap-2 rounded-xl bg-steel p-3">
            <input className={INPUT} placeholder="نام کارخانه" value={fNew.name} onChange={(e) => setFNew({ ...fNew, name: e.target.value })} required />
            <input className={INPUT} placeholder="محل (مثلاً اصفهان)" value={fNew.location} onChange={(e) => setFNew({ ...fNew, location: e.target.value })} />
            <input className={INPUT} placeholder="توضیح کوتاه" value={fNew.description} onChange={(e) => setFNew({ ...fNew, description: e.target.value })} />
            <label className="flex items-center gap-2 text-xs font-bold">
              <input type="checkbox" checked={fNew.verified} onChange={(e) => setFNew({ ...fNew, verified: e.target.checked })} className="accent-blue" />
              کارخانه‌ی تأییدشده
            </label>
            <button disabled={busy} className={`${BTN} bg-blue text-white`}>+ افزودن کارخانه</button>
          </form>

          <div className="space-y-2">
            {factories.map((f) =>
              fEdit?.id === f.id ? (
                <div key={f.id} className="grid gap-2 rounded-xl border border-blue/30 p-3">
                  <input className={INPUT} value={fEdit.name} onChange={(e) => setFEdit({ ...fEdit, name: e.target.value })} />
                  <input className={INPUT} placeholder="محل" value={fEdit.location ?? ""} onChange={(e) => setFEdit({ ...fEdit, location: e.target.value })} />
                  <input className={INPUT} placeholder="توضیح" value={fEdit.description ?? ""} onChange={(e) => setFEdit({ ...fEdit, description: e.target.value })} />
                  <label className="flex items-center gap-2 text-xs font-bold">
                    <input type="checkbox" checked={fEdit.verified} onChange={(e) => setFEdit({ ...fEdit, verified: e.target.checked })} className="accent-blue" />
                    تأییدشده
                  </label>
                  <div className="flex gap-2">
                    <button disabled={busy} onClick={saveFactory} className={`${BTN} bg-blue text-white`}>ذخیره</button>
                    <button onClick={() => setFEdit(null)} className={`${BTN} bg-black/5`}>انصراف</button>
                  </div>
                </div>
              ) : (
                <div key={f.id} className="flex items-center justify-between gap-2 rounded-xl border border-black/5 p-3">
                  <div>
                    <div className="text-sm font-bold">
                      {f.name} {f.verified && <span className="text-[11px] text-success">✔ تأییدشده</span>}
                    </div>
                    <div className="text-[11px] text-ink/40">{f.location ?? "محل ثبت نشده"}</div>
                  </div>
                  <div className="flex gap-1.5">
                    <button onClick={() => setFEdit(f)} className={`${BTN} bg-black/5`}>ویرایش</button>
                    <button onClick={() => deleteFactory(f)} className={`${BTN} bg-danger/10 text-danger`}>حذف</button>
                  </div>
                </div>
              )
            )}
          </div>
        </section>

        {/* دسته‌ها */}
        <section className="rounded-card border border-black/5 bg-white p-5">
          <h2 className="mb-4 text-sm font-extrabold">دسته‌ها ({categories.length})</h2>
          <form onSubmit={addCategory} className="mb-5 flex gap-2 rounded-xl bg-steel p-3">
            <input className={INPUT} placeholder="نام دسته (مثلاً قوطی)" value={cNew} onChange={(e) => setCNew(e.target.value)} required />
            <button disabled={busy} className={`${BTN} bg-blue text-white whitespace-nowrap`}>+ افزودن</button>
          </form>

          <div className="space-y-2">
            {categories.map((c) =>
              cEdit?.id === c.id ? (
                <div key={c.id} className="grid gap-2 rounded-xl border border-blue/30 p-3">
                  <label className="text-xs font-bold text-ink/60">نام دسته</label>
                  <input className={INPUT} value={cEdit.name} onChange={(e) => setCEdit({ ...cEdit, name: e.target.value })} />
                  <label className="text-xs font-bold text-ink/60">ستون‌های اختصاصی قیمت (با ویرگول جدا کن)</label>
                  <input
                    className={INPUT}
                    placeholder="مثلاً: ضخامت، عرض، طول — خالی بگذار اگر لازم نیست"
                    value={cEditCols}
                    onChange={(e) => setCEditCols(e.target.value)}
                  />
                  <div className="flex gap-2">
                    <button disabled={busy} onClick={saveCategory} className={`${BTN} bg-blue text-white`}>ذخیره</button>
                    <button onClick={() => setCEdit(null)} className={`${BTN} bg-black/5`}>انصراف</button>
                  </div>
                </div>
              ) : (
                <div key={c.id} className="flex items-center justify-between gap-2 rounded-xl border border-black/5 p-3">
                  <div>
                    <div className="text-sm font-bold">{c.name}</div>
                    <div className="mt-1 text-[11px] text-ink/40">
                      {c.price_columns && c.price_columns.length > 0 ? `ستون‌ها: ${c.price_columns.join("، ")}` : "ستون اختصاصی ندارد"}
                    </div>
                  </div>
                  <div className="flex gap-1.5">
                    <button
                      onClick={() => {
                        setCEdit(c);
                        setCEditCols((c.price_columns ?? []).join("، "));
                      }}
                      className={`${BTN} bg-black/5`}
                    >
                      ویرایش
                    </button>
                    <button onClick={() => deleteCategory(c)} className={`${BTN} bg-danger/10 text-danger`}>حذف</button>
                  </div>
                </div>
              )
            )}
          </div>
        </section>
      </div>
    </div>
  );
}
