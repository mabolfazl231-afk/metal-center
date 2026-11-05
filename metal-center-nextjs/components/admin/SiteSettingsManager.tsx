"use client";

import { useEffect, useState, type ChangeEvent, type FormEvent } from "react";
import { supabase } from "@/lib/supabase";
import { DEFAULT_SETTINGS, type Settings } from "@/lib/cms";
import { uploadMedia } from "@/components/admin/ImageUploadField";

type Form = {
  phones: string;
  email: string;
  telegram: string;
  instagram: string;
  linkedin: string;
  hours: string;
  site_description: string;
  catalog_pdf_url: string;
};

type Msg = { type: "ok" | "err"; text: string } | null;

const INPUT = "w-full rounded-lg border border-black/10 bg-white px-3 py-2 text-sm outline-none focus:border-blue";
const BTN = "rounded-lg px-4 py-2.5 text-xs font-bold transition disabled:opacity-40";

// خطوط «عنوان | مقدار» را به فهرست تبدیل می‌کند
function parsePairs(text: string) {
  return text
    .split("\n")
    .map((line) => line.split("|").map((x) => x.trim()))
    .filter((p) => p[0] && p[1]);
}

// ارقام فارسی شماره تلفن را انگلیسی می‌کند تا لینک tel درست کار کند
const toEn = (s: string) => s.replace(/[۰-۹]/g, (d) => String("۰۱۲۳۴۵۶۷۸۹".indexOf(d)));

function toForm(s: Settings): Form {
  return {
    phones: s.phones.map((p) => `${p.display} | ${p.tel}`).join("\n"),
    email: s.email,
    telegram: s.telegram,
    instagram: s.instagram,
    linkedin: s.linkedin,
    hours: s.hours.map((h) => `${h.days} | ${h.hours}`).join("\n"),
    site_description: s.site_description,
    catalog_pdf_url: s.catalog_pdf_url,
  };
}

export default function SiteSettingsManager() {
  const [form, setForm] = useState<Form>(toForm(DEFAULT_SETTINGS));
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState(false);
  const [msg, setMsg] = useState<Msg>(null);

  useEffect(() => {
    supabase
      .from("site_settings")
      .select("value")
      .eq("key", "general")
      .maybeSingle()
      .then(({ data, error }) => {
        setLoading(false);
        if (error) return setMsg({ type: "err", text: "خواندن تنظیمات ناموفق بود. فایل 0009 را در Supabase اجرا کن. (" + error.message + ")" });
        if (data?.value) setForm(toForm({ ...DEFAULT_SETTINGS, ...(data.value as Partial<Settings>) }));
      });
  }, []);

  async function uploadCatalog(e: ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    e.target.value = "";
    if (!file) return;
    setBusy(true);
    setMsg(null);
    try {
      const url = await uploadMedia(file);
      setForm((f) => ({ ...f, catalog_pdf_url: url }));
      setMsg({ type: "ok", text: "فایل آپلود شد. برای نمایش در فوتر، تنظیمات را ذخیره کن." });
    } catch (ex) {
      setMsg({ type: "err", text: ex instanceof Error ? ex.message : "آپلود ناموفق بود." });
    } finally {
      setBusy(false);
    }
  }

  async function save(e: FormEvent) {
    e.preventDefault();
    const phones = parsePairs(toEn(form.phones)).map(([display, tel]) => ({ display, tel: tel.replace(/[^0-9+]/g, "") }));
    if (phones.length === 0) return setMsg({ type: "err", text: "حداقل یک شماره تماس وارد کن (هر خط: نمایش | شماره)." });
    const value: Settings = {
      phones,
      email: form.email.trim(),
      telegram: form.telegram.trim(),
      instagram: form.instagram.trim(),
      linkedin: form.linkedin.trim(),
      hours: parsePairs(form.hours).map(([days, hours]) => ({ days, hours })),
      site_description: form.site_description.trim(),
      catalog_pdf_url: form.catalog_pdf_url.trim(),
    };
    setBusy(true);
    const { error } = await supabase
      .from("site_settings")
      .upsert({ key: "general", value, updated_at: new Date().toISOString() }, { onConflict: "key" });
    setBusy(false);
    if (error) return setMsg({ type: "err", text: "ذخیره نشد: " + error.message });
    setMsg({ type: "ok", text: "تنظیمات ذخیره شد. تغییرات تا حدود ۱ دقیقه در سایت دیده می‌شود." });
  }

  if (loading) return <p className="py-10 text-center text-sm text-ink/40">در حال بارگذاری...</p>;

  return (
    <form onSubmit={save} className="space-y-6">
      <div>
        <h1 className="mb-1 text-xl font-extrabold">تنظیمات سایت و اطلاعات تماس</h1>
        <p className="text-sm text-ink/50">این اطلاعات در فوتر، صفحه‌ی تماس و جاهای دیگر سایت نمایش داده می‌شود.</p>
      </div>

      {msg && (
        <div className={`rounded-xl px-4 py-3 text-sm font-semibold ${msg.type === "ok" ? "bg-success/10 text-success" : "bg-danger/10 text-danger"}`}>
          {msg.text}
        </div>
      )}

      <section className="grid gap-4 rounded-card border border-black/5 bg-white p-5 md:grid-cols-2">
        <h2 className="text-sm font-extrabold md:col-span-2">شماره‌ها و ایمیل</h2>
        <div className="md:col-span-2">
          <label className="mb-1 block text-xs font-bold text-ink/60">شماره‌های تماس</label>
          <textarea className={INPUT} rows={3} dir="ltr" value={form.phones} onChange={(e) => setForm({ ...form, phones: e.target.value })} />
          <p className="mt-1 text-[11px] text-ink/45">هر خط یک شماره: نمایش | شماره بدون فاصله. مثال: 0919-782-9196 | 09197829196</p>
        </div>
        <div className="md:col-span-2">
          <label className="mb-1 block text-xs font-bold text-ink/60">ایمیل</label>
          <input className={INPUT} dir="ltr" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} />
        </div>
      </section>

      <section className="grid gap-4 rounded-card border border-black/5 bg-white p-5 md:grid-cols-2">
        <h2 className="text-sm font-extrabold md:col-span-2">شبکه‌های اجتماعی</h2>
        <div>
          <label className="mb-1 block text-xs font-bold text-ink/60">تلگرام</label>
          <input className={INPUT} dir="ltr" value={form.telegram} onChange={(e) => setForm({ ...form, telegram: e.target.value })} />
        </div>
        <div>
          <label className="mb-1 block text-xs font-bold text-ink/60">اینستاگرام</label>
          <input className={INPUT} dir="ltr" value={form.instagram} onChange={(e) => setForm({ ...form, instagram: e.target.value })} />
        </div>
        <div className="md:col-span-2">
          <label className="mb-1 block text-xs font-bold text-ink/60">لینکدین</label>
          <input className={INPUT} dir="ltr" value={form.linkedin} onChange={(e) => setForm({ ...form, linkedin: e.target.value })} />
        </div>
      </section>

      <section className="grid gap-4 rounded-card border border-black/5 bg-white p-5">
        <h2 className="text-sm font-extrabold">ساعات کاری</h2>
        <div>
          <label className="mb-1 block text-xs font-bold text-ink/60">ساعات کاری</label>
          <textarea className={INPUT} rows={2} value={form.hours} onChange={(e) => setForm({ ...form, hours: e.target.value })} />
          <p className="mt-1 text-[11px] text-ink/45">هر خط: روزها | ساعت. مثال: شنبه تا چهارشنبه | ۸:۳۰ تا ۱۷</p>
        </div>
      </section>

      <section className="grid gap-4 rounded-card border border-black/5 bg-white p-5">
        <h2 className="text-sm font-extrabold">کاتالوگ و موتور جستجو (SEO)</h2>
        <div>
          <label className="mb-1 block text-xs font-bold text-ink/60">توضیح کوتاه سایت (برای گوگل)</label>
          <textarea className={INPUT} rows={2} value={form.site_description} onChange={(e) => setForm({ ...form, site_description: e.target.value })} />
        </div>
        <div>
          <span className="mb-1 block text-xs font-bold text-ink/60">کاتالوگ PDF (دکمه‌ی دانلود فوتر)</span>
          <div className="flex flex-wrap items-center gap-2">
            <label className="inline-flex cursor-pointer items-center rounded-lg bg-blue/10 px-3 py-2 text-xs font-bold text-blue">
              انتخاب فایل PDF
              <input type="file" accept="application/pdf" className="hidden" onChange={uploadCatalog} disabled={busy} />
            </label>
            {form.catalog_pdf_url && (
              <a href={form.catalog_pdf_url} target="_blank" rel="noopener noreferrer" className="text-xs font-bold text-blue underline" dir="ltr">
                فایل فعلی
              </a>
            )}
          </div>
        </div>
      </section>

      <button disabled={busy} className={`${BTN} bg-blue text-white`}>
        {busy ? "در حال ذخیره..." : "ذخیره تنظیمات"}
      </button>
    </form>
  );
}
