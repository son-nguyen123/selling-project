-- Store Products Table
CREATE TABLE IF NOT EXISTS store_products (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  price DECIMAL(10, 2) NOT NULL,
  description TEXT,
  category TEXT,
  stock INTEGER DEFAULT 0,
  dashboard_image_url TEXT,
  single_image_url TEXT,
  demo_video_url TEXT,
  gallery_urls TEXT[],
  specs JSONB,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Orders Table
CREATE TABLE IF NOT EXISTS orders (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id),
  customer_name TEXT,
  customer_email TEXT NOT NULL,
  items JSONB NOT NULL,
  total_price DECIMAL(10, 2),
  status TEXT DEFAULT 'new',
  payment_method TEXT DEFAULT 'simulated',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Product Reviews Table
CREATE TABLE IF NOT EXISTS product_reviews (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  product_id UUID REFERENCES store_products(id) ON DELETE CASCADE,
  user_id UUID REFERENCES auth.users(id),
  rating INTEGER CHECK (rating >= 1 AND rating <= 5),
  comment TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_orders_user_id ON orders(user_id);
CREATE INDEX IF NOT EXISTS idx_orders_status ON orders(status);
CREATE INDEX IF NOT EXISTS idx_product_reviews_product_id ON product_reviews(product_id);

-- Updated_at trigger function
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE OR REPLACE TRIGGER store_products_updated_at
  BEFORE UPDATE ON store_products
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE OR REPLACE TRIGGER orders_updated_at
  BEFORE UPDATE ON orders
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ==================== RLS ====================
ALTER TABLE store_products ENABLE ROW LEVEL SECURITY;
ALTER TABLE orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE product_reviews ENABLE ROW LEVEL SECURITY;

-- store_products: anyone can SELECT
CREATE POLICY "store_products_select_all"
  ON store_products FOR SELECT
  USING (true);

-- store_products: admin INSERT
CREATE POLICY "store_products_insert_admin"
  ON store_products FOR INSERT
  WITH CHECK (
    auth.uid() IS NOT NULL
    AND (SELECT email FROM auth.users WHERE id = auth.uid()) ~ '@admin.com$'
  );

-- store_products: admin UPDATE
CREATE POLICY "store_products_update_admin"
  ON store_products FOR UPDATE
  USING (
    auth.uid() IS NOT NULL
    AND (SELECT email FROM auth.users WHERE id = auth.uid()) ~ '@admin.com$'
  );

-- store_products: admin DELETE
CREATE POLICY "store_products_delete_admin"
  ON store_products FOR DELETE
  USING (
    auth.uid() IS NOT NULL
    AND (SELECT email FROM auth.users WHERE id = auth.uid()) ~ '@admin.com$'
  );

-- orders: users see their own orders
CREATE POLICY "orders_select_own"
  ON orders FOR SELECT
  USING (
    auth.uid() = user_id
    OR (
      auth.uid() IS NOT NULL
      AND (SELECT email FROM auth.users WHERE id = auth.uid()) ~ '@admin.com$'
    )
  );

-- orders: authenticated users can insert their own orders
CREATE POLICY "orders_insert_authenticated"
  ON orders FOR INSERT
  WITH CHECK (
    auth.uid() IS NOT NULL
    AND auth.uid() = user_id
  );

-- orders: admins can update
CREATE POLICY "orders_update_admin"
  ON orders FOR UPDATE
  USING (
    auth.uid() IS NOT NULL
    AND (SELECT email FROM auth.users WHERE id = auth.uid()) ~ '@admin.com$'
  );

-- product_reviews: anyone can SELECT
CREATE POLICY "product_reviews_select_all"
  ON product_reviews FOR SELECT
  USING (true);

-- product_reviews: authenticated users can INSERT their own
CREATE POLICY "product_reviews_insert_authenticated"
  ON product_reviews FOR INSERT
  WITH CHECK (
    auth.uid() IS NOT NULL
    AND auth.uid() = user_id
  );
