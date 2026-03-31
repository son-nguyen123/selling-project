-- ============================================================
-- Migration: Ensure profile exists before project insert/update
-- ============================================================
-- This migration adds a BEFORE INSERT OR UPDATE trigger on the
-- "projects" table. Whenever a project row is inserted or updated
-- with a non-NULL author_id, the trigger checks whether a matching
-- row exists in "public.profiles". If it does not, it inserts a
-- minimal profile row (id only) so that the foreign key constraint
-- "projects_author_id_fkey" is never violated.
--
-- The trigger runs as SECURITY DEFINER so that it can write to
-- "public.profiles" even when Row Level Security is enabled.
-- ============================================================

-- ------------------------------------------------------------
-- 1. Trigger function
-- ------------------------------------------------------------
CREATE OR REPLACE FUNCTION public.ensure_profile_before_project()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- Only act when author_id is provided
  IF NEW.author_id IS NOT NULL THEN
    INSERT INTO public.profiles (id)
    VALUES (NEW.author_id)
    ON CONFLICT (id) DO NOTHING;
  END IF;

  RETURN NEW;
END;
$$;

-- ------------------------------------------------------------
-- 2. Attach the trigger to the projects table
-- ------------------------------------------------------------
DROP TRIGGER IF EXISTS ensure_profile_before_project_upsert ON public.projects;

CREATE TRIGGER ensure_profile_before_project_upsert
  BEFORE INSERT OR UPDATE ON public.projects
  FOR EACH ROW
  EXECUTE PROCEDURE public.ensure_profile_before_project();
