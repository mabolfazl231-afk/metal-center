-- ============================================================
-- 0016 — پنل خریدار، فاز ۲: پیش‌فاکتور، سفارش، پیگیری، اعلان، پیام به کارشناس
-- پیش‌نیاز: 0015 باید قبلاً اجرا شده باشد.
-- این فایل را یک‌بار در Supabase > SQL Editor اجرا کنید.
-- ============================================================

-- ---------- کد یکتا برای پیش‌فاکتور و سفارش ----------
create or replace function public.new_code(prefix text) returns text
language sql volatile as $$
  select prefix || '-' || to_char(now(), 'YYMMDD') || '-' || upper(substr(md5(random()::text || clock_timestamp()::text), 1, 6));
$$;

-- ---------- جدول‌ها ----------
create table if not exists public.proformas (
  id uuid primary key default gen_random_uuid(),
  code text not null unique default public.new_code('PF'),
  rfq_id uuid not null references public.rfqs(id) on delete cascade,
  user_id uuid references auth.users(id) on delete set null,
  status text not null default 'draft' check (status in ('draft', 'sent', 'accepted', 'rejected')),
  subtotal bigint not null default 0,
  vat_percent numeric not null default 10,
  vat_amount bigint not null default 0,
  total bigint not null default 0,
  valid_until date,
  note text,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);
create index if not exists proformas_rfq_idx on public.proformas(rfq_id);

create table if not exists public.proforma_items (
  id uuid primary key default gen_random_uuid(),
  proforma_id uuid not null references public.proformas(id) on delete cascade,
  product_name text not null,
  size text,
  quantity text,
  line_total bigint not null default 0,
  sort_order int default 0
);
create index if not exists proforma_items_pf_idx on public.proforma_items(proforma_id);

create table if not exists public.orders (
  id uuid primary key default gen_random_uuid(),
  code text not null unique default public.new_code('SO'),
  proforma_id uuid unique references public.proformas(id) on delete set null,
  rfq_id uuid references public.rfqs(id) on delete set null,
  user_id uuid references auth.users(id) on delete set null,
  status text not null default 'confirmed' check (status in ('confirmed', 'preparing', 'shipped', 'delivered', 'cancelled')),
  total bigint not null default 0,
  shipping_address text,
  carrier text,
  tracking_code text,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);
create index if not exists orders_user_idx on public.orders(user_id);

create table if not exists public.order_status_log (
  id bigserial primary key,
  order_id uuid not null references public.orders(id) on delete cascade,
  from_status text,
  to_status text not null,
  created_at timestamptz default now()
);
create index if not exists order_status_log_order_idx on public.order_status_log(order_id);

create table if not exists public.support_messages (
  id bigserial primary key,
  rfq_id uuid not null references public.rfqs(id) on delete cascade,
  user_id uuid references auth.users(id) on delete set null,
  from_admin boolean not null default false,
  body text not null,
  created_at timestamptz default now()
);
create index if not exists support_messages_rfq_idx on public.support_messages(rfq_id);

create table if not exists public.notifications (
  id bigserial primary key,
  user_id uuid not null references auth.users(id) on delete cascade,
  title text not null,
  body text,
  link text,
  read_at timestamptz,
  created_at timestamptz default now()
);
create index if not exists notifications_user_idx on public.notifications(user_id, created_at desc);

-- ---------- RLS ----------
alter table public.proformas enable row level security;
alter table public.proforma_items enable row level security;
alter table public.orders enable row level security;
alter table public.order_status_log enable row level security;
alter table public.support_messages enable row level security;
alter table public.notifications enable row level security;

-- پیش‌نویس‌های ادمین برای مشتری دیده نمی‌شود
drop policy if exists "owner reads sent proformas" on public.proformas;
create policy "owner reads sent proformas" on public.proformas
  for select to authenticated using (user_id = auth.uid() and status <> 'draft');

drop policy if exists "admin all proformas" on public.proformas;
create policy "admin all proformas" on public.proformas
  for all to authenticated using (public.is_admin()) with check (public.is_admin());

drop policy if exists "owner reads proforma items" on public.proforma_items;
create policy "owner reads proforma items" on public.proforma_items
  for select to authenticated using (
    exists (select 1 from public.proformas p where p.id = proforma_items.proforma_id and p.user_id = auth.uid() and p.status <> 'draft')
  );

drop policy if exists "admin all proforma items" on public.proforma_items;
create policy "admin all proforma items" on public.proforma_items
  for all to authenticated using (public.is_admin()) with check (public.is_admin());

drop policy if exists "owner reads orders" on public.orders;
create policy "owner reads orders" on public.orders
  for select to authenticated using (user_id = auth.uid());

drop policy if exists "admin all orders" on public.orders;
create policy "admin all orders" on public.orders
  for all to authenticated using (public.is_admin()) with check (public.is_admin());

drop policy if exists "owner reads order log" on public.order_status_log;
create policy "owner reads order log" on public.order_status_log
  for select to authenticated using (
    exists (select 1 from public.orders o where o.id = order_status_log.order_id and o.user_id = auth.uid())
  );

drop policy if exists "admin all order log" on public.order_status_log;
create policy "admin all order log" on public.order_status_log
  for all to authenticated using (public.is_admin()) with check (public.is_admin());

drop policy if exists "owner reads support" on public.support_messages;
create policy "owner reads support" on public.support_messages
  for select to authenticated using (user_id = auth.uid());

drop policy if exists "owner sends support" on public.support_messages;
create policy "owner sends support" on public.support_messages
  for insert to authenticated with check (
    user_id = auth.uid() and from_admin = false
    and exists (select 1 from public.rfqs r where r.id = support_messages.rfq_id and r.user_id = auth.uid())
  );

drop policy if exists "admin all support" on public.support_messages;
create policy "admin all support" on public.support_messages
  for all to authenticated using (public.is_admin()) with check (public.is_admin());

drop policy if exists "owner reads notifications" on public.notifications;
create policy "owner reads notifications" on public.notifications
  for select to authenticated using (user_id = auth.uid());

drop policy if exists "owner marks notifications" on public.notifications;
create policy "owner marks notifications" on public.notifications
  for update to authenticated using (user_id = auth.uid()) with check (user_id = auth.uid());

-- ---------- اعلان‌ها (فقط از داخل تریگرها ساخته می‌شوند) ----------
create or replace function public.notify_user(uid uuid, ttl text, bd text, lnk text) returns void
language sql security definer set search_path = public as $$
  insert into public.notifications (user_id, title, body, link) values (uid, ttl, bd, lnk);
$$;

-- تریگر استعلام: اضافه شدن اعلان به تغییر وضعیت (تریگر قبلی جایگزین می‌شود)
create or replace function public.log_rfq_status() returns trigger
language plpgsql security definer set search_path = public as $$
begin
  if tg_op = 'INSERT' then
    insert into public.rfq_status_log (rfq_id, from_status, to_status, changed_by)
    values (new.id, null, new.status, auth.uid());
  elsif new.status is distinct from old.status then
    insert into public.rfq_status_log (rfq_id, from_status, to_status, changed_by)
    values (new.id, old.status, new.status, auth.uid());
    if new.user_id is not null then
      perform public.notify_user(new.user_id, 'وضعیت استعلام ' || new.code || ' تغییر کرد', 'برای جزئیات وارد پنل شوید.', '/panel');
    end if;
  end if;
  return null;
end $$;

-- پیش‌فاکتور ارسال شد: اعلان به مشتری و استعلام «قیمت‌گذاری شد» می‌شود
create or replace function public.proforma_notify() returns trigger
language plpgsql security definer set search_path = public as $$
begin
  if new.status = 'sent' and old.status is distinct from 'sent' then
    if new.user_id is not null then
      perform public.notify_user(new.user_id, 'پیش‌فاکتور ' || new.code || ' آماده است', 'برای بررسی و تأیید وارد پنل شوید.', '/panel');
    end if;
    update public.rfqs set status = 'quoted'
    where id = new.rfq_id and status in ('submitted', 'reviewing');
  end if;
  return null;
end $$;

drop trigger if exists proformas_notify_trg on public.proformas;
create trigger proformas_notify_trg
  after update of status on public.proformas
  for each row execute function public.proforma_notify();

-- سفارش: ثبت اولیه، تغییر وضعیت، و اعلان به مشتری
create or replace function public.order_status_fn() returns trigger
language plpgsql security definer set search_path = public as $$
begin
  if tg_op = 'INSERT' then
    insert into public.order_status_log (order_id, from_status, to_status) values (new.id, null, new.status);
    if new.user_id is not null then
      perform public.notify_user(new.user_id, 'سفارش ' || new.code || ' ثبت شد', 'سفارش شما ثبت و تأیید شد.', '/panel');
    end if;
  elsif new.status is distinct from old.status then
    insert into public.order_status_log (order_id, from_status, to_status) values (new.id, old.status, new.status);
    if new.user_id is not null then
      perform public.notify_user(new.user_id, 'وضعیت سفارش ' || new.code || ' تغییر کرد', 'جزئیات و کد پیگیری را در پنل ببینید.', '/panel');
    end if;
  end if;
  return null;
end $$;

drop trigger if exists orders_status_trg on public.orders;
create trigger orders_status_trg
  after insert or update of status on public.orders
  for each row execute function public.order_status_fn();

-- پیام کارشناس به مشتری: اعلان
create or replace function public.support_notify() returns trigger
language plpgsql security definer set search_path = public as $$
begin
  if new.from_admin and new.user_id is not null then
    perform public.notify_user(new.user_id, 'پیام جدید از کارشناس', left(new.body, 120), '/panel');
  end if;
  return null;
end $$;

drop trigger if exists support_notify_trg on public.support_messages;
create trigger support_notify_trg
  after insert on public.support_messages
  for each row execute function public.support_notify();

-- ---------- پاسخ مشتری به پیش‌فاکتور ----------
-- تأیید: ساخت سفارش با نشانی تحویل؛ رد: فقط وضعیت. هر دو فقط برای صاحب پیش‌فاکتور و فقط وقتی وضعیت «sent» باشد.
create or replace function public.respond_proforma(p_id uuid, p_accept boolean, p_address text default null)
returns uuid
language plpgsql security definer set search_path = public as $$
declare
  pf public.proformas%rowtype;
  new_order uuid;
begin
  select * into pf from public.proformas where id = p_id for update;
  if not found or pf.user_id is distinct from auth.uid() then
    raise exception 'دسترسی به این پیش‌فاکتور ندارید.';
  end if;
  if pf.status <> 'sent' then
    raise exception 'این پیش‌فاکتور دیگر قابل پاسخ نیست.';
  end if;
  if pf.valid_until is not null and pf.valid_until < current_date then
    raise exception 'اعتبار این پیش‌فاکتور تمام شده است.';
  end if;

  if not p_accept then
    update public.proformas set status = 'rejected', updated_at = now() where id = p_id;
    return null;
  end if;

  if p_address is null or length(trim(p_address)) < 10 then
    raise exception 'نشانی تحویل را کامل وارد کنید.';
  end if;

  update public.proformas set status = 'accepted', updated_at = now() where id = p_id;
  insert into public.orders (proforma_id, rfq_id, user_id, total, shipping_address, status)
  values (pf.id, pf.rfq_id, pf.user_id, pf.total, trim(p_address), 'confirmed')
  returning id into new_order;
  return new_order;
end $$;

grant execute on function public.respond_proforma(uuid, boolean, text) to authenticated;
