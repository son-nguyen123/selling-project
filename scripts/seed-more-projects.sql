-- ============================================================
-- Seed thêm dự án mẫu (Project IDs ~9 đến ~20)
-- Chạy script này trong Supabase SQL Editor sau khi đã chạy schema.sql
-- ============================================================

INSERT INTO public.projects (title, description, tech_stack, category, price, cover_image_url)
VALUES
  (
    'Real-time Chat Application',
    'Full-stack real-time chat app với WebSockets, phòng chat nhóm, tin nhắn riêng tư và thông báo. Xây dựng với Next.js và Supabase Realtime.',
    'Next.js, Supabase, TypeScript, Tailwind CSS',
    'Web App',
    65.00,
    'https://images.unsplash.com/photo-1611746872915-64382b5c76da?w=500&h=300&fit=crop'
  ),
  (
    'Portfolio Website Template',
    'Template website portfolio chuyên nghiệp với dark mode, animations mượt mà và tối ưu SEO. Phù hợp cho lập trình viên và designer.',
    'Next.js, Framer Motion, TypeScript, Tailwind CSS',
    'Web App',
    29.00,
    'https://images.unsplash.com/photo-1467232004584-a241de8bcf5d?w=500&h=300&fit=crop'
  ),
  (
    'E-Learning Platform',
    'Nền tảng học trực tuyến hoàn chỉnh với video player, quiz, chứng chỉ và dashboard tiến trình học tập.',
    'React, Node.js, PostgreSQL, AWS S3',
    'Web App',
    149.00,
    'https://images.unsplash.com/photo-1501504905252-473c47e087f8?w=500&h=300&fit=crop'
  ),
  (
    'Inventory Management System',
    'Hệ thống quản lý kho hàng với theo dõi tồn kho realtime, quản lý nhà cung cấp, báo cáo và xuất Excel.',
    'React, Express, MySQL, Redux Toolkit',
    'Web App',
    89.00,
    'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=500&h=300&fit=crop'
  ),
  (
    'Blog CMS with Markdown',
    'Hệ thống quản lý nội dung blog với Markdown editor, phân loại bài viết, tags và tối ưu SEO tự động.',
    'Next.js, MDX, Prisma, PostgreSQL',
    'Backend',
    49.00,
    'https://images.unsplash.com/photo-1499750310107-5fef28a66643?w=500&h=300&fit=crop'
  ),
  (
    'Social Media Dashboard',
    'Dashboard phân tích mạng xã hội với thống kê tương tác, lịch đăng bài và tích hợp nhiều nền tảng.',
    'React, Chart.js, Node.js, OAuth',
    'Web App',
    75.00,
    'https://images.unsplash.com/photo-1611162616305-c69b3fa7fbe0?w=500&h=300&fit=crop'
  ),
  (
    'GraphQL API Starter',
    'Starter kit GraphQL API production-ready với authentication JWT, phân quyền, rate limiting và tài liệu tự động.',
    'Node.js, GraphQL, TypeScript, Prisma',
    'Backend',
    55.00,
    'https://images.unsplash.com/photo-1558494949-ef010cbdcc31?w=500&h=300&fit=crop'
  ),
  (
    'React Native Food Delivery App',
    'Ứng dụng đặt đồ ăn với map realtime, thanh toán trực tuyến, đánh giá và quản lý đơn hàng.',
    'React Native, Expo, Firebase, Stripe',
    'Mobile',
    119.00,
    'https://images.unsplash.com/photo-1565299507177-b0ac66763828?w=500&h=300&fit=crop'
  ),
  (
    'Multi-tenant SaaS Boilerplate',
    'Boilerplate SaaS đa tenant hoàn chỉnh với quản lý tổ chức, phân quyền RBAC, billing Stripe và onboarding.',
    'Next.js, Supabase, Stripe, TypeScript',
    'Web App',
    199.00,
    'https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=500&h=300&fit=crop'
  ),
  (
    'DevOps Monitoring Dashboard',
    'Dashboard giám sát hệ thống với theo dõi metrics, log viewer, alerts và tích hợp Docker/Kubernetes.',
    'React, Prometheus, Grafana, Docker',
    'Backend',
    95.00,
    'https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=500&h=300&fit=crop'
  ),
  (
    'Vue.js Component Library',
    'Thư viện 60+ component Vue.js với TypeScript, Storybook docs và hỗ trợ dark/light theme.',
    'Vue.js, TypeScript, Storybook, Vite',
    'Component Library',
    45.00,
    'https://images.unsplash.com/photo-1587620962725-abab7fe55159?w=500&h=300&fit=crop'
  ),
  (
    'Flutter Weather App',
    'Ứng dụng thời tiết Flutter đẹp với dự báo 7 ngày, widget, dark mode và hỗ trợ đa ngôn ngữ.',
    'Flutter, Dart, OpenWeatherAPI, Riverpod',
    'Mobile',
    39.00,
    'https://images.unsplash.com/photo-1504608524841-42584120d693?w=500&h=300&fit=crop'
  )
ON CONFLICT DO NOTHING;
