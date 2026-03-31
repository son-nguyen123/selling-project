-- ============================================================
-- Tạo tài khoản Admin cho ProjectHub
-- Chạy script này trong Supabase SQL Editor:
--   Supabase Dashboard → SQL Editor → New Query → Paste & Run
-- ============================================================

-- Bước 1: Tạo user trong bảng auth.users của Supabase
-- Thay 'Admin@Password123!' bằng mật khẩu bạn muốn sử dụng.
INSERT INTO auth.users (
  instance_id,
  id,
  aud,
  role,
  email,
  encrypted_password,
  email_confirmed_at,
  raw_app_meta_data,
  raw_user_meta_data,
  created_at,
  updated_at,
  confirmation_token,
  email_change,
  email_change_token_new,
  recovery_token
)
SELECT
  '00000000-0000-0000-0000-000000000000',
  gen_random_uuid(),
  'authenticated',
  'authenticated',
  'admin@admin.com',
  crypt('Admin@Password123!', gen_salt('bf')),
  NOW(),
  '{"provider":"email","providers":["email"]}',
  '{"full_name":"Admin"}',
  NOW(),
  NOW(),
  '',
  '',
  '',
  ''
WHERE NOT EXISTS (
  SELECT 1 FROM auth.users WHERE email = 'admin@admin.com'
);

-- Bước 2: Tạo profile cho admin user (tự động nếu trigger đã được thiết lập)
INSERT INTO public.profiles (id, name, avatar_url)
SELECT id, 'Admin', NULL
FROM auth.users
WHERE email = 'admin@admin.com'
ON CONFLICT (id) DO NOTHING;

-- Xác nhận kết quả
SELECT id, email, created_at
FROM auth.users
WHERE email = 'admin@admin.com';
