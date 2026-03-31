-- ============================================================
-- Migration: Fix author_id column type in projects table
-- ============================================================
-- Run this in the Supabase SQL editor if you see the error:
--   "invalid input syntax for type integer: "<uuid>""
--   when publishing a project.
--
-- Root cause: the projects.author_id column was created as
-- BIGINT/INTEGER instead of UUID. This migration converts it
-- to UUID so it can store Supabase Auth user IDs correctly.
--
-- NOTE: Existing rows whose author_id cannot be converted to
-- UUID will be set to NULL (they can be re-assigned later).
-- ============================================================

DO $$
DECLARE
  col_type      text;
  affected_rows bigint;
BEGIN
  SELECT data_type INTO col_type
  FROM information_schema.columns
  WHERE table_schema = 'public'
    AND table_name   = 'projects'
    AND column_name  = 'author_id';

  IF col_type IN ('integer', 'bigint', 'smallint') THEN
    SELECT COUNT(*) INTO affected_rows
    FROM public.projects
    WHERE author_id IS NOT NULL;

    RAISE NOTICE 'Migration starting: % row(s) with a non-NULL author_id will be set to NULL (integer values cannot be cast to UUID). Re-assign them after migration if needed.', affected_rows;

    -- 1. Remove the foreign key constraint referencing profiles(id)
    ALTER TABLE public.projects
      DROP CONSTRAINT IF EXISTS projects_author_id_fkey;

    -- 2. Change the column type to UUID.
    --    The USING clause sets all existing integer values to NULL because
    --    integer IDs cannot be meaningfully cast to UUIDs.
    ALTER TABLE public.projects
      ALTER COLUMN author_id TYPE UUID USING NULL::uuid;

    -- 3. Restore the foreign key constraint
    ALTER TABLE public.projects
      ADD CONSTRAINT projects_author_id_fkey
      FOREIGN KEY (author_id)
      REFERENCES public.profiles (id)
      ON DELETE SET NULL;

    RAISE NOTICE 'Migration complete: author_id changed from % to UUID.', col_type;

  ELSIF col_type = 'uuid' THEN
    RAISE NOTICE 'No migration needed: author_id is already UUID.';

  ELSE
    RAISE NOTICE 'Unexpected author_id type: %. Please inspect the column manually.', col_type;
  END IF;
END $$;
