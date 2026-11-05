"use client";

import { useState } from "react";
import { supabase } from "@/lib/supabase";
import { Mic, FileText, Plus, Trash2 } from "lucide-react";

type Line = { product: string; size: string; quantity: string };
const EMPTY_LINE: Line = { product: "", size: "", quantity: "" };
const INPUT = "w-full rounded-xl border border-black/10 bg-steel p-3 text-sm outline-none focus:border-blue";

// ارقام فارسی را لاتین می‌کند تا شماره‌ی موبایل درست ذخیره شود
const toEn = (s: string) => s.replace(/[۰-۹]/g, (d) => String("۰۱۲۳۴۵۶۷۸۹".indexOf(d)));

export default function RfqPage() {
  const [method, setMethod] = useState<"upload" | "manual">("upload");
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [destination, setDestination] = useState("");
  const [deliveryTime, setDeliveryTime] = useState("عادی (۳-۵ روز کاری)");
  const [notes, setNotes] = useState("");
  const [files, setFiles] = useState<File[]>([]);
  const [lines, setLines] = useState<Line[]>([{ ...EMPTY_LINE }]);
  const [status, setStatus] = useState<"idle" | "sending" | "done" | "error">("idle");
  const [errorText, setErrorText] = useState("");

  function updateLine(i: number, patch: Partial<Line>) {
    setLines((ls) => ls.map((l, idx) => (idx === i ? { ...l, ...patch } : l)));
  }

  function fail(text: string) {
    setStatus("error");
    setErrorText(text);
  }

  async function handleSubmit() {
    const phoneDigits = toEn(phone).replace(/\D/g, "");
    if (!name.trim() || phoneDigits.length < 10) return fail("نام و شماره موبایل معتبر را وارد کنید.");

    const items = method === "manual" ? lines.filter((l) => l.product.trim()) : [];
    if (method === "manual" && items.length === 0) return fail("حداقل یک ردیف محصول وارد کنید.");

    setStatus("sending");
    const fileNote = method === "upload" && files.length > 0 ? `فایل‌های پیوست (نام): ${files.map((f) => f.name).join("، ")}` : "";
    const notesText = [notes.trim(), fileNote, `مقصد: ${destination.trim() || "—"} | زمان تحویل: ${deliveryTime}`]
      .filter(Boolean)
      .join("\n");

    const { data, error } = await supabase
      .from("rfqs")
      .insert({ customer_name: name.trim(), customer_phone: phoneDigits, method, notes: notesText, status: "pending" })
      .select("id")
      .single();
    if (error || !data) return fail("ثبت درخواست ناموفق بود. لطفاً دوباره تلاش کنید.");

    if (items.length > 0) {
      const { error: itemErr } = await supabase.from("rfq_items").insert(
        items.map((l) => ({
          rfq_id: data.id,
          product_name: l.product.trim(),
          size: l.size.trim() || null,
          quantity: l.quantity.trim() || null,
        }))
      );
      if (itemErr) return fail("درخواست ثبت شد، اما ردیف‌های محصول ذخیره نشدند. لطفاً با پشتیبانی تماس بگیرید.");
    }

    setStatus("done");
    setName("");
    setPhone("");
    setDestination("");
    setNotes("");
    setFiles([]);
    setLines([{ ...EMPTY_LINE }]);
  }

  return (
    <div className="mx-auto max-w-[1240px] px-6 py-10">
      <div className="mb-8 text-center">
        <h1 className="mb-2 text-[28px] font-extrabold">درخواست استعلام قیمت</h1>
        <p className="mx-auto max-w-[520px] text-[14.5px] text-ink/50">
          ردیف‌های خرید را وارد کنید یا فایل را پیوست کنید — کارشناسان ما ظرف چند ساعت پاسخ می‌دهند.
        </p>
      </div>

      <div className="mx-auto mb-8 flex max-w-[420px] gap-2 rounded-2xl border border-black/5 bg-white p-1.5">
        {(["upload", "manual"] as const).map((m) => (
          <button
            key={m}
            onClick={() => setMethod(m)}
            className={`flex-1 rounded-xl py-3 text-sm font-bold transition ${method === m ? "bg-blue text-white" : "text-ink/50"}`}
          >
            {m === "upload" ? "آپلود فایل" : "فرم دستی"}
          </button>
        ))}
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <div className="rounded-card border border-black/5 bg-white p-6">
          {method === "upload" ? (
            <>
              <h3 className="mb-4 font-bold">آپلود لیست خرید</h3>
              <label className="block cursor-pointer rounded-2xl border-2 border-dashed border-black/10 bg-steel p-10 text-center">
                <input
                  type="file"
                  multiple
                  className="hidden"
                  accept=".jpg,.jpeg,.png,.pdf,.xlsx,.xls,.dwg,.dxf"
                  onChange={(e) => setFiles(Array.from(e.target.files ?? []))}
                />
                <div className="mb-1 font-bold">فایل را انتخاب کنید</div>
                <div className="text-xs text-ink/50">JPG، PDF، Excel، نقشه DWG/DXF</div>
              </label>

              {files.length > 0 && (
                <ul className="mt-3 space-y-1.5">
                  {files.map((f, i) => (
                    <li key={i} className="flex items-center gap-2 rounded-xl bg-steel px-3 py-2 text-xs">
                      <FileText size={14} className="text-blue" /> {f.name}
                    </li>
                  ))}
                </ul>
              )}
              <p className="mt-3 text-[11px] leading-6 text-ink/45">
                فعلاً نام فایل همراه درخواست ثبت می‌شود. ارسال خود فایل در نسخه‌ی بعدی فعال می‌شود؛ اگر فایل مهم است، همراه با شماره‌ی خود به واتساپ یا تلگرام هم بفرستید.
              </p>

              <button type="button" disabled title="به‌زودی" className="mt-3 flex w-full cursor-not-allowed items-center justify-center gap-2 rounded-xl border border-dashed border-black/10 py-3 text-xs font-semibold text-ink/40">
                <Mic size={15} /> ضبط توضیح صوتی (به‌زودی)
              </button>
            </>
          ) : (
            <>
              <h3 className="mb-4 font-bold">ردیف‌های خرید</h3>
              <div className="space-y-3">
                {lines.map((l, i) => (
                  <div key={i} className="grid grid-cols-[1fr_1fr_1fr_auto] items-center gap-2">
                    <input placeholder="محصول (مثلاً میلگرد)" value={l.product} onChange={(e) => updateLine(i, { product: e.target.value })} className="rounded-lg border border-black/10 p-2.5 text-xs outline-none focus:border-blue" />
                    <input placeholder="سایز (مثلاً ۱۴)" value={l.size} onChange={(e) => updateLine(i, { size: e.target.value })} className="rounded-lg border border-black/10 p-2.5 text-xs outline-none focus:border-blue" />
                    <input placeholder="مقدار (تن)" value={l.quantity} onChange={(e) => updateLine(i, { quantity: e.target.value })} className="rounded-lg border border-black/10 p-2.5 text-xs outline-none focus:border-blue" />
                    <button
                      type="button"
                      onClick={() => setLines((ls) => (ls.length > 1 ? ls.filter((_, idx) => idx !== i) : ls))}
                      disabled={lines.length === 1}
                      className="flex h-9 w-9 items-center justify-center rounded-lg bg-danger/10 text-danger disabled:opacity-30"
                      aria-label="حذف ردیف"
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>
                ))}
              </div>
              <button
                type="button"
                onClick={() => setLines((ls) => [...ls, { ...EMPTY_LINE }])}
                className="mt-4 flex items-center gap-1.5 text-xs font-bold text-blue"
              >
                <Plus size={14} /> افزودن ردیف جدید
              </button>
            </>
          )}
        </div>

        <div className="rounded-card border border-black/5 bg-white p-6">
          <h3 className="mb-4 font-bold">اطلاعات تماس و تحویل</h3>
          <div className="space-y-3">
            <input placeholder="نام و نام خانوادگی" value={name} onChange={(e) => setName(e.target.value)} className={INPUT} />
            <input placeholder="شماره موبایل" inputMode="tel" value={phone} onChange={(e) => setPhone(e.target.value)} className={INPUT} />
            <input placeholder="مقصد تحویل (شهر)" value={destination} onChange={(e) => setDestination(e.target.value)} className={INPUT} />
            <select value={deliveryTime} onChange={(e) => setDeliveryTime(e.target.value)} className={INPUT}>
              <option>عادی (۳-۵ روز کاری)</option>
              <option>فوری (۲۴-۴۸ ساعت)</option>
              <option>هماهنگ نشده</option>
            </select>
            <textarea placeholder="توضیحات (اختیاری)" value={notes} onChange={(e) => setNotes(e.target.value)} rows={3} className={INPUT} />
            <button
              onClick={handleSubmit}
              disabled={status === "sending"}
              className="w-full rounded-btn bg-blue py-3.5 font-bold text-white transition hover:bg-navy disabled:opacity-60"
            >
              {status === "sending" ? "در حال ارسال..." : "ارسال درخواست استعلام"}
            </button>
            {status === "done" && <p className="text-center text-sm font-bold text-success">✓ درخواست شما با موفقیت ثبت شد!</p>}
            {status === "error" && <p className="text-center text-sm font-bold text-danger">{errorText}</p>}
          </div>
        </div>
      </div>
    </div>
  );
}
