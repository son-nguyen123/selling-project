import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import Header from '@/components/header'
import Footer from '@/components/footer'
import { Button } from '@/components/ui/button'
import Link from 'next/link'
import { Eye, ShoppingCart, Download } from 'lucide-react'
import { Badge } from '@/components/ui/badge'

interface Project {
  id: number
  title: string
  category: string | null
  price: number
  cover_image_url: string | null
  created_at: string
}

function ShopeeCard({ project }: { project: Project }) {
  return (
    <div className="group bg-card border border-border rounded-sm overflow-hidden hover:shadow-md transition-all duration-200">
      <Link href={`/projects/${project.id}`} className="block">
        <div className="relative aspect-square bg-muted overflow-hidden">
          <img
            src={
              project.cover_image_url ||
              'https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=400&h=400&fit=crop'
            }
            alt={project.title}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
          />
          {project.category && (
            <div className="absolute top-2 left-2">
              <Badge className="bg-accent text-accent-foreground text-xs px-1.5 py-0.5 rounded-sm border-0">
                {project.category}
              </Badge>
            </div>
          )}
        </div>
      </Link>
      <div className="p-2.5">
        <Link href={`/projects/${project.id}`}>
          <h3 className="text-sm text-foreground line-clamp-2 leading-snug mb-1.5 min-h-[2.5rem] hover:text-accent transition-colors">
            {project.title}
          </h3>
        </Link>
        <p className="text-accent font-bold text-base mb-2">
          ${Number(project.price).toFixed(0)}
        </p>
        <div className="flex gap-1.5">
          <Link href={`/projects/${project.id}`} className="flex-1">
            <button className="w-full flex items-center justify-center gap-1 py-1.5 border border-border text-xs text-foreground rounded-sm hover:border-accent hover:text-accent transition-colors">
              <Eye className="h-3 w-3" />
              Xem
            </button>
          </Link>
          <Link href={`/projects/${project.id}#buy-section`} className="flex-1">
            <button className="w-full flex items-center justify-center gap-1 py-1.5 border border-border text-xs text-foreground rounded-sm hover:border-accent hover:text-accent transition-colors">
              <ShoppingCart className="h-3 w-3" />
              Đặt
            </button>
          </Link>
          <Link href={`/projects/${project.id}#buy-section`} className="flex-1">
            <button className="w-full flex items-center justify-center gap-1 py-1.5 bg-accent text-accent-foreground text-xs rounded-sm hover:bg-accent/90 transition-colors">
              <Download className="h-3 w-3" />
              Mua
            </button>
          </Link>
        </div>
      </div>
    </div>
  )
}

export default async function DashboardPage() {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect('/login')
  }

  const { data: wishlistRows = [] } = await supabase
    .from('wishlists')
    .select('project_id, projects(id, title, category, price, cover_image_url)')
    .eq('user_id', user.id)
    .order('created_at', { ascending: false })

  const profile = await supabase
    .from('profiles')
    .select('name, avatar_url')
    .eq('id', user.id)
    .single()

  const userName =
    profile.data?.name ??
    (user.user_metadata?.full_name as string | undefined) ??
    user.email

  return (
    <div className="min-h-screen bg-background">
      <Header />

      <main className="max-w-7xl mx-auto px-4 py-6">
        {/* Page header */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl font-bold text-foreground">Dashboard</h1>
            <p className="text-muted-foreground text-sm mt-0.5">Chào mừng trở lại, {userName}</p>
          </div>
        </div>

        {/* Wishlist */}
        <section>
          <div className="flex items-center gap-2 mb-4 pb-3 border-b border-border">
            <h2 className="text-base font-semibold text-foreground uppercase tracking-wide">
              Yêu thích của tôi
            </h2>
            <span className="text-sm text-muted-foreground">({(wishlistRows ?? []).length})</span>
          </div>

          {(wishlistRows ?? []).length === 0 ? (
            <div className="text-center py-12 border border-dashed border-border rounded-sm">
              <p className="text-muted-foreground mb-4 text-sm">Danh sách yêu thích trống.</p>
              <Link href="/">
                <Button variant="outline" className="rounded-sm" size="sm">Khám phá sản phẩm</Button>
              </Link>
            </div>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-2.5">
              {(wishlistRows ?? []).map((row: any) => {
                const p = row.projects as Project | null
                if (!p) return null
                return <ShopeeCard key={p.id} project={p} />
              })}
            </div>
          )}
        </section>
      </main>

      <Footer />
    </div>
  )
}
