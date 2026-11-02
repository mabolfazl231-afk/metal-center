-- متال سنتر — مرحله ۲: دسترسی ادمین برای ویرایش داده‌ها
-- این فایل را کامل کپی کن و در Supabase → SQL Editor → New query پیست کن، سپس Run بزن.
-- اگر ادمین جدید اضافه کردی، ایمیلش را داخل تابع is_admin به لیست اضافه کن و دوباره Run بزن.

create or replace function public.is_admin() returns boolean
language sql stable
as $$
  select coalesce(auth.jwt() ->> 'email', '') in (
    'mabolfazl231@gmail.com'
  );
$$;

-- ادمین همه‌ی ردیف‌ها را می‌بیند و می‌تواند ویرایش، افزودن و حذف کند
create policy "admin all categories" on categories for all to authenticated
  using (is_admin()) with check (is_admin());

create policy "admin all factories" on factories for all to authenticated
  using (is_admin()) with check (is_admin());

create policy "admin all products" on products for all to authenticated
  using (is_admin()) with check (is_admin());

create policy "admin all prices" on daily_prices for all to authenticated
  using (is_admin()) with check (is_admin());

create policy "admin all articles" on articles for all to authenticated
  using (is_admin()) with check (is_admin());

create policy "admin all rfqs" on rfqs for all to authenticated
  using (is_admin()) with check (is_admin());

create policy "admin all rfq items" on rfq_items for all to authenticated
  using (is_admin()) with check (is_admin());
