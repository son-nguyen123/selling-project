-- Migration: Seed 17 mock store_products with proper category distribution
-- Categories: Source code, Website, Phần mềm, Ứng dụng, Dịch vụ máy chủ

INSERT INTO public.store_products (name, description, price, category, stock, dashboard_image_url)
VALUES
  -- Source code (4 sản phẩm)
  (
    'Next.js SaaS Boilerplate',
    'Bộ khởi đầu SaaS hoàn chỉnh với Next.js 14, Supabase, Stripe billing, đa tenant và hệ thống phân quyền RBAC. Tiết kiệm hàng trăm giờ phát triển.',
    199.00,
    'Source code',
    999,
    'https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=500&h=400&fit=crop'
  ),
  (
    'React Native E-Commerce App',
    'Source code ứng dụng thương mại điện tử React Native đầy đủ tính năng: giỏ hàng, thanh toán Stripe, push notification và quản lý đơn hàng.',
    149.00,
    'Source code',
    999,
    'https://images.unsplash.com/photo-1563013544-824ae1b704d3?w=500&h=400&fit=crop'
  ),
  (
    'Node.js REST API Boilerplate',
    'Source code Node.js production-ready với JWT auth, rate limiting, Swagger docs, Docker và CI/CD pipeline. Dùng ngay, triển khai nhanh.',
    89.00,
    'Source code',
    999,
    'https://images.unsplash.com/photo-1558494949-ef010cbdcc31?w=500&h=400&fit=crop'
  ),
  (
    'Vue.js Admin Dashboard',
    'Dashboard quản trị Vue.js 3 hiện đại với hơn 60 component, biểu đồ Chart.js, dark/light mode và đầy đủ TypeScript support.',
    79.00,
    'Source code',
    999,
    'https://images.unsplash.com/photo-1587620962725-abab7fe55159?w=500&h=400&fit=crop'
  ),

  -- Website (4 sản phẩm)
  (
    'Portfolio Website Pro',
    'Template website portfolio chuyên nghiệp cho lập trình viên và designer. Dark mode, animations Framer Motion, tối ưu SEO và Google PageSpeed 100.',
    49.00,
    'Website',
    999,
    'https://images.unsplash.com/photo-1467232004584-a241de8bcf5d?w=500&h=400&fit=crop'
  ),
  (
    'Landing Page Startup Kit',
    'Bộ template landing page hiện đại dành cho startup. Tích hợp sẵn form thu thập email, section giá cả, testimonials và tích hợp Google Analytics.',
    59.00,
    'Website',
    999,
    'https://images.unsplash.com/photo-1522542550221-31fd19575a2d?w=500&h=400&fit=crop'
  ),
  (
    'E-Commerce Website Template',
    'Template website bán hàng đẹp và hiệu quả cao với giỏ hàng, trang sản phẩm, checkout và tích hợp VNPay/MoMo.',
    99.00,
    'Website',
    999,
    'https://images.unsplash.com/photo-1556742049-0cfed4f6a45d?w=500&h=400&fit=crop'
  ),
  (
    'Blog & CMS Website',
    'Website blog/tạp chí tích hợp CMS quản lý nội dung Markdown, phân loại bài viết, tags và tối ưu SEO tự động cho Google.',
    45.00,
    'Website',
    999,
    'https://images.unsplash.com/photo-1499750310107-5fef28a66643?w=500&h=400&fit=crop'
  ),

  -- Phần mềm (3 sản phẩm)
  (
    'Phần mềm Quản lý Bán hàng',
    'Phần mềm quản lý bán hàng desktop đa nền tảng (Windows/Mac) với quản lý kho, hóa đơn, báo cáo doanh thu và in tem mã vạch.',
    299.00,
    'Phần mềm',
    50,
    'https://images.unsplash.com/photo-1554774853-719586f82d77?w=500&h=400&fit=crop'
  ),
  (
    'Phần mềm Kế toán Doanh nghiệp',
    'Phần mềm kế toán đầy đủ cho doanh nghiệp vừa và nhỏ: quản lý thu chi, sổ sách, báo cáo thuế và xuất file Excel/PDF.',
    399.00,
    'Phần mềm',
    30,
    'https://images.unsplash.com/photo-1554224155-6726b3ff858f?w=500&h=400&fit=crop'
  ),
  (
    'Phần mềm Thiết kế Nội thất 3D',
    'Phần mềm thiết kế và trực quan hóa nội thất 3D chuyên nghiệp. Thư viện 5000+ mẫu đồ nội thất, render chất lượng cao.',
    249.00,
    'Phần mềm',
    20,
    'https://images.unsplash.com/photo-1555041469-a586c61ea9bc?w=500&h=400&fit=crop'
  ),

  -- Ứng dụng (3 sản phẩm)
  (
    'Ứng dụng Giao đồ ăn',
    'Ứng dụng đặt và giao đồ ăn đầy đủ tính năng: bản đồ realtime, theo dõi đơn hàng, đánh giá nhà hàng và thanh toán online.',
    119.00,
    'Ứng dụng',
    999,
    'https://images.unsplash.com/photo-1565299507177-b0ac66763828?w=500&h=400&fit=crop'
  ),
  (
    'Ứng dụng Học Tiếng Anh',
    'Ứng dụng học tiếng Anh gamification với flash card, luyện nghe/nói, theo dõi tiến độ và cộng đồng học tập.',
    69.00,
    'Ứng dụng',
    999,
    'https://images.unsplash.com/photo-1501504905252-473c47e087f8?w=500&h=400&fit=crop'
  ),
  (
    'Ứng dụng Theo dõi Sức khỏe',
    'Ứng dụng theo dõi sức khỏe toàn diện: bước chân, giấc ngủ, lượng calo, kế hoạch tập luyện và kết nối Apple Health/Google Fit.',
    89.00,
    'Ứng dụng',
    999,
    'https://images.unsplash.com/photo-1576091160550-112173f7f869?w=500&h=400&fit=crop'
  ),

  -- Dịch vụ máy chủ (3 sản phẩm)
  (
    'VPS Linux Cơ bản',
    'Máy chủ ảo VPS Linux (Ubuntu 22.04) cấu hình cơ bản: 2 vCPU, 2GB RAM, 40GB SSD NVMe, băng thông 1Gbps. Cam kết uptime 99.9%.',
    15.00,
    'Dịch vụ máy chủ',
    100,
    'https://images.unsplash.com/photo-1558494949-ef010cbdcc31?w=500&h=400&fit=crop'
  ),
  (
    'Hosting WordPress Tốc độ cao',
    'Gói hosting WordPress tối ưu hiệu năng: SSD NVMe, CDN toàn cầu, SSL miễn phí, sao lưu hàng ngày và hỗ trợ 24/7.',
    8.00,
    'Dịch vụ máy chủ',
    500,
    'https://images.unsplash.com/photo-1451187580459-43490279c0fa?w=500&h=400&fit=crop'
  ),
  (
    'Máy chủ Dedicated Enterprise',
    'Máy chủ vật lý chuyên dụng hiệu năng cao: Intel Xeon 16 nhân, 64GB RAM, 2x 960GB NVMe RAID 1, băng thông không giới hạn.',
    299.00,
    'Dịch vụ máy chủ',
    10,
    'https://images.unsplash.com/photo-1544197150-b99a580bb7a8?w=500&h=400&fit=crop'
  )
ON CONFLICT DO NOTHING;
