"use client";

import { useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";
import { afterLoginPath, translateAuthError } from "@/lib/auth";

type Mode = "password" | "signup" | "otp";

const TABS: { key: Mode; label: string }[] = [
  { key: "password", label: "ورود با رمز" },
  { key: "signup", label: "ثبت‌نام" },
  { key: "otp", label: "کد یک‌بار مصرف" },
];

export default function LoginPage() {
  const router = useRouter();
  const [mode, setMode] = useState<Mode>("password");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [code, setCode] = useState("");
  const [codeSent, setCodeSent] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [info, setInfo] = useState<string | null>(null);

  function switchMode(next: Mode) {
    setMode(next);
    setError(null);
    setInfo(null);
    setCodeSent(false);
    setCode("");
  }

  async function goToPanel() {
    const { data } = await supabase.auth.getSession();
    router.replace(afterLoginPath(data.session?.user.email));
  }

  async function handlePassword(e: FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);
    const { error } = await supabase.auth.signInWithPassword({ email: email.trim(), password });
    setLoading(false);
    if (error) return setError(translateAuthError(error.message));
    goToPanel();
  }

  async function handleSignup(e: FormEvent) {
    e.preventDefault();
    if (password.length < 6) return setError("رمز عبور باید حداقل ۶ کاراکتر باشد.");
    setLoading(true);
    setError(null);
    const { data, error } = await supabase.auth.signUp({
      email: email.trim(),
      password,
      options: { emailRedirectTo: `${window.location.origin}/auth/callback` },
    });
    setLoading(false);
    if (error) return setError(translateAuthError(error.message));
    if (data.session) return goToPanel();
    setInfo("ثبت‌نام انجام شد. برای فعال‌سازی، لینک تأیید را که به ایمیلت آمده باز کن.");
  }

  async function handleSendCode(e: FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);
    const { error } = await supabase.auth.signInWithOtp({
      email: email.trim(),
      options: { shouldCreateUser: true },
    });
    setLoading(false);
    if (error) return setError(translateAuthError(error.message));
    setCodeSent(true);
    setInfo("کد ۶ رقمی به ایمیلت فرستاده شد.");
  }

  async function handleVerifyCode(e: FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);
    const { error } = await supabase.auth.verifyOtp({ email: email.trim(), token: code.trim(), type: "email" });
    setLoading(false);
    if (error) return setError(translateAuthError(error.message));
    goToPanel();
  }

  const input =
    "w-full rounded-xl border border-border-light bg-white px-4 py-3 text-sm outline-none transition focus:border-blue dark:border-border-dark dark:bg-surface-dark";
  const primary =
    "w-full rounded-xl bg-blue py-3 text-sm font-bold text-white shadow-glow transition hover:bg-navy disabled:opacity-60";

  return (
    <div className="flex min-h-[80vh] items-center justify-center bg-gradient-to-br from-[#E8F0FF] via-white to-[#E9FBF4] px-4 py-12 dark:bg-canvas-dark">
      <div className="w-full max-w-[420px] overflow-hidden rounded-card bg-white shadow-lifted dark:bg-surface-dark">
        <div className="bg-gradient-to-l from-blue to-navy px-6 py-7 text-center text-white">
          <div className="text-xl font-extrabold">ورود به متال سنتر</div>
          <div className="mt-1 text-xs text-white/70">مدیریت استعلام‌ها، قیمت‌ها و سفارش‌ها</div>
        </div>

        <div className="p-6">
          <div className="mb-6 grid grid-cols-3 gap-1 rounded-xl bg-steel p-1 dark:bg-white/5">
            {TABS.map((t) => (
              <button
                key={t.key}
                type="button"
                onClick={() => switchMode(t.key)}
                className={`rounded-lg py-2 text-xs font-bold transition ${
                  mode === t.key ? "bg-white text-blue shadow-soft dark:bg-surface-dark" : "text-ink/50"
                }`}
              >
                {t.label}
              </button>
            ))}
          </div>

          {mode === "password" && (
            <form onSubmit={handlePassword} className="space-y-4">
              <input className={input} type="email" dir="ltr" placeholder="ایمیل" value={email} onChange={(e) => setEmail(e.target.value)} required />
              <input className={input} type="password" dir="ltr" placeholder="رمز عبور" value={password} onChange={(e) => setPassword(e.target.value)} required />
              <button className={primary} disabled={loading}>{loading ? "در حال ورود..." : "ورود"}</button>
            </form>
          )}

          {mode === "signup" && (
            <form onSubmit={handleSignup} className="space-y-4">
              <input className={input} type="email" dir="ltr" placeholder="ایمیل" value={email} onChange={(e) => setEmail(e.target.value)} required />
              <input className={input} type="password" dir="ltr" placeholder="رمز عبور (حداقل ۶ کاراکتر)" value={password} onChange={(e) => setPassword(e.target.value)} required />
              <button className={primary} disabled={loading}>{loading ? "در حال ثبت‌نام..." : "ثبت‌نام"}</button>
            </form>
          )}

          {mode === "otp" && !codeSent && (
            <form onSubmit={handleSendCode} className="space-y-4">
              <input className={input} type="email" dir="ltr" placeholder="ایمیل" value={email} onChange={(e) => setEmail(e.target.value)} required />
              <button className={primary} disabled={loading}>{loading ? "در حال ارسال..." : "ارسال کد ورود"}</button>
            </form>
          )}

          {mode === "otp" && codeSent && (
            <form onSubmit={handleVerifyCode} className="space-y-4">
              <input className={`${input} text-center tracking-[0.4em]`} inputMode="numeric" dir="ltr" maxLength={6} placeholder="______" value={code} onChange={(e) => setCode(e.target.value.replace(/\D/g, ""))} required />
              <button className={primary} disabled={loading || code.length < 6}>{loading ? "در حال تأیید..." : "تأیید و ورود"}</button>
              <button type="button" onClick={() => setCodeSent(false)} className="w-full text-xs font-semibold text-blue">
                تغییر ایمیل یا ارسال مجدد کد
              </button>
            </form>
          )}

          {error && <p className="mt-4 rounded-xl bg-danger/10 px-4 py-3 text-center text-sm font-semibold text-danger">{error}</p>}
          {info && <p className="mt-4 rounded-xl bg-success/10 px-4 py-3 text-center text-sm font-semibold text-success">{info}</p>}
        </div>
      </div>
    </div>
  );
}
