# متال سنتر — Next.js Project (مرحله ۱۰)

این پوشه شروع تبدیل طراحی HTML قبلی به یک پروژه واقعی و قابل توسعه با
Next.js + React + TypeScript + Tailwind است (طبق Technical Architecture سند پروژه).

## چطور اجرا کنم؟

پیش‌نیاز: نصب بودن **Node.js** نسخه ۱۸ به بالا روی سیستم (از nodejs.org دانلود کن).

```bash
# ۱. وارد پوشه پروژه شو
cd metal-center-nextjs

# ۲. نصب پکیج‌ها (فقط بار اول)
npm install

# ۳. اجرای نسخه توسعه
npm run dev
```

بعد از اجرا، برو به آدرس `http://localhost:3000` توی مرورگر.

## ساختار فعلی پروژه

```
metal-center-nextjs/
├── app/
│   ├── layout.tsx        ← چارچوب کلی صفحات (هدر + فوتر مشترک)
│   ├── page.tsx           ← صفحه اصلی (کامل تبدیل شده)
│   ├── globals.css        ← استایل پایه + فونت‌ها
│   └── products/page.tsx  ← نمونه صفحه دوم (پایه، نیاز به تکمیل)
├── components/
│   ├── Header.tsx          ← هدر مشترک با منو، تاگل تم و RTL/LTR
│   └── Footer.tsx          ← فوتر مشترک
├── lib/
│   └── data.ts             ← داده‌های نمونه (بعداً با Supabase جایگزین می‌شه)
├── tailwind.config.ts       ← رنگ‌ها و توکن‌های طراحی برند (منبع اصلی رنگ‌بندی)
└── package.json
```

## چیکار شده و چیکار مونده؟ (مرحله ۱۰ — تکمیل شد ✅)

**انجام‌شده — همه ۱۲ صفحه تبدیل شدند:**

| صفحه | مسیر | نوع |
|---|---|---|
| اصلی | app/page.tsx | Server Component |
| محصولات | app/products/page.tsx | Server Component (پایه، نیاز به فیلتر کامل) |
| قیمت روز | app/prices/page.tsx | Server Component |
| استعلام قیمت | app/rfq/page.tsx | Client Component (تب آپلود/دستی) |
| مرکز دانش | app/knowledge/page.tsx | Server Component |
| کارخانه‌ها | app/factories/page.tsx | Server Component |
| خدمات | app/services/page.tsx | Server Component |
| صادرات | app/export/page.tsx | Server Component |
| درباره ما | app/about/page.tsx | Server Component |
| تماس با ما | app/contact/page.tsx | Server Component |
| پنل مشتری | app/panel/page.tsx | Client Component (سایدبار + تب) |
| پنل ادمین | app/admin/page.tsx | Client Component (سایدبار + تب) |

همه صفحات از `lib/data.ts` به‌عنوان منبع داده استفاده می‌کنند — دقیقاً همون جایی که در مرحله ۱۱ باید با کوئری‌های Supabase جایگزین بشه.

**باقی‌مانده برای تکمیل کامل مرحله ۱۰:**
- صفحه محصولات نیاز به فیلتر کامل + صفحه جزئیات محصول (`app/products/[slug]/page.tsx`) دارد
- پنل مشتری/ادمین فعلاً بدون احراز هویت واقعی هستند (فرم‌ها UI-only)
- فرم‌های RFQ و تماس هنوز به سرور واقعی متصل نیستند (submit handler لازم است)

## قدم بعدی: مرحله ۱۱ — اتصال Supabase

از اینجا به بعد به یک حساب Supabase (رایگان) و متغیرهای محیطی نیاز داریم. بهترین راه ادامه،
استفاده از **Claude Code** است چون می‌تونه مستقیم `npm install`، `npm run dev` و اتصال دیتابیس
رو روی سیستم خودت اجرا و تست کنه.

نصب Claude Code: به `claude.com/claude-code` مراجعه کن یا از دستور
`npm install -g @anthropic-ai/claude-code` استفاده کن (نیاز به Node.js).

---

## مرحله ۱۱ — اتصال Supabase (شروع شد ✅)

**چیزهایی که اضافه شده:**
- `.env.local` — شامل آدرس و کلید عمومی پروژه Supabase شما (از قبل پر شده)
- `lib/supabase.ts` — کلاینت اتصال به دیتابیس
- `supabase/migrations/0001_init.sql` — اسکیمای کامل دیتابیس (جدول‌های categories, factories, products, daily_prices, rfqs, rfq_items, articles) + داده نمونه
- صفحه **قیمت روز** حالا واقعاً از دیتابیس می‌خونه (نمونه کامل الگو برای بقیه صفحات)
- فرم **RFQ** حالا واقعاً در دیتابیس ثبت می‌شود (امتحانش کن!)

### قدم ۱: اجرای Migration روی Supabase

1. برو به پنل Supabase پروژه‌ات → از منوی سمت چپ **SQL Editor** رو انتخاب کن
2. روی **New query** بزن
3. کل محتوای فایل `supabase/migrations/0001_init.sql` رو کپی و پیست کن
4. دکمه **Run** رو بزن

اگه موفق بود، پیام سبز رنگ "Success" می‌بینی. حالا جدول‌ها و چند رکورد نمونه ساخته شدن.

### قدم ۲: تست محلی

```bash
npm install
npm run dev
```

برو به `http://localhost:3000/prices` — الان باید همون قیمت نمونه‌ای که توی migration گذاشتیم
(میلگرد A3 سایز ۱۴) رو از دیتابیس واقعی ببینی، نه از فایل استاتیک.

برو به `http://localhost:3000/rfq` و یک فرم تست پر کن و بفرست. بعد برو به پنل Supabase →
**Table Editor** → جدول `rfqs` — باید درخواستت رو اونجا ببینی!

### قدم ۳: بقیه صفحات (باقی‌مانده)

فقط صفحه قیمت روز و فرم RFQ به دیتابیس واقعی وصل شدن (به‌عنوان نمونه کامل). برای وصل کردن
بقیه (محصولات، کارخانه‌ها، مرکز دانش، پنل‌ها)، دقیقاً از همون الگوی `app/prices/page.tsx` پیروی کن:
یک تابع `async function getX()` که با `supabase.from("table").select(...)` داده می‌گیره،
و اگه خالی/خطا بود از `lib/data.ts` به‌عنوان fallback استفاده می‌کنه.

### قدم بعدی: احراز هویت (Auth)

برای اینکه پنل مشتری و پنل ادمین واقعی بشن (نه فقط UI)، باید **Supabase Auth** رو اضافه کنیم
(ورود با شماره موبایل یا ایمیل). این آخرین تکه‌ی بزرگ قبل از رفتن به مرحله ۱۲ (چندزبانه و SEO) است.
