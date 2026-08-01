"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";
import type { User } from "@supabase/supabase-js";

// این هوک را در ابتدای هر صفحه‌ای که باید محافظت‌شده باشد (پنل مشتری، پنل ادمین) صدا بزنید.
// اگر کاربر وارد نشده باشد، خودکار به صفحه‌ی ورود هدایت می‌شود.
export function useAuthGuard() {
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => {
      if (!data.session) {
        router.replace("/login");
      } else {
        setUser(data.session.user);
      }
      setLoading(false);
    });

    const { data: listener } = supabase.auth.onAuthStateChange((_event, session) => {
      if (!session) {
        router.replace("/login");
      } else {
        setUser(session.user);
      }
    });

    return () => listener.subscription.unsubscribe();
  }, [router]);

  return { user, loading };
}

export async function signOut() {
  await supabase.auth.signOut();
  window.location.href = "/login";
}
