import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import Header from '@/components/header'
import Footer from '@/components/footer'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import Link from 'next/link'
import { Plus, Eye, ShoppingCart, Download } from 'lucide-react'

interface Project {
  id: number
  title: string
  category: string | null
  price: number
  cover_image_url: string | null
  created_at: string
}

export default async function DashboardPage() {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect('/login')
  }

  // Fetch user's projects
  const { data: projects = [] } = await supabase
    .from('projects')
    .select('id, title, category, price, cover_image_url, created_at')
    .eq('author_id', user.id)
    .order('created_at', { ascending: false })

  // Fetch user's wishlisted projects
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

      <main className="max-w-7xl mx-auto px-4 py-12">
        {/* Page header */}
        <div className="flex items-center justify-between mb-10">
          <div>
            <h1 className="text-3xl font-bold text-foreground">Dashboard</h1>
            <p className="text-muted-foreground mt-1">Welcome back, {userName}</p>
          </div>
          <Link href="/upload">
            <Button className="gap-2">
              <Plus className="h-4 w-4" />
              New Project
            </Button>
          </Link>
        </div>

        {/* My Projects */}
        <section className="mb-14">
          <h2 className="text-xl font-semibold text-foreground mb-6">
            My Projects{' '}
            <span className="text-muted-foreground font-normal text-base">
              ({(projects as Project[]).length})
            </span>
          </h2>

          {(projects as Project[]).length === 0 ? (
            <div className="text-center py-16 border border-dashed border-border rounded-xl">
              <p className="text-muted-foreground mb-4">You haven&apos;t listed any projects yet.</p>
              <Link href="/upload">
                <Button variant="outline" className="gap-2">
                  <Plus className="h-4 w-4" />
                  Upload your first project
                </Button>
              </Link>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {(projects as Project[]).map((project) => (
                <Card
                  key={project.id}
                  className="overflow-hidden border border-border hover:shadow-lg transition-all duration-300 flex flex-col"
                >
                  <Link href={`/projects/${project.id}`} className="block">
                    <div className="relative h-44 bg-muted overflow-hidden">
                      <img
                        src={
                          project.cover_image_url ||
                          'https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=400&h=200&fit=crop'
                        }
                        alt={project.title}
                        className="w-full h-full object-cover hover:scale-105 transition-transform duration-300"
                      />
                      <div className="absolute top-2 left-2">
                        <Badge variant="secondary" className="bg-background/80 backdrop-blur">
                          {project.category ?? 'Other'}
                        </Badge>
                      </div>
                    </div>
                  </Link>
                  <div className="p-4 flex flex-col flex-1">
                    <Link href={`/projects/${project.id}`}>
                      <h3 className="font-semibold text-foreground truncate hover:text-accent transition-colors">
                        {project.title}
                      </h3>
                    </Link>
                    <p className="text-accent font-bold text-lg mt-1 mb-4">
                      ${Number(project.price).toFixed(2)}
                    </p>
                    <div className="mt-auto flex gap-2">
                      <Link href={`/projects/${project.id}`} className="flex-1">
                        <Button size="sm" variant="outline" className="w-full gap-1">
                          <Eye className="h-3 w-3" />
                          Xem Thêm
                        </Button>
                      </Link>
                      <Link href={`/projects/${project.id}#buy-section`} className="flex-1">
                        <Button size="sm" variant="outline" className="w-full gap-1">
                          <ShoppingCart className="h-3 w-3" />
                          Đặt Hàng
                        </Button>
                      </Link>
                      <Link href={`/projects/${project.id}#buy-section`} className="flex-1">
                        <Button size="sm" className="w-full gap-1">
                          <Download className="h-3 w-3" />
                          Mua Ngay
                        </Button>
                      </Link>
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          )}
        </section>

        {/* Wishlist */}
        <section>
          <h2 className="text-xl font-semibold text-foreground mb-6">
            My Wishlist{' '}
            <span className="text-muted-foreground font-normal text-base">
              ({(wishlistRows ?? []).length})
            </span>
          </h2>

          {(wishlistRows ?? []).length === 0 ? (
            <div className="text-center py-16 border border-dashed border-border rounded-xl">
              <p className="text-muted-foreground mb-4">Your wishlist is empty.</p>
              <Link href="/">
                <Button variant="outline">Browse Projects</Button>
              </Link>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {(wishlistRows ?? []).map((row: any) => {
                const p = row.projects as Project | null
                if (!p) return null
                return (
                  <Card key={p.id} className="overflow-hidden border border-border hover:shadow-lg transition-all duration-300 flex flex-col">
                    <Link href={`/projects/${p.id}`} className="block">
                      <div className="relative h-44 bg-muted overflow-hidden">
                        <img
                          src={
                            p.cover_image_url ||
                            'https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=400&h=200&fit=crop'
                          }
                          alt={p.title}
                          className="w-full h-full object-cover hover:scale-105 transition-transform duration-300"
                        />
                      </div>
                    </Link>
                    <div className="p-4 flex flex-col flex-1">
                      <Link href={`/projects/${p.id}`}>
                        <h3 className="font-semibold text-foreground truncate hover:text-accent transition-colors">
                          {p.title}
                        </h3>
                      </Link>
                      <p className="text-accent font-bold text-lg mt-1 mb-4">
                        ${Number(p.price).toFixed(2)}
                      </p>
                      <div className="mt-auto flex gap-2">
                        <Link href={`/projects/${p.id}`} className="flex-1">
                          <Button size="sm" variant="outline" className="w-full gap-1">
                            <Eye className="h-3 w-3" />
                            Xem Thêm
                          </Button>
                        </Link>
                        <Link href={`/projects/${p.id}#buy-section`} className="flex-1">
                          <Button size="sm" variant="outline" className="w-full gap-1">
                            <ShoppingCart className="h-3 w-3" />
                            Đặt Hàng
                          </Button>
                        </Link>
                        <Link href={`/projects/${p.id}#buy-section`} className="flex-1">
                          <Button size="sm" className="w-full gap-1">
                            <Download className="h-3 w-3" />
                            Mua Ngay
                          </Button>
                        </Link>
                      </div>
                    </div>
                  </Card>
                )
              })}
            </div>
          )}
        </section>
      </main>

      <Footer />
    </div>
  )
}
