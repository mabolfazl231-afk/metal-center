"use client";

import { useEffect, useState, type FormEvent, type KeyboardEvent } from "react";
import { ArrowUp, ArrowDown, Plus, X } from "lucide-react";
import { supabase } from "@/lib/supabase";

type Factory = { id: string; name: string; slug: string; location: string | null; description: string | null; verified: boolean };
type Category = {
  id: string;
  name: string;
  slug: string;
  price_columns: string[] | null;
  parent_id: string | null;
  sort_order: number | null;
};
type Msg = { type: "ok" | "err"; text: string } | null;

const INPUT = "w-full rounded-lg border border-black/10 bg-white px-3 py-2 text-sm outline-none focus:border-blue";
const BTN = "rounded-lg px-3 py-2 text-xs font-bold transition disabled:opacity-40";
const ICON_BTN = "rounded-lg bg-black/5 p-1.5 transition disabled:opacity-30";

function makeSlug(name: string) {
  return `${name.trim().replace(/\s+/g, "-")}-${Date.now().toString(36)}`;
}

// ستون‌های تکراری و خالی حذف می‌شوند و ترتیب حفظ می‌شود
function cleanColumns(list: string[]) {
  const seen = new Set<string>();
  const out: string[] = [];
  for (const raw of list) {
    const v = raw.trim();
    if (!v || seen.has(v)) continue;
    seen.add(v);
    out.push(v);
  }
  return out;
}

function sortCats(list: Category[]) {
  return [...list].sort((a, b) => (a.sort_order ?? 0) - (b.sort_order ?? 0) || a.name.localeCompare(b.name, "fa"));
}

export default function FactoryCategoryManager() {
  const [factories, setFactories] = useState<Factory[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [busy, setBusy] = useState(false);
  const [msg, setMsg] = useState<Msg>(null);

  const [fNew, setFNew] = useState({ name: "", location: "", description: "", verified: false });
  const [fEdit, setFEdit] = useState<Factory | null>(null);

  const [cNew, setCNew] = useState({ name: "", parent_id: "" });
  const [cEdit, setCEdit] = useState<Category | null>(null);
  const [cEditName, setCEditName] = useState("");
  const [cEditParent, setCEditParent] = useState("");
  const [cEditCols, setCEditCols] = useState<string[]>([]);
  const [colDraft, setColDraft] = useState("");

  function flash(type: "ok" | "err", text: string) {
    setMsg({ type, text });
  }

  // دسته‌های اصلی (بدون والد) و زیرمجموعه‌ی هر کدام
  const roots = sortCats(categories.filter((c) => !c.parent_id));
  const childrenOf = (id: string) => sortCats(categories.filter((c) => c.parent_id === id));

  // خود دسته و همه‌ی زیرمجموعه‌هایش؛ اینها نمی‌توانند والد دسته‌ی ویرایشی شوند
  function subtreeIds(id: string) {
    const out = new Set<string>([id]);
    let grew = true;
    while (grew) {
      grew = false;
      for (const c of categories) {
        if (c.parent_id && out.has(c.parent_id) && !out.has(c.id)) {
          out.add(c.id);
          grew = true;
        }
      }
    }
    return out;
  }

  function nextSortFor(parentId: string | null) {
    const sibs = categories.filter((c) => (c.parent_id ?? null) === parentId);
    return Math.max(0, ...sibs.map((c) => c.sort_order ?? 0)) + 1;
  }

  async function load() {
    const [f, c] = await Promise.all([
      supabase.from("factories").select("id,name,slug,location,description,verified").order("name"),
      supabase.from("categories").select("id,name,slug,price_columns,parent_id,sort_order").order("sort_order").order("name"),
    ]);
    const err = f.error || c.error;
    if (err) return flash("err", "خواندن اطلاعات ناموفق بود. اگر خطای ستون می‌بینی، فایل 0010 را در Supabase اجرا کن. (" + err.message + ")");
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
    if (!cNew.name.trim()) return flash("err", "نام دسته را وارد کن.");
    setBusy(true);
    const parent = cNew.parent_id || null;
    const { error } = await supabase.from("categories").insert({
      name: cNew.name.trim(),
      slug: makeSlug(cNew.name),
      parent_id: parent,
      sort_order: nextSortFor(parent),
    });
    setBusy(false);
    if (error) return flash("err", "افزودن دسته ناموفق بود: " + error.message);
    setCNew({ name: "", parent_id: "" });
    flash("ok", parent ? "زیرمجموعه اضافه شد." : "دسته اضافه شد.");
    load();
  }

  function startEditCat(c: Category) {
    setCEdit(c);
    setCEditName(c.name);
    setCEditParent(c.parent_id ?? "");
    setCEditCols(c.price_columns ?? []);
    setColDraft("");
  }

  async function saveCategory() {
    if (!cEdit) return;
    const name = cEditName.trim();
    if (!name) return flash("err", "نام دسته خالی است.");
    const parent = cEditParent || null;
    if (parent && childrenOf(cEdit.id).length > 0)
      return flash("err", "این دسته زیرمجموعه دارد، پس نمی‌تواند زیرمجموعه‌ی دسته‌ی دیگری شود.");
    if (parent && subtreeIds(cEdit.id).has(parent)) return flash("err", "این دسته نمی‌تواند زیرمجموعه‌ی خودش باشد.");
    setBusy(true);
    const { error } = await supabase
      .from("categories")
      .update({
        name,
        parent_id: parent,
        price_columns: cleanColumns(cEditCols),
        // اگر به والد جدید منتقل شد، ترتیبش در بین خواهرهای جدید ته‌ی صف می‌رود
        ...(parent !== (cEdit.parent_id ?? null) ? { sort_order: nextSortFor(parent) } : {}),
      })
      .eq("id", cEdit.id);
    setBusy(false);
    if (error) return flash("err", "ذخیره نشد: " + error.message);
    setCEdit(null);
    flash("ok", "دسته ذخیره شد.");
    load();
  }

  async function deleteCategory(c: Category) {
    const kids = childrenOf(c.id).length;
    const question = kids
      ? `دسته‌ی «${c.name}» و ${kids.toLocaleString("fa-IR")} زیرمجموعه‌اش حذف شوند؟`
      : `دسته‌ی «${c.name}» حذف شود؟`;
    if (!window.confirm(question)) return;
    const { error } = await supabase.from("categories").delete().eq("id", c.id);
    if (error) return flash("err", "حذف نشد. احتمالاً محصولاتی در این دسته یا زیرمجموعه‌هایش هستند. (" + error.message + ")");
    flash("ok", "دسته حذف شد.");
    load();
  }

  // جابه‌جایی بالا/پایین بین خواهرهای همان سطح
  async function moveCategory(c: Category, dir: -1 | 1) {
    const sibs = sortCats(categories.filter((x) => (x.parent_id ?? null) === (c.parent_id ?? null)));
    const i = sibs.findIndex((x) => x.id === c.id);
    const j = i + dir;
    if (i < 0 || j < 0 || j >= sibs.length) return;
    const order = [...sibs];
    [order[i], order[j]] = [order[j], order[i]];
    setBusy(true);
    const results = await Promise.all(order.map((x, idx) => supabase.from("categories").update({ sort_order: idx + 1 }).eq("id", x.id)));
    setBusy(false);
    if (results.some((r) => r.error)) return flash("err", "ترتیب ذخیره نشد.");
    load();
  }

  // ویرایشگر ستون‌ها: مثل ستون‌های اکسل، به ترتیب و قابل تغییر
  function addColumn() {
    const v = colDraft.trim();
    if (!v) return;
    if (cEditCols.some((x) => x.trim() === v)) return flash("err", "این ستون قبلاً اضافه شده است.");
    setCEditCols([...cEditCols, v]);
    setColDraft("");
  }

  function onColDraftKey(e: KeyboardEvent<HTMLInputElement>) {
    if (e.key === "Enter") {
      e.preventDefault();
      addColumn();
    }
  }

  function renameColumn(i: number, value: string) {
    setCEditCols(cEditCols.map((x, k) => (k === i ? value : x)));
  }

  function moveColumn(i: number, dir: -1 | 1) {
    const j = i + dir;
    if (j < 0 || j >= cEditCols.length) return;
    const next = [...cEditCols];
    [next[i], next[j]] = [next[j], next[i]];
    setCEditCols(next);
  }

  function removeColumn(i: number) {
    setCEditCols(cEditCols.filter((_, k) => k !== i));
  }

  function renderCategory(c: Category, isChild: boolean) {
    if (cEdit?.id === c.id) {
      const kids = childrenOf(c.id).length;
      const parentOptions = roots.filter((r) => !subtreeIds(c.id).has(r.id));
      return (
        <div key={c.id} className="grid gap-3 rounded-xl border border-blue/30 p-3">
          <label className="text-xs font-bold text-ink/60">نام دسته</label>
          <input className={INPUT} value={cEditName} onChange={(e) => setCEditName(e.target.value)} />

          <label className="text-xs font-bold text-ink/60">والد (دسته‌ی اصلی)</label>
          <select
            className={INPUT}
            value={cEditParent}
            disabled={kids > 0}
            onChange={(e) => setCEditParent(e.target.value)}
          >
            <option value="">دسته‌ی اصلی (بدون والد)</option>
            {parentOptions.map((r) => (
              <option key={r.id} value={r.id}>
                زیرمجموعه‌ی «{r.name}»
              </option>
            ))}
          </select>
          {kids > 0 && <p className="text-[11px] text-ink/45">این دسته زیرمجموعه دارد، پس والدش قفل است.</p>}

          <div className="grid gap-2 rounded-xl bg-steel p-3">
            <div className="text-xs font-extrabold text-blue">ستون‌های قیمت (به همین ترتیب در جدول سایت دیده می‌شوند)</div>
            <p className="text-[11px] text-ink/50">
              برای ورق مثلاً: ابعاد، ضخامت، عرض، طول.
              {isChild && " اگر این زیرمجموعه ستون ندارد، ستون‌های دسته‌ی اصلی استفاده می‌شود."}
            </p>

            {cEditCols.length === 0 ? (
              <p className="rounded-lg border border-dashed border-black/10 bg-white py-3 text-center text-[11px] text-ink/40">
                ستونی تعریف نشده است.
              </p>
            ) : (
              cEditCols.map((col, i) => (
                <div key={i} className="flex items-center gap-1.5">
                  <span className="w-7 flex-shrink-0 text-center text-[11px] font-bold text-ink/40">
                    {(i + 1).toLocaleString("fa-IR")}
                  </span>
                  <input className={INPUT} value={col} onChange={(e) => renameColumn(i, e.target.value)} />
                  <button type="button" disabled={i === 0} onClick={() => moveColumn(i, -1)} className={ICON_BTN} aria-label="بالا">
                    <ArrowUp size={12} />
                  </button>
                  <button
                    type="button"
                    disabled={i === cEditCols.length - 1}
                    onClick={() => moveColumn(i, 1)}
                    className={ICON_BTN}
                    aria-label="پایین"
                  >
                    <ArrowDown size={12} />
                  </button>
                  <button type="button" onClick={() => removeColumn(i)} className="rounded-lg bg-danger/10 p-1.5 text-danger" aria-label="حذف ستون">
                    <X size={12} />
                  </button>
                </div>
              ))
            )}

            <div className="flex gap-1.5">
              <input
                className={INPUT}
                placeholder="ستون جدید، مثلاً: عرض"
                value={colDraft}
                onChange={(e) => setColDraft(e.target.value)}
                onKeyDown={onColDraftKey}
              />
              <button type="button" onClick={addColumn} className={`${BTN} flex items-center gap-1 bg-blue text-white whitespace-nowrap`}>
                <Plus size={12} /> افزودن
              </button>
            </div>
            <p className="text-[11px] text-ink/45">
              تغییر نام یک ستون، مقدار قبلی آن را در محصولات جابه‌جا نمی‌کند؛ بعد از تغییر نام، مقدار ستون را دوباره در محصولات وارد کن.
            </p>
          </div>

          <div className="flex gap-2">
            <button disabled={busy} onClick={saveCategory} className={`${BTN} bg-blue text-white`}>ذخیره</button>
            <button onClick={() => setCEdit(null)} className={`${BTN} bg-black/5`}>انصراف</button>
          </div>
        </div>
      );
    }

    const siblings = c.parent_id ? childrenOf(c.parent_id) : roots;
    const index = siblings.findIndex((x) => x.id === c.id);
    return (
      <div key={c.id} className="flex items-center justify-between gap-2 rounded-xl border border-black/5 p-3">
        <div className="min-w-0">
          <div className="text-sm font-bold">
            {c.name}
            {isChild && <span className="text-[11px] font-normal text-ink/40"> · زیرمجموعه</span>}
          </div>
          <div className="mt-1 text-[11px] text-ink/40">
            {c.price_columns && c.price_columns.length > 0 ? `ستون‌ها: ${c.price_columns.join("، ")}` : "ستون اختصاصی ندارد"}
          </div>
        </div>
        <div className="flex flex-shrink-0 gap-1.5">
          <button disabled={busy || index <= 0} onClick={() => moveCategory(c, -1)} className={ICON_BTN} aria-label="بالا">
            <ArrowUp size={12} />
          </button>
          <button disabled={busy || index === siblings.length - 1} onClick={() => moveCategory(c, 1)} className={ICON_BTN} aria-label="پایین">
            <ArrowDown size={12} />
          </button>
          <button onClick={() => startEditCat(c)} className={`${BTN} bg-black/5`}>ویرایش</button>
          <button onClick={() => deleteCategory(c)} className={`${BTN} bg-danger/10 text-danger`}>حذف</button>
        </div>
      </div>
    );
  }

  return (
    <div>
      <h1 className="mb-1 text-xl font-extrabold">کارخانه‌ها و دسته‌ها</h1>
      <p className="mb-5 text-sm text-ink/50">کارخانه‌ها، دسته‌ها و زیرمجموعه‌ها را همین‌جا اضافه، ویرایش یا حذف کن.</p>

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

        {/* دسته‌ها و زیرمجموعه‌ها */}
        <section className="rounded-card border border-black/5 bg-white p-5">
          <h2 className="mb-1 text-sm font-extrabold">دسته‌ها ({categories.length})</h2>
          <p className="mb-4 text-[11px] text-ink/45">
            هر دسته‌ی اصلی می‌تواند زیرمجموعه داشته باشد، مثلاً میلگرد ← ساده و آجدار. هر زیرمجموعه ستون‌های قیمت جدا دارد.
          </p>

          <form onSubmit={addCategory} className="mb-5 grid gap-2 rounded-xl bg-steel p-3">
            <div className="flex gap-2">
              <input
                className={INPUT}
                placeholder="نام دسته یا زیرمجموعه"
                value={cNew.name}
                onChange={(e) => setCNew({ ...cNew, name: e.target.value })}
                required
              />
              <button disabled={busy} className={`${BTN} bg-blue text-white whitespace-nowrap`}>+ افزودن</button>
            </div>
            <select className={INPUT} value={cNew.parent_id} onChange={(e) => setCNew({ ...cNew, parent_id: e.target.value })}>
              <option value="">دسته‌ی اصلی (بدون والد)</option>
              {roots.map((r) => (
                <option key={r.id} value={r.id}>
                  زیرمجموعه‌ی «{r.name}»
                </option>
              ))}
            </select>
          </form>

          <div className="space-y-2">
            {roots.map((c) => (
              <div key={c.id} className="space-y-2">
                {renderCategory(c, false)}
                {childrenOf(c.id).length > 0 && (
                  <div className="mr-4 space-y-2 border-r-2 border-blue/20 pr-3">
                    {childrenOf(c.id).map((k) => renderCategory(k, true))}
                  </div>
                )}
              </div>
            ))}
          </div>
        </section>
      </div>
    </div>
  );
}
