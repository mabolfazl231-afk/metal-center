"use client";

import Link from "next/link";
import Image from "next/image";
import { useCallback, useEffect, useState } from "react";
import { ChevronDown } from "lucide-react";
import { supabase } from "@/lib/supabase";
import { useAuthGuard, signOut } from "@/lib/useAuthGuard";
import { RFQ_ACTIVE, faDateTime, faNum, statusLabel, statusStyle, toEn, type RfqStatus } from "@/lib/rfq";

type Item = { product_name: string; size: string | null; quantity: string | null };
type Rfq = {
  id: string;
  code: string;
  status: RfqStatus;
  method: "upload" | "manual";
  notes: string | null;
  created_at: string;
  rfq_items: Item[] | null;
};
type LogRow = { id: number; from_status: string | null; to_status: string; created_at: string };
type Msg = { type: "ok" | "err"; text: string } | null;

const NAV = [
  { key: "overview", label: "نمای کلی" },
  { key: "rfqs", label: "استعلام‌های من" },
  { key: "profile", label: "پروفایل و امنیت" },
  { key: "invoices", label: "فاکتورها" },
  { key: "favorites", label: "علاقه‌مندی‌ها" },
];
const INPUT = "w-full rounded-xl border border-black/10 bg-steel p-3 text-sm outline-none focus:border-blue";

export default function CustomerPanelPage() {
  const { user, loading } = useAuthGuard();
  const [tab, setTab] = useState("overview");
  const [rfqs, setRfqs] = useState<Rfq[]>([]);
  const [rfqLoading, setRfqLoading] = useState(true);
  const [rfqError, setRfqError] = useState("");
  const [openId, setOpenId] = useState<string | null>(null);

  // فقط استعلام‌های خود کاربر؛ قفل اصلی در سمت دیتابیس (RLS) است
  const loadRfqs = useCallback(async () => {
    setRfqLoading(true);
    const { data, error } = await supabase
      .from("rfqs")
      .select("id,code,status,method,notes,created_at,rfq_items(product_name,size,quantity)")
      .order("created_at", { ascending: false })
      .limit(200);
    setRfqLoading(false);
    if (error) return setRfqError("خواندن استعلام‌ها ناموفق بود. لطفاً صفحه را تازه کنید.");
    setRfqError("");
    setRfqs((data ?? []) as unknown as Rfq[]);
  }, []);

  useEffect(() => {
    if (user) loadRfqs();
  }, [user, loadRfqs]);

  if (loading) {
    return <div className="flex min-h-screen items-center justify-center text-sm text-ink/50">در حال بارگذاری...</div>;
  }
  if (!user) return null; // useAuthGuard در حال هدایت به /login است

  const counts = {
    total: rfqs.length,
    active: rfqs.filter((r) => RFQ_ACTIVE.includes(r.status)).length,
    quoted: rfqs.filter((r) => r.status === "quoted").length,
    closed: rfqs.filter((r) => r.status === "closed").length,
  };

  return (
    <div className="grid min-h-screen grid-cols-1 lg:grid-cols-[260px_1fr]">
      <aside className="hidden border-e border-black/5 bg-white p-5 lg:block">
        <Link href="/" className="mb-6 flex items-center gap-2.5 px-2 text-base font-extrabold">
          <Image src="/logo.png" alt="متال سنتر" width={32} height={32} className="rounded-[10px]" />
          متال سنتر
        </Link>
        <nav className="space-y-1">
          {NAV.map((n) => (
            <button
              key={n.key}
              onClick={() => setTab(n.key)}
              className={`block w-full rounded-xl px-3 py-2.5 text-start text-sm font-semibold ${
                tab === n.key ? "bg-blue/10 text-blue" : "text-ink/60 hover:bg-steel"
              }`}
            >
              {n.label}
            </button>
          ))}
        </nav>
        <Link href="/" className="mt-8 block border-t border-black/5 pt-4 text-xs font-semibold text-ink/50">
          ← بازگشت به سایت
        </Link>
        <div className="mt-2 truncate text-[11px] text-ink/40" dir="ltr">{user.email}</div>
        <button onClick={signOut} className="mt-2 text-xs font-semibold text-danger">
          خروج از حساب
        </button>
      </aside>

      <div className="p-6">
        {/* نوار تب در موبایل */}
        <div className="mb-6 flex gap-2 overflow-x-auto lg:hidden">
          {NAV.map((n) => (
            <button
              key={n.key}
              onClick={() => setTab(n.key)}
              className={`whitespace-nowrap rounded-full border px-4 py-2 text-xs font-bold ${
                tab === n.key ? "border-blue bg-blue text-white" : "border-black/10 text-ink/60"
              }`}
            >
              {n.label}
            </button>
          ))}
        </div>

        {tab === "overview" && (
          <div>
            <h1 className="mb-1 text-xl font-extrabold">نمای کلی حساب</h1>
            <p className="mb-6 text-sm text-ink/50">خلاصه استعلام‌های شما</p>
            <div className="mb-6 grid grid-cols-2 gap-3.5 lg:grid-cols-4">
              {[
                { num: counts.active, lbl: "استعلام فعال" },
                { num: counts.quoted, lbl: "قیمت‌گذاری شده" },
                { num: counts.closed, lbl: "بسته‌شده" },
                { num: counts.total, lbl: "کل استعلام‌ها" },
              ].map((s) => (
                <div key={s.lbl} className="rounded-2xl border border-black/5 bg-white p-4">
                  <div className="text-lg font-extrabold">{faNum(s.num)}</div>
                  <div className="mt-1 text-xs text-ink/50">{s.lbl}</div>
                </div>
              ))}
            </div>
            <Link href="/rfq" className="inline-block rounded-btn bg-blue px-5 py-3 text-sm font-bold text-white">
              + استعلام جدید
            </Link>
          </div>
        )}

        {tab === "rfqs" && (
          <div>
            <h1 className="mb-1 text-xl font-extrabold">استعلام‌های من</h1>
            <p className="mb-5 text-sm text-ink/50">برای دیدن ردیف‌ها و تاریخچه‌ی هر استعلام روی آن بزنید.</p>

            {rfqLoading ? (
              <p className="py-10 text-center text-sm text-ink/40">در حال بارگذاری...</p>
            ) : rfqError ? (
              <p className="rounded-xl bg-danger/10 p-4 text-sm font-semibold text-danger">{rfqError}</p>
            ) : rfqs.length === 0 ? (
              <div className="rounded-card border border-dashed border-black/10 bg-white py-12 text-center">
                <p className="mb-4 text-sm text-ink/50">هنوز استعلامی ثبت نکرده‌اید.</p>
                <Link href="/rfq" className="inline-block rounded-btn bg-blue px-5 py-3 text-sm font-bold text-white">
                  ثبت اولین استعلام
                </Link>
              </div>
            ) : (
              <div className="space-y-3">
                {rfqs.map((r) => (
                  <RfqCard
                    key={r.id}
                    rfq={r}
                    open={openId === r.id}
                    onToggle={() => setOpenId(openId === r.id ? null : r.id)}
                  />
                ))}
              </div>
            )}
          </div>
        )}

        {tab === "profile" && (
          <div>
            <h1 className="mb-4 text-xl font-extrabold">پروفایل و امنیت</h1>
            <ProfileForm userId={user.id} email={user.email ?? ""} />
          </div>
        )}

        {tab === "invoices" && (
          <div>
            <h1 className="mb-4 text-xl font-extrabold">فاکتورها</h1>
            <p className="text-sm text-ink/50">این بخش در فاز بعدی پنل فعال می‌شود.</p>
          </div>
        )}

        {tab === "favorites" && (
          <div>
            <h1 className="mb-4 text-xl font-extrabold">علاقه‌مندی‌ها</h1>
            <p className="text-sm text-ink/50">این بخش در فاز بعدی پنل فعال می‌شود.</p>
          </div>
        )}
      </div>
    </div>
  );
}

function RfqCard({ rfq, open, onToggle }: { rfq: Rfq; open: boolean; onToggle: () => void }) {
  const items = rfq.rfq_items ?? [];
  return (
    <div className="rounded-card border border-black/5 bg-white p-4">
      <button onClick={onToggle} className="flex w-full items-center gap-3 text-start" aria-expanded={open}>
        <div className="min-w-0 flex-1">
          <div className="font-extrabold" dir="ltr">{rfq.code}</div>
          <div className="mt-0.5 text-[11.5px] text-ink/50">
            {faDateTime(rfq.created_at)} · {rfq.method === "upload" ? "فایل پیوست" : `${faNum(items.length)} ردیف`}
          </div>
        </div>
        <span className={`rounded-pill px-2.5 py-1 text-[11px] font-bold ${statusStyle(rfq.status)}`}>
          {statusLabel(rfq.status)}
        </span>
        <ChevronDown size={16} className={`text-ink/40 transition-transform ${open ? "rotate-180" : ""}`} />
      </button>

      {open && (
        <div className="mt-4 space-y-4 border-t border-black/5 pt-4 text-sm">
          {items.length > 0 && (
            <ul className="space-y-2">
              {items.map((it, i) => (
                <li key={i} className="rounded-xl bg-steel p-3 text-xs">
                  <b>{it.product_name}</b> · سایز: {it.size ?? "—"} · مقدار: {it.quantity ?? "—"}
                </li>
              ))}
            </ul>
          )}
          {rfq.notes && (
            <p className="whitespace-pre-line rounded-xl bg-steel p-3 text-xs leading-6 text-ink/70">{rfq.notes}</p>
          )}
          <div>
            <div className="mb-2 text-xs font-bold text-ink/50">تاریخچه وضعیت</div>
            <StatusLog rfqId={rfq.id} />
          </div>
        </div>
      )}
    </div>
  );
}

function StatusLog({ rfqId }: { rfqId: string }) {
  const [rows, setRows] = useState<LogRow[] | null>(null);
  useEffect(() => {
    let cancelled = false;
    supabase
      .from("rfq_status_log")
      .select("id,from_status,to_status,created_at")
      .eq("rfq_id", rfqId)
      .order("created_at")
      .then(({ data }) => {
        if (!cancelled) setRows((data ?? []) as LogRow[]);
      });
    return () => {
      cancelled = true;
    };
  }, [rfqId]);

  if (rows === null) return <p className="text-xs text-ink/40">در حال بارگذاری...</p>;
  if (rows.length === 0) return <p className="text-xs text-ink/40">تاریخچه‌ای ثبت نشده است.</p>;
  return (
    <ol className="space-y-1.5 text-xs">
      {rows.map((r) => (
        <li key={r.id} className="flex flex-wrap gap-2">
          <span className="text-ink/40">{faDateTime(r.created_at)}</span>
          <span>
            {r.from_status ? `${statusLabel(r.from_status)} ← ` : "ثبت اولیه: "}
            <b>{statusLabel(r.to_status)}</b>
          </span>
        </li>
      ))}
    </ol>
  );
}

type ProfileData = { full_name: string; mobile: string; company: string; city: string };
const EMPTY_FORM: ProfileData = { full_name: "", mobile: "", company: "", city: "" };

function ProfileForm({ userId, email }: { userId: string; email: string }) {
  const [form, setForm] = useState<ProfileData>(EMPTY_FORM);
  const [newPass, setNewPass] = useState("");
  const [saving, setSaving] = useState(false);
  const [msg, setMsg] = useState<Msg>(null);

  useEffect(() => {
    let cancelled = false;
    supabase
      .from("profiles")
      .select("full_name,mobile,company,city")
      .eq("id", userId)
      .maybeSingle()
      .then(({ data }) => {
        if (cancelled || !data) return;
        setForm({
          full_name: data.full_name ?? "",
          mobile: data.mobile ?? "",
          company: data.company ?? "",
          city: data.city ?? "",
        });
      });
    return () => {
      cancelled = true;
    };
  }, [userId]);

  async function saveProfile() {
    const mobile = toEn(form.mobile).replace(/\D/g, "");
    if (!form.full_name.trim() || mobile.length < 10) {
      return setMsg({ type: "err", text: "نام و شماره موبایل معتبر لازم است." });
    }
    setSaving(true);
    const { error } = await supabase.from("profiles").upsert(
      {
        id: userId,
        full_name: form.full_name.trim(),
        mobile,
        company: form.company.trim() || null,
        city: form.city.trim() || null,
        updated_at: new Date().toISOString(),
      },
      { onConflict: "id" }
    );
    setSaving(false);
    setMsg(error ? { type: "err", text: "ذخیره ناموفق بود: " + error.message } : { type: "ok", text: "پروفایل ذخیره شد." });
  }

  async function changePassword() {
    if (newPass.length < 8) return setMsg({ type: "err", text: "رمز جدید باید حداقل ۸ کاراکتر باشد." });
    setSaving(true);
    const { error } = await supabase.auth.updateUser({ password: newPass });
    setSaving(false);
    setNewPass("");
    setMsg(error ? { type: "err", text: "تغییر رمز ناموفق بود: " + error.message } : { type: "ok", text: "رمز عبور تغییر کرد." });
  }

  return (
    <div className="max-w-md space-y-5">
      {msg && (
        <div className={`rounded-xl px-4 py-3 text-sm font-semibold ${msg.type === "ok" ? "bg-success/10 text-success" : "bg-danger/10 text-danger"}`}>
          {msg.text}
        </div>
      )}

      <div className="space-y-3 rounded-card border border-black/5 bg-white p-6">
        <div className="text-xs text-ink/50">ایمیل ورود (قابل تغییر نیست)</div>
        <div className="rounded-xl bg-steel p-3 text-sm" dir="ltr">{email}</div>
        <input placeholder="نام و نام خانوادگی" value={form.full_name} onChange={(e) => setForm({ ...form, full_name: e.target.value })} className={INPUT} />
        <input placeholder="شماره موبایل" inputMode="tel" value={form.mobile} onChange={(e) => setForm({ ...form, mobile: e.target.value })} className={INPUT} />
        <input placeholder="نام شرکت یا کارگاه (اختیاری)" value={form.company} onChange={(e) => setForm({ ...form, company: e.target.value })} className={INPUT} />
        <input placeholder="شهر (اختیاری)" value={form.city} onChange={(e) => setForm({ ...form, city: e.target.value })} className={INPUT} />
        <button onClick={saveProfile} disabled={saving} className="rounded-btn bg-blue px-5 py-3 text-sm font-bold text-white disabled:opacity-60">
          ذخیره تغییرات
        </button>
      </div>

      <div className="space-y-3 rounded-card border border-black/5 bg-white p-6">
        <div className="text-sm font-bold">تغییر رمز عبور</div>
        <input type="password" placeholder="رمز جدید (حداقل ۸ کاراکتر)" value={newPass} onChange={(e) => setNewPass(e.target.value)} className={INPUT} />
        <button onClick={changePassword} disabled={saving || !newPass} className="rounded-btn border border-blue px-5 py-3 text-sm font-bold text-blue disabled:opacity-40">
          تغییر رمز
        </button>
      </div>
    </div>
  );
}
