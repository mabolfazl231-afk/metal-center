"use client";

import { useCallback, useEffect, useState } from "react";
import { ChevronDown, Plus, Trash2 } from "lucide-react";
import { supabase } from "@/lib/supabase";
import {
  ORDER_STATUSES,
  RFQ_STATUSES,
  VAT_PERCENT,
  faDateTime,
  faNum,
  orderLabel,
  orderStyle,
  proformaLabel,
  proformaStyle,
  statusLabel,
  statusStyle,
  toEn,
  toNum,
  toman,
  type OrderStatus,
  type ProformaStatus,
  type RfqStatus,
} from "@/lib/rfq";

type Item = { product_name: string; size: string | null; quantity: string | null; standard: string | null };
type Rfq = {
  id: string;
  code: string;
  user_id: string | null;
  customer_name: string;
  customer_phone: string;
  customer_email: string | null;
  method: "upload" | "manual";
  notes: string | null;
  status: RfqStatus;
  created_at: string;
  rfq_items: Item[] | null;
};
type LogRow = { id: number; from_status: string | null; to_status: string; created_at: string };
type PItem = { product_name: string; size: string | null; quantity: string | null; line_total: number; sort_order: number | null };
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
type AdminOrder = {
  id: string;
  code: string;
  status: OrderStatus;
  total: number;
  shipping_address: string | null;
  carrier: string | null;
  tracking_code: string | null;
  created_at: string;
  rfqs: { code: string; customer_name: string; customer_phone: string } | null;
};
type Support = { id: number; from_admin: boolean; body: string; created_at: string };
type Msg = { type: "ok" | "err"; text: string } | null;
type View = "rfqs" | "orders";

const INPUT = "w-full rounded-xl border border-black/10 bg-steel p-2.5 text-xs outline-none focus:border-blue";

export default function RfqManager() {
  const [view, setView] = useState<View>("rfqs");
  const [msg, setMsg] = useState<Msg>(null);

  return (
    <div>
      <h1 className="mb-1 text-xl font-extrabold">استعلام، پیش‌فاکتور و سفارش</h1>
      <p className="mb-5 text-sm text-ink/50">
        هر استعلام کد یکتا دارد. پیش‌فاکتور را بسازید و ارسال کنید؛ پس از تأیید مشتری، سفارش ساخته و در پنل او پیگیری می‌شود.
      </p>

      <div className="mb-5 flex gap-2">
        {(["rfqs", "orders"] as const).map((v) => (
          <button
            key={v}
            onClick={() => setView(v)}
            className={`rounded-pill border px-4 py-2 text-xs font-bold ${view === v ? "border-blue bg-blue text-white" : "border-black/10 bg-white text-ink/60"}`}
          >
            {v === "rfqs" ? "استعلام‌ها" : "سفارش‌ها"}
          </button>
        ))}
      </div>

      {msg && (
        <div className={`mb-5 rounded-xl px-4 py-3 text-sm font-semibold ${msg.type === "ok" ? "bg-success/10 text-success" : "bg-danger/10 text-danger"}`}>
          {msg.text}
        </div>
      )}

      {view === "rfqs" ? <RfqList setMsg={setMsg} /> : <OrdersView setMsg={setMsg} />}
    </div>
  );
}

/* ---------------- استعلام‌ها ---------------- */

function RfqList({ setMsg }: { setMsg: (m: Msg) => void }) {
  const [rfqs, setRfqs] = useState<Rfq[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<"all" | RfqStatus>("all");
  const [openId, setOpenId] = useState<string | null>(null);
  const [logVersion, setLogVersion] = useState(0);

  const load = useCallback(async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from("rfqs")
      .select("id,code,user_id,customer_name,customer_phone,customer_email,method,notes,status,created_at,rfq_items(product_name,size,quantity,standard)")
      .order("created_at", { ascending: false })
      .limit(300);
    setLoading(false);
    if (error) return setMsg({ type: "err", text: "خواندن استعلام‌ها ناموفق بود: " + error.message });
    setRfqs((data ?? []) as unknown as Rfq[]);
  }, [setMsg]);

  useEffect(() => {
    load();
  }, [load]);

  async function changeStatus(r: Rfq, status: RfqStatus) {
    const { error } = await supabase.from("rfqs").update({ status }).eq("id", r.id);
    if (error) return setMsg({ type: "err", text: "تغییر وضعیت ناموفق بود: " + error.message });
    setRfqs((list) => list.map((x) => (x.id === r.id ? { ...x, status } : x)));
    setLogVersion((v) => v + 1);
    setMsg({ type: "ok", text: `وضعیت ${r.code} به «${statusLabel(status)}» تغییر کرد.` });
  }

  const shown = rfqs.filter((r) => filter === "all" || r.status === filter);

  return (
    <div>
      <div className="mb-4 flex flex-wrap gap-2">
        {(["all", ...RFQ_STATUSES] as const).map((f) => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            className={`rounded-pill border px-3.5 py-1.5 text-xs font-bold ${
              filter === f ? "border-blue bg-blue text-white" : "border-black/10 bg-white text-ink/60"
            }`}
          >
            {f === "all" ? "همه" : statusLabel(f)}
            {f !== "all" && <span className="ms-1.5 opacity-70">{faNum(rfqs.filter((r) => r.status === f).length)}</span>}
          </button>
        ))}
      </div>

      {loading ? (
        <p className="py-10 text-center text-sm text-ink/40">در حال بارگذاری...</p>
      ) : shown.length === 0 ? (
        <p className="rounded-card border border-dashed border-black/10 py-12 text-center text-sm text-ink/40">استعلامی با این وضعیت نیست.</p>
      ) : (
        <div className="space-y-3">
          {shown.map((r) => {
            const open = openId === r.id;
            const items = r.rfq_items ?? [];
            return (
              <div key={r.id} className="rounded-card border border-black/5 bg-white p-4">
                <div className="flex flex-wrap items-center gap-3">
                  <button onClick={() => setOpenId(open ? null : r.id)} className="flex min-w-0 flex-1 items-center gap-3 text-start" aria-expanded={open}>
                    <div className="min-w-0 flex-1">
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="text-sm font-extrabold" dir="ltr">{r.code}</span>
                        <span className="truncate text-sm font-semibold">{r.customer_name}</span>
                        {!r.user_id && <span className="rounded-pill bg-black/5 px-2 py-0.5 text-[10px] text-ink/50">بدون حساب</span>}
                      </div>
                      <div className="mt-0.5 text-[11.5px] text-ink/50">
                        <span dir="ltr">{r.customer_phone}</span> · {faDateTime(r.created_at)}
                      </div>
                    </div>
                    <span className="rounded-pill bg-black/5 px-2.5 py-1 text-[11px] font-bold text-ink/60">
                      {r.method === "upload" ? "فایل" : `${faNum(items.length)} ردیف`}
                    </span>
                    <ChevronDown size={16} className={`text-ink/40 transition-transform ${open ? "rotate-180" : ""}`} />
                  </button>
                  <select
                    value={r.status}
                    onChange={(e) => changeStatus(r, e.target.value as RfqStatus)}
                    className={`rounded-pill px-3 py-1.5 text-xs font-bold outline-none ${statusStyle(r.status)}`}
                  >
                    {RFQ_STATUSES.map((s) => (
                      <option key={s} value={s}>{statusLabel(s)}</option>
                    ))}
                  </select>
                </div>

                {open && (
                  <div className="mt-4 space-y-5 border-t border-black/5 pt-4 text-sm">
                    {items.length > 0 && (
                      <div className="overflow-x-auto">
                        <table className="w-full min-w-[480px] text-right text-xs">
                          <thead className="text-ink/50">
                            <tr>
                              <th className="p-2">محصول</th>
                              <th className="p-2">سایز</th>
                              <th className="p-2">مقدار</th>
                              <th className="p-2">استاندارد</th>
                            </tr>
                          </thead>
                          <tbody>
                            {items.map((it, i) => (
                              <tr key={i} className="border-t border-black/5">
                                <td className="p-2 font-bold">{it.product_name}</td>
                                <td className="p-2">{it.size ?? "—"}</td>
                                <td className="p-2">{it.quantity ?? "—"}</td>
                                <td className="p-2">{it.standard ?? "—"}</td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    )}
                    {r.notes && <p className="whitespace-pre-line rounded-xl bg-steel p-3 text-xs leading-6 text-ink/70">{r.notes}</p>}
                    {r.customer_email && <div className="text-xs text-ink/50" dir="ltr">{r.customer_email}</div>}

                    <div>
                      <div className="mb-2 text-xs font-bold text-ink/50">تاریخچه وضعیت</div>
                      <StatusLog rfqId={r.id} version={logVersion} />
                    </div>

                    <ProformaEditor rfq={r} setMsg={setMsg} onSaved={() => setLogVersion((v) => v + 1)} />

                    <div>
                      <div className="mb-2 text-xs font-bold text-ink/50">گفتگو با مشتری</div>
                      <SupportThread rfq={r} setMsg={setMsg} />
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

function StatusLog({ rfqId, version }: { rfqId: string; version: number }) {
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
  }, [rfqId, version]);

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

/* ---------------- پیش‌فاکتور ---------------- */

type Line = { product_name: string; size: string; quantity: string; line_total: string };
type Draft = { id: string | null; items: Line[]; valid_until: string; note: string };
const EMPTY_LINE: Line = { product_name: "", size: "", quantity: "", line_total: "" };

function ProformaEditor({ rfq, setMsg, onSaved }: { rfq: Rfq; setMsg: (m: Msg) => void; onSaved: () => void }) {
  const [list, setList] = useState<Proforma[] | null>(null);
  const [draft, setDraft] = useState<Draft | null>(null);
  const [busy, setBusy] = useState(false);

  const load = useCallback(async () => {
    const { data } = await supabase
      .from("proformas")
      .select("id,code,status,subtotal,vat_amount,total,valid_until,note,proforma_items(product_name,size,quantity,line_total,sort_order)")
      .eq("rfq_id", rfq.id)
      .order("created_at", { ascending: false });
    setList((data ?? []) as unknown as Proforma[]);
  }, [rfq.id]);

  useEffect(() => {
    load();
  }, [load]);

  function startNew() {
    setDraft({ id: null, items: [{ ...EMPTY_LINE }], valid_until: "", note: "" });
  }

  function startEdit(p: Proforma) {
    const items = [...(p.proforma_items ?? [])]
      .sort((a, b) => (a.sort_order ?? 0) - (b.sort_order ?? 0))
      .map((it) => ({
        product_name: it.product_name,
        size: it.size ?? "",
        quantity: it.quantity ?? "",
        line_total: String(it.line_total),
      }));
    setDraft({ id: p.id, items: items.length ? items : [{ ...EMPTY_LINE }], valid_until: p.valid_until ?? "", note: p.note ?? "" });
  }

  function updateLine(i: number, patch: Partial<Line>) {
    setDraft((d) => (d ? { ...d, items: d.items.map((l, idx) => (idx === i ? { ...l, ...patch } : l)) } : d));
  }

  const subtotal = draft ? draft.items.reduce((sum, l) => sum + toNum(l.line_total), 0) : 0;
  const vat = Math.round((subtotal * VAT_PERCENT) / 100);
  const total = subtotal + vat;

  async function save(send: boolean) {
    if (!draft) return;
    if (send && !rfq.user_id) return setMsg({ type: "err", text: "این استعلام به حساب کاربری وصل نیست؛ پیش‌فاکتور قابل ارسال نیست." });
    const valid = draft.items.filter((l) => l.product_name.trim() && toNum(l.line_total) > 0);
    if (valid.length === 0) return setMsg({ type: "err", text: "حداقل یک ردیف با نام محصول و مبلغ معتبر وارد کنید." });

    setBusy(true);
    const head = {
      subtotal,
      vat_percent: VAT_PERCENT,
      vat_amount: vat,
      total,
      valid_until: draft.valid_until || null,
      note: draft.note.trim() || null,
      updated_at: new Date().toISOString(),
    };

    let pfId = draft.id;
    if (pfId) {
      const { error } = await supabase.from("proformas").update(head).eq("id", pfId);
      if (error) { setBusy(false); return setMsg({ type: "err", text: "ذخیره پیش‌فاکتور ناموفق بود: " + error.message }); }
      await supabase.from("proforma_items").delete().eq("proforma_id", pfId);
    } else {
      const { data, error } = await supabase
        .from("proformas")
        .insert({ ...head, rfq_id: rfq.id, user_id: rfq.user_id, status: "draft" })
        .select("id")
        .single();
      if (error || !data) { setBusy(false); return setMsg({ type: "err", text: "ساخت پیش‌فاکتور ناموفق بود: " + (error?.message ?? "") }); }
      pfId = data.id as string;
    }

    const { error: itemErr } = await supabase.from("proforma_items").insert(
      valid.map((l, i) => ({
        proforma_id: pfId,
        product_name: l.product_name.trim(),
        size: l.size.trim() || null,
        quantity: l.quantity.trim() || null,
        line_total: toNum(l.line_total),
        sort_order: i,
      }))
    );
    if (itemErr) { setBusy(false); return setMsg({ type: "err", text: "ردیف‌ها ذخیره نشدند: " + itemErr.message }); }

    if (send) {
      const { error } = await supabase.from("proformas").update({ status: "sent" }).eq("id", pfId);
      if (error) { setBusy(false); return setMsg({ type: "err", text: "ارسال ناموفق بود: " + error.message }); }
    }

    setBusy(false);
    setDraft(null);
    setMsg({ type: "ok", text: send ? "پیش‌فاکتور برای مشتری ارسال شد." : "پیش‌نویس ذخیره شد." });
    load();
    onSaved();
  }

  async function sendExisting(p: Proforma) {
    const { error } = await supabase.from("proformas").update({ status: "sent" }).eq("id", p.id);
    if (error) return setMsg({ type: "err", text: "ارسال ناموفق بود: " + error.message });
    setMsg({ type: "ok", text: "پیش‌فاکتور برای مشتری ارسال شد." });
    load();
    onSaved();
  }

  return (
    <div>
      <div className="mb-2 flex items-center justify-between">
        <div className="text-xs font-bold text-ink/50">پیش‌فاکتور</div>
        {!draft && (
          <button onClick={startNew} className="flex items-center gap-1 text-xs font-bold text-blue">
            <Plus size={13} /> پیش‌فاکتور جدید
          </button>
        )}
      </div>

      {list === null ? (
        <p className="text-xs text-ink/40">در حال بارگذاری...</p>
      ) : list.length === 0 && !draft ? (
        <p className="text-xs text-ink/40">هنوز پیش‌فاکتوری برای این استعلام ساخته نشده است.</p>
      ) : (
        <div className="space-y-2">
          {list.map((p) => (
            <div key={p.id} className="flex flex-wrap items-center gap-2 rounded-xl border border-black/5 p-3 text-xs">
              <span className="font-bold" dir="ltr">{p.code}</span>
              <span className={`rounded-pill px-2 py-0.5 font-bold ${proformaStyle(p.status)}`}>{proformaLabel(p.status)}</span>
              <span className="font-bold">{toman(p.total)}</span>
              <div className="ms-auto flex gap-2">
                {p.status === "draft" && (
                  <>
                    <button onClick={() => startEdit(p)} className="font-bold text-blue">ویرایش</button>
                    <button onClick={() => sendExisting(p)} className="font-bold text-success">ارسال به مشتری</button>
                  </>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {draft && (
        <div className="mt-3 space-y-3 rounded-xl bg-steel p-4">
          {draft.items.map((l, i) => (
            <div key={i} className="grid grid-cols-[1.4fr_1fr_1fr_1fr_auto] items-center gap-2">
              <input placeholder="محصول" value={l.product_name} onChange={(e) => updateLine(i, { product_name: e.target.value })} className={INPUT} />
              <input placeholder="سایز" value={l.size} onChange={(e) => updateLine(i, { size: e.target.value })} className={INPUT} />
              <input placeholder="مقدار (مثلاً ۲ تن)" value={l.quantity} onChange={(e) => updateLine(i, { quantity: e.target.value })} className={INPUT} />
              <input placeholder="مبلغ ردیف (تومان)" inputMode="numeric" value={l.line_total} onChange={(e) => updateLine(i, { line_total: e.target.value })} className={INPUT} />
              <button
                type="button"
                onClick={() => setDraft((d) => (d && d.items.length > 1 ? { ...d, items: d.items.filter((_, idx) => idx !== i) } : d))}
                disabled={draft.items.length === 1}
                className="flex h-8 w-8 items-center justify-center rounded-lg bg-danger/10 text-danger disabled:opacity-30"
                aria-label="حذف ردیف"
              >
                <Trash2 size={13} />
              </button>
            </div>
          ))}
          <button type="button" onClick={() => setDraft((d) => (d ? { ...d, items: [...d.items, { ...EMPTY_LINE }] } : d))} className="flex items-center gap-1 text-xs font-bold text-blue">
            <Plus size={13} /> ردیف جدید
          </button>

          <div className="grid gap-2 sm:grid-cols-2">
            <label className="text-xs text-ink/60">
              اعتبار تا تاریخ
              <input type="date" value={draft.valid_until} onChange={(e) => setDraft({ ...draft, valid_until: e.target.value })} className={`${INPUT} mt-1`} />
            </label>
            <label className="text-xs text-ink/60">
              یادداشت برای مشتری
              <input value={draft.note} onChange={(e) => setDraft({ ...draft, note: e.target.value })} className={`${INPUT} mt-1`} />
            </label>
          </div>

          <div className="rounded-lg bg-white p-3 text-xs">
            <div className="flex justify-between"><span>جمع</span><span>{toman(subtotal)}</span></div>
            <div className="flex justify-between"><span>مالیات ({faNum(VAT_PERCENT)}٪)</span><span>{toman(vat)}</span></div>
            <div className="mt-1 flex justify-between text-sm font-extrabold"><span>جمع کل</span><span>{toman(total)}</span></div>
          </div>

          <div className="flex flex-wrap gap-2">
            <button onClick={() => save(true)} disabled={busy} className="rounded-btn bg-blue px-4 py-2.5 text-xs font-bold text-white disabled:opacity-60">
              ذخیره و ارسال به مشتری
            </button>
            <button onClick={() => save(false)} disabled={busy} className="rounded-btn border border-blue px-4 py-2.5 text-xs font-bold text-blue disabled:opacity-60">
              ذخیره پیش‌نویس
            </button>
            <button onClick={() => setDraft(null)} className="px-4 py-2.5 text-xs font-bold text-ink/50">انصراف</button>
          </div>
        </div>
      )}
    </div>
  );
}

/* ---------------- گفتگو با مشتری ---------------- */

function SupportThread({ rfq, setMsg }: { rfq: Rfq; setMsg: (m: Msg) => void }) {
  const [rows, setRows] = useState<Support[]>([]);
  const [text, setText] = useState("");
  const [busy, setBusy] = useState(false);

  const load = useCallback(async () => {
    const { data } = await supabase
      .from("support_messages")
      .select("id,from_admin,body,created_at")
      .eq("rfq_id", rfq.id)
      .order("created_at");
    setRows((data ?? []) as Support[]);
  }, [rfq.id]);

  useEffect(() => {
    load();
  }, [load]);

  async function send() {
    if (!text.trim()) return;
    if (!rfq.user_id) return setMsg({ type: "err", text: "این استعلام به حساب کاربری وصل نیست؛ پیام قابل ارسال نیست." });
    setBusy(true);
    const { error } = await supabase.from("support_messages").insert({ rfq_id: rfq.id, user_id: rfq.user_id, from_admin: true, body: text.trim() });
    setBusy(false);
    if (error) return setMsg({ type: "err", text: "ارسال پیام ناموفق بود: " + error.message });
    setText("");
    load();
  }

  return (
    <div className="space-y-3">
      {rows.length > 0 && (
        <ul className="space-y-2">
          {rows.map((m) => (
            <li key={m.id} className={`max-w-[85%] rounded-xl p-3 text-xs leading-6 ${m.from_admin ? "mr-auto bg-blue/10" : "bg-steel"}`}>
              <div className="mb-1 font-bold text-ink/60">{m.from_admin ? "کارشناس" : "مشتری"} · {faDateTime(m.created_at)}</div>
              <div className="whitespace-pre-line">{m.body}</div>
            </li>
          ))}
        </ul>
      )}
      <textarea rows={2} placeholder="پاسخ به مشتری" value={text} onChange={(e) => setText(e.target.value)} className={INPUT} />
      <button onClick={send} disabled={busy || !text.trim()} className="rounded-btn bg-blue px-4 py-2.5 text-xs font-bold text-white disabled:opacity-40">
        ارسال پاسخ
      </button>
    </div>
  );
}

/* ---------------- سفارش‌ها ---------------- */

function OrdersView({ setMsg }: { setMsg: (m: Msg) => void }) {
  const [orders, setOrders] = useState<AdminOrder[] | null>(null);

  const load = useCallback(async () => {
    const { data, error } = await supabase
      .from("orders")
      .select("id,code,status,total,shipping_address,carrier,tracking_code,created_at,rfqs(code,customer_name,customer_phone)")
      .order("created_at", { ascending: false })
      .limit(300);
    if (error) return setMsg({ type: "err", text: "خواندن سفارش‌ها ناموفق بود: " + error.message });
    setOrders((data ?? []) as unknown as AdminOrder[]);
  }, [setMsg]);

  useEffect(() => {
    load();
  }, [load]);

  if (orders === null) return <p className="py-10 text-center text-sm text-ink/40">در حال بارگذاری...</p>;
  if (orders.length === 0) return <p className="rounded-card border border-dashed border-black/10 py-12 text-center text-sm text-ink/40">هنوز سفارشی ثبت نشده است.</p>;

  return (
    <div className="space-y-3">
      {orders.map((o) => (
        <OrderRow key={o.id} order={o} setMsg={setMsg} onChanged={load} />
      ))}
    </div>
  );
}

function OrderRow({ order, setMsg, onChanged }: { order: AdminOrder; setMsg: (m: Msg) => void; onChanged: () => void }) {
  const [open, setOpen] = useState(false);
  const [carrier, setCarrier] = useState(order.carrier ?? "");
  const [tracking, setTracking] = useState(order.tracking_code ?? "");
  const [logRows, setLogRows] = useState<LogRow[] | null>(null);

  useEffect(() => {
    if (!open) return;
    let cancelled = false;
    supabase
      .from("order_status_log")
      .select("id,from_status,to_status,created_at")
      .eq("order_id", order.id)
      .order("created_at")
      .then(({ data }) => {
        if (!cancelled) setLogRows((data ?? []) as LogRow[]);
      });
    return () => {
      cancelled = true;
    };
  }, [open, order.id, order.status]);

  async function changeStatus(status: OrderStatus) {
    const { error } = await supabase.from("orders").update({ status, updated_at: new Date().toISOString() }).eq("id", order.id);
    if (error) return setMsg({ type: "err", text: "تغییر وضعیت ناموفق بود: " + error.message });
    setMsg({ type: "ok", text: `وضعیت ${order.code} به «${orderLabel(status)}» تغییر کرد.` });
    onChanged();
  }

  async function saveTracking() {
    const { error } = await supabase
      .from("orders")
      .update({ carrier: carrier.trim() || null, tracking_code: toEn(tracking).trim() || null, updated_at: new Date().toISOString() })
      .eq("id", order.id);
    if (error) return setMsg({ type: "err", text: "ذخیره ناموفق بود: " + error.message });
    setMsg({ type: "ok", text: "اطلاعات ارسال ذخیره شد." });
    onChanged();
  }

  return (
    <div className="rounded-card border border-black/5 bg-white p-4">
      <div className="flex flex-wrap items-center gap-3">
        <button onClick={() => setOpen(!open)} className="flex min-w-0 flex-1 items-center gap-3 text-start" aria-expanded={open}>
          <div className="min-w-0 flex-1">
            <div className="flex flex-wrap items-center gap-2">
              <span className="text-sm font-extrabold" dir="ltr">{order.code}</span>
              <span className="truncate text-sm font-semibold">{order.rfqs?.customer_name ?? "—"}</span>
            </div>
            <div className="mt-0.5 text-[11.5px] text-ink/50">
              <span dir="ltr">{order.rfqs?.customer_phone ?? ""}</span> · {faDateTime(order.created_at)} · {toman(order.total)}
            </div>
          </div>
          <ChevronDown size={16} className={`text-ink/40 transition-transform ${open ? "rotate-180" : ""}`} />
        </button>
        <select
          value={order.status}
          onChange={(e) => changeStatus(e.target.value as OrderStatus)}
          className={`rounded-pill px-3 py-1.5 text-xs font-bold outline-none ${orderStyle(order.status)}`}
        >
          {ORDER_STATUSES.map((s) => (
            <option key={s} value={s}>{orderLabel(s)}</option>
          ))}
        </select>
      </div>

      {open && (
        <div className="mt-4 space-y-4 border-t border-black/5 pt-4 text-sm">
          <div className="rounded-xl bg-steel p-3 text-xs leading-6">
            <div className="mb-1 text-ink/50">نشانی تحویل</div>
            {order.shipping_address || "—"}
          </div>
          <div className="grid gap-2 sm:grid-cols-[1fr_1fr_auto] sm:items-end">
            <label className="text-xs text-ink/60">
              باربری
              <input value={carrier} onChange={(e) => setCarrier(e.target.value)} className={`${INPUT} mt-1`} />
            </label>
            <label className="text-xs text-ink/60">
              کد پیگیری
              <input value={tracking} onChange={(e) => setTracking(e.target.value)} dir="ltr" className={`${INPUT} mt-1`} />
            </label>
            <button onClick={saveTracking} className="rounded-btn bg-blue px-4 py-2.5 text-xs font-bold text-white">ذخیره ارسال</button>
          </div>
          <div>
            <div className="mb-2 text-xs font-bold text-ink/50">تاریخچه سفارش</div>
            {logRows === null ? (
              <p className="text-xs text-ink/40">در حال بارگذاری...</p>
            ) : (
              <ol className="space-y-1.5 text-xs">
                {logRows.map((r) => (
                  <li key={r.id} className="flex flex-wrap gap-2">
                    <span className="text-ink/40">{faDateTime(r.created_at)}</span>
                    <span>{r.from_status ? `${orderLabel(r.from_status)} ← ` : "ثبت اولیه: "}<b>{orderLabel(r.to_status)}</b></span>
                  </li>
                ))}
              </ol>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
