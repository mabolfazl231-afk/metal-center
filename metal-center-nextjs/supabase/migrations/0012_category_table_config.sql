-- 0012: ترتیب و نام و نمایش ستون‌های جدول قیمت برای هر دسته
-- هر آیتم: { "key": "...", "label": "...", "hidden": true|false }
-- کلیدهای ثابت: name, size, factory, grade, loading_place, unit, weight_kg, price
-- ستون‌های اختصاصی: key شروع‌شونده با attr: (مقدار آن در products.attributes ذخیره می‌شود)
-- اگر خالی باشد، از ستون‌های قدیمی (price_columns و hidden_fields) یا دسته‌ی والد استفاده می‌شود.

alter table public.categories
  add column if not exists table_config jsonb not null default '[]'::jsonb;
