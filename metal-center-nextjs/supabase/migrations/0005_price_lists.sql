-- لیست‌های قیمت (یک‌بار اجرا شود)
create table if not exists price_lists (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  list_date date default current_date,
  status text not null default 'draft' check (status in ('draft', 'published', 'archived')),
  created_at timestamptz default now()
);

create table if not exists price_list_items (
  id uuid primary key default gen_random_uuid(),
  price_list_id uuid not null references price_lists(id) on delete cascade,
  product_id uuid not null references products(id) on delete cascade,
  price numeric not null,
  unique (price_list_id, product_id)
);

alter table price_lists enable row level security;
alter table price_list_items enable row level security;

drop policy if exists "admin all price_lists" on price_lists;
create policy "admin all price_lists" on price_lists for all to authenticated using (public.is_admin()) with check (public.is_admin());

drop policy if exists "admin all price_list_items" on price_list_items;
create policy "admin all price_list_items" on price_list_items for all to authenticated using (public.is_admin()) with check (public.is_admin());
