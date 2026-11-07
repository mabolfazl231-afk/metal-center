-- 0013: رنگ، عکس و نمایش در صفحه‌ی اصلی برای دسته‌ها؛ لوگو برای کارخانه‌ها
-- این فایل را یک‌بار در Supabase SQL Editor اجرا کن. دوباره اجرا کردنش مشکلی ندارد.

alter table public.categories
  add column if not exists color text,
  add column if not exists image_url text,
  add column if not exists show_on_home boolean not null default false;

alter table public.factories
  add column if not exists logo_url text;

-- پنج دسته‌ای که الان در صفحه‌ی اصلی هستند، همچنان در صفحه‌ی اصلی بمانند.
-- دسته‌های جدیدی که از پنل اضافه می‌کنی، پیش‌فرض در صفحه‌ی اصلی نمی‌آیند.
update public.categories
set show_on_home = true
where parent_id is null
  and name in ('میلگرد', 'تیرآهن', 'ورق', 'پروفیل', 'نبشی و ناودانی');
