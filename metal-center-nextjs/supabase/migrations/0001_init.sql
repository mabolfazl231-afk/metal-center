-- متال سنتر — Migration اولیه (مرحله ۱۱)
-- این فایل رو کامل کپی کن و توی Supabase → SQL Editor → New query پیست کن، بعد Run بزن.
-- طبق "Database & Entity Model" سند اصلی پروژه: UUID keys, Entity-first, audit-ready.

-- ===================== دسته‌بندی محصولات =====================
create table categories (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  slug text unique not null,
  created_at timestamptz default now()
);

-- ===================== کارخانه‌ها =====================
create table factories (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  slug text unique not null,
  location text,
  verified boolean default false,
  founded_year int,
  description text,
  created_at timestamptz default now()
);

-- ===================== محصولات =====================
create table products (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  slug text unique not null,
  category_id uuid references categories(id),
  factory_id uuid references factories(id),
  standard text,          -- مثلاً A3, DIN
  size text,               -- مثلاً 14mm
  unit text default 'kg',
  in_stock boolean default true,
  visible boolean default true,
  created_at timestamptz default now()
);

-- ===================== قیمت روزانه =====================
create table daily_prices (
  id uuid primary key default gen_random_uuid(),
  product_id uuid references products(id) not null,
  price numeric not null,
  change_percent numeric default 0,
  recorded_at timestamptz default now()
);

-- ===================== استعلام قیمت (RFQ) =====================
create table rfqs (
  id uuid primary key default gen_random_uuid(),
  customer_name text not null,
  customer_phone text not null,
  customer_email text,
  method text check (method in ('upload', 'manual')) not null,
  notes text,
  status text check (status in ('pending', 'review', 'done')) default 'pending',
  assigned_expert text,
  created_at timestamptz default now()
);

-- ردیف‌های هر استعلام (برای فرم دستی)
create table rfq_items (
  id uuid primary key default gen_random_uuid(),
  rfq_id uuid references rfqs(id) on delete cascade,
  product_name text not null,
  size text,
  quantity text,
  unit text,
  standard text
);

-- ===================== مقالات مرکز دانش =====================
create table articles (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  slug text unique not null,
  category text,
  content text,
  published boolean default false,
  created_at timestamptz default now()
);

-- ===================== فعال‌سازی Row Level Security =====================
alter table categories enable row level security;
alter table factories enable row level security;
alter table products enable row level security;
alter table daily_prices enable row level security;
alter table rfqs enable row level security;
alter table rfq_items enable row level security;
alter table articles enable row level security;

-- محصولات، کارخانه‌ها، قیمت‌ها و مقالات منتشرشده برای همه (حتی مهمان) قابل خواندنند
create policy "public read categories" on categories for select using (true);
create policy "public read factories" on factories for select using (true);
create policy "public read products" on products for select using (visible = true);
create policy "public read prices" on daily_prices for select using (true);
create policy "public read published articles" on articles for select using (published = true);

-- هرکسی (حتی مهمان) می‌تونه استعلام قیمت ثبت کنه، ولی فقط نتیجه خودش رو نمی‌بینه
-- (خوندن RFQها بعداً وقتی احراز هویت اضافه شد، به کاربر/ادمین محدود می‌شود)
create policy "anyone can submit rfq" on rfqs for insert with check (true);
create policy "anyone can submit rfq items" on rfq_items for insert with check (true);

-- ===================== داده نمونه برای تست =====================
insert into categories (name, slug) values
  ('میلگرد', 'rebar'),
  ('تیرآهن', 'i-beam'),
  ('ورق', 'sheet'),
  ('پروفیل', 'profile');

insert into factories (name, slug, location, verified, founded_year) values
  ('ذوب آهن اصفهان', 'zob-ahan-isfahan', 'اصفهان، ایران', true, 1976),
  ('فولاد مبارکه', 'foolad-mobarakeh', 'مبارکه، اصفهان', true, 1993);

-- محصول نمونه (بعد از اجرای بالا، شناسه دسته و کارخانه رو با subquery پر می‌کنیم)
insert into products (name, slug, category_id, factory_id, standard, size, in_stock)
select 'میلگرد A3 سایز ۱۴', 'rebar-a3-14',
  (select id from categories where slug = 'rebar'),
  (select id from factories where slug = 'zob-ahan-isfahan'),
  'A3', '14mm', true;

insert into daily_prices (product_id, price, change_percent)
select id, 29850, 1.2 from products where slug = 'rebar-a3-14';
