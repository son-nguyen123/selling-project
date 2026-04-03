-- Migration 010: Ensure orders table exists with all required columns
-- This migration is idempotent and safe to run multiple times.

-- 1. Create the orders table if it does not exist
CREATE TABLE IF NOT EXISTS public.orders (
  id             UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id        UUID REFERENCES auth.users(id),
  customer_name  TEXT,
  customer_email TEXT NOT NULL,
  items          JSONB NOT NULL,
  total_price    DECIMAL(10, 2),
  status         TEXT DEFAULT 'new',
  payment_method TEXT DEFAULT 'simulated',
  created_at     TIMESTAMPTZ DEFAULT NOW(),
  updated_at     TIMESTAMPTZ DEFAULT NOW()
);

-- 2. Add any missing columns to an existing orders table
ALTER TABLE public.orders
  ADD COLUMN IF NOT EXISTS customer_email TEXT,
  ADD COLUMN IF NOT EXISTS customer_name TEXT,
  ADD COLUMN IF NOT EXISTS items JSONB,
  ADD COLUMN IF NOT EXISTS total_price DECIMAL(10, 2),
  ADD COLUMN IF NOT EXISTS status TEXT DEFAULT 'new',
  ADD COLUMN IF NOT EXISTS payment_method TEXT DEFAULT 'simulated',
  ADD COLUMN IF NOT EXISTS updated_at TIMESTAMPTZ DEFAULT NOW();

-- Enforce NOT NULL on required columns (safe if already set)
ALTER TABLE public.orders
  ALTER COLUMN customer_email SET NOT NULL,
  ALTER COLUMN items SET NOT NULL;

-- 3. Ensure indexes exist
CREATE INDEX IF NOT EXISTS idx_orders_user_id ON public.orders(user_id);
CREATE INDEX IF NOT EXISTS idx_orders_status ON public.orders(status);

-- 4. Enable RLS if not already enabled
ALTER TABLE public.orders ENABLE ROW LEVEL SECURITY;

-- 5. Recreate RLS policies (idempotent)
DROP POLICY IF EXISTS "orders_select_own" ON public.orders;
CREATE POLICY "orders_select_own"
  ON public.orders FOR SELECT
  USING (
    auth.uid() = user_id
    OR (
      auth.uid() IS NOT NULL
      AND (SELECT email FROM auth.users WHERE id = auth.uid()) ~ '@admin.com$'
    )
  );

-- Allow service role inserts (server-side API) and authenticated users inserting
-- their own orders. Prevents authenticated users from creating orders for others.
DROP POLICY IF EXISTS "orders_insert_authenticated" ON public.orders;
CREATE POLICY "orders_insert_authenticated"
  ON public.orders FOR INSERT
  WITH CHECK (
    -- Service role bypasses RLS entirely; this covers anon/authenticated callers.
    -- Allow guest inserts (no auth.uid()) and authenticated users inserting their own orders.
    auth.uid() IS NULL OR auth.uid() = user_id
  );

DROP POLICY IF EXISTS "orders_update_admin" ON public.orders;
CREATE POLICY "orders_update_admin"
  ON public.orders FOR UPDATE
  USING (
    auth.uid() IS NOT NULL
    AND (SELECT email FROM auth.users WHERE id = auth.uid()) ~ '@admin.com$'
  );
