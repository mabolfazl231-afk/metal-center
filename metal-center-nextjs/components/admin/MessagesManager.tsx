"use client";

import { useEffect, useState } from "react";
import { Mail, MailOpen, Trash2 } from "lucide-react";
import { supabase } from "@/lib/supabase";

type Message = { id: string; name: string; phone: string; message: string; is_read: boolean; created_at: string };
type Msg = { type: "ok" | "err"; text: string } | null;

export default function MessagesManager() {
  const [items, setItems] = useState<Message[]>([]);
  const [loading, setLoading] = useState(true);
  const [msg, setMsg] = useState<Msg>(null);

  function flash(type: "ok" | "err", text: string) {
    setMsg({ type, text });
  }

  async function load() {
    setLoading(true);
    const { data, error } = await supabase
      .from("contact_messages")
      .select("id,name,phone,message,is_read,created_at")
      .order("created_at", { ascending: false })
      .limit(300);
    setLoading(false);
    if (error) return flash("err", "خواندن پیام‌ها ناموفق بود. فایل 0007 را در Supabase اجرا کن. (" + error.message + ")");
    setItems((data ?? []) as Message[]);
  }

  useEffect(() => {
    load();
  }, []);

  async function toggleRead(m: Message) {
    const { error } = await supabase.from("contact_messages").update({ is_read: !m.is_read }).eq("id", m.id);
    if (error) return flash("err", "ذخیره نشد: " + error.message);
    setItems((list) => list.map((x) => (x.id === m.id ? { ...x, is_read: !m.is_read } : x)));
  }

  async function remove(m: Message) {
    if (!window.confirm(`پیام «${m.name}» حذف شود؟`)) return;
    const { error } = await supabase.from("contact_messages").delete().eq("id", m.id);
    if (error) return flash("err", "حذف نشد: " + error.message);
    setItems((list) => list.filter((x) => x.id !== m.id));
  }

  return (
    <div>
      <h1 className="mb-1 text-xl font-extrabold">پیام‌های تماس</h1>
      <p className="mb-5 text-sm text-ink/50">پیام‌هایی که از فرم صفحه‌ی «تماس با ما» ارسال شده‌اند.</p>

      {msg && (
        <div className={`mb-5 rounded-xl px-4 py-3 text-sm font-semibold ${msg.type === "ok" ? "bg-success/10 text-success" : "bg-danger/10 text-danger"}`}>
          {msg.text}
        </div>
      )}

      {loading ? (
        <p className="py-10 text-center text-sm text-ink/40">در حال بارگذاری...</p>
      ) : items.length === 0 ? (
        <p className="rounded-card border border-dashed border-black/10 py-12 text-center text-sm text-ink/40">هنوز پیامی ثبت نشده است.</p>
      ) : (
        <div className="space-y-3">
          {items.map((m) => (
            <div key={m.id} className={`rounded-card border bg-white p-4 ${m.is_read ? "border-black/5" : "border-blue/40"}`}>
              <div className="mb-2 flex flex-wrap items-center justify-between gap-2">
                <div className="flex items-center gap-2">
                  {!m.is_read && <span className="h-2 w-2 rounded-full bg-blue" aria-label="خوانده‌نشده" />}
                  <span className="text-sm font-extrabold">{m.name}</span>
                  <a href={`tel:${m.phone}`} className="text-xs font-bold text-blue" dir="ltr">{m.phone}</a>
                </div>
                <span className="text-[11px] text-ink/45">{new Date(m.created_at).toLocaleString("fa-IR", { dateStyle: "short", timeStyle: "short" })}</span>
              </div>
              <p className="whitespace-pre-line text-sm leading-7 text-ink/75">{m.message}</p>
              <div className="mt-3 flex gap-2">
                <button onClick={() => toggleRead(m)} className="flex items-center gap-1.5 rounded-lg bg-black/5 px-3 py-2 text-xs font-bold">
                  {m.is_read ? <Mail size={13} /> : <MailOpen size={13} />}
                  {m.is_read ? "علامت به‌عنوان خوانده‌نشده" : "علامت به‌عنوان خوانده‌شده"}
                </button>
                <button onClick={() => remove(m)} className="flex items-center gap-1.5 rounded-lg bg-danger/10 px-3 py-2 text-xs font-bold text-danger">
                  <Trash2 size={13} /> حذف
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
