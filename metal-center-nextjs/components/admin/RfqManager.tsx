"use client";

import { useEffect, useState } from "react";
import { ChevronDown } from "lucide-react";
import { supabase } from "@/lib/supabase";

type Item = { product_name: string; size: string | null; quantity: string | null; unit: string | null; standard: string | null };
type Status = "pending" | "review" | "done";
type Rfq = {
  id: string;
  customer_name: string;
  customer_phone: string;
  customer_email: string | null;
  method: "upload" | "manual";
  notes: string | null;
  status: Status;
  created_at: string;
  rfq_items: Item[] | null;
};

const STATUS_LABEL: Record<Status, string> = { pending: "در انتظار بررسی", review: "در حال قیمت‌گذاری", done: "تکمیل‌شده" };
const STATUS_STYLE: Record<Status, string> = {
  pending: "bg-warning/15 text-[#B87700]",
  review: "bg-blue/10 text-blue",
  done: "bg-success/10 text-success",
};

type Msg = { type: "ok" | "err"; text: string } | null;

export default function RfqManager() {
  const [rfqs, setRfqs] = useState<Rfq[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<"all" | Status>("all");
  const [openId, setOpenId] = useState<string | null>(null);
  const [msg, setMsg] = useState<Msg>(null);

  async function load() {
    setLoading(true);
    const { data, error } = await supabase
      .from("rfqs")
      .select("id,customer_name,customer_phone,customer_email,method,notes,status,created_at,rfq_items(product_name,size,quantity,unit,standard)")
      .order("created_at", { ascending: false })
      .limit(300);
    setLoading(false);
    if (error) return setMsg({ type: "err", text: "خواندن استعلام‌ها ناموفق بود: " + error.message });
    setRfqs((data ?? []) as unknown as Rfq[]);
  }

  useEffect(() => {
    load();
  }, []);

  async function changeStatus(r: Rfq, status: Status) {
    const { error } = await supabase.from("rfqs").update({ status }).eq("id", r.id);
    if (error) return setMsg({ type: "err", text: "تغییر وضعیت ناموفق بود: " + error.message });
    setRfqs((list) => list.map((x) => (x.id === r.id ? { ...x, status } : x)));
  }

  const shown = rfqs.filter((r) => filter === "all" || r.status === filter);

  return (
    <div>
      <h1 className="mb-1 text-xl font-extrabold">مدیریت استعلام‌ها</h1>
      <p className="mb-5 text-sm text-ink/50">همه‌ی استعلام‌های ثبت‌شده از سایت. با فلش هر کدام جزئیات و ردیف‌های محصول را ببین.</p>

      {msg && (
        <div className={`mb-5 rounded-xl px-4 py-3 text-sm font-semibold ${msg.type === "ok" ? "bg-success/10 text-success" : "bg-danger/10 text-danger"}`}>
          {msg.text}
        </div>
      )}

      <div className="mb-4 flex flex-wrap gap-2">
        {(["all", "pending", "review", "done"] as const).map((f) => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            className={`rounded-pill border px-3.5 py-1.5 text-xs font-bold ${
              filter === f ? "border-blue bg-blue text-white" : "border-black/10 bg-white text-ink/60"
            }`}
          >
            {f === "all" ? "همه" : STATUS_LABEL[f]}
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
                      <div className="truncate text-sm font-extrabold">{r.customer_name}</div>
                      <div className="mt-0.5 text-[11.5px] text-ink/50">
                        <span dir="ltr">{r.customer_phone}</span> · {new Date(r.created_at).toLocaleString("fa-IR", { dateStyle: "short", timeStyle: "short" })}
                      </div>
                    </div>
                    <span className="rounded-pill bg-black/5 px-2.5 py-1 text-[11px] font-bold text-ink/60">
                      {r.method === "upload" ? "فایل" : `${items.length} ردیف`}
                    </span>
                    <ChevronDown size={16} className={`text-ink/40 transition-transform ${open ? "rotate-180" : ""}`} />
                  </button>
                  <select
                    value={r.status}
                    onChange={(e) => changeStatus(r, e.target.value as Status)}
                    className={`rounded-pill px-3 py-1.5 text-xs font-bold outline-none ${STATUS_STYLE[r.status]}`}
                  >
                    {(Object.keys(STATUS_LABEL) as Status[]).map((s) => (
                      <option key={s} value={s}>{STATUS_LABEL[s]}</option>
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
