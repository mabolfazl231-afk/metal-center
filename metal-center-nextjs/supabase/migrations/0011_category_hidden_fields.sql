-- 0011: فیلدهای ثابتی که برای هر دسته نمایش داده نمی‌شوند
-- مقادیر ممکن: grade (گرید)، loading_place (محل بارگیری)، unit (واحد)
-- اگر خالی باشد، همه‌ی فیلدها نمایش داده می‌شوند (و اگر زیرمجموعه خالی باشد، از والد گرفته می‌شود).

alter table public.categories
  add column if not exists hidden_fields text[] not null default '{}';
