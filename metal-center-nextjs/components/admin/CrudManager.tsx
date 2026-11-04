"use client";

import { useEffect, useState, type FormEvent } from "react";
import { Pencil, Trash2, Plus, Eye, EyeOff } from "lucide-react";
import { supabase } from "@/lib/supabase";
import ImageUploadField from "@/components/admin/ImageUploadField";

// یک موتور عمومی برای فهرست‌های مدیریتی (منو، خدمات، مقالات).
// هر بخش فقط تعریف فیلدهایش را می‌دهد و همین کامپوننت فرم، ذخیره، ترتیب و حذف را انجام می‌دهد.

export type FieldDef =
  | { key: string; label: string; type: "text" | "textarea" | "number" | "bool" | "image"; required?: boolean; hint?: string }
  | { key: string; label: string; type: "select"; options: string[]; required?: boolean; hint?: string };

export type CrudConfig = {
  table: string;
  title: string;
  description: string;
  fields: FieldDef[];
  defaults: Record<string, unknown>;
  titleKey: string;
  subtitleKey?: string;
  toggleKey?: string; // مثلاً active یا published — نمایش/پنهان کردن سریع
  filter?: { column: string; value: string };
  addLabel: string;
  emptyText: string;
};

type Row = { id: string; sort_order?: number } & Record<string, unknown>;
type Msg = { type: "ok" | "err"; text: string } | null;

const INPUT = "w-full rounded-lg border border-black/10 bg-white px-3 py-2 text-sm outline-none focus:border-blue";
const BTN = "rounded-lg px-3 py-2 text-xs font-bold transition disabled:opacity-40";

export default function CrudManager({ config }: { config: CrudConfig }) {
  const [rows, setRows] = useState<Row[]>([]);
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState(false);
  const [msg, setMsg] = useState<Msg>(null);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState<Record<string, unknown>>({});

  const flash = (type: "ok" | "err", text: string) => setMsg({ type, text });

  async function load() {
    setLoading(true);
    let q = supabase.from(config.table).select("*");
    if (config.filter) q = q.eq(config.filter.column, config.filter.value);
    const { data, error } = await q.order("sort_order", { ascending: true });
    setLoading(false);
    if (error) return flash("err", `خواندن اطلاعات ناموفق بود. مطمئن شو فایل 0009 را در Supabase اجرا کرده‌ای. (${error.message})`);
    setRows((data ?? []) as Row[]);
  }

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [config.table]);

  function startNew() {
    const next = Math.max(0, ...rows.map((r) => Number(r.sort_order) || 0)) + 1;
    setEditingId(null);
    setForm({ ...config.defaults, sort_order: next });
    setShowForm(true);
  }

  function startEdit(r: Row) {
    setEditingId(r.id);
    setForm({ ...r });
    setShowForm(true);
  }

  async function save(e: FormEvent) {
    e.preventDefault();
    for (const f of config.fields) {
      if (f.required && !String(form[f.key] ?? "").trim()) return flash("err", `فیلد «${f.label}» را پر کن.`);
    }
    // تبدیل فرم به داده‌ی ذخیره‌شونده
    const payload: Record<string, unknown> = {};
    for (const f of config.fields) {
      const v = form[f.key];
      if (f.type === "number") payload[f.key] = Number(v) || 0;
      else if (f.type === "bool") payload[f.key] = !!v;
      else if (f.type === "image") payload[f.key] = String(v ?? "").trim() || null;
      else payload[f.key] = String(v ?? "").trim();
    }
    if (config.filter) payload[config.filter.column] = config.filter.value;
    payload.sort_order = Number(form.sort_order) || 0;

    setBusy(true);
    const res = editingId
      ? await supabase.from(config.table).update(payload).eq("id", editingId)
      : await supabase.from(config.table).insert(payload);
    setBusy(false);
    if (res.error) return flash("err", "ذخیره نشد: " + res.error.message);
    setShowForm(false);
    setEditingId(null);
    flash("ok", "ذخیره شد.");
    load();
  }

  async function toggle(r: Row) {
    if (!config.toggleKey) return;
    const key = config.toggleKey;
    const { error } = await supabase.from(config.table).update({ [key]: !r[key] }).eq("id", r.id);
    if (error) return flash("err", "تغییر وضعیت ناموفق بود: " + error.message);
    load();
  }

  async function remove(r: Row) {
    const label = String(r[config.titleKey] ?? "");
    if (!window.confirm(`«${label}» حذف شود؟`)) return;
    const { error } = await supabase.from(config.table).delete().eq("id", r.id);
    if (error) return flash("err", "حذف نشد: " + error.message);
    flash("ok", "حذف شد.");
    load();
  }

  function renderInput(f: FieldDef) {
    const v = form[f.key];
    const set = (val: unknown) => setForm((prev) => ({ ...prev, [f.key]: val }));
    if (f.type === "image") return <ImageUploadField value={String(v ?? "")} onChange={(url) => set(url)} label={f.label} />;
    if (f.type === "bool") {
      return (
        <label className="flex items-center gap-2 text-xs font-bold">
          <input type="checkbox" checked={!!v} onChange={(e) => set(e.target.checked)} className="accent-blue" />
          {f.label}
        </label>
      );
    }
    if (f.type === "select") {
      return (
        <select className={INPUT} value={String(v ?? "")} onChange={(e) => set(e.target.value)}>
          {f.options.map((o) => (
            <option key={o} value={o}>{o}</option>
          ))}
        </select>
      );
    }
    if (f.type === "textarea") {
      return <textarea className={INPUT} rows={4} value={String(v ?? "")} onChange={(e) => set(e.target.value)} />;
    }
    if (f.type === "number") {
      return <input type="number" className={INPUT} value={String(v ?? "")} onChange={(e) => set(e.target.value)} />;
    }
    return <input className={INPUT} value={String(v ?? "")} onChange={(e) => set(e.target.value)} />;
  }

  return (
    <div>
      <div className="mb-5 flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="mb-1 text-xl font-extrabold">{config.title}</h1>
          <p className="text-sm text-ink/50">{config.description}</p>
        </div>
        <button onClick={startNew} className={`${BTN} flex items-center gap-1.5 bg-blue text-white`}>
          <Plus size={14} /> {config.addLabel}
        </button>
      </div>

      {msg && (
        <div className={`mb-5 rounded-xl px-4 py-3 text-sm font-semibold ${msg.type === "ok" ? "bg-success/10 text-success" : "bg-danger/10 text-danger"}`}>
          {msg.text}
        </div>
      )}

      {showForm && (
        <form onSubmit={save} className="mb-6 grid gap-3 rounded-card border border-blue/30 bg-white p-5 md:grid-cols-2">
          <div className="text-sm font-extrabold md:col-span-2">{editingId ? "ویرایش" : "مورد جدید"}</div>
          {config.fields.map((f) => (
            <div key={f.key} className={f.type === "textarea" || f.type === "image" ? "md:col-span-2" : ""}>
              {f.type !== "image" && f.type !== "bool" && (
                <label className="mb-1 block text-xs font-bold text-ink/60">
                  {f.label}
                  {f.required && " *"}
                </label>
              )}
              {renderInput(f)}
              {f.hint && <p className="mt-1 text-[11px] text-ink/45">{f.hint}</p>}
            </div>
          ))}
          <div className="flex gap-2 md:col-span-2">
            <button disabled={busy} className={`${BTN} bg-blue text-white`}>ذخیره</button>
            <button type="button" onClick={() => setShowForm(false)} className={`${BTN} bg-black/5`}>انصراف</button>
          </div>
        </form>
      )}

      {loading ? (
        <p className="py-10 text-center text-sm text-ink/40">در حال بارگذاری...</p>
      ) : rows.length === 0 ? (
        <p className="rounded-card border border-dashed border-black/10 py-12 text-center text-sm text-ink/40">{config.emptyText}</p>
      ) : (
        <div className="space-y-2.5">
          {rows.map((r) => {
            const active = config.toggleKey ? !!r[config.toggleKey] : true;
            return (
              <div
                key={r.id}
                className={`flex flex-col gap-2 rounded-card border bg-white p-4 sm:flex-row sm:items-center ${active ? "border-black/5" : "border-dashed border-black/15 opacity-70"}`}
              >
                <div className="min-w-0 flex-1">
                  <div className="truncate text-sm font-extrabold">{String(r[config.titleKey] ?? "")}</div>
                  {config.subtitleKey && <div className="truncate text-[12px] text-ink/50">{String(r[config.subtitleKey] ?? "")}</div>}
                  <div className="text-[11px] text-ink/40">ترتیب {Number(r.sort_order) || 0}{config.toggleKey && ` · ${active ? "نمایش داده می‌شود" : "پنهان"}`}</div>
                </div>
                <div className="flex gap-1.5">
                  {config.toggleKey && (
                    <button onClick={() => toggle(r)} className={`${BTN} bg-black/5`} aria-label="تغییر وضعیت">
                      {active ? <Eye size={14} /> : <EyeOff size={14} />}
                    </button>
                  )}
                  <button onClick={() => startEdit(r)} className={`${BTN} bg-black/5`} aria-label="ویرایش">
                    <Pencil size={14} />
                  </button>
                  <button onClick={() => remove(r)} className={`${BTN} bg-danger/10 text-danger`} aria-label="حذف">
                    <Trash2 size={14} />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
