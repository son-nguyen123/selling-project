-- Migration: Add admin RLS policies for the projects table
-- Run this in the Supabase SQL editor after the initial schema.sql

-- Allow admins (email ending with @admin.com) to insert any project
CREATE POLICY "Admin can insert projects"
  ON public.projects FOR INSERT
  WITH CHECK (
    auth.uid() IS NOT NULL
    AND (SELECT email FROM auth.users WHERE id = auth.uid()) ~ '@admin.com$'
  );

-- Allow admins to update any project
CREATE POLICY "Admin can update any project"
  ON public.projects FOR UPDATE
  USING (
    auth.uid() IS NOT NULL
    AND (SELECT email FROM auth.users WHERE id = auth.uid()) ~ '@admin.com$'
  );

-- Allow admins to delete any project
CREATE POLICY "Admin can delete any project"
  ON public.projects FOR DELETE
  USING (
    auth.uid() IS NOT NULL
    AND (SELECT email FROM auth.users WHERE id = auth.uid()) ~ '@admin.com$'
  );
