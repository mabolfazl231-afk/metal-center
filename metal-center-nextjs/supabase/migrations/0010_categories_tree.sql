-- 0010: زیرمجموعه‌ی دسته‌ها و ترتیب نمایش
-- هر دسته می‌تواند یک والد (دسته‌ی اصلی) داشته باشد: میلگرد ← ساده / آجدار
-- اگر دسته‌ی اصلی حذف شود، زیرمجموعه‌هایش هم حذف می‌شوند (on delete cascade).
-- اگر محصولی به دسته یا زیرمجموعه وصل باشد، حذف انجام نمی‌شود (همان رفتار قبلی).

alter table public.categories
  add column if not exists parent_id uuid references public.categories(id) on delete cascade,
  add column if not exists sort_order integer not null default 0;

create index if not exists categories_parent_id_idx on public.categories (parent_id);
create index if not exists categories_sort_order_idx on public.categories (sort_order);
