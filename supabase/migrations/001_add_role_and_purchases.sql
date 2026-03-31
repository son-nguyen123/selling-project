-- Migration: Add role column to profiles and create purchases table
-- Run this in your Supabase SQL editor or via the Supabase CLI.

-- 1. Add role column to profiles table
ALTER TABLE profiles
  ADD COLUMN IF NOT EXISTS role TEXT NOT NULL DEFAULT 'user'
    CHECK (role IN ('admin', 'user'));

-- 2. Add email column to profiles if not already present
ALTER TABLE profiles
  ADD COLUMN IF NOT EXISTS email TEXT;

-- 3. Grant admin role to your admin accounts (replace with actual email addresses)
-- UPDATE profiles SET role = 'admin' WHERE id = (
--   SELECT id FROM auth.users WHERE email = 'admin@admin.com'
-- );

-- 4. Create purchases table for per-user purchase history
CREATE TABLE IF NOT EXISTS purchases (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id     UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  project_id  INT NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Index for fast per-user lookups
CREATE INDEX IF NOT EXISTS purchases_user_id_idx ON purchases(user_id);

-- Row Level Security: users can only see their own purchases
ALTER TABLE purchases ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own purchases"
  ON purchases FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own purchases"
  ON purchases FOR INSERT
  WITH CHECK (auth.uid() = user_id);
