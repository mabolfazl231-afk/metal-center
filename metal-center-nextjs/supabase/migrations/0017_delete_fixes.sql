-- 0017: امکان حذف محصول و کارخانه
-- قبلاً قیدهای کلید خارجی اجازه‌ی حذف نمی‌دادند:
--   * daily_prices.product_id بدون cascade بود، پس محصول دارای تاریخچه‌ی قیمت حذف نمی‌شد.
--   * products.factory_id بدون on delete بود، پس کارخانه‌ی دارای محصول حذف نمی‌شد.
-- این migration را یک‌بار در Supabase اجرا کنید (بعد از 0016).

-- تاریخچه‌ی قیمت با حذف محصول پاک شود
do $$
declare r record;
begin
  for r in
    select conname from pg_constraint
    where contype = 'f'
      and conrelid = 'public.daily_prices'::regclass
      and confrelid = 'public.products'::regclass
  loop
    execute format('alter table public.daily_prices drop constraint %I', r.conname);
  end loop;
end $$;

alter table public.daily_prices
  add constraint daily_prices_product_id_fkey
  foreign key (product_id) references public.products(id) on delete cascade;

-- محصولات کارخانه‌ی حذف‌شده، بدون کارخانه بمانند (خودِ محصول حذف نمی‌شود)
do $$
declare r record;
begin
  for r in
    select conname from pg_constraint
    where contype = 'f'
      and conrelid = 'public.products'::regclass
      and confrelid = 'public.factories'::regclass
  loop
    execute format('alter table public.products drop constraint %I', r.conname);
  end loop;
end $$;

alter table public.products
  add constraint products_factory_id_fkey
  foreign key (factory_id) references public.factories(id) on delete set null;
