-- ============================================================
-- Migration 005: Wallet system + product field additions
-- ============================================================

-- 1. Add missing product columns
ALTER TABLE store_products
  ADD COLUMN IF NOT EXISTS single_image TEXT,
  ADD COLUMN IF NOT EXISTS gallery_urls JSONB,
  ADD COLUMN IF NOT EXISTS demo_urls JSONB;

-- 2. User wallet balance
ALTER TABLE profiles
  ADD COLUMN IF NOT EXISTS balance INTEGER NOT NULL DEFAULT 0 CHECK (balance >= 0);

-- 3. Admin settings (stores QR image URL, etc.)
CREATE TABLE IF NOT EXISTS admin_settings (
  id   SERIAL PRIMARY KEY,
  key  TEXT NOT NULL UNIQUE,
  value TEXT
);

-- Default row for QR image
INSERT INTO admin_settings (key, value) VALUES ('qr_image', NULL)
  ON CONFLICT (key) DO NOTHING;

-- 4. Transaction history
CREATE TABLE IF NOT EXISTS transactions (
  id         SERIAL PRIMARY KEY,
  user_id    UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  amount     INTEGER NOT NULL,
  type       TEXT NOT NULL CHECK (type IN ('deposit', 'payment', 'refund', 'topup')),
  status     TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'completed', 'rejected')),
  note       TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- RLS for transactions
ALTER TABLE transactions ENABLE ROW LEVEL SECURITY;

-- Users can only see their own transactions
CREATE POLICY "Users can view own transactions"
  ON transactions FOR SELECT
  USING (auth.uid() = user_id);

-- Only service role / admin can insert/update transactions via RLS bypass
-- API routes use service role key (createAdminClient) for write operations

-- RLS for admin_settings: public read, no direct client write
ALTER TABLE admin_settings ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Public can read admin_settings"
  ON admin_settings FOR SELECT
  USING (true);
