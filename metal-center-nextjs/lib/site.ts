// اطلاعات تماس و شبکه‌های اجتماعی متال سنتر — هر جای سایت از همین فایل خوانده می‌شود.
// اگر شماره یا لینکی عوض شد، فقط همین فایل را تغییر بده.

export const PHONES = [
  { display: "0919-782-9196", tel: "09197829196" },
  { display: "0912-108-3918", tel: "09121083918" },
  { display: "0920-106-3918", tel: "09201063918" },
];

// شماره‌ای که روی دکمه‌ی «تماس» جدول قیمت و فلوتینگ‌ها نشان داده می‌شود
export const PRIMARY_PHONE = PHONES[0].tel;

export const EMAIL = "metalcenter.ir@gmai.com";

export const SOCIAL = {
  telegram: "https://t.me/MetalCenter7",
  instagram: "https://www.instagram.com/metal__center",
  linkedin: "https://www.linkedin.com/in/metalcenter",
};

// ساعات کاری — نمایش در صفحه‌ی تماس
export const WORKING_HOURS = [
  { days: "شنبه تا چهارشنبه", hours: "۸:۳۰ تا ۱۷" },
  { days: "پنجشنبه", hours: "۸:۳۰ تا ۱۳:۳۰" },
];
