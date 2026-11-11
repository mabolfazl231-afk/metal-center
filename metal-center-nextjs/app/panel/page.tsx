"use client";

import Link from "next/link";
import Image from "next/image";
import { useCallback, useEffect, useState } from "react";
import { Bell, ChevronDown } from "lucide-react";
import { supabase } from "@/lib/supabase";
import { useAuthGuard, signOut } from "@/lib/useAuthGuard";
import {
  RFQ_ACTIVE,
  VAT_PERCENT,
  faDateTime,
  faNum,
  orderLabel,
  orderStyle,
  proformaLabel,
  proformaStyle,
  statusLabel,
  statusStyle,
  todayIso,
  toEn,
  toman,
  type RfqStatus,
  type OrderStatus,
  type ProformaStatus,
} from "@/lib/rfq";

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
type PItem = { product_name: string; size: string | null; quantity: string | null; line_total: number };
type Proforma = {
  id: string;
  code: string;
  status: ProformaStatus;
  subtotal: number;
  vat_amount: number;
  total: number;
  valid_until: string | null;
  note: string | null;
  proforma_items: PItem[] | null;
};
type Order = {
  id: string;
  code: string;
  status: OrderStatus;
  total: number;
  shipping_address: string | null;
  carrier: string | null;
  tracking_code: string | null;
  created_at: string;
  order_status_log: LogRow[] | null;
};
type Notif = { id: number; title: string; body: string | null; read_at: string | null; created_at: string };
type Support = { id: number; from_admin: boolean; body: string; created_at: string };
type Msg = { type: "ok" | "err"; text: string } | null;

const NAV = [
  { key: "overview", label: "نمای کلی" },
  { key: "rfqs", label: "استعلام‌های من" },
  { key: "orders", label: "سفارش‌ها" },
  { key: "notifs", label: "اعلان‌ها" },
  { key: "profile", label: "پروفایل و امنیت" },
];
const INPUT = "w-full rounded-xl border border-black/10 bg-steel p-3 text-sm outline-none focus:border-blue";

export default function CustomerPanelPage() {
  const { user, loading } = useAuthGuard();
  const [tab, setTab] = useState("overview");
  const [rfqs, setRfqs] = useState<Rfq[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);
  const [notifs, setNotifs] = useState<Notif[]>([]);
  const [dataLoading, setDataLoading] = useState(true);
  const [dataError, setDataError] = useState("");
  const [openId, setOpenId] = useState<string | null>(null);
  const [openOrderId, setOpenOrderId] = useState<string | null>(null);

  // همه‌ی داده‌ها فقط خودِ کاربر است؛ قفل اصلی در سمت دیتابیس (RLS) است
  const loadAll = useCallback(async () => {
    setDataLoading(true);
    const [r, o, n] = await Promise.all([
      supabase
        .from("rfqs")
        .select("id,code,status,method,notes,created_at,rfq_items(product_name,size,quantity)")
        .order("created_at", { ascending: false })
        .limit(200),
      supabase
        .from("orders")
        .select("id,code,status,total,shipping_address,carrier,tracking_code,created_at,order_status_log(id,from_status,to_status,created_at)")
        .order("created_at", { ascending: false })
        .limit(200),
      supabase
        .from("notifications")
        .select("id,title,body,read_at,created_at")
        .order("created_at", { ascending: false })
        .limit(100),
    ]);
    setDataLoading(false);
    if (r.error || o.error || n.error) return setDataError("خواندن اطلاعات ناموفق بود. لطفاً صفحه را تازه کنید.");
    setDataError("");
    setRfqs((r.data ?? []) as unknown as Rfq[]);
    setOrders((o.data ?? []) as unknown as Order[]);
    setNotifs((n.data ?? []) as Notif[]);
  }, []);

  useEffect(() => {
    if (user) loadAll();
  }, [user, loadAll]);

  if (loading) {
    return <div className="flex min-h-screen items-center justify-center text-sm text-ink/50">در حال بارگذاری...</div>;
  }
  if (!user) return null; // useAuthGuard در حال هدایت به /login است

  const unread = notifs.filter((n) => !n.read_at).length;
  const counts = {
    total: rfqs.length,
    active: rfqs.filter((r) => RFQ_ACTIVE.includes(r.status)).length,
    quoted: rfqs.filter((r) => r.status === "quoted").length,
    orders: orders.length,
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
              className={`flex w-full items-center justify-between rounded-xl px-3 py-2.5 text-start text-sm font-semibold ${
                tab === n.key ? "bg-blue/10 text-blue" : "text-ink/60 hover:bg-steel"
              }`}
            >
              {n.label}
              {n.key === "notifs" && unread > 0 && (
                <span className="rounded-pill bg-danger px-2 py-0.5 text-[10px] font-bold text-white">{faNum(unread)}</span>
              )}
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
              className={`flex items-center gap-1.5 whitespace-nowrap rounded-full border px-4 py-2 text-xs font-bold ${
                tab === n.key ? "border-blue bg-blue text-white" : "border-black/10 text-ink/60"
              }`}
            >
              {n.label}
              {n.key === "notifs" && unread > 0 && <span className="rounded-pill bg-danger px-1.5 text-[10px] text-white">{faNum(unread)}</span>}
            </button>
          ))}
        </div>

        {dataError && <p className="mb-5 rounded-xl bg-danger/10 p-4 text-sm font-semibold text-danger">{dataError}</p>}

        {tab === "overview" && (
          <div>
            <h1 className="mb-1 text-xl font-extrabold">نمای کلی حساب</h1>
            <p className="mb-6 text-sm text-ink/50">خلاصه استعلام‌ها و سفارش‌های شما</p>
            <div className="mb-6 grid grid-cols-2 gap-3.5 lg:grid-cols-4">
              {[
                { num: counts.active, lbl: "استعلام فعال" },
                { num: counts.quoted, lbl: "پیش‌فاکتور منتظر تأیید" },
                { num: counts.orders, lbl: "سفارش" },
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
            <p className="mb-5 text-sm text-ink/50">روی هر استعلام بزنید تا ردیف‌ها، پیش‌فاکتور و پیام‌ها را ببینید.</p>
            {dataLoading ? (
              <p className="py-10 text-center text-sm text-ink/40">در حال بارگذاری...</p>
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
                    userId={user.id}
                    open={openId === r.id}
                    onToggle={() => setOpenId(openId === r.id ? null : r.id)}
                    onChanged={loadAll}
                  />
                ))}
              </div>
            )}
          </div>
        )}

        {tab === "orders" && (
          <div>
            <h1 className="mb-1 text-xl font-extrabold">سفارش‌های من</h1>
            <p className="mb-5 text-sm text-ink/50">وضعیت سفارش و کد پیگیری ارسال.</p>
            {dataLoading ? (
              <p className="py-10 text-center text-sm text-ink/40">در حال بارگذاری...</p>
            ) : orders.length === 0 ? (
              <p className="rounded-card border border-dashed border-black/10 bg-white py-12 text-center text-sm text-ink/40">
                هنوز سفارشی ثبت نشده است. پس از تأیید یک پیش‌فاکتور، سفارش اینجا نمایش داده می‌شود.
              </p>
            ) : (
              <div className="space-y-3">
                {orders.map((o) => (
                  <OrderCard key={o.id} order={o} open={openOrderId === o.id} onToggle={() => setOpenOrderId(openOrderId === o.id ? null : o.id)} />
                ))}
              </div>
            )}
          </div>
        )}

        {tab === "notifs" && (
          <NotifList notifs={notifs} onChanged={loadAll} />
        )}

        {tab === "profile" && (
          <div>
            <h1 className="mb-4 text-xl font-extrabold">پروفایل و امنیت</h1>
            <ProfileForm userId={user.id} email={user.email ?? ""} />
          </div>
        )}
      </div>
    </div>
  );
}

/* ---------------- استعلام ---------------- */

function RfqCard({ rfq, userId, open, onToggle, onChanged }: { rfq: Rfq; userId: string; open: boolean; onToggle: () => void; onChanged: () => void }) {
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
        <span className={`rounded-pill px-2.5 py-1 text-[11px] font-bold ${statusStyle(rfq.status)}`}>{statusLabel(rfq.status)}</span>
        <ChevronDown size={16} className={`text-ink/40 transition-transform ${open ? "rotate-180" : ""}`} />
      </button>

      {open && (
        <div className="mt-4 space-y-5 border-t border-black/5 pt-4 text-sm">
          {items.length > 0 && (
            <ul className="space-y-2">
              {items.map((it, i) => (
                <li key={i} className="rounded-xl bg-steel p-3 text-xs">
                  <b>{it.product_name}</b> · سایز: {it.size ?? "—"} · مقدار: {it.quantity ?? "—"}
                </li>
              ))}
            </ul>
          )}
          {rfq.notes && <p className="whitespace-pre-line rounded-xl bg-steel p-3 text-xs leading-6 text-ink/70">{rfq.notes}</p>}

          <div>
            <div className="mb-2 text-xs font-bold text-ink/50">پیش‌فاکتور</div>
            <ProformaBox rfqId={rfq.id} onChanged={onChanged} />
          </div>

          <div>
            <div className="mb-2 text-xs font-bold text-ink/50">تاریخچه وضعیت</div>
            <StatusLog rfqId={rfq.id} />
          </div>

          <div>
            <div className="mb-2 text-xs font-bold text-ink/50">پیام به کارشناس</div>
            <SupportBox rfqId={rfq.id} userId={userId} />
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
  return <Timeline rows={rows} label={statusLabel} />;
}

function Timeline({ rows, label }: { rows: LogRow[]; label: (s: string) => string }) {
  return (
    <ol className="space-y-1.5 text-xs">
      {rows.map((r) => (
        <li key={r.id} className="flex flex-wrap gap-2">
          <span className="text-ink/40">{faDateTime(r.created_at)}</span>
          <span>
            {r.from_status ? `${label(r.from_status)} ← ` : "ثبت اولیه: "}
            <b>{label(r.to_status)}</b>
          </span>
        </li>
      ))}
    </ol>
  );
}

/* ---------------- پیش‌فاکتور ---------------- */

function ProformaBox({ rfqId, onChanged }: { rfqId: string; onChanged: () => void }) {
  const [list, setList] = useState<Proforma[] | null>(null);
  const [acceptId, setAcceptId] = useState<string | null>(null);
  const [address, setAddress] = useState("");
  const [busy, setBusy] = useState(false);
  const [msg, setMsg] = useState<Msg>(null);

  const load = useCallback(async () => {
    const { data } = await supabase
      .from("proformas")
      .select("id,code,status,subtotal,vat_amount,total,valid_until,note,proforma_items(product_name,size,quantity,line_total)")
      .eq("rfq_id", rfqId)
      .order("created_at", { ascending: false });
    setList((data ?? []) as unknown as Proforma[]);
  }, [rfqId]);

  useEffect(() => {
    load();
  }, [load]);

  async function respond(p: Proforma, accept: boolean) {
    if (accept && address.trim().length < 10) return setMsg({ type: "err", text: "نشانی تحویل را کامل وارد کنید." });
    setBusy(true);
    setMsg(null);
    const { error } = await supabase.rpc("respond_proforma", {
      p_id: p.id,
      p_accept: accept,
      p_address: accept ? address.trim() : null,
    });
    setBusy(false);
    if (error) return setMsg({ type: "err", text: error.message });
    setAcceptId(null);
    setAddress("");
    setMsg({ type: "ok", text: accept ? "سفارش شما ثبت شد. در بخش سفارش‌ها پیگیری کنید." : "پیش‌فاکتور رد شد." });
    await load();
    onChanged();
  }

  if (list === null) return <p className="text-xs text-ink/40">در حال بارگذاری...</p>;
  if (list.length === 0) return <p className="text-xs text-ink/40">هنوز پیش‌فاکتوری برای این استعلام صادر نشده است.</p>;

  return (
    <div className="space-y-3">
      {msg && (
        <p className={`rounded-xl px-3 py-2 text-xs font-semibold ${msg.type === "ok" ? "bg-success/10 text-success" : "bg-danger/10 text-danger"}`}>{msg.text}</p>
      )}
      {list.map((p) => {
        const expired = !!p.valid_until && p.valid_until < todayIso();
        const canRespond = p.status === "sent" && !expired;
        return (
          <div key={p.id} className="rounded-xl border border-black/5 p-4">
            <div className="flex flex-wrap items-center gap-2">
              <span className="font-bold" dir="ltr">{p.code}</span>
              <span className={`rounded-pill px-2.5 py-1 text-[11px] font-bold ${proformaStyle(p.status)}`}>{proformaLabel(p.status)}</span>
              {expired && p.status === "sent" && <span className="text-[11px] font-bold text-danger">اعتبار تمام شده</span>}
            </div>

            <ul className="mt-3 space-y-1.5 text-xs">
              {(p.proforma_items ?? []).map((it, i) => (
                <li key={i} className="flex justify-between gap-2 rounded-lg bg-steel px-3 py-2">
                  <span>{it.product_name}{it.size ? ` · ${it.size}` : ""}{it.quantity ? ` · ${it.quantity}` : ""}</span>
                  <b>{toman(it.line_total)}</b>
                </li>
              ))}
            </ul>

            <div className="mt-3 space-y-1 text-xs text-ink/70">
              <div className="flex justify-between"><span>جمع</span><span>{toman(p.subtotal)}</span></div>
              <div className="flex justify-between"><span>مالیات ({faNum(VAT_PERCENT)}٪)</span><span>{toman(p.vat_amount)}</span></div>
              <div className="flex justify-between text-sm font-extrabold text-ink"><span>جمع کل</span><span>{toman(p.total)}</span></div>
            </div>
            {p.valid_until && <div className="mt-2 text-[11px] text-ink/50">اعتبار تا {new Date(p.valid_until).toLocaleDateString("fa-IR")}</div>}
            {p.note && <p className="mt-2 whitespace-pre-line text-xs text-ink/60">{p.note}</p>}

            {canRespond && acceptId !== p.id && (
              <div className="mt-4 flex flex-wrap gap-2">
                <button onClick={() => setAcceptId(p.id)} className="rounded-btn bg-blue px-4 py-2.5 text-xs font-bold text-white">
                  تأیید و ثبت سفارش
                </button>
                <button onClick={() => respond(p, false)} disabled={busy} className="rounded-btn border border-danger px-4 py-2.5 text-xs font-bold text-danger disabled:opacity-40">
                  رد پیش‌فاکتور
                </button>
              </div>
            )}

            {canRespond && acceptId === p.id && (
              <div className="mt-4 space-y-2">
                <textarea rows={2} placeholder="نشانی کامل تحویل (شهر، خیابان، پلاک، کد پستی)" value={address} onChange={(e) => setAddress(e.target.value)} className={INPUT} />
                <div className="flex gap-2">
                  <button onClick={() => respond(p, true)} disabled={busy} className="rounded-btn bg-blue px-4 py-2.5 text-xs font-bold text-white disabled:opacity-60">
                    ثبت سفارش
                  </button>
                  <button onClick={() => setAcceptId(null)} className="rounded-btn px-4 py-2.5 text-xs font-bold text-ink/50">
                    انصراف
                  </button>
                </div>
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}

/* ---------------- پیام به کارشناس ---------------- */

function SupportBox({ rfqId, userId }: { rfqId: string; userId: string }) {
  const [rows, setRows] = useState<Support[]>([]);
  const [text, setText] = useState("");
  const [busy, setBusy] = useState(false);
  const [msg, setMsg] = useState<Msg>(null);

  const load = useCallback(async () => {
    const { data } = await supabase
      .from("support_messages")
      .select("id,from_admin,body,created_at")
      .eq("rfq_id", rfqId)
      .order("created_at");
    setRows((data ?? []) as Support[]);
  }, [rfqId]);

  useEffect(() => {
    load();
  }, [load]);

  async function send() {
    if (!text.trim()) return;
    setBusy(true);
    setMsg(null);
    const { error } = await supabase.from("support_messages").insert({ rfq_id: rfqId, user_id: userId, from_admin: false, body: text.trim() });
    setBusy(false);
    if (error) return setMsg({ type: "err", text: "ارسال پیام ناموفق بود." });
    setText("");
    load();
  }

  return (
    <div className="space-y-3">
      {rows.length > 0 && (
        <ul className="space-y-2">
          {rows.map((m) => (
            <li key={m.id} className={`max-w-[85%] rounded-xl p-3 text-xs leading-6 ${m.from_admin ? "bg-blue/10" : "mr-auto bg-steel"}`}>
              <div className="mb-1 font-bold text-ink/60">{m.from_admin ? "کارشناس متال سنتر" : "شما"} · {faDateTime(m.created_at)}</div>
              <div className="whitespace-pre-line">{m.body}</div>
            </li>
          ))}
        </ul>
      )}
      <textarea rows={2} placeholder="سوال یا توضیح خود را بنویسید" value={text} onChange={(e) => setText(e.target.value)} className={INPUT} />
      <button onClick={send} disabled={busy || !text.trim()} className="rounded-btn bg-blue px-4 py-2.5 text-xs font-bold text-white disabled:opacity-40">
        ارسال پیام
      </button>
      {msg && <p className="text-xs font-semibold text-danger">{msg.text}</p>}
    </div>
  );
}

/* ---------------- سفارش ---------------- */

function OrderCard({ order, open, onToggle }: { order: Order; open: boolean; onToggle: () => void }) {
  const log = [...(order.order_status_log ?? [])].sort((a, b) => a.created_at.localeCompare(b.created_at));
  return (
    <div className="rounded-card border border-black/5 bg-white p-4">
      <button onClick={onToggle} className="flex w-full items-center gap-3 text-start" aria-expanded={open}>
        <div className="min-w-0 flex-1">
          <div className="font-extrabold" dir="ltr">{order.code}</div>
          <div className="mt-0.5 text-[11.5px] text-ink/50">{faDateTime(order.created_at)} · {toman(order.total)}</div>
        </div>
        <span className={`rounded-pill px-2.5 py-1 text-[11px] font-bold ${orderStyle(order.status)}`}>{orderLabel(order.status)}</span>
        <ChevronDown size={16} className={`text-ink/40 transition-transform ${open ? "rotate-180" : ""}`} />
      </button>

      {open && (
        <div className="mt-4 space-y-4 border-t border-black/5 pt-4 text-sm">
          <div className="grid gap-2 text-xs sm:grid-cols-2">
            <div className="rounded-xl bg-steel p-3">
              <div className="mb-1 text-ink/50">کد پیگیری ارسال</div>
              <b dir="ltr">{order.tracking_code || "هنوز ثبت نشده"}</b>
              {order.carrier && <div className="mt-1 text-ink/60">باربری: {order.carrier}</div>}
            </div>
            <div className="rounded-xl bg-steel p-3">
              <div className="mb-1 text-ink/50">نشانی تحویل</div>
              <div className="leading-6">{order.shipping_address || "—"}</div>
            </div>
          </div>
          <div>
            <div className="mb-2 text-xs font-bold text-ink/50">مراحل سفارش</div>
            {log.length > 0 ? <Timeline rows={log} label={orderLabel} /> : <p className="text-xs text-ink/40">—</p>}
          </div>
        </div>
      )}
    </div>
  );
}

/* ---------------- اعلان‌ها ---------------- */

function NotifList({ notifs, onChanged }: { notifs: Notif[]; onChanged: () => void }) {
  const unread = notifs.filter((n) => !n.read_at).length;

  async function markOne(n: Notif) {
    if (n.read_at) return;
    await supabase.from("notifications").update({ read_at: new Date().toISOString() }).eq("id", n.id);
    onChanged();
  }

  async function markAll() {
    await supabase.from("notifications").update({ read_at: new Date().toISOString() }).is("read_at", null);
    onChanged();
  }

  return (
    <div>
      <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
        <h1 className="flex items-center gap-2 text-xl font-extrabold"><Bell size={20} /> اعلان‌ها</h1>
        {unread > 0 && (
          <button onClick={markAll} className="text-xs font-bold text-blue">همه را خوانده‌شده کن</button>
        )}
      </div>
      {notifs.length === 0 ? (
        <p className="rounded-card border border-dashed border-black/10 bg-white py-12 text-center text-sm text-ink/40">اعلانی ندارید.</p>
      ) : (
        <div className="space-y-2">
          {notifs.map((n) => (
            <button
              key={n.id}
              onClick={() => markOne(n)}
              className={`block w-full rounded-card border p-4 text-start ${n.read_at ? "border-black/5 bg-white" : "border-blue/30 bg-blue/5"}`}
            >
              <div className="flex items-center gap-2">
                {!n.read_at && <span className="h-2 w-2 rounded-full bg-danger" />}
                <span className="text-sm font-bold">{n.title}</span>
              </div>
              {n.body && <div className="mt-1 text-xs leading-6 text-ink/60">{n.body}</div>}
              <div className="mt-1.5 text-[11px] text-ink/40">{faDateTime(n.created_at)}</div>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

/* ---------------- پروفایل ---------------- */

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
