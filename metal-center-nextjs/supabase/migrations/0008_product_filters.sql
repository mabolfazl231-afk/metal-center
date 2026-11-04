-- 0008: فیلترهای لیست قیمت — گرید، محل بارگیری و واحد قیمت هر محصول
-- بعد از 0007 در SQL Editor اجرا کن.

alter table public.products
  add column if not exists grade text not null default '';

alter table public.products
  add column if not exists loading_place text not null default '';

alter table public.products
  add column if not exists price_unit text not null default 'تومان / کیلوگرم';
