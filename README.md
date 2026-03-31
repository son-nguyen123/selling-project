# 🛒 ProjectHub – Sàn Giao Dịch Dự Án Kỹ Thuật Số

**ProjectHub** là một ứng dụng marketplace hiện đại, cho phép người dùng khám phá, mua bán các dự án kỹ thuật số, code template và UI component. Được xây dựng bằng **Next.js 16, React 19, TypeScript, Tailwind CSS v4 và Supabase**.

---

## ✨ Tính năng chính

### 🏪 Marketplace
- Duyệt hàng nghìn dự án kỹ thuật số
- Tìm kiếm real-time theo tên, mô tả hoặc công nghệ (có debounce)
- Lọc theo danh mục: Web App, Mobile, Backend, Component Library, Other
- Sắp xếp: Nổi bật, Mới nhất, Giá thấp → cao, Giá cao → thấp

### 🛍️ Giỏ hàng & Thanh toán
- Thêm/xóa dự án khỏi giỏ hàng
- Cập nhật số lượng, tính tổng tiền tự động
- Lưu giỏ hàng vào `localStorage` (không mất khi tải lại trang)
- Luồng thanh toán (Checkout)

### ❤️ Danh sách yêu thích (Wishlist)
- Lưu dự án yêu thích (yêu cầu đăng nhập)
- Toggle thêm/xóa với thông báo toast
- Cập nhật UI tức thì (optimistic update)

### 📤 Đăng bán dự án
- Form upload dự án: tên, mô tả, công nghệ, danh mục, giá, ảnh bìa
- Validation phía server
- Dự án được gắn với tài khoản người bán

### 👤 Xác thực người dùng
- Đăng ký / Đăng nhập bằng email
- Hỗ trợ OAuth (đăng nhập mạng xã hội)
- Xác minh email sau đăng ký
- Quản lý phiên đăng nhập với cookie

### 📊 Dashboard người dùng
- Xem danh sách dự án đã đăng bán
- Thống kê cá nhân

### 🔐 Trang Admin
- Truy cập tại `/admin` (yêu cầu email `@admin.com`)
- Quản lý toàn bộ dự án và người dùng

### 🎨 Giao diện
- Chủ đề tối (dark mode) với điểm nhấn màu vàng `#C4742D`
- Responsive trên mọi thiết bị (mobile-first)
- Animation mượt mà khi hover
- Thông báo toast bằng Sonner

---

## 🛠️ Công nghệ sử dụng

| Lớp | Công nghệ |
|-----|-----------|
| **Frontend** | Next.js 16 (App Router), React 19.2, TypeScript |
| **Styling** | Tailwind CSS v4, shadcn/ui |
| **Database** | Supabase PostgreSQL |
| **Auth** | Supabase Auth |
| **Icons** | Lucide React |
| **Notifications** | Sonner |
| **Analytics** | Vercel Analytics |
| **Package Manager** | pnpm |

---

## 📁 Cấu trúc dự án

```
selling-project/
├── app/
│   ├── actions/               # Server Actions
│   ├── admin/                 # Trang quản trị (admin)
│   ├── api/
│   │   ├── projects/          # API CRUD dự án
│   │   ├── store/             # API cửa hàng / đơn hàng
│   │   └── wishlist/          # API toggle wishlist
│   ├── auth/                  # Xử lý OAuth callback
│   ├── cart/                  # Trang giỏ hàng
│   ├── check-email/           # Thông báo xác minh email
│   ├── checkout/              # Trang thanh toán
│   ├── context/
│   │   └── cart-provider.tsx  # Context quản lý giỏ hàng
│   ├── dashboard/             # Dashboard người dùng
│   ├── login/                 # Trang đăng nhập
│   ├── projects/[id]/         # Chi tiết dự án
│   ├── register/              # Trang đăng ký
│   ├── store/                 # Trang cửa hàng
│   ├── upload/                # Trang đăng bán dự án
│   ├── layout.tsx             # Layout gốc (metadata, providers)
│   ├── page.tsx               # Trang chủ marketplace
│   └── globals.css            # Biến màu sắc toàn cục
│
├── components/
│   ├── ui/                    # shadcn/ui components
│   ├── store/                 # Components cho cửa hàng
│   ├── header.tsx             # Header (server component)
│   ├── header-client.tsx      # Header (client component, menu, auth)
│   ├── hero.tsx               # Banner trang chủ
│   ├── project-card.tsx       # Card hiển thị dự án
│   ├── search-bar.tsx         # Ô tìm kiếm có debounce
│   ├── sort-dropdown.tsx      # Dropdown sắp xếp
│   ├── filter-sidebar.tsx     # Sidebar lọc danh mục
│   └── footer.tsx             # Footer
│
├── lib/
│   └── supabase/
│       ├── client.ts          # Supabase client (browser)
│       ├── server.ts          # Supabase client (server)
│       └── proxy.ts           # Proxy quản lý session
│
├── hooks/                     # Custom React hooks
├── scripts/                   # SQL scripts (schema, seed data)
├── public/                    # Assets tĩnh
├── middleware.ts              # Middleware xác thực
└── next.config.mjs            # Cấu hình Next.js
```

---

## 🗄️ Schema Database

### Bảng `projects`
| Cột | Kiểu | Mô tả |
|-----|------|-------|
| `id` | Integer (PK) | ID dự án |
| `title` | Text | Tên dự án |
| `description` | Text | Mô tả chi tiết |
| `price` | Decimal | Giá bán |
| `category` | Text | Danh mục |
| `tech_stack` | Text | Công nghệ (cách nhau bởi dấu phẩy) |
| `cover_image_url` | Text | URL ảnh bìa |
| `author_id` | UUID (FK) | ID người bán |
| `created_at` | Timestamp | Ngày tạo |
| `updated_at` | Timestamp | Ngày cập nhật |

### Bảng `profiles`
| Cột | Kiểu | Mô tả |
|-----|------|-------|
| `id` | UUID (PK) | ID người dùng |
| `name` | Text | Tên hiển thị |
| `avatar_url` | Text | URL ảnh đại diện |

### Bảng `wishlists`
| Cột | Kiểu | Mô tả |
|-----|------|-------|
| `id` | Integer (PK) | ID bản ghi |
| `user_id` | UUID (FK) | ID người dùng |
| `project_id` | Integer (FK) | ID dự án |
| `created_at` | Timestamp | Ngày thêm |

---

## 🚀 Hướng dẫn cài đặt

### Yêu cầu
- Node.js 18+
- pnpm (khuyến nghị) hoặc npm/yarn
- Tài khoản [Supabase](https://supabase.com)

### Các bước cài đặt

**1. Clone dự án**
```bash
git clone https://github.com/son-nguyen123/selling-project.git
cd selling-project
```

**2. Cài đặt dependencies**
```bash
pnpm install
```

**3. Cấu hình biến môi trường**

Tạo file `.env.local` tại thư mục gốc:
```env
NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key
```

> Lấy các giá trị này tại: **Supabase Dashboard → Project Settings → API**

**4. Khởi tạo database**

Mở **Supabase SQL Editor** (Dashboard → SQL Editor → New Query) và chạy lần lượt:

```
scripts/schema.sql            -- Tạo bảng và cấu trúc
scripts/seed-more-projects.sql -- Thêm dữ liệu mẫu
```

**5. Chạy ứng dụng**
```bash
pnpm dev
```

Mở trình duyệt tại [http://localhost:3000](http://localhost:3000)

---

## 🔐 Tài khoản Admin

Trang quản trị (`/admin`) yêu cầu email kết thúc bằng `@admin.com`.

**Tạo tài khoản admin** bằng cách chạy `scripts/create-admin-user.sql` trong Supabase SQL Editor.

Thông tin đăng nhập mặc định:
- **Email**: `admin@admin.com`
- **Mật khẩu**: `Admin@Password123!`

> ⚠️ Hãy đổi mật khẩu sau khi đăng nhập lần đầu.

---

## 🌐 Deploy lên Vercel

1. Push code lên GitHub
2. Kết nối repository tại [vercel.com](https://vercel.com)
3. Thêm các biến môi trường trong **Vercel → Settings → Environment Variables**
4. Deploy!

Ứng dụng sẽ tự động scale và chạy trên hạ tầng Vercel.

---

## 📚 Tài liệu tham khảo

- [Next.js Documentation](https://nextjs.org/docs)
- [Supabase Documentation](https://supabase.com/docs)
- [shadcn/ui Components](https://ui.shadcn.com/)
- [Tailwind CSS v4](https://tailwindcss.com/docs)

---

## 📄 License

Dự án mã nguồn mở, có thể sử dụng cho mục đích cá nhân và thương mại.
