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
-- Xử lý cả hai trường hợp: bảng dùng cột "name" hoặc "full_name"
DO $$
DECLARE
  v_user_id UUID;
BEGIN
  SELECT id INTO v_user_id FROM auth.users WHERE email = 'admin@admin.com';

  IF v_user_id IS NULL THEN
    RAISE NOTICE 'Admin user not found, skipping profile creation.';
    RETURN;
  END IF;

  -- Thử với cột "full_name" trước (mẫu Supabase phổ biến)
  IF EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public' AND table_name = 'profiles' AND column_name = 'full_name'
  ) THEN
    INSERT INTO public.profiles (id, full_name, avatar_url)
    VALUES (v_user_id, 'Admin', NULL)
    ON CONFLICT (id) DO NOTHING;

  -- Nếu không có "full_name", thử với cột "name"
  ELSIF EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public' AND table_name = 'profiles' AND column_name = 'name'
  ) THEN
    INSERT INTO public.profiles (id, name, avatar_url)
    VALUES (v_user_id, 'Admin', NULL)
    ON CONFLICT (id) DO NOTHING;

  -- Nếu không có cả hai, chỉ insert id
  ELSE
    INSERT INTO public.profiles (id)
    VALUES (v_user_id)
    ON CONFLICT (id) DO NOTHING;
  END IF;
END $$;

-- Xác nhận kết quả
SELECT id, email, created_at
FROM auth.users
WHERE email = 'admin@admin.com';
