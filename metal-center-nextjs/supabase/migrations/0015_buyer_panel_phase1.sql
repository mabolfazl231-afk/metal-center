-- ============================================================
-- 0015 — پنل خریدار، فاز ۱
-- ۱) پروفایل خریدار   ۲) کد یکتای استعلام   ۳) وضعیت‌های جدید + تاریخچه
-- ۴) قفل دسترسی: هر مشتری فقط استعلام‌ها و ردیف‌های خودش را می‌بیند
-- این فایل را یک‌بار در Supabase > SQL Editor اجرا کنید.
-- ============================================================

-- ---------- ۱) پروفایل خریدار ----------
create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  full_name text,
  mobile text,
  company text,
  city text,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

alter table public.profiles enable row level security;

drop policy if exists "own profile read" on public.profiles;
create policy "own profile read" on public.profiles
  for select to authenticated using (id = auth.uid());

drop policy if exists "own profile insert" on public.profiles;
create policy "own profile insert" on public.profiles
  for insert to authenticated with check (id = auth.uid());

drop policy if exists "own profile update" on public.profiles;
create policy "own profile update" on public.profiles
  for update to authenticated using (id = auth.uid()) with check (id = auth.uid());

drop policy if exists "admin all profiles" on public.profiles;
create policy "admin all profiles" on public.profiles
  for all to authenticated using (public.is_admin()) with check (public.is_admin());

-- ---------- ۲) استعلام به کاربر وصل می‌شود + کد یکتا ----------
alter table public.rfqs add column if not exists user_id uuid references auth.users(id) on delete set null;
alter table public.rfqs add column if not exists code text;
create index if not exists rfqs_user_id_idx on public.rfqs(user_id);

create or replace function public.new_rfq_code() returns text
language sql volatile as $$
  select 'MC-' || to_char(now(), 'YYMMDD') || '-' || upper(substr(md5(random()::text || clock_timestamp()::text), 1, 6));
$$;

update public.rfqs
set code = 'MC-' || to_char(created_at, 'YYMMDD') || '-' || upper(substr(id::text, 1, 6))
where code is null;

alter table public.rfqs alter column code set default public.new_rfq_code();
create unique index if not exists rfqs_code_key on public.rfqs(code);
alter table public.rfqs alter column code set not null;

-- ---------- ۳) وضعیت‌های جدید ----------
-- حذف هر CHECK قدیمی روی ستون status (نام آن در پروژه‌های مختلف فرق می‌کند)
do $$
declare r record;
begin
  for r in
    select conname from pg_constraint
    where conrelid = 'public.rfqs'::regclass and contype = 'c'
      and pg_get_constraintdef(oid) ilike '%status%'
  loop
    execute format('alter table public.rfqs drop constraint %I', r.conname);
  end loop;
end $$;

update public.rfqs set status = 'submitted' where status = 'pending';
update public.rfqs set status = 'reviewing' where status = 'review';
update public.rfqs set status = 'closed'    where status = 'done';

alter table public.rfqs alter column status set default 'submitted';
alter table public.rfqs add constraint rfqs_status_check
  check (status in ('submitted', 'reviewing', 'quoted', 'closed', 'cancelled'));

-- تاریخچه‌ی تغییر وضعیت (خودکار با تریگر ثبت می‌شود)
create table if not exists public.rfq_status_log (
  id bigserial primary key,
  rfq_id uuid not null references public.rfqs(id) on delete cascade,
  from_status text,
  to_status text not null,
  changed_by uuid,
  created_at timestamptz default now()
);
create index if not exists rfq_status_log_rfq_idx on public.rfq_status_log(rfq_id);

alter table public.rfq_status_log enable row level security;

drop policy if exists "owner reads status log" on public.rfq_status_log;
create policy "owner reads status log" on public.rfq_status_log
  for select to authenticated using (
    exists (select 1 from public.rfqs r where r.id = rfq_status_log.rfq_id and r.user_id = auth.uid())
  );

drop policy if exists "admin all status log" on public.rfq_status_log;
create policy "admin all status log" on public.rfq_status_log
  for all to authenticated using (public.is_admin()) with check (public.is_admin());

create or replace function public.log_rfq_status() returns trigger
language plpgsql security definer set search_path = public as $$
begin
  if tg_op = 'INSERT' then
    insert into public.rfq_status_log (rfq_id, from_status, to_status, changed_by)
    values (new.id, null, new.status, auth.uid());
  elsif new.status is distinct from old.status then
    insert into public.rfq_status_log (rfq_id, from_status, to_status, changed_by)
    values (new.id, old.status, new.status, auth.uid());
  end if;
  return null;
end $$;

drop trigger if exists rfq_status_log_trg on public.rfqs;
create trigger rfq_status_log_trg
  after insert or update of status on public.rfqs
  for each row execute function public.log_rfq_status();

-- ---------- ۴) قفل دسترسی ----------
-- ثبت استعلام فقط با ورود به حساب و فقط با user_id خود کاربر
drop policy if exists "anyone can submit rfq" on public.rfqs;
drop policy if exists "anyone can submit rfq items" on public.rfq_items;

drop policy if exists "customer inserts own rfq" on public.rfqs;
create policy "customer inserts own rfq" on public.rfqs
  for insert to authenticated with check (user_id = auth.uid());

drop policy if exists "customer reads own rfqs" on public.rfqs;
create policy "customer reads own rfqs" on public.rfqs
  for select to authenticated using (user_id = auth.uid());

drop policy if exists "customer inserts own rfq items" on public.rfq_items;
create policy "customer inserts own rfq items" on public.rfq_items
  for insert to authenticated with check (
    exists (select 1 from public.rfqs r where r.id = rfq_items.rfq_id and r.user_id = auth.uid())
  );

drop policy if exists "customer reads own rfq items" on public.rfq_items;
create policy "customer reads own rfq items" on public.rfq_items
  for select to authenticated using (
    exists (select 1 from public.rfqs r where r.id = rfq_items.rfq_id and r.user_id = auth.uid())
  );
