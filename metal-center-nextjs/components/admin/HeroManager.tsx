"use client";

import { useEffect, useState, type FormEvent } from "react";
import { ArrowUp, ArrowDown, Pencil, Trash2, Eye, EyeOff, Plus } from "lucide-react";
import { supabase } from "@/lib/supabase";

type Slide = {
  id: string;
  eyebrow: string;
  title: string;
  description: string;
  primary_label: string;
  primary_href: string;
  secondary_label: string;
  secondary_href: string;
  image_url: string | null;
  sort_order: number;
  active: boolean;
};

type Form = Omit<Slide, "id" | "sort_order">;
type Msg = { type: "ok" | "err"; text: string } | null;

const EMPTY: Form = {
  eyebrow: "",
  title: "",
  description: "",
  primary_label: "",
  primary_href: "",
  secondary_label: "",
  secondary_href: "",
  image_url: "",
  active: true,
};

const INPUT = "w-full rounded-lg border border-black/10 bg-white px-3 py-2 text-sm outline-none focus:border-blue";
const BTN = "rounded-lg px-3 py-2 text-xs font-bold transition disabled:opacity-40";

export default function HeroManager() {
  const [slides, setSlides] = useState<Slide[]>([]);
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState(false);
  const [msg, setMsg] = useState<Msg>(null);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState<Form>(EMPTY);

  function flash(type: "ok" | "err", text: string) {
    setMsg({ type, text });
  }

  async function load() {
    setLoading(true);
    const { data, error } = await supabase.from("hero_slides").select("*").order("sort_order", { ascending: true });
    setLoading(false);
    if (error) {
      return flash("err", "خواندن بنرها ناموفق بود. مطمئن شو فایل 0007 را در Supabase اجرا کرده‌ای. (" + error.message + ")");
    }
    setSlides((data ?? []) as Slide[]);
  }

  useEffect(() => {
    load();
  }, []);

  function startNew() {
    setEditingId(null);
    setForm(EMPTY);
    setShowForm(true);
  }

  function startEdit(s: Slide) {
    setEditingId(s.id);
    setForm({
      eyebrow: s.eyebrow,
      title: s.title,
      description: s.description,
      primary_label: s.primary_label,
      primary_href: s.primary_href,
      secondary_label: s.secondary_label,
      secondary_href: s.secondary_href,
      image_url: s.image_url ?? "",
      active: s.active,
    });
    setShowForm(true);
  }

  async function save(e: FormEvent) {
    e.preventDefault();
    if (!form.title.trim()) return flash("err", "عنوان بنر را وارد کن.");
    setBusy(true);
    const payload = { ...form, title: form.title.trim(), image_url: form.image_url.trim() || null };
    const res = editingId
      ? await supabase.from("hero_slides").update(payload).eq("id", editingId)
      : await supabase
          .from("hero_slides")
          .insert({ ...payload, sort_order: Math.max(0, ...slides.map((s) => s.sort_order)) + 1 });
    setBusy(false);
    if (res.error) return flash("err", "ذخیره نشد: " + res.error.message);
    setShowForm(false);
    setEditingId(null);
    flash("ok", "بنر ذخیره شد.");
    load();
  }

  // جابه‌جایی با همسایه‌ی بالا/پایین
  async function move(s: Slide, dir: -1 | 1) {
    const i = slides.findIndex((x) => x.id === s.id);
    const other = slides[i + dir];
    if (!other) return;
    setBusy(true);
    const [a, b] = await Promise.all([
      supabase.from("hero_slides").update({ sort_order: other.sort_order }).eq("id", s.id),
      supabase.from("hero_slides").update({ sort_order: s.sort_order }).eq("id", other.id),
    ]);
    setBusy(false);
    if (a.error || b.error) return flash("err", "ترتیب تغییر نکرد.");
    load();
  }

  async function toggleActive(s: Slide) {
    const { error } = await supabase.from("hero_slides").update({ active: !s.active }).eq("id", s.id);
    if (error) return flash("err", "تغییر وضعیت ناموفق بود: " + error.message);
    load();
  }

  async function remove(s: Slide) {
    if (!window.confirm(`بنر «${s.title}» حذف شود؟`)) return;
    const { error } = await supabase.from("hero_slides").delete().eq("id", s.id);
    if (error) return flash("err", "حذف نشد: " + error.message);
    flash("ok", "بنر حذف شد.");
    load();
  }

  return (
    <div>
      <div className="mb-5 flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="mb-1 text-xl font-extrabold">بنرهای صفحه‌ی اصلی</h1>
          <p className="text-sm text-ink/50">
            بنرهای اسلایدر بالای سایت. ترتیب نمایش با فلش‌ها عوض می‌شود و بنر غیرفعال نمایش داده نمی‌شود.
          </p>
        </div>
        <button onClick={startNew} className={`${BTN} flex items-center gap-1.5 bg-blue text-white`}>
          <Plus size={14} /> بنر جدید
        </button>
      </div>

      {msg && (
        <div className={`mb-5 rounded-xl px-4 py-3 text-sm font-semibold ${msg.type === "ok" ? "bg-success/10 text-success" : "bg-danger/10 text-danger"}`}>
          {msg.text}
        </div>
      )}

      {showForm && (
        <form onSubmit={save} className="mb-6 grid gap-3 rounded-card border border-blue/30 bg-white p-5 md:grid-cols-2">
          <div className="md:col-span-2 text-sm font-extrabold">{editingId ? "ویرایش بنر" : "بنر جدید"}</div>
          <div>
            <label className="text-xs font-bold text-ink/60">متن کوچک بالای عنوان</label>
            <input className={INPUT} value={form.eyebrow} onChange={(e) => setForm({ ...form, eyebrow: e.target.value })} />
          </div>
          <div>
            <label className="text-xs font-bold text-ink/60">عنوان اصلی *</label>
            <input className={INPUT} value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} required />
          </div>
          <div className="md:col-span-2">
            <label className="text-xs font-bold text-ink/60">توضیح</label>
            <textarea className={INPUT} rows={2} value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} />
          </div>
          <div>
            <label className="text-xs font-bold text-ink/60">دکمه‌ی اصلی — متن</label>
            <input className={INPUT} value={form.primary_label} onChange={(e) => setForm({ ...form, primary_label: e.target.value })} />
          </div>
          <div>
            <label className="text-xs font-bold text-ink/60">دکمه‌ی اصلی — لینک (مثلاً /prices)</label>
            <input className={INPUT} dir="ltr" value={form.primary_href} onChange={(e) => setForm({ ...form, primary_href: e.target.value })} />
          </div>
          <div>
            <label className="text-xs font-bold text-ink/60">دکمه‌ی دوم — متن (اختیاری)</label>
            <input className={INPUT} value={form.secondary_label} onChange={(e) => setForm({ ...form, secondary_label: e.target.value })} />
          </div>
          <div>
            <label className="text-xs font-bold text-ink/60">دکمه‌ی دوم — لینک</label>
            <input className={INPUT} dir="ltr" value={form.secondary_href} onChange={(e) => setForm({ ...form, secondary_href: e.target.value })} />
          </div>
          <div className="md:col-span-2">
            <label className="text-xs font-bold text-ink/60">تصویر پس‌زمینه (اختیاری)</label>
            <input
              className={INPUT}
              dir="ltr"
              placeholder="/banners/hero-1.jpg"
              value={form.image_url}
              onChange={(e) => setForm({ ...form, image_url: e.target.value })}
            />
            <p className="mt-1 text-[11px] text-ink/45">
              فایل عکس را داخل پوشه‌ی public/banners بگذار و مسیرش را اینجا بنویس. اندازه‌ی پیشنهادی ۱۹۲۰×۸۰۰ پیکسل.
            </p>
          </div>
          <label className="flex items-center gap-2 text-xs font-bold md:col-span-2">
            <input type="checkbox" checked={form.active} onChange={(e) => setForm({ ...form, active: e.target.checked })} className="accent-blue" />
            نمایش در سایت
          </label>
          <div className="flex gap-2 md:col-span-2">
            <button disabled={busy} className={`${BTN} bg-blue text-white`}>ذخیره</button>
            <button type="button" onClick={() => setShowForm(false)} className={`${BTN} bg-black/5`}>انصراف</button>
          </div>
        </form>
      )}

      {loading ? (
        <p className="py-10 text-center text-sm text-ink/40">در حال بارگذاری...</p>
      ) : slides.length === 0 ? (
        <p className="rounded-card border border-dashed border-black/10 py-12 text-center text-sm text-ink/40">
          بنری ثبت نشده. با دکمه‌ی «بنر جدید» اولین بنر را بساز. تا وقتی بنری نباشد، بنرهای پیش‌فرض سایت نمایش داده می‌شوند.
        </p>
      ) : (
        <div className="space-y-3">
          {slides.map((s, i) => (
            <div key={s.id} className={`flex flex-col gap-3 rounded-card border bg-white p-4 sm:flex-row sm:items-center ${s.active ? "border-black/5" : "border-dashed border-black/15 opacity-70"}`}>
              <div className="relative h-16 w-full flex-shrink-0 overflow-hidden rounded-xl bg-gradient-to-l from-[#071B34] to-[#0A3D91] sm:w-28">
                {s.image_url && (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={s.image_url} alt="" className="absolute inset-0 h-full w-full object-cover" />
                )}
              </div>
              <div className="min-w-0 flex-1">
                <div className="text-[11px] font-bold text-blue">{s.eyebrow || "بدون متن کوچک"}</div>
                <div className="truncate text-sm font-extrabold">{s.title}</div>
                <div className="text-[11px] text-ink/45">
                  {s.active ? "نمایش داده می‌شود" : "غیرفعال"} · ترتیب {s.sort_order}
                </div>
              </div>
              <div className="flex flex-wrap items-center gap-1.5">
                <button disabled={busy || i === 0} onClick={() => move(s, -1)} className={`${BTN} bg-black/5`} aria-label="بالا">
                  <ArrowUp size={14} />
                </button>
                <button disabled={busy || i === slides.length - 1} onClick={() => move(s, 1)} className={`${BTN} bg-black/5`} aria-label="پایین">
                  <ArrowDown size={14} />
                </button>
                <button onClick={() => toggleActive(s)} className={`${BTN} bg-black/5`} aria-label={s.active ? "غیرفعال کردن" : "فعال کردن"}>
                  {s.active ? <Eye size={14} /> : <EyeOff size={14} />}
                </button>
                <button onClick={() => startEdit(s)} className={`${BTN} bg-black/5`} aria-label="ویرایش">
                  <Pencil size={14} />
                </button>
                <button onClick={() => remove(s)} className={`${BTN} bg-danger/10 text-danger`} aria-label="حذف">
                  <Trash2 size={14} />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
