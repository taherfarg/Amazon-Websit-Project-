-- Create orders table
create table if not exists orders (
  id uuid default gen_random_uuid() primary key,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  user_id uuid references auth.users(id),
  total_amount numeric not null,
  currency text default 'AED',
  status text default 'pending',
  payment_status text default 'pending',
  shipping_details jsonb not null
);

-- Create order items table
create table if not exists order_items (
  id uuid default gen_random_uuid() primary key,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  order_id uuid references orders(id) on delete cascade not null,
  product_id bigint references products(id) not null,
  quantity integer not null,
  price_at_purchase numeric not null
);

-- RLS Policies (Basic)
alter table orders enable row level security;
alter table order_items enable row level security;

-- Allow public insert for guest checkout (be careful with this in production, better to use edge functions or specific rules)
create policy "Allow public insert to orders"
  on orders for insert
  with check (true);

create policy "Allow public insert to order_items"
  on order_items for insert
  with check (true);

create policy "Allow users to view their own orders"
  on orders for select
  using (auth.uid() = user_id);
