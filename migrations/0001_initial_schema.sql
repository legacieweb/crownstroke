-- Crownstroke initial schema (matches src/db/schema.ts).
-- Applied through the key-scoped IyonicDB API as 0002_ensure_crownstroke_schema.

CREATE TABLE IF NOT EXISTS users (
  id TEXT PRIMARY KEY,
  email TEXT NOT NULL UNIQUE,
  password TEXT NOT NULL,
  name TEXT,
  role TEXT NOT NULL,
  plan TEXT NOT NULL DEFAULT 'free',
  shop_name TEXT,
  reset_token TEXT,
  reset_expires TIMESTAMP,
  created_at TIMESTAMP NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS designers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id TEXT NOT NULL,
  name TEXT NOT NULL,
  email TEXT NOT NULL,
  hero_image TEXT,
  created_at TIMESTAMP NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS shops (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  designer_id UUID NOT NULL REFERENCES designers(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  slug TEXT NOT NULL UNIQUE,
  description TEXT,
  created_at TIMESTAMP NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS designer_designs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  designer_id UUID NOT NULL REFERENCES designers(id) ON DELETE CASCADE,
  shop_id UUID NOT NULL REFERENCES shops(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  product_id TEXT NOT NULL,
  preview TEXT NOT NULL,
  design_data JSONB NOT NULL,
  is_featured TEXT NOT NULL DEFAULT 'false',
  is_editors_pick TEXT NOT NULL DEFAULT 'false',
  is_exclusive TEXT NOT NULL DEFAULT 'false',
  is_spring_collection TEXT NOT NULL DEFAULT 'false',
  is_minimalist TEXT NOT NULL DEFAULT 'false',
  is_flash_sale TEXT NOT NULL DEFAULT 'false',
  price DOUBLE PRECISION NOT NULL,
  created_at TIMESTAMP NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS site_settings (
  id TEXT PRIMARY KEY,
  bg_video_url TEXT
);

CREATE TABLE IF NOT EXISTS orders (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  customer_name TEXT NOT NULL,
  customer_email TEXT NOT NULL,
  shipping_address TEXT NOT NULL,
  city TEXT NOT NULL,
  country TEXT NOT NULL,
  total_amount DOUBLE PRECISION NOT NULL,
  deposit_amount DOUBLE PRECISION NOT NULL,
  balance_amount DOUBLE PRECISION NOT NULL,
  status TEXT NOT NULL DEFAULT 'pending',
  payment_status TEXT NOT NULL DEFAULT 'pending',
  payment_type TEXT NOT NULL,
  items JSONB NOT NULL,
  created_at TIMESTAMP NOT NULL DEFAULT NOW()
);
