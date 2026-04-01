-- Migration: Ensure store_products has a public SELECT policy so unauthenticated
-- users can browse products on the storefront.
--
-- Run this in the Supabase SQL editor if products added via the admin panel are
-- not appearing on the public product listing page.

-- Enable RLS if not already enabled
ALTER TABLE store_products ENABLE ROW LEVEL SECURITY;

-- Public SELECT: anyone (including anonymous visitors) can read products
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE schemaname = 'public'
      AND tablename  = 'store_products'
      AND policyname = 'store_products_select_all'
  ) THEN
    CREATE POLICY "store_products_select_all"
      ON store_products FOR SELECT
      USING (true);
  END IF;
END $$;

-- Admin INSERT (idempotent)
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE schemaname = 'public'
      AND tablename  = 'store_products'
      AND policyname = 'store_products_insert_admin'
  ) THEN
    CREATE POLICY "store_products_insert_admin"
      ON store_products FOR INSERT
      WITH CHECK (
        auth.uid() IS NOT NULL
        AND (SELECT email FROM auth.users WHERE id = auth.uid()) ~ '@admin\.com$'
      );
  END IF;
END $$;

-- Admin UPDATE (idempotent)
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE schemaname = 'public'
      AND tablename  = 'store_products'
      AND policyname = 'store_products_update_admin'
  ) THEN
    CREATE POLICY "store_products_update_admin"
      ON store_products FOR UPDATE
      USING (
        auth.uid() IS NOT NULL
        AND (SELECT email FROM auth.users WHERE id = auth.uid()) ~ '@admin\.com$'
      );
  END IF;
END $$;

-- Admin DELETE (idempotent)
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE schemaname = 'public'
      AND tablename  = 'store_products'
      AND policyname = 'store_products_delete_admin'
  ) THEN
    CREATE POLICY "store_products_delete_admin"
      ON store_products FOR DELETE
      USING (
        auth.uid() IS NOT NULL
        AND (SELECT email FROM auth.users WHERE id = auth.uid()) ~ '@admin\.com$'
      );
  END IF;
END $$;
