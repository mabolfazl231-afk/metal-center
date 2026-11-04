"use client";

import { useState, type ChangeEvent } from "react";
import { ImagePlus, Loader2, X } from "lucide-react";
import { supabase } from "@/lib/supabase";

// نام فایل یکتا و بی‌فاصله — فارسی یا فاصله در نام فایل آپلود را خراب نمی‌کند
function uniqueName(name: string) {
  const ext = (name.split(".").pop() || "jpg").toLowerCase().replace(/[^a-z0-9]/g, "") || "jpg";
  return `${Date.now()}-${Math.random().toString(36).slice(2, 8)}.${ext}`;
}

// آپلود فایل در مخزن «media» و برگرداندن آدرس عمومی آن
export async function uploadMedia(file: File): Promise<string> {
  const isPdf = file.type === "application/pdf";
  const isImage = file.type.startsWith("image/");
  if (!isPdf && !isImage) throw new Error("فقط فایل عکس یا PDF مجاز است.");
  const limit = isPdf ? 20 : 5;
  if (file.size > limit * 1024 * 1024) throw new Error(`حجم فایل باید کمتر از ${limit} مگابایت باشد.`);

  const path = uniqueName(file.name);
  const { error } = await supabase.storage.from("media").upload(path, file, {
    cacheControl: "3600",
    upsert: false,
    contentType: file.type,
  });
  if (error) {
    throw new Error(
      error.message.toLowerCase().includes("bucket")
        ? "مخزن رسانه پیدا نشد. اول فایل 0009 را در Supabase اجرا کن."
        : "آپلود ناموفق بود: " + error.message
    );
  }
  return supabase.storage.from("media").getPublicUrl(path).data.publicUrl;
}

// فیلد آپلود عکس: یک عکس انتخاب می‌کنی، آدرسش خودکار در فرم قرار می‌گیرد
export default function ImageUploadField({ value, onChange, label = "تصویر" }: { value: string; onChange: (url: string) => void; label?: string }) {
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState("");

  async function pick(e: ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    e.target.value = "";
    if (!file) return;
    setBusy(true);
    setErr("");
    try {
      onChange(await uploadMedia(file));
    } catch (ex) {
      setErr(ex instanceof Error ? ex.message : "آپلود ناموفق بود.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <div>
      <span className="text-xs font-bold text-ink/60">{label}</span>
      <div className="mt-1 flex items-center gap-3">
        <div className="relative h-16 w-24 flex-shrink-0 overflow-hidden rounded-xl bg-steel">
          {value ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={value} alt="" className="h-full w-full object-cover" />
          ) : (
            <span className="flex h-full items-center justify-center text-ink/30"><ImagePlus size={20} /></span>
          )}
        </div>
        <div className="flex flex-col gap-1.5">
          <label className="inline-flex cursor-pointer items-center gap-1.5 rounded-lg bg-blue/10 px-3 py-2 text-xs font-bold text-blue">
            {busy ? <Loader2 size={14} className="animate-spin" /> : <ImagePlus size={14} />}
            {busy ? "در حال آپلود..." : "انتخاب عکس"}
            <input type="file" accept="image/*" className="hidden" onChange={pick} disabled={busy} />
          </label>
          {value && (
            <button type="button" onClick={() => onChange("")} className="inline-flex items-center gap-1 text-[11px] font-bold text-danger">
              <X size={12} /> حذف عکس
            </button>
          )}
        </div>
      </div>
      {err && <p className="mt-1.5 text-[11px] font-bold text-danger">{err}</p>}
    </div>
  );
}
