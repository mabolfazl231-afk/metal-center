"use client";

import { useEffect, useState, type FormEvent } from "react";
import { Pencil, Plus, Eye, EyeOff } from "lucide-react";
import { supabase } from "@/lib/supabase";
import ImageUploadField from "@/components/admin/ImageUploadField";
import type { SitePage } from "@/lib/cms";

// صفحه‌های ثابت سایت؛ هر کدام بنر و متن خودش را دارد
const FIXED = [
  { key: "services", title: "خدمات", path: "/services" },
  { key: "knowledge", title: "مرکز دانش", path: "/knowledge" },
  { key: "products", title: "محصولات", path: "/products" },
  { key: "factories", title: "کارخانه‌ها", path: "/factories" },
  { key: "export", title: "صادرات", path: "/export" },
  { key: "about", title: "درباره ما", path: "/about" },
];
const FIXED_KEYS = FIXED.map((f) => f.key);
// این آدرس‌ها برای صفحات اصلی سایت رزرو هستند و نمی‌شود صفحه‌ی جدید با آن‌ها ساخت
const RESERVED = ["admin", "login", "auth", "prices", "rfq", "contact", "category", "api", "p", "steel-weight-calculator", "assistant"];

type Row = SitePage & { updated_at?: string };
type Form = { key: string; title: string; subtitle: string; body: string; banner_url: string; published: boolean };
type Msg = { type: "ok" | "err"; text: string } | null;

const INPUT = "w-full rounded-lg border border-black/10 bg-white px-3 py-2 text-sm outline-none focus:border-blue";
const BTN = "rounded-lg px-3 py-2 text-xs font-bold transition disabled:opacity-40";

const EMPTY = (key: string): Form => ({ key, title: "", subtitle: "", body: "", banner_url: "", published: true });

export default function SitePagesManager() {
  const [rows, setRows] = useState<Row[]>([]);
  const [busy, setBusy] = useState(false);
  const [msg, setMsg] = useState<Msg>(null);
  const [form, setForm] = useState<Form | null>(null);
  const [isNew, setIsNew] = useState(false);
  const [newSlug, setNewSlug] = useState("");

  function flash(type: "ok" | "err", text: string) {
    setMsg({ type, text });
  }

  async function load() {
    const { data, error } = await supabase.from("site_pages").select("*");
    if (error) return flash("err", "خواندن صفحات ناموفق بود. اول فایل 0014 را در Supabase اجرا کن. (" + error.message + ")");
    setRows((data ?? []) as Row[]);
  }

  useEffect(() => {
    load();
  }, []);

  const rowOf = (key: string) => rows.find((r) => r.key === key);
  const custom = rows.filter((r) => !FIXED_KEYS.includes(r.key));

  function editFixed(key: string) {
    const r = rowOf(key);
    setIsNew(false);
    setForm(
      r
        ? { key: r.key, title: r.title, subtitle: r.subtitle, body: r.body, banner_url: r.banner_url ?? "", published: r.published }
        : EMPTY(key)
    );
  }

  function editRow(r: Row) {
    setIsNew(false);
    setForm({ key: r.key, title: r.title, subtitle: r.subtitle, body: r.body, banner_url: r.banner_url ?? "", published: r.published });
  }

  function startNewPage() {
    const slug = newSlug.trim().toLowerCase();
    if (!/^[a-z0-9-]+$/.test(slug)) return flash("err", "آدرس صفحه فقط حروف انگلیسی کوچک، عدد و خط تیره باشد، مثلاً shipping-info.");
    if (RESERVED.includes(slug) || FIXED_KEYS.includes(slug)) return flash("err", "این آدرس رزرو است؛ یک آدرس دیگر انتخاب کن.");
    if (rowOf(slug)) return flash("err", "صفحه‌ای با این آدرس از قبل وجود دارد.");
    setIsNew(true);
    setForm(EMPTY(slug));
  }

  async function save(e: FormEvent) {
    e.preventDefault();
    if (!form) return;
    if (!form.title.trim()) return flash("err", "عنوان صفحه را وارد کن.");
    setBusy(true);
    const { error } = await supabase.from("site_pages").upsert(
      {
        key: form.key,
        title: form.title.trim(),
        subtitle: form.subtitle.trim(),
        body: form.body,
        banner_url: form.banner_url || null,
        published: form.published,
        updated_at: new Date().toISOString(),
      },
      { onConflict: "key" }
    );
    setBusy(false);
    if (error) return flash("err", "ذخیره نشد: " + error.message);
    setForm(null);
    setIsNew(false);
    flash("ok", "صفحه ذخیره شد.");
    load();
  }

  async function togglePublished(r: Row) {
    const { error } = await supabase.from("site_pages").update({ published: !r.published }).eq("key", r.key);
    if (error) return flash("err", "تغییر وضعیت ناموفق بود: " + error.message);
    load();
  }

  const urlOf = (key: string) => FIXED.find((f) => f.key === key)?.path ?? `/p/${key}`;

  return (
    <div>
      <h1 className="mb-1 text-xl font-extrabold">صفحات سایت و بنرها</h1>
      <p className="mb-5 text-sm text-ink/50">
        برای هر صفحه می‌توانی بنر، عنوان، توضیح و متن کامل را تغییر دهی. صفحه‌ی جدید هم می‌توانی بسازی؛ آدرسش /p/نام-صفحه می‌شود.
      </p>

      {msg && (
        <div className={`mb-5 rounded-xl px-4 py-3 text-sm font-semibold ${msg.type === "ok" ? "bg-success/10 text-success" : "bg-danger/10 text-danger"}`}>
          {msg.text}
        </div>
      )}

      {form && (
        <form onSubmit={save} className="mb-6 grid gap-3 rounded-card border border-blue/30 bg-white p-5 md:grid-cols-2">
          <div className="md:col-span-2 text-sm font-extrabold">
            {isNew ? `صفحه‌ی جدید: ${urlOf(form.key)}` : `ویرایش: ${urlOf(form.key)}`}
          </div>
          <div>
            <label className="text-xs font-bold text-ink/60">عنوان صفحه *</label>
            <input className={INPUT} value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} required />
          </div>
          <div>
            <label className="text-xs font-bold text-ink/60">زیرعنوان (توضیح کوتاه زیر عنوان)</label>
            <input className={INPUT} value={form.subtitle} onChange={(e) => setForm({ ...form, subtitle: e.target.value })} />
          </div>
          <div className="md:col-span-2">
            <label className="text-xs font-bold text-ink/60">متن کامل صفحه (زیر بنر؛ پاراگراف‌ها را با Enter جدا کن)</label>
            <textarea className={INPUT} rows={6} value={form.body} onChange={(e) => setForm({ ...form, body: e.target.value })} />
          </div>
          <div className="md:col-span-2">
            <ImageUploadField label="عکس بنر" value={form.banner_url} onChange={(url) => setForm({ ...form, banner_url: url })} />
            <p className="mt-1 text-[11px] text-ink/45">اندازه‌ی پیشنهادی ۱۹۲۰×۶۰۰ پیکسل. بدون عکس، پس‌زمینه‌ی آبی نمایش داده می‌شود.</p>
          </div>
          <label className="flex items-center gap-2 text-xs font-bold md:col-span-2">
            <input type="checkbox" checked={form.published} onChange={(e) => setForm({ ...form, published: e.target.checked })} className="accent-blue" />
            نمایش در سایت
          </label>
          <div className="flex gap-2 md:col-span-2">
            <button disabled={busy} className={`${BTN} bg-blue text-white`}>ذخیره</button>
            <button type="button" onClick={() => setForm(null)} className={`${BTN} bg-black/5`}>انصراف</button>
          </div>
        </form>
      )}

      <div className="mb-3 text-xs font-extrabold text-ink/60">صفحات اصلی سایت</div>
      <div className="mb-8 space-y-2">
        {FIXED.map((f) => {
          const r = rowOf(f.key);
          return (
            <div key={f.key} className="flex flex-col gap-3 rounded-card border border-black/5 bg-white p-4 sm:flex-row sm:items-center">
              <div className="relative h-14 w-full flex-shrink-0 overflow-hidden rounded-xl bg-gradient-to-l from-navy to-blue sm:w-24">
                {r?.banner_url && (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={r.banner_url} alt="" className="absolute inset-0 h-full w-full object-cover" />
                )}
              </div>
              <div className="min-w-0 flex-1">
                <div className="text-sm font-extrabold">{f.title}</div>
                <div dir="ltr" className="text-[11px] text-ink/45">{f.path}</div>
                <div className="text-[11px] text-ink/45">{r ? (r.banner_url ? "بنر دارد" : "بدون بنر") : "هنوز تنظیم نشده"}</div>
              </div>
              <button onClick={() => editFixed(f.key)} className={`${BTN} flex items-center gap-1 bg-black/5`}>
                <Pencil size={13} /> ویرایش
              </button>
            </div>
          );
        })}
      </div>

      <div className="mb-3 text-xs font-extrabold text-ink/60">صفحات جدید</div>
      <div className="mb-3 flex flex-col gap-2 rounded-card bg-steel p-3 sm:flex-row">
        <input
          className={INPUT}
          dir="ltr"
          placeholder="آدرس صفحه، مثلاً shipping-info"
          value={newSlug}
          onChange={(e) => setNewSlug(e.target.value)}
        />
        <button onClick={startNewPage} className={`${BTN} flex items-center justify-center gap-1 bg-blue text-white whitespace-nowrap`}>
          <Plus size={13} /> صفحه‌ی جدید
        </button>
      </div>
      <div className="space-y-2">
        {custom.length === 0 && <p className="py-4 text-center text-xs text-ink/40">صفحه‌ی جدیدی ساخته نشده است.</p>}
        {custom.map((r) => (
          <div key={r.key} className="flex flex-col gap-3 rounded-card border border-black/5 bg-white p-4 sm:flex-row sm:items-center">
            <div className="min-w-0 flex-1">
              <div className="text-sm font-extrabold">{r.title}</div>
              <div dir="ltr" className="text-[11px] text-ink/45">/p/{r.key} {r.published ? "" : "· غیرفعال"}</div>
            </div>
            <div className="flex gap-1.5">
              <button onClick={() => togglePublished(r)} className={`${BTN} bg-black/5`} aria-label={r.published ? "غیرفعال کردن" : "فعال کردن"}>
                {r.published ? <Eye size={14} /> : <EyeOff size={14} />}
              </button>
              <button onClick={() => editRow(r)} className={`${BTN} flex items-center gap-1 bg-black/5`}>
                <Pencil size={13} /> ویرایش
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
