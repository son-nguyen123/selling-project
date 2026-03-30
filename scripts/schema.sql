-- ============================================================
-- ProjectHub – Supabase Schema Setup
-- Run this in the Supabase SQL editor (Settings → SQL Editor)
-- ============================================================

-- ------------------------------------------------------------
-- 1. profiles
--    Mirrors auth.users. Auto-created on first sign-in via
--    the trigger below.
-- ------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.profiles (
  id         UUID PRIMARY KEY REFERENCES auth.users (id) ON DELETE CASCADE,
  name       TEXT,
  avatar_url TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Public profiles are viewable by everyone"
  ON public.profiles FOR SELECT USING (true);

CREATE POLICY "Users can insert their own profile"
  ON public.profiles FOR INSERT WITH CHECK (auth.uid() = id);

CREATE POLICY "Users can update their own profile"
  ON public.profiles FOR UPDATE USING (auth.uid() = id);

-- Auto-create a profile row whenever a new user signs up
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER LANGUAGE plpgsql SECURITY DEFINER AS $$
BEGIN
  INSERT INTO public.profiles (id, name, avatar_url)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data ->> 'full_name', NEW.email),
    NEW.raw_user_meta_data ->> 'avatar_url'
  )
  ON CONFLICT (id) DO NOTHING;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE PROCEDURE public.handle_new_user();

-- ------------------------------------------------------------
-- 2. projects
--    author_id references profiles.id (which mirrors auth.users)
-- ------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.projects (
  id              BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  title           TEXT NOT NULL,
  description     TEXT,
  tech_stack      TEXT,
  category        TEXT,
  price           NUMERIC(10, 2) NOT NULL DEFAULT 0,
  cover_image_url TEXT,
  author_id       UUID REFERENCES public.profiles (id) ON DELETE SET NULL,
  created_at      TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  updated_at      TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

ALTER TABLE public.projects ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Projects are viewable by everyone"
  ON public.projects FOR SELECT USING (true);

CREATE POLICY "Authenticated users can insert projects"
  ON public.projects FOR INSERT WITH CHECK (auth.uid() = author_id);

CREATE POLICY "Authors can update their own projects"
  ON public.projects FOR UPDATE USING (auth.uid() = author_id);

CREATE POLICY "Authors can delete their own projects"
  ON public.projects FOR DELETE USING (auth.uid() = author_id);

-- Keep updated_at fresh automatically
CREATE OR REPLACE FUNCTION public.set_updated_at()
RETURNS TRIGGER LANGUAGE plpgsql AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS set_projects_updated_at ON public.projects;
CREATE TRIGGER set_projects_updated_at
  BEFORE UPDATE ON public.projects
  FOR EACH ROW EXECUTE PROCEDURE public.set_updated_at();

-- ------------------------------------------------------------
-- 3. wishlists
-- ------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.wishlists (
  id         BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  user_id    UUID NOT NULL REFERENCES public.profiles (id) ON DELETE CASCADE,
  project_id BIGINT NOT NULL REFERENCES public.projects (id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  UNIQUE (user_id, project_id)
);

ALTER TABLE public.wishlists ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own wishlist"
  ON public.wishlists FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert into their own wishlist"
  ON public.wishlists FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete from their own wishlist"
  ON public.wishlists FOR DELETE USING (auth.uid() = user_id);

-- ------------------------------------------------------------
-- 4. Sample seed data (optional – adjust author_id as needed)
--    After enabling Google auth, sign in once, then run:
--      UPDATE public.projects SET author_id = auth.uid()
--      WHERE author_id IS NULL;
-- ------------------------------------------------------------
INSERT INTO public.projects (title, description, tech_stack, category, price, cover_image_url)
VALUES
  ('Modern E-Commerce Dashboard',
   'A fully responsive e-commerce dashboard with product management, order tracking, and analytics.',
   'React, TypeScript, Tailwind CSS, Node.js', 'Web App', 49.00,
   'https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=500&h=300&fit=crop'),

  ('AI Chat Interface',
   'A modern chat interface with real-time messaging and AI integration.',
   'Next.js, AI SDK, Node.js, React', 'Web App', 79.00,
   'https://images.unsplash.com/photo-1633356122544-f134ef2944f0?w=500&h=300&fit=crop'),

  ('Design System Components',
   'Comprehensive design system with 50+ reusable React components.',
   'React, Storybook, TypeScript, Tailwind CSS', 'Component Library', 39.00,
   'https://images.unsplash.com/photo-1561070791-2526d30994b5?w=500&h=300&fit=crop'),

  ('Backend API Boilerplate',
   'Production-ready Node.js backend with authentication and REST API endpoints.',
   'Node.js, Express, PostgreSQL, Docker', 'Backend', 59.00,
   'https://images.unsplash.com/photo-1517694712202-14dd9538aa97?w=500&h=300&fit=crop'),

  ('Mobile App Template',
   'Cross-platform mobile app template with navigation and Firebase integration.',
   'React Native, Expo, Firebase, Redux', 'Mobile', 69.00,
   'https://images.unsplash.com/photo-1519389950473-47ba0277781c?w=500&h=300&fit=crop'),

  ('3D Web Experience',
   'Interactive 3D web experience using Three.js and WebGL with particle effects.',
   'Three.js, WebGL, React, Canvas', 'Web App', 89.00,
   'https://images.unsplash.com/photo-1633356122102-3fe601e05bd2?w=500&h=300&fit=crop'),

  ('SaaS Dashboard Template',
   'Complete SaaS dashboard with user management, billing, analytics, and settings.',
   'Next.js, Supabase, TypeScript, Recharts', 'Web App', 99.00,
   'https://images.unsplash.com/photo-1678512521898-46d9a4584d9f?w=500&h=300&fit=crop'),

  ('Animation Component Library',
   'Advanced animation components with Framer Motion including scroll-triggered animations.',
   'React, Framer Motion, TypeScript, Tailwind', 'Component Library', 55.00,
   'https://images.unsplash.com/photo-1611339555312-e607c25352ca?w=500&h=300&fit=crop')
ON CONFLICT DO NOTHING;
