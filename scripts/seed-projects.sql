-- Seed sample projects data
-- This script adds sample projects for the marketplace

-- First, insert a sample user (seller)
INSERT INTO users (name, email, password_hash, role, created_at)
VALUES
  ('Alex Chen', 'alex@example.com', 'hashed_password_1', 'seller', NOW()),
  ('Sarah Rodriguez', 'sarah@example.com', 'hashed_password_2', 'seller', NOW()),
  ('Jordan Park', 'jordan@example.com', 'hashed_password_3', 'seller', NOW()),
  ('Mike Thompson', 'mike@example.com', 'hashed_password_4', 'seller', NOW()),
  ('Lisa Wong', 'lisa@example.com', 'hashed_password_5', 'seller', NOW()),
  ('David Lee', 'david@example.com', 'hashed_password_6', 'seller', NOW())
ON CONFLICT (email) DO NOTHING;

-- Insert sample projects
INSERT INTO projects (title, description, tech_stack, category, price, author_id, cover_image_url, created_at, updated_at)
VALUES
  (
    'Modern E-Commerce Dashboard',
    'A fully responsive e-commerce dashboard with product management, order tracking, and analytics. Built with React and TypeScript.',
    'React, TypeScript, Tailwind CSS, Node.js',
    'Web App',
    49.00,
    (SELECT id FROM users WHERE email = 'alex@example.com' LIMIT 1),
    'https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=500&h=300&fit=crop',
    NOW(),
    NOW()
  ),
  (
    'AI Chat Interface',
    'A modern chat interface with real-time messaging, AI integration, and beautiful UI components. Perfect for building customer support systems.',
    'Next.js, AI SDK, Node.js, React',
    'Web App',
    79.00,
    (SELECT id FROM users WHERE email = 'sarah@example.com' LIMIT 1),
    'https://images.unsplash.com/photo-1633356122544-f134ef2944f0?w=500&h=300&fit=crop',
    NOW(),
    NOW()
  ),
  (
    'Design System Components',
    'Comprehensive design system with 50+ reusable React components. Includes buttons, forms, cards, modals, and more.',
    'React, Storybook, TypeScript, Tailwind CSS',
    'Component Library',
    39.00,
    (SELECT id FROM users WHERE email = 'jordan@example.com' LIMIT 1),
    'https://images.unsplash.com/photo-1561070791-2526d30994b5?w=500&h=300&fit=crop',
    NOW(),
    NOW()
  ),
  (
    'Backend API Boilerplate',
    'Production-ready Node.js backend with authentication, database setup, and REST API endpoints. Includes Docker configuration.',
    'Node.js, Express, PostgreSQL, Docker',
    'Backend',
    59.00,
    (SELECT id FROM users WHERE email = 'mike@example.com' LIMIT 1),
    'https://images.unsplash.com/photo-1517694712202-14dd9538aa97?w=500&h=300&fit=crop',
    NOW(),
    NOW()
  ),
  (
    'Mobile App Template',
    'Cross-platform mobile app template with navigation, authentication, and Firebase integration. Ready to customize.',
    'React Native, Expo, Firebase, Redux',
    'Mobile',
    69.00,
    (SELECT id FROM users WHERE email = 'lisa@example.com' LIMIT 1),
    'https://images.unsplash.com/photo-1519389950473-47ba0277781c?w=500&h=300&fit=crop',
    NOW(),
    NOW()
  ),
  (
    '3D Web Experience',
    'Interactive 3D web experience using Three.js and WebGL. Includes animations, particle effects, and responsive design.',
    'Three.js, WebGL, React, Canvas',
    'Web App',
    89.00,
    (SELECT id FROM users WHERE email = 'david@example.com' LIMIT 1),
    'https://images.unsplash.com/photo-1633356122544-f134ef2944f0?w=500&h=300&fit=crop',
    NOW(),
    NOW()
  ),
  (
    'SaaS Dashboard Template',
    'Complete SaaS dashboard with user management, billing, analytics, and settings. Built with Next.js and Supabase.',
    'Next.js, Supabase, TypeScript, Recharts',
    'Web App',
    99.00,
    (SELECT id FROM users WHERE email = 'alex@example.com' LIMIT 1),
    'https://images.unsplash.com/photo-1678512521898-46d9a4584d9f?w=500&h=300&fit=crop',
    NOW(),
    NOW()
  ),
  (
    'Headless CMS Integration',
    'Ready-to-use integration for popular headless CMS platforms. Includes data fetching, caching, and preview mode.',
    'Next.js, TypeScript, Contentful, Prisma',
    'Backend',
    45.00,
    (SELECT id FROM users WHERE email = 'sarah@example.com' LIMIT 1),
    'https://images.unsplash.com/photo-1654165805694-e1953b910d82?w=500&h=300&fit=crop',
    NOW(),
    NOW()
  ),
  (
    'React Native Fitness App',
    'Full-featured fitness tracking app with workout logging, progress tracking, and social features.',
    'React Native, Firebase, Redux, Expo',
    'Mobile',
    79.00,
    (SELECT id FROM users WHERE email = 'mike@example.com' LIMIT 1),
    'https://images.unsplash.com/photo-1576091160550-112173f7f869?w=500&h=300&fit=crop',
    NOW(),
    NOW()
  ),
  (
    'Animation Component Library',
    'Advanced animation components library with Framer Motion. Includes transitions, gestures, and scroll-triggered animations.',
    'React, Framer Motion, TypeScript, Tailwind',
    'Component Library',
    55.00,
    (SELECT id FROM users WHERE email = 'jordan@example.com' LIMIT 1),
    'https://images.unsplash.com/photo-1611339555312-e607c25352ca?w=500&h=300&fit=crop',
    NOW(),
    NOW()
  );
