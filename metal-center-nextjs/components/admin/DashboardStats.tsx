"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";

type CountRes = { count: number | null; error: { message: string } | null };
type RecentRfq = { id: string; customer_name: string; created_at: string; status: string };

const STATUS: Record<string, string> = { pending: "در انتظار", review: "در حال قیمت‌گذاری", done: "تکمیل‌شده" };

const n = (r: CountRes) => (r.error ? null : r.count ?? 0);

export default function DashboardStats() {
  const [loaded, setLoaded] = useState(false);
  const [stats, setStats] = useState<{ label: string; value: number | null }[]>([]);
  const [recent, setRecent] = useState<RecentRfq[]>([]);

  useEffect(() => {
    let cancelled = false;
    async function run() {
      const start = new Date();
      start.setHours(0, 0, 0, 0);
      const head = { count: "exact" as const, head: true };

      const [total, today, pending, unread, factories, products, recentRes] = await Promise.all([
        supabase.from("rfqs").select("id", head),
        supabase.from("rfqs").select("id", head).gte("created_at", start.toISOString()),
        supabase.from("rfqs").select("id", head).eq("status", "pending"),
        supabase.from("contact_messages").select("id", head).eq("is_read", false),
        supabase.from("factories").select("id", head),
        supabase.from("products").select("id", head).eq("visible", true),
        supabase.from("rfqs").select("id,customer_name,created_at,status").order("created_at", { ascending: false }).limit(5),
      ]);

      if (cancelled) return;
      setStats([
        { label: "استعلام امروز", value: n(today) },
        { label: "استعلام در انتظار بررسی", value: n(pending) },
        { label: "کل استعلام‌ها", value: n(total) },
        { label: "پیام تماس خوانده‌نشده", value: n(unread) },
        { label: "کارخانه‌ی ثبت‌شده", value: n(factories) },
        { label: "محصول فعال", value: n(products) },
      ]);
      setRecent((recentRes.data ?? []) as RecentRfq[]);
      setLoaded(true);
    }
    run();
    return () => {
      cancelled = true;
    };
  }, []);

  return (
    <div>
      <h1 className="mb-1 text-xl font-extrabold">نمای کلی سیستم</h1>
      <p className="mb-6 text-sm text-ink/50">آمار واقعی از دیتابیس. اگر عددی «—» بود، فایل SQL مربوط اجرا نشده است.</p>

      <div className="mb-6 grid grid-cols-2 gap-3.5 lg:grid-cols-3">
        {!loaded &&
          [0, 1, 2, 3, 4, 5].map((i) => <div key={i} className="h-[88px] animate-pulse rounded-2xl bg-white" />)}
        {loaded &&
          stats.map((s) => (
            <div key={s.label} className="rounded-2xl border border-black/5 bg-white p-5 shadow-soft">
              <div className="text-2xl font-extrabold">{s.value === null ? "—" : s.value.toLocaleString("fa-IR")}</div>
              <div className="mt-1 text-xs text-ink/50">{s.label}</div>
            </div>
          ))}
      </div>

      <div className="rounded-card border border-black/5 bg-white p-5">
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-sm font-extrabold">آخرین استعلام‌ها</h2>
        </div>
        {recent.length === 0 ? (
          <p className="py-6 text-center text-sm text-ink/40">هنوز استعلامی ثبت نشده است.</p>
        ) : (
          <ul className="divide-y divide-black/5">
            {recent.map((r) => (
              <li key={r.id} className="flex items-center justify-between gap-3 py-3 text-sm">
                <span className="font-bold">{r.customer_name}</span>
                <span className="text-xs text-ink/50">{new Date(r.created_at).toLocaleDateString("fa-IR")}</span>
                <span className="rounded-full bg-blue/10 px-2.5 py-1 text-[11px] font-bold text-blue">{STATUS[r.status] ?? r.status}</span>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
