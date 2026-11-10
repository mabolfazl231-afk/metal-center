"use client";

import { useEffect, useState } from "react";
import { ChevronDown } from "lucide-react";
import { supabase } from "@/lib/supabase";
import { RFQ_STATUSES, faDateTime, statusLabel, statusStyle, type RfqStatus } from "@/lib/rfq";

type Item = { product_name: string; size: string | null; quantity: string | null; standard: string | null };
type Rfq = {
  id: string;
  code: string;
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
type Msg = { type: "ok" | "err"; text: string } | null;

export default function RfqManager() {
  const [rfqs, setRfqs] = useState<Rfq[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<"all" | RfqStatus>("all");
  const [openId, setOpenId] = useState<string | null>(null);
  const [msg, setMsg] = useState<Msg>(null);
  const [logVersion, setLogVersion] = useState(0);

  async function load() {
    setLoading(true);
    const { data, error } = await supabase
      .from("rfqs")
      .select("id,code,customer_name,customer_phone,customer_email,method,notes,status,created_at,rfq_items(product_name,size,quantity,standard)")
      .order("created_at", { ascending: false })
      .limit(300);
    setLoading(false);
    if (error) return setMsg({ type: "err", text: "خواندن استعلام‌ها ناموفق بود: " + error.message });
    setRfqs((data ?? []) as unknown as Rfq[]);
  }

  useEffect(() => {
    load();
  }, []);

  async function changeStatus(r: Rfq, status: RfqStatus) {
    const { error } = await supabase.from("rfqs").update({ status }).eq("id", r.id);
    if (error) return setMsg({ type: "err", text: "تغییر وضعیت ناموفق بود: " + error.message });
    setRfqs((list) => list.map((x) => (x.id === r.id ? { ...x, status } : x)));
    setLogVersion((v) => v + 1); // تاریخچه‌ی باز را دوباره می‌خواند
    setMsg({ type: "ok", text: `وضعیت ${r.code} به «${statusLabel(status)}» تغییر کرد.` });
  }

  const shown = rfqs.filter((r) => filter === "all" || r.status === filter);

  return (
    <div>
      <h1 className="mb-1 text-xl font-extrabold">مدیریت استعلام‌ها</h1>
      <p className="mb-5 text-sm text-ink/50">
        همه‌ی استعلام‌ها با کد یکتا. تغییر وضعیت، برای مشتری در پنل او و در تاریخچه ثبت می‌شود.
      </p>

      {msg && (
        <div className={`mb-5 rounded-xl px-4 py-3 text-sm font-semibold ${msg.type === "ok" ? "bg-success/10 text-success" : "bg-danger/10 text-danger"}`}>
          {msg.text}
        </div>
      )}

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
            {f !== "all" && <span className="ms-1.5 opacity-70">{rfqs.filter((r) => r.status === f).length}</span>}
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
                      </div>
                      <div className="mt-0.5 text-[11.5px] text-ink/50">
                        <span dir="ltr">{r.customer_phone}</span> · {faDateTime(r.created_at)}
                      </div>
                    </div>
                    <span className="rounded-pill bg-black/5 px-2.5 py-1 text-[11px] font-bold text-ink/60">
                      {r.method === "upload" ? "فایل" : `${items.length} ردیف`}
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
                  <div className="mt-4 space-y-3 border-t border-black/5 pt-4 text-sm">
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
