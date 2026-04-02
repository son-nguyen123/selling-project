import { createClient } from '@/lib/supabase/server'
import { notFound } from 'next/navigation'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import Header from '@/components/header'
import Footer from '@/components/footer'
import { Download, ChevronRight, User, ShoppingCart, Star, Store } from 'lucide-react'
import Link from 'next/link'

interface Profile {
  name: string | null
  avatar_url: string | null
}

interface Project {
  id: number
  title: string
  description: string | null
  tech_stack: string | null
  category: string | null
  price: number
  cover_image_url: string | null
  created_at: string
  author_id: string | null
  profiles?: Profile | null
}

export default async function ProjectDetailPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params
  const supabase = await createClient()

  const { data, error } = await supabase
    .from('projects')
    .select(
      `id, title, description, tech_stack, category, price, cover_image_url, created_at, author_id`,
    )
    .eq('id', id)
    .single()

  if (error || !data) {
    notFound()
  }

  const project = data as unknown as Project

  let authorProfile: Profile | null = null
  if (project.author_id) {
    const { data: profileData } = await supabase
      .from('profiles')
      .select('name, avatar_url')
      .eq('id', project.author_id)
      .single()
    authorProfile = profileData ?? null
  }

  const techList = project.tech_stack
    ? project.tech_stack.split(',').map((t) => t.trim())
    : []
  const authorName = authorProfile?.name ?? 'Unknown Author'

  return (
    <div className="min-h-screen bg-background">
      <Header />

      <main className="max-w-7xl mx-auto px-4 py-4">
        {/* Breadcrumb */}
        <nav className="flex items-center gap-1.5 text-xs text-muted-foreground mb-4">
          <Link href="/" className="hover:text-accent transition-colors">Trang chủ</Link>
          <ChevronRight className="h-3 w-3" />
          {project.category && (
            <>
              <Link href={`/?category=${encodeURIComponent(project.category)}`} className="hover:text-accent transition-colors">
                {project.category}
              </Link>
              <ChevronRight className="h-3 w-3" />
            </>
          )}
          <span className="text-foreground line-clamp-1">{project.title}</span>
        </nav>

        {/* Main product section - Shopee layout */}
        <div className="bg-card border border-border rounded-sm p-4 md:p-6 mb-4">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">

            {/* Left: Product image (5/12) */}
            <div className="lg:col-span-5">
              <div className="aspect-square rounded-sm overflow-hidden bg-muted border border-border">
                <img
                  src={
                    project.cover_image_url ||
                    'https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=600&h=600&fit=crop'
                  }
                  alt={project.title}
                  className="w-full h-full object-cover"
                />
              </div>
              {/* Thumbnail strip placeholder */}
              <div className="mt-2 flex gap-2 overflow-x-auto pb-1">
                {[1, 2, 3].map((i) => (
                  <div key={i} className="w-16 h-16 shrink-0 rounded-sm border-2 border-transparent hover:border-accent cursor-pointer overflow-hidden bg-muted opacity-60 first:border-accent first:opacity-100">
                    <img
                      src={
                        project.cover_image_url ||
                        'https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=100&h=100&fit=crop'
                      }
                      alt=""
                      className="w-full h-full object-cover"
                    />
                  </div>
                ))}
              </div>
            </div>

            {/* Right: Product info + purchase (7/12) */}
            <div className="lg:col-span-7 flex flex-col gap-4" id="buy-section">
              {/* Category */}
              <div>
                <Badge className="bg-accent/10 text-accent border-accent/30 rounded-sm text-xs px-2 py-0.5">
                  {project.category ?? 'Other'}
                </Badge>
              </div>

              {/* Title */}
              <h1 className="text-xl md:text-2xl font-semibold text-foreground leading-snug">
                {project.title}
              </h1>

              {/* Rating row */}
              <div className="flex items-center gap-4 text-sm">
                <div className="flex items-center gap-1">
                  <span className="text-accent font-semibold border-b border-accent">4.8</span>
                  <div className="flex">
                    {[1,2,3,4,5].map((s) => (
                      <Star key={s} className={`h-3.5 w-3.5 ${s <= 5 ? 'fill-accent text-accent' : 'fill-muted text-muted-foreground'}`} />
                    ))}
                  </div>
                </div>
                <span className="text-muted-foreground border-l border-border pl-4">Instant download</span>
              </div>

              {/* Price section - orange background like Shopee */}
              <div className="bg-muted/50 rounded-sm px-4 py-3">
                <div className="flex items-baseline gap-2">
                  <span className="text-3xl md:text-4xl font-bold text-accent">
                    {Number(project.price).toLocaleString('vi-VN')}₫
                  </span>
                  <span className="text-xs text-muted-foreground">thanh toán một lần</span>
                </div>
              </div>

              {/* Seller info */}
              <div className="flex items-center gap-3 py-3 border-t border-b border-border">
                <div className="w-10 h-10 rounded-full bg-muted flex items-center justify-center overflow-hidden border border-border">
                  {authorProfile?.avatar_url ? (
                    <img src={authorProfile.avatar_url} alt={authorName} className="w-full h-full object-cover" />
                  ) : (
                    <User className="h-5 w-5 text-muted-foreground" />
                  )}
                </div>
                <div>
                  <p className="text-sm font-medium text-foreground">{authorName}</p>
                  <p className="text-xs text-muted-foreground flex items-center gap-1">
                    <Store className="h-3 w-3" /> Người bán
                  </p>
                </div>
              </div>

              {/* Tech stack */}
              {techList.length > 0 && (
                <div className="flex items-start gap-3">
                  <span className="text-sm text-muted-foreground w-20 shrink-0 pt-0.5">Công nghệ</span>
                  <div className="flex flex-wrap gap-1.5">
                    {techList.map((tech) => (
                      <Badge key={tech} variant="outline" className="text-xs rounded-sm">
                        {tech}
                      </Badge>
                    ))}
                  </div>
                </div>
              )}

              {/* Action buttons - Shopee style */}
              <div className="flex gap-3 pt-2">
                <Button
                  variant="outline"
                  className="flex-1 gap-2 py-5 text-base border-accent text-accent hover:bg-accent/10 rounded-sm"
                  size="lg"
                >
                  <ShoppingCart className="h-5 w-5" />
                  Đặt Hàng
                </Button>
                <Button
                  className="flex-1 gap-2 py-5 text-base bg-accent hover:bg-accent/90 text-accent-foreground rounded-sm"
                  size="lg"
                >
                  <Download className="h-5 w-5" />
                  Mua Ngay
                </Button>
              </div>

              <p className="text-xs text-muted-foreground text-center">
                ✓ Tải xuống ngay sau khi thanh toán &nbsp;·&nbsp; ✓ Hỗ trợ 24/7
              </p>
            </div>
          </div>
        </div>

        {/* Description section */}
        <div className="bg-card border border-border rounded-sm p-4 md:p-6">
          <h2 className="text-base font-semibold text-foreground mb-4 pb-3 border-b border-border uppercase tracking-wide">
            Mô tả sản phẩm
          </h2>
          <p className="text-muted-foreground leading-relaxed text-sm">
            {project.description || 'Chưa có mô tả.'}
          </p>
        </div>
      </main>

      <Footer />
    </div>
  )
}
