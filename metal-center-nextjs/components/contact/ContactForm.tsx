"use client";

import { useState, type FormEvent } from "react";
import { supabase } from "@/lib/supabase";
import { CheckCircle2 } from "lucide-react";

const INPUT = "rounded-xl border border-black/10 bg-steel p-3 text-sm outline-none transition focus:border-blue";
const toEn = (s: string) => s.replace(/[۰-۹]/g, (d) => String("۰۱۲۳۴۵۶۷۸۹".indexOf(d)));

export default function ContactForm() {
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [message, setMessage] = useState("");
  const [status, setStatus] = useState<"idle" | "sending" | "done" | "error">("idle");
  const [errorText, setErrorText] = useState("");

  async function send(e: FormEvent) {
    e.preventDefault();
    const phoneDigits = toEn(phone).replace(/\D/g, "");
    if (!name.trim() || !message.trim()) {
      setStatus("error");
      setErrorText("نام و متن پیام را وارد کنید.");
      return;
    }
    if (phoneDigits.length < 10) {
      setStatus("error");
      setErrorText("شماره موبایل معتبر وارد کنید.");
      return;
    }
    setStatus("sending");
    const { error } = await supabase
      .from("contact_messages")
      .insert({ name: name.trim(), phone: phoneDigits, message: message.trim() });
    if (error) {
      setStatus("error");
      setErrorText("ارسال پیام ناموفق بود. لطفاً دوباره تلاش کنید یا با شماره‌های بالا تماس بگیرید.");
      return;
    }
    setStatus("done");
    setName("");
    setPhone("");
    setMessage("");
  }

  return (
    <form onSubmit={send} className="rounded-card border border-border-light bg-white p-7 shadow-soft dark:border-border-dark dark:bg-surface-dark">
      <h3 className="mb-1 font-bold">ارسال پیام</h3>
      <p className="mb-5 text-xs text-ink/50 dark:text-white/40">کارشناسان ما در ساعات کاری پاسخ می‌دهند.</p>

      {status === "done" ? (
        <div className="flex flex-col items-center gap-3 py-10 text-center">
          <CheckCircle2 size={44} className="text-success" />
          <p className="font-extrabold">پیام شما ثبت شد</p>
          <p className="text-sm text-ink/55">به‌زودی با شما تماس می‌گیریم.</p>
          <button onClick={() => setStatus("idle")} className="mt-2 text-xs font-bold text-blue">ارسال پیام دیگر</button>
        </div>
      ) : (
        <div className="space-y-3">
          <div className="grid gap-3 sm:grid-cols-2">
            <input placeholder="نام و نام خانوادگی" value={name} onChange={(e) => setName(e.target.value)} className={INPUT} />
            <input placeholder="شماره موبایل" inputMode="tel" value={phone} onChange={(e) => setPhone(e.target.value)} className={INPUT} />
          </div>
          <textarea placeholder="پیام شما" rows={6} value={message} onChange={(e) => setMessage(e.target.value)} className={`w-full ${INPUT}`} />
          <button
            type="submit"
            disabled={status === "sending"}
            className="w-full rounded-btn bg-blue py-3.5 font-bold text-white transition hover:bg-navy disabled:opacity-60"
          >
            {status === "sending" ? "در حال ارسال..." : "ارسال پیام"}
          </button>
          {status === "error" && <p className="text-center text-sm font-bold text-danger">{errorText}</p>}
        </div>
      )}
    </form>
  );
}
