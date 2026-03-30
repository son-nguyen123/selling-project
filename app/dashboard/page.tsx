import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import Header from '@/components/header'
import Footer from '@/components/footer'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import Link from 'next/link'
import { Plus, Pencil } from 'lucide-react'

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

  const userName = profile.data?.name ?? user.email

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
                <Card key={project.id} className="overflow-hidden border border-border">
                  <div className="relative h-36 bg-muted">
                    <img
                      src={
                        project.cover_image_url ||
                        'https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=400&h=200&fit=crop'
                      }
                      alt={project.title}
                      className="w-full h-full object-cover"
                    />
                    <div className="absolute top-2 left-2">
                      <Badge variant="secondary" className="bg-background/80 backdrop-blur">
                        {project.category ?? 'Other'}
                      </Badge>
                    </div>
                  </div>
                  <div className="p-4 flex items-center justify-between gap-2">
                    <div className="min-w-0">
                      <h3 className="font-semibold text-foreground truncate">{project.title}</h3>
                      <p className="text-accent font-bold">${Number(project.price).toFixed(2)}</p>
                    </div>
                    <Link href={`/projects/${project.id}`}>
                      <Button size="sm" variant="outline" className="gap-1 shrink-0">
                        <Pencil className="h-3 w-3" />
                        View
                      </Button>
                    </Link>
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
                  <Card key={p.id} className="overflow-hidden border border-border">
                    <div className="relative h-36 bg-muted">
                      <img
                        src={
                          p.cover_image_url ||
                          'https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=400&h=200&fit=crop'
                        }
                        alt={p.title}
                        className="w-full h-full object-cover"
                      />
                    </div>
                    <div className="p-4 flex items-center justify-between gap-2">
                      <div className="min-w-0">
                        <h3 className="font-semibold text-foreground truncate">{p.title}</h3>
                        <p className="text-accent font-bold">${Number(p.price).toFixed(2)}</p>
                      </div>
                      <Link href={`/projects/${p.id}`}>
                        <Button size="sm" variant="outline" className="shrink-0">
                          View
                        </Button>
                      </Link>
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
