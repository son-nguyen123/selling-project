-- Migration: Allow the service-role key (used by API routes) to bypass RLS for
-- writes on store_products.  All INSERT / UPDATE / DELETE operations from the
-- admin panel are performed with createAdminClient() which carries the service-
-- role key.  The service-role key already bypasses RLS by default in Supabase,
-- but we also keep the admin-only RLS policies in place so that any direct use
-- of the anon key still enforces the restriction.
--
-- If you previously only had the admin-email-based INSERT policy and products
-- were not being saved, this migration adds a permissive fallback policy for
-- rows inserted via the service-role key (which sets auth.role() = 'service_role').

-- Ensure RLS is still enabled
ALTER TABLE store_products ENABLE ROW LEVEL SECURITY;

-- Allow service-role writes (INSERT) so server-side admin client can always insert
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE schemaname = 'public'
      AND tablename  = 'store_products'
      AND policyname = 'store_products_insert_service_role'
  ) THEN
    CREATE POLICY "store_products_insert_service_role"
      ON store_products FOR INSERT
      WITH CHECK (auth.role() = 'service_role');
  END IF;
END $$;

-- Allow service-role writes (UPDATE)
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE schemaname = 'public'
      AND tablename  = 'store_products'
      AND policyname = 'store_products_update_service_role'
  ) THEN
    CREATE POLICY "store_products_update_service_role"
      ON store_products FOR UPDATE
      USING (auth.role() = 'service_role');
  END IF;
END $$;

-- Allow service-role writes (DELETE)
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE schemaname = 'public'
      AND tablename  = 'store_products'
      AND policyname = 'store_products_delete_service_role'
  ) THEN
    CREATE POLICY "store_products_delete_service_role"
      ON store_products FOR DELETE
      USING (auth.role() = 'service_role');
  END IF;
END $$;
