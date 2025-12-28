-- Create products table with enhanced fields
create table if not exists products (
  id bigint primary key generated always as identity,
  title_en text not null,
  title_ar text not null,
  description_en text,
  description_ar text,
  image_url text,
  affiliate_link text,
  category text,
  rating float,
  price decimal(10, 2) default 0.00,
  original_price decimal(10, 2),
  discount_percent decimal(5, 2),
  currency varchar(10) default 'AED',
  brand text,
  asin varchar(20),
  review_count integer default 0,
  is_featured boolean default false,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Create product_images table for multiple images
create table if not exists product_images (
  id bigint primary key generated always as identity,
  product_id bigint references products(id) on delete cascade,
  image_url text not null,
  image_type varchar(50) default 'gallery',
  alt_text text,
  sort_order integer default 0,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Create product_reviews table for storing reviews
create table if not exists product_reviews (
  id bigint primary key generated always as identity,
  product_id bigint references products(id) on delete cascade,
  author text,
  rating float,
  title text,
  review_text text,
  review_date text,
  is_verified boolean default false,
  helpful_count integer default 0,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Enable Row Level Security (RLS)
alter table products enable row level security;
alter table product_images enable row level security;
alter table product_reviews enable row level security;

-- Create policies for public read access
create policy "Products are viewable by everyone"
  on products for select
  using (true);

create policy "Product images are viewable by everyone"
  on product_images for select
  using (true);

create policy "Product reviews are viewable by everyone"
  on product_reviews for select
  using (true);

-- Create indexes for better performance
create index if not exists idx_products_category on products(category);
create index if not exists idx_products_rating on products(rating);
create index if not exists idx_products_price on products(price);
create index if not exists idx_products_featured on products(is_featured);
create index if not exists idx_product_images_product on product_images(product_id);
create index if not exists idx_product_reviews_product on product_reviews(product_id);

-- Migration: Add new columns to existing table if they don't exist
-- Run these one by one if upgrading from old schema:
-- ALTER TABLE products ADD COLUMN IF NOT EXISTS price decimal(10, 2) default 0.00;
-- ALTER TABLE products ADD COLUMN IF NOT EXISTS original_price decimal(10, 2);
-- ALTER TABLE products ADD COLUMN IF NOT EXISTS discount_percent decimal(5, 2);
-- ALTER TABLE products ADD COLUMN IF NOT EXISTS currency varchar(10) default 'AED';
-- ALTER TABLE products ADD COLUMN IF NOT EXISTS brand text;
-- ALTER TABLE products ADD COLUMN IF NOT EXISTS asin varchar(20);
-- ALTER TABLE products ADD COLUMN IF NOT EXISTS review_count integer default 0;
-- ALTER TABLE products ADD COLUMN IF NOT EXISTS updated_at timestamp with time zone default timezone('utc'::text, now());
