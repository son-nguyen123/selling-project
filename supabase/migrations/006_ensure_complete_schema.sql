-- ============================================================
-- Migration 006: Ensure complete schema (idempotent)
-- Run this in Supabase SQL editor to create all missing tables
-- and columns required by the application.
-- ============================================================

-- 1. Add balance column to profiles if missing
ALTER TABLE public.profiles
  ADD COLUMN IF NOT EXISTS balance INTEGER NOT NULL DEFAULT 0 CHECK (balance >= 0);

-- 2. Add missing store_products columns
ALTER TABLE store_products
  ADD COLUMN IF NOT EXISTS single_image TEXT,
  ADD COLUMN IF NOT EXISTS demo_video_url TEXT,
  ADD COLUMN IF NOT EXISTS demo_urls JSONB,
  ADD COLUMN IF NOT EXISTS gallery_urls TEXT[],
  ADD COLUMN IF NOT EXISTS single_image_url TEXT;

-- 3. Admin settings table (stores key-value pairs like QR image URL)
CREATE TABLE IF NOT EXISTS public.admin_settings (
  id    SERIAL PRIMARY KEY,
  key   TEXT NOT NULL UNIQUE,
  value TEXT
);

-- Seed default QR image row
INSERT INTO public.admin_settings (key, value) VALUES ('qr_image', NULL)
  ON CONFLICT (key) DO NOTHING;

-- RLS for admin_settings: anyone can read, no direct client writes
ALTER TABLE public.admin_settings ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Public can read admin_settings" ON public.admin_settings;
CREATE POLICY "Public can read admin_settings"
  ON public.admin_settings FOR SELECT
  USING (true);

-- 4. Transaction history table
CREATE TABLE IF NOT EXISTS public.transactions (
  id         SERIAL PRIMARY KEY,
  user_id    UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  amount     INTEGER NOT NULL,
  type       TEXT NOT NULL CHECK (type IN ('deposit', 'payment', 'refund', 'topup')),
  status     TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'completed', 'rejected')),
  note       TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- RLS for transactions: users can view their own
ALTER TABLE public.transactions ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can view own transactions" ON public.transactions;
CREATE POLICY "Users can view own transactions"
  ON public.transactions FOR SELECT
  USING (auth.uid() = user_id);
