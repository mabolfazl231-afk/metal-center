-- 0006: ستون‌های اختصاصی لیست قیمت برای هر دسته (مثلاً ابعاد برای ورق)
-- این فایل را یک‌بار در SQL Editor اجرا کن. بعد از 0005 اجرا شود.

-- ۱) هر دسته لیست نام ستون‌های خودش را دارد، مثلاً ["ضخامت","عرض","طول"]
alter table public.categories
  add column if not exists price_columns jsonb not null default '[]'::jsonb;

-- ۲) هر محصول مقدار این ستون‌ها را دارد، مثلاً {"ضخامت":"2","عرض":"1000"}
alter table public.products
  add column if not exists attributes jsonb not null default '{}'::jsonb;

-- نمونه: برای دسته‌ی ورق، ستون‌های ضخامت/عرض/طول فعال شود (اگر دسته‌ی «ورق» داری)
update public.categories
set price_columns = '["ضخامت (میلی‌متر)","عرض","طول"]'::jsonb
where name = 'ورق';
