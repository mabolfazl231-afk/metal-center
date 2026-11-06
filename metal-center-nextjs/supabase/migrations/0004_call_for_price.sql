-- ستون «قیمت تماس بگیرید» برای هر محصول (یک‌بار اجرا شود)
alter table products add column if not exists call_for_price boolean not null default false;
