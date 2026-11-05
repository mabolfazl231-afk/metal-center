// تشخیص ادمین و مسیر بعد از ورود (مشترک بین همه‌ی روش‌های ورود)
export function isAdminEmail(email?: string | null) {
  const list = (process.env.NEXT_PUBLIC_ADMIN_EMAILS ?? "")
    .split(",")
    .map((e) => e.trim().toLowerCase())
    .filter(Boolean);
  return !!email && list.includes(email.trim().toLowerCase());
}

export function afterLoginPath(email?: string | null) {
  return isAdminEmail(email) ? "/admin" : "/panel";
}

// پیام‌های انگلیسی Supabase را به فارسی قابل فهم تبدیل می‌کند
export function translateAuthError(msg: string) {
  const m = msg.toLowerCase();
  if (m.includes("invalid login")) return "ایمیل یا رمز عبور اشتباه است.";
  if (m.includes("email not confirmed")) return "ایمیلت هنوز تأیید نشده. لینک تأیید را در ایمیل باز کن.";
  if (m.includes("rate limit") || m.includes("too many")) return "تعداد درخواست‌ها زیاد است. کمی بعد دوباره تلاش کن.";
  if (m.includes("expired") || m.includes("invalid token") || m.includes("otp")) return "کد اشتباه یا منقضی شده است. کد جدید بگیر.";
  if (m.includes("already registered") || m.includes("already been registered")) return "این ایمیل قبلاً ثبت‌نام کرده. از تب «ورود با رمز» وارد شو.";
  if (m.includes("password")) return "رمز عبور باید حداقل ۶ کاراکتر باشد.";
  return "مشکلی پیش آمد: " + msg;
}
