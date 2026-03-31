import { Badge } from '@/components/ui/badge'
import Header from '@/components/header'
import Hero from '@/components/hero'
import ProjectCard from '@/components/project-card'
import Footer from '@/components/footer'
import SortDropdown from '@/components/sort-dropdown'
import { createClient } from '@/lib/supabase/server'
import { Suspense } from 'react'
import SkeletonCard from '@/components/skeleton-card'
import { redirect } from 'next/navigation'

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
  author_id: string | null
  cover_image_url: string | null
  created_at: string
  profiles: Profile | null
}

export default async function Home({
  searchParams,
}: {
  searchParams: Promise<{
    search?: string
    category?: string
    sort?: string
    error?: string
    error_code?: string
  }>
}) {
  const { search = '', category = 'All', sort = 'featured', error_code } = await searchParams

  if (error_code === 'otp_expired') {
    redirect('/check-email?expired=true')
  }

  const supabase = await createClient()

  // Get current user (null if not logged in)
  const {
    data: { user },
  } = await supabase.auth.getUser()

  // Fetch projects
  let projects: Project[] = []
  try {
    let query = supabase
      .from('projects')
      .select(
        `
        id,
        title,
        description,
        tech_stack,
        category,
        price,
        author_id,
        cover_image_url,
        created_at,
        profiles!author_id(name, avatar_url)
      `,
      )
      .limit(50)

    if (category !== 'All') {
      query = query.eq('category', category)
    }

    if (search) {
      query = query.or(
        `title.ilike.%${search}%,description.ilike.%${search}%,tech_stack.ilike.%${search}%`,
      )
    }

    if (sort === 'latest') {
      query = query.order('created_at', { ascending: false })
    } else if (sort === 'price-low') {
      query = query.order('price', { ascending: true })
    } else if (sort === 'price-high') {
      query = query.order('price', { ascending: false })
    } else {
      query = query.order('created_at', { ascending: false })
    }

    const { data, error } = await query
    if (!error && data) {
      projects = data as unknown as Project[]
    }
  } catch (err) {
    console.error(
      'Failed to load projects. Check NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_PUBLISHABLE_DEFAULT_KEY env vars:',
      err,
    )
  }

  // Fetch user's wishlisted project IDs (only if logged in)
  const wishlistedIds = new Set<number>()
  if (user) {
    try {
      const { data: wishlist } = await supabase
        .from('wishlists')
        .select('project_id')
        .eq('user_id', user.id)

      wishlist?.forEach((row) => wishlistedIds.add(row.project_id as number))
    } catch {
      // Wishlist fetch is non-critical
    }
  }

  const categories = ['All', 'Web App', 'Mobile', 'Backend', 'Component Library', 'Other']

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <Hero />

      <main className="max-w-7xl mx-auto px-4 py-6">
        {/* Category + Sort row */}
        <div className="flex items-center justify-between mb-4 flex-wrap gap-3">
          {/* Category Pills */}
          <div className="flex gap-1.5 flex-wrap">
            {categories.map((cat) => (
              <form key={cat} action="/" method="get" className="inline">
                <input type="hidden" name="category" value={cat} />
                <input type="hidden" name="search" value={search} />
                <input type="hidden" name="sort" value={sort} />
                <button type="submit">
                  <Badge
                    variant={category === cat ? 'default' : 'outline'}
                    className={`cursor-pointer px-3 py-1 rounded-sm text-xs ${category === cat ? 'bg-accent text-accent-foreground border-accent' : ''}`}
                  >
                    {cat}
                  </Badge>
                </button>
              </form>
            ))}
          </div>

          <div className="flex items-center gap-3">
            <span className="text-sm text-muted-foreground">{projects.length} sản phẩm</span>
            <SortDropdown sort={sort} search={search} category={category} />
          </div>
        </div>

        {/* Shopee-style product grid: 2 cols mobile → 3 tablet → 4 md → 5 lg */}
        <Suspense fallback={
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-2.5">
            {Array.from({ length: 10 }).map((_, i) => <SkeletonCard key={i} />)}
          </div>
        }>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-2.5">
            {projects.map((project) => (
              <ProjectCard
                key={project.id}
                project={{
                  id: project.id,
                  title: project.title,
                  author: project.profiles?.name ?? 'Unknown',
                  price: parseFloat(String(project.price)),
                  image:
                    project.cover_image_url ||
                    'https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=500&h=500&fit=crop',
                  rating: 4.5,
                  reviews: 0,
                  category: project.category || 'Other',
                  tech: project.tech_stack
                    ? project.tech_stack.split(',').map((t) => t.trim())
                    : [],
                }}
                initialIsWishlisted={wishlistedIds.has(project.id)}
                isLoggedIn={!!user}
              />
            ))}
          </div>
        </Suspense>

        {/* Empty State */}
        {projects.length === 0 && (
          <div className="text-center py-16 border border-dashed border-border rounded-sm">
            <p className="text-muted-foreground text-lg mb-4">
              Không tìm thấy dự án nào phù hợp.
            </p>
            <form action="/" method="get">
              <button type="submit" className="px-4 py-2 border border-border rounded-sm text-sm hover:border-accent hover:text-accent transition-colors">
                Xoá bộ lọc
              </button>
            </form>
          </div>
        )}
      </main>

      <Footer />
    </div>
  )
}

