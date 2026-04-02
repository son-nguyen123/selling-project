-- ============================================================
-- Migration 007: Create storage buckets for product images and videos
-- Run this in the Supabase SQL editor to create the required
-- storage buckets so that file uploads from the admin panel work.
-- ============================================================

-- 1. Create buckets (idempotent)
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES
  ('product-images', 'product-images', true, 52428800,
   ARRAY['image/jpeg','image/jpg','image/png','image/gif','image/webp','image/svg+xml','image/bmp','image/tiff'])
ON CONFLICT (id) DO UPDATE SET public = true;

INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES
  ('product-videos', 'product-videos', true, 524288000,
   ARRAY['video/mp4','video/webm','video/ogg','video/quicktime','video/x-msvideo','video/avi'])
ON CONFLICT (id) DO UPDATE SET public = true;

-- 2. Public read policy for product-images
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE schemaname = 'storage'
      AND tablename  = 'objects'
      AND policyname = 'product_images_public_read'
  ) THEN
    CREATE POLICY "product_images_public_read"
      ON storage.objects FOR SELECT
      USING (bucket_id = 'product-images');
  END IF;
END $$;

-- 3. Public read policy for product-videos
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE schemaname = 'storage'
      AND tablename  = 'objects'
      AND policyname = 'product_videos_public_read'
  ) THEN
    CREATE POLICY "product_videos_public_read"
      ON storage.objects FOR SELECT
      USING (bucket_id = 'product-videos');
  END IF;
END $$;

-- 4. INSERT policy for product-images (allows service role + admin users)
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE schemaname = 'storage'
      AND tablename  = 'objects'
      AND policyname = 'product_images_insert'
  ) THEN
    CREATE POLICY "product_images_insert"
      ON storage.objects FOR INSERT
      WITH CHECK (bucket_id = 'product-images');
  END IF;
END $$;

-- 5. INSERT policy for product-videos
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE schemaname = 'storage'
      AND tablename  = 'objects'
      AND policyname = 'product_videos_insert'
  ) THEN
    CREATE POLICY "product_videos_insert"
      ON storage.objects FOR INSERT
      WITH CHECK (bucket_id = 'product-videos');
  END IF;
END $$;

-- 6. UPDATE policy (for upsert support)
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE schemaname = 'storage'
      AND tablename  = 'objects'
      AND policyname = 'product_images_update'
  ) THEN
    CREATE POLICY "product_images_update"
      ON storage.objects FOR UPDATE
      USING (bucket_id = 'product-images');
  END IF;
END $$;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE schemaname = 'storage'
      AND tablename  = 'objects'
      AND policyname = 'product_videos_update'
  ) THEN
    CREATE POLICY "product_videos_update"
      ON storage.objects FOR UPDATE
      USING (bucket_id = 'product-videos');
  END IF;
END $$;

-- 7. DELETE policies
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE schemaname = 'storage'
      AND tablename  = 'objects'
      AND policyname = 'product_images_delete'
  ) THEN
    CREATE POLICY "product_images_delete"
      ON storage.objects FOR DELETE
      USING (bucket_id = 'product-images');
  END IF;
END $$;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE schemaname = 'storage'
      AND tablename  = 'objects'
      AND policyname = 'product_videos_delete'
  ) THEN
    CREATE POLICY "product_videos_delete"
      ON storage.objects FOR DELETE
      USING (bucket_id = 'product-videos');
  END IF;
END $$;
