-- 0014: بنر و متن هر صفحه‌ی سایت، صفحه‌های جدید، و عکس خدمات
-- این فایل را یک‌بار در Supabase SQL Editor اجرا کن. دوباره اجرا کردنش مشکلی ندارد.

alter table public.services
  add column if not exists image_url text;

create table if not exists public.site_pages (
  key text primary key,
  title text not null default '',
  subtitle text not null default '',
  body text not null default '',
  banner_url text,
  published boolean not null default true,
  updated_at timestamptz not null default now()
);

alter table public.site_pages enable row level security;

drop policy if exists "public read published pages" on public.site_pages;
create policy "public read published pages" on public.site_pages
  for select using (published = true);

drop policy if exists "admin manages pages" on public.site_pages;
create policy "admin manages pages" on public.site_pages
  for all to authenticated using (is_admin()) with check (is_admin());
