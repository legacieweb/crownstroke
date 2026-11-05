-- Admin-managed limited edition catalog.
CREATE TABLE IF NOT EXISTS limited_edition_products (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  description TEXT NOT NULL DEFAULT '',
  price DOUBLE PRECISION NOT NULL,
  front_image TEXT NOT NULL,
  back_image TEXT NOT NULL,
  extra_images JSONB NOT NULL DEFAULT '[]'::jsonb,
  created_at TIMESTAMP NOT NULL DEFAULT NOW()
);
