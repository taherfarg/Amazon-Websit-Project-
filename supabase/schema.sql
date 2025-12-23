-- Create products table
create table products (
  id bigint primary key generated always as identity,
  title_en text not null,
  title_ar text not null,
  description_en text,
  description_ar text,
  image_url text,
  affiliate_link text,
  category text,
  rating float,
  is_featured boolean default false,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Enable Row Level Security (RLS)
alter table products enable row level security;

-- Create policy to allow public read access
create policy "Public products are viewable by everyone."
  on products for select
  using ( true );
