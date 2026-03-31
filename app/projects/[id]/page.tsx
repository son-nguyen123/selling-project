import { createClient } from '@/lib/supabase/server'
import { notFound } from 'next/navigation'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import Header from '@/components/header'
import Footer from '@/components/footer'
import { Download, ArrowLeft, User, ShoppingCart } from 'lucide-react'
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

  // Fetch project without profile join first for resilience
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

  // Optionally fetch author profile (non-critical)
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

      <main className="max-w-5xl mx-auto px-4 py-12">
        <Link
          href="/"
          className="inline-flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors mb-8"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to Projects
        </Link>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
          {/* Left: Image + Purchase */}
          <div className="lg:col-span-2 space-y-6">
            <div className="rounded-xl overflow-hidden border border-border aspect-video bg-muted">
              <img
                src={
                  project.cover_image_url ||
                  'https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=800&h=450&fit=crop'
                }
                alt={project.title}
                className="w-full h-full object-cover"
              />
            </div>

            {/* Description */}
            <div>
              <h2 className="text-xl font-semibold text-foreground mb-3">About this project</h2>
              <p className="text-muted-foreground leading-relaxed">
                {project.description || 'No description provided.'}
              </p>
            </div>

            {/* Tech Stack */}
            {techList.length > 0 && (
              <div>
                <h2 className="text-xl font-semibold text-foreground mb-3">Tech Stack</h2>
                <div className="flex flex-wrap gap-2">
                  {techList.map((tech) => (
                    <Badge key={tech} variant="outline" className="px-3 py-1">
                      {tech}
                    </Badge>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Right: Purchase Card */}
          <div className="space-y-4" id="buy-section">
            <div className="bg-card border border-border rounded-xl p-6 sticky top-24">
              <div className="mb-1">
                <Badge variant="secondary">{project.category ?? 'Other'}</Badge>
              </div>

              <h1 className="text-2xl font-bold text-foreground mt-3 mb-4">{project.title}</h1>

              {/* Author */}
              <div className="flex items-center gap-2 mb-6 pb-6 border-b border-border">
                <div className="w-8 h-8 rounded-full bg-muted flex items-center justify-center overflow-hidden">
                  {authorProfile?.avatar_url ? (
                    <img
                      src={authorProfile.avatar_url}
                      alt={authorName}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <User className="h-4 w-4 text-muted-foreground" />
                  )}
                </div>
                <span className="text-sm text-muted-foreground">by {authorName}</span>
              </div>

              <div className="flex items-baseline gap-1 mb-6">
                <span className="text-4xl font-bold text-foreground">
                  ${Number(project.price).toFixed(2)}
                </span>
                <span className="text-sm text-muted-foreground">one-time</span>
              </div>

              <div className="flex flex-col gap-3">
                <Button className="w-full gap-2 py-6 text-base" size="lg">
                  <Download className="h-5 w-5" />
                  Mua Ngay
                </Button>
                <Button variant="outline" className="w-full gap-2 py-5 text-base" size="lg">
                  <ShoppingCart className="h-5 w-5" />
                  Đặt Hàng
                </Button>
              </div>

              <p className="text-xs text-muted-foreground text-center mt-4">
                Instant download after purchase
              </p>
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  )
}
