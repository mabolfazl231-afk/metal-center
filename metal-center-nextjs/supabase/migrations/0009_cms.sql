-- 0009: مدیریت محتوای سایت (CMS)
-- این فایل را یک‌بار در SQL Editor اجرا کن (بعد از 0007 و 0008).
-- اگر جدولی از قبل بوده باشد، دوباره اجرا کردن بی‌خطر است.

-- ===================== تنظیمات کلی (تماس، شبکه‌های اجتماعی، ساعات کاری، SEO) =====================
create table if not exists public.site_settings (
  key text primary key,
  value jsonb not null default '{}'::jsonb,
  updated_at timestamptz default now()
);

alter table public.site_settings enable row level security;

drop policy if exists "public read settings" on public.site_settings;
create policy "public read settings" on public.site_settings
  for select using (true);

drop policy if exists "admin manages settings" on public.site_settings;
create policy "admin manages settings" on public.site_settings
  for all using (public.is_admin()) with check (public.is_admin());

-- ===================== آیتم‌های منو (فعلاً منوی فوتر) =====================
create table if not exists public.menu_items (
  id uuid primary key default gen_random_uuid(),
  location text not null default 'footer',
  label text not null,
  href text not null default '/',
  sort_order int not null default 0,
  active boolean not null default true,
  created_at timestamptz default now()
);

alter table public.menu_items enable row level security;

drop policy if exists "public read active menu" on public.menu_items;
create policy "public read active menu" on public.menu_items
  for select using (active = true);

drop policy if exists "admin manages menu" on public.menu_items;
create policy "admin manages menu" on public.menu_items
  for all using (public.is_admin()) with check (public.is_admin());

-- ===================== خدمات =====================
create table if not exists public.services (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  description text not null default '',
  icon text not null default 'Wrench',
  sort_order int not null default 0,
  active boolean not null default true,
  created_at timestamptz default now()
);

alter table public.services enable row level security;

drop policy if exists "public read active services" on public.services;
create policy "public read active services" on public.services
  for select using (active = true);

drop policy if exists "admin manages services" on public.services;
create policy "admin manages services" on public.services
  for all using (public.is_admin()) with check (public.is_admin());

-- ===================== مقالات مرکز دانش =====================
create table if not exists public.articles (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  excerpt text not null default '',
  body text not null default '',
  tag text not null default 'راهنمای خرید',
  read_minutes int not null default 5,
  cover_url text,
  sort_order int not null default 0,
  published boolean not null default true,
  created_at timestamptz default now()
);

alter table public.articles enable row level security;

drop policy if exists "public read published articles" on public.articles;
create policy "public read published articles" on public.articles
  for select using (published = true);

drop policy if exists "admin manages articles" on public.articles;
create policy "admin manages articles" on public.articles
  for all using (public.is_admin()) with check (public.is_admin());

-- ===================== مخزن رسانه (عکس و PDF) =====================
insert into storage.buckets (id, name, public)
values ('media', 'media', true)
on conflict (id) do nothing;

drop policy if exists "public read media" on storage.objects;
create policy "public read media" on storage.objects
  for select using (bucket_id = 'media');

drop policy if exists "admin uploads media" on storage.objects;
create policy "admin uploads media" on storage.objects
  for insert with check (bucket_id = 'media' and public.is_admin());

drop policy if exists "admin updates media" on storage.objects;
create policy "admin updates media" on storage.objects
  for update using (bucket_id = 'media' and public.is_admin());

drop policy if exists "admin deletes media" on storage.objects;
create policy "admin deletes media" on storage.objects
  for delete using (bucket_id = 'media' and public.is_admin());
