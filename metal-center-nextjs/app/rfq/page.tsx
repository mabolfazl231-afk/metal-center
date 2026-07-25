"use client";

import { useState } from "react";
import { supabase } from "@/lib/supabase";

export default function RfqPage() {
  const [method, setMethod] = useState<"upload" | "manual">("upload");
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [notes, setNotes] = useState("");
  const [status, setStatus] = useState<"idle" | "sending" | "done" | "error">("idle");

  async function handleSubmit() {
    if (!name || !phone) {
      setStatus("error");
      return;
    }
    setStatus("sending");
    const { error } = await supabase.from("rfqs").insert({
      customer_name: name,
      customer_phone: phone,
      method,
      notes,
      status: "pending",
    });
    setStatus(error ? "error" : "done");
  }

  return (
    <div className="mx-auto max-w-[1240px] px-6 py-10">
      <div className="mb-8 text-center">
        <h1 className="mb-2 text-[28px] font-extrabold">درخواست استعلام قیمت</h1>
        <p className="mx-auto max-w-[520px] text-[14.5px] text-ink/50">
          فایل خرید خود را آپلود کنید یا فرم را دستی تکمیل کنید — کارشناسان ما ظرف چند ساعت پاسخ می‌دهند.
        </p>
      </div>

      <div className="mx-auto mb-8 flex max-w-[420px] gap-2 rounded-2xl border border-black/5 bg-white p-1.5">
        <button
          onClick={() => setMethod("upload")}
          className={`flex-1 rounded-xl py-3 text-sm font-bold ${
            method === "upload" ? "bg-blue text-white" : "text-ink/50"
          }`}
        >
          آپلود فایل
        </button>
        <button
          onClick={() => setMethod("manual")}
          className={`flex-1 rounded-xl py-3 text-sm font-bold ${
            method === "manual" ? "bg-blue text-white" : "text-ink/50"
          }`}
        >
          فرم دستی
        </button>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <div className="rounded-card border border-black/5 bg-white p-6">
          {method === "upload" ? (
            <>
              <h3 className="mb-4 font-bold">آپلود لیست خرید</h3>
              <label className="block cursor-pointer rounded-2xl border-2 border-dashed border-black/10 bg-steel p-10 text-center">
                <input type="file" className="hidden" accept=".jpg,.png,.pdf,.xlsx" />
                <div className="mb-1 font-bold">فایل را بکشید و اینجا رها کنید</div>
                <div className="text-xs text-ink/50">یا کلیک کنید برای انتخاب از سیستم</div>
                <div className="mt-3 text-[11px] text-ink/40">JPG، PDF، XLSX — حداکثر ۲۰ مگابایت</div>
              </label>
            </>
          ) : (
            <>
              <h3 className="mb-4 font-bold">ردیف‌های خرید</h3>
              <div className="space-y-2 text-sm">
                <div className="grid grid-cols-3 gap-2">
                  <input placeholder="محصول" className="rounded-lg border border-black/10 p-2 text-xs" />
                  <input placeholder="سایز" className="rounded-lg border border-black/10 p-2 text-xs" />
                  <input placeholder="مقدار (تن)" className="rounded-lg border border-black/10 p-2 text-xs" />
                </div>
              </div>
              <button className="mt-3 text-xs font-bold text-blue">+ افزودن ردیف جدید</button>
            </>
          )}
        </div>

        <div className="rounded-card border border-black/5 bg-white p-6">
          <h3 className="mb-4 font-bold">اطلاعات تماس</h3>
          <div className="space-y-3">
            <input
              placeholder="نام و نام خانوادگی"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full rounded-xl border border-black/10 bg-steel p-3 text-sm"
            />
            <input
              placeholder="شماره موبایل"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              className="w-full rounded-xl border border-black/10 bg-steel p-3 text-sm"
            />
            <textarea
              placeholder="توضیحات (اختیاری)"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              rows={3}
              className="w-full rounded-xl border border-black/10 bg-steel p-3 text-sm"
            />
            <button
              onClick={handleSubmit}
              disabled={status === "sending"}
              className="w-full rounded-btn bg-blue py-3.5 font-bold text-white hover:bg-navy disabled:opacity-60"
            >
              {status === "sending" ? "در حال ارسال..." : "ارسال درخواست استعلام"}
            </button>
            {status === "done" && (
              <p className="text-center text-sm font-bold text-success">
                ✓ درخواست شما با موفقیت ثبت شد!
              </p>
            )}
            {status === "error" && (
              <p className="text-center text-sm font-bold text-danger">
                لطفاً نام و شماره موبایل را کامل وارد کنید.
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
