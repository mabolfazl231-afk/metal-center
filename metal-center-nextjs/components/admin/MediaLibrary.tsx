"use client";

import { useEffect, useState, type ChangeEvent } from "react";
import { Copy, Check, Trash2, Loader2 } from "lucide-react";
import { supabase } from "@/lib/supabase";
import { uploadMedia } from "@/components/admin/ImageUploadField";

type Item = { name: string; created_at?: string };

// مخزن رسانه: آپلود عکس و PDF و کپی آدرس آن‌ها
export default function MediaLibrary() {
  const [items, setItems] = useState<Item[]>([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [msg, setMsg] = useState<{ type: "ok" | "err"; text: string } | null>(null);
  const [copied, setCopied] = useState<string | null>(null);

  const urlOf = (name: string) => supabase.storage.from("media").getPublicUrl(name).data.publicUrl;

  async function load() {
    setLoading(true);
    const { data, error } = await supabase.storage
      .from("media")
      .list("", { limit: 200, sortBy: { column: "created_at", order: "desc" } });
    setLoading(false);
    if (error) return setMsg({ type: "err", text: "خواندن رسانه‌ها ناموفق بود. فایل 0009 را در Supabase اجرا کن. (" + error.message + ")" });
    // پوشه‌ها شناسه ندارند؛ فقط فایل‌ها نمایش داده می‌شوند
    setItems((data ?? []).filter((d) => d.id).map((d) => ({ name: d.name, created_at: d.created_at })));
  }

  useEffect(() => {
    load();
  }, []);

  async function upload(e: ChangeEvent<HTMLInputElement>) {
    const files = Array.from(e.target.files ?? []);
    e.target.value = "";
    if (files.length === 0) return;
    setUploading(true);
    setMsg(null);
    let failed = 0;
    for (const f of files) {
      try {
        await uploadMedia(f);
      } catch (ex) {
        failed++;
        setMsg({ type: "err", text: ex instanceof Error ? ex.message : "آپلود ناموفق بود." });
      }
    }
    setUploading(false);
    if (failed < files.length) setMsg((m) => (m?.type === "err" ? m : { type: "ok", text: `${files.length - failed} فایل آپلود شد.` }));
    load();
  }

  async function copy(name: string) {
    const url = urlOf(name);
    try {
      await navigator.clipboard.writeText(url);
    } catch {
      window.prompt("آدرس را کپی کنید:", url);
    }
    setCopied(name);
    setTimeout(() => setCopied(null), 1500);
  }

  async function remove(name: string) {
    if (!window.confirm("این فایل حذف شود؟ اگر جایی از سایت استفاده شده باشد، آن عکس دیگر نمایش داده نمی‌شود.")) return;
    const { error } = await supabase.storage.from("media").remove([name]);
    if (error) return setMsg({ type: "err", text: "حذف نشد: " + error.message });
    load();
  }

  return (
    <div>
      <div className="mb-5 flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="mb-1 text-xl font-extrabold">رسانه‌ها</h1>
          <p className="text-sm text-ink/50">عکس و PDF را اینجا آپلود کن و آدرس آن را در بخش‌های دیگر (بنر، خدمات، مقالات، کاتالوگ) استفاده کن.</p>
        </div>
        <label className="inline-flex cursor-pointer items-center gap-1.5 rounded-lg bg-blue px-3.5 py-2.5 text-xs font-bold text-white">
          {uploading ? <Loader2 size={14} className="animate-spin" /> : null}
          {uploading ? "در حال آپلود..." : "آپلود فایل"}
          <input type="file" multiple accept="image/*,application/pdf" className="hidden" onChange={upload} disabled={uploading} />
        </label>
      </div>

      {msg && (
        <div className={`mb-5 rounded-xl px-4 py-3 text-sm font-semibold ${msg.type === "ok" ? "bg-success/10 text-success" : "bg-danger/10 text-danger"}`}>
          {msg.text}
        </div>
      )}

      {loading ? (
        <p className="py-10 text-center text-sm text-ink/40">در حال بارگذاری...</p>
      ) : items.length === 0 ? (
        <p className="rounded-card border border-dashed border-black/10 py-12 text-center text-sm text-ink/40">هنوز فایلی آپلود نشده است.</p>
      ) : (
        <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
          {items.map((it) => {
            const isPdf = it.name.toLowerCase().endsWith(".pdf");
            return (
              <div key={it.name} className="overflow-hidden rounded-card border border-black/5 bg-white">
                <div className="flex h-32 items-center justify-center bg-steel">
                  {isPdf ? (
                    <span className="text-xs font-bold text-ink/50">PDF</span>
                  ) : (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={urlOf(it.name)} alt="" className="h-full w-full object-cover" />
                  )}
                </div>
                <div className="flex items-center justify-between gap-1 p-2">
                  <button onClick={() => copy(it.name)} className="flex items-center gap-1 rounded-lg bg-black/5 px-2 py-1.5 text-[11px] font-bold">
                    {copied === it.name ? <Check size={12} className="text-success" /> : <Copy size={12} />}
                    {copied === it.name ? "کپی شد" : "کپی آدرس"}
                  </button>
                  <button onClick={() => remove(it.name)} className="rounded-lg bg-danger/10 p-1.5 text-danger" aria-label="حذف">
                    <Trash2 size={12} />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
