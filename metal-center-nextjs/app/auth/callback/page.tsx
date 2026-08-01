"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";

export default function AuthCallbackPage() {
  const router = useRouter();

  useEffect(() => {
    // Supabase به‌صورت خودکار توکن داخل آدرس رو می‌خونه و session رو می‌سازه
    supabase.auth.getSession().then(({ data }) => {
      if (data.session) {
        router.replace("/panel");
      } else {
        router.replace("/login");
      }
    });
  }, [router]);

  return (
    <div className="flex min-h-[70vh] items-center justify-center">
      <p className="text-sm text-ink/50">در حال ورود به حساب شما...</p>
    </div>
  );
}
