"use client";

import { useState } from "react";
import { supabase } from "@/lib/supabase";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState<"idle" | "sending" | "sent" | "error">("idle");

  async function handleLogin() {
    if (!email) return;
    setStatus("sending");
    const { error } = await supabase.auth.signInWithOtp({
      email,
      options: {
        // بعد از کلیک روی لینک ایمیل، کاربر به همین سایت برمی‌گردد
        emailRedirectTo:
          typeof window !== "undefined" ? `${window.location.origin}/auth/callback` : undefined,
      },
    });
    setStatus(error ? "error" : "sent");
  }

  return (
    <div className="mx-auto flex min-h-[70vh] max-w-md flex-col justify-center px-6 py-10">
      <div className="rounded-card border border-black/5 bg-white p-8 text-center shadow-soft">
        <h1 className="mb-2 text-xl font-extrabold">ورود به حساب کاربری</h1>
        <p className="mb-6 text-sm text-ink/50">
          ایمیل خود را وارد کنید — یک لینک ورود برایتان ارسال می‌شود، بدون نیاز به رمز عبور.
        </p>

        <input
          type="email"
          placeholder="example@mail.com"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          dir="ltr"
          className="mb-3 w-full rounded-xl border border-black/10 bg-steel p-3 text-center text-sm"
        />
        <button
          onClick={handleLogin}
          disabled={status === "sending"}
          className="w-full rounded-btn bg-blue py-3.5 font-bold text-white hover:bg-navy disabled:opacity-60"
        >
          {status === "sending" ? "در حال ارسال..." : "ارسال لینک ورود"}
        </button>

        {status === "sent" && (
          <p className="mt-4 text-sm font-semibold text-success">
            ✓ ایمیل ارسال شد! صندوق ایمیل خود را چک کنید و روی لینک کلیک کنید.
          </p>
        )}
        {status === "error" && (
          <p className="mt-4 text-sm font-semibold text-danger">
            مشکلی پیش آمد. لطفاً دوباره تلاش کنید.
          </p>
        )}
      </div>
    </div>
  );
}
