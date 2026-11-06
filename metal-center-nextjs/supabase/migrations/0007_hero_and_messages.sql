-- 0007: بنرهای صفحه‌ی اصلی + پیام‌های فرم تماس
-- این فایل را یک‌بار در SQL Editor اجرا کن (بعد از 0002 و 0005 و 0006).

-- ===================== بنرهای هیرو =====================
create table if not exists public.hero_slides (
  id uuid primary key default gen_random_uuid(),
  eyebrow text not null default '',
  title text not null,
  description text not null default '',
  primary_label text not null default 'لیست قیمت',
  primary_href text not null default '/prices',
  secondary_label text not null default '',
  secondary_href text not null default '/',
  image_url text,                    -- مثلاً /banners/hero-1.jpg (اختیاری)
  sort_order int not null default 0,
  active boolean not null default true,
  created_at timestamptz default now()
);

alter table public.hero_slides enable row level security;

drop policy if exists "public read active slides" on public.hero_slides;
create policy "public read active slides" on public.hero_slides
  for select using (active = true);

drop policy if exists "admin manages slides" on public.hero_slides;
create policy "admin manages slides" on public.hero_slides
  for all using (public.is_admin()) with check (public.is_admin());

-- بنرهای اولیه؛ فقط اگر جدول خالی باشد
insert into public.hero_slides (eyebrow, title, description, primary_label, primary_href, secondary_label, secondary_href, image_url, sort_order)
select * from (values
  ('قیمت‌ها هر ۱۵ دقیقه به‌روزرسانی می‌شوند', 'فولاد را هوشمندانه بخرید، بفروشید و مدیریت کنید', 'قیمت لحظه‌ای، استعلام آنی با آپلود فایل، و شبکه‌ای معتبر از کارخانه‌ها — همه در یک پلتفرم.', 'لیست قیمت', '/prices', 'استعلام هوشمند', '/rfq', '/banners/hero-1.jpg', 1),
  ('✦ جدید — دستیار هوشمند فولاد', 'از Metal AI برای انتخاب محصول کمک بگیرید', 'سوال بپرسید، بهترین سایز و استاندارد را پیدا کنید، و مستقیم درخواست استعلام ثبت کنید.', 'شروع گفتگو با Metal AI', '/assistant', 'مشاهده محصولات', '/products', '/banners/hero-2.jpg', 2),
  ('شبکه‌ی معتبر کارخانه‌ها', 'مستقیم از ۲۴۰+ کارخانه تأییدشده خرید کنید', 'بدون واسطه، با قیمت شفاف و گواهی استاندارد معتبر برای هر محصول.', 'مشاهده کارخانه‌ها', '/factories', 'درباره ما', '/about', '/banners/hero-3.jpg', 3)
) as v(eyebrow, title, description, primary_label, primary_href, secondary_label, secondary_href, image_url, sort_order)
where not exists (select 1 from public.hero_slides);

-- ===================== پیام‌های فرم تماس =====================
create table if not exists public.contact_messages (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  phone text not null,
  message text not null,
  is_read boolean not null default false,
  created_at timestamptz default now()
);

alter table public.contact_messages enable row level security;

-- هرکسی می‌تواند پیام بفرستد، ولی فقط ادمین می‌بیند
drop policy if exists "anyone can send contact message" on public.contact_messages;
create policy "anyone can send contact message" on public.contact_messages
  for insert with check (true);

drop policy if exists "admin reads contact messages" on public.contact_messages;
create policy "admin reads contact messages" on public.contact_messages
  for select using (public.is_admin());

drop policy if exists "admin updates contact messages" on public.contact_messages;
create policy "admin updates contact messages" on public.contact_messages
  for update using (public.is_admin()) with check (public.is_admin());

drop policy if exists "admin deletes contact messages" on public.contact_messages;
create policy "admin deletes contact messages" on public.contact_messages
  for delete using (public.is_admin());
