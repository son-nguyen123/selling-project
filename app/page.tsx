import { Search, Filter } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import Header from '@/components/header'
import Hero from '@/components/hero'
import ProjectCard from '@/components/project-card'
import Footer from '@/components/footer'
import { createClient } from '@/lib/supabase/server'

interface Project {
  id: number
  title: string
  description: string | null
  tech_stack: string | null
  category: string | null
  price: number
  author_id: number | null
  cover_image_url: string | null
  created_at: string
  updated_at: string
}

interface ProjectWithAuthor extends Project {
  author_name?: string
}

export default async function Home({
  searchParams,
}: {
  searchParams: Promise<{ search?: string; category?: string; sort?: string }>
}) {
  const { search = '', category = 'All', sort = 'featured' } = await searchParams

  const supabase = await createClient()

  // Fetch projects with author information
  let query = supabase
    .from('projects')
    .select(`
      id,
      title,
      description,
      tech_stack,
      category,
      price,
      author_id,
      cover_image_url,
      created_at,
      updated_at,
      users!author_id(name)
    `)
    .limit(50)

  if (category !== 'All') {
    query = query.eq('category', category)
  }

  if (search) {
    query = query.or(
      `title.ilike.%${search}%,description.ilike.%${search}%,tech_stack.ilike.%${search}%`
    )
  }

  // Apply sorting
  if (sort === 'latest') {
    query = query.order('created_at', { ascending: false })
  } else if (sort === 'price-low') {
    query = query.order('price', { ascending: true })
  } else if (sort === 'price-high') {
    query = query.order('price', { ascending: false })
  } else {
    query = query.order('created_at', { ascending: false })
  }

  const { data: projects = [] } = await query

  // Transform data to include author names
  const projectsWithAuthors: ProjectWithAuthor[] = (projects as any[]).map((project) => ({
    ...project,
    author_name: project.users?.name || 'Unknown Author',
  }))

  const categories = ['All', 'Web App', 'Mobile', 'Backend', 'Component Library', 'Other']

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <Hero />

      <main className="max-w-7xl mx-auto px-4 py-12">
        {/* Search and Filters Section */}
        <div className="space-y-6 mb-12">
          <div className="flex gap-4 flex-col lg:flex-row">
            <form action="/" className="flex-1 relative" method="get">
              <Search className="absolute left-3 top-3 h-5 w-5 text-muted-foreground" />
              <Input
                placeholder="Search by project name, description, or technology..."
                className="pl-10"
                name="search"
                defaultValue={search}
              />
            </form>
            <Button variant="outline" className="gap-2">
              <Filter className="h-4 w-4" />
              Advanced
            </Button>
          </div>

          {/* Category Pills */}
          <div className="flex gap-2 flex-wrap">
            {categories.map((cat) => (
              <form key={cat} action="/" method="get" className="inline">
                <input type="hidden" name="category" value={cat} />
                <input type="hidden" name="search" value={search} />
                <input type="hidden" name="sort" value={sort} />
                <button type="submit">
                  <Badge
                    variant={category === cat ? 'default' : 'outline'}
                    className="cursor-pointer px-4 py-2"
                  >
                    {cat}
                  </Badge>
                </button>
              </form>
            ))}
          </div>
        </div>

        {/* Results Header */}
        <div className="flex justify-between items-center mb-8">
          <h2 className="text-2xl font-bold">
            Featured Projects{' '}
            <span className="text-muted-foreground font-normal text-lg">({projectsWithAuthors.length})</span>
          </h2>
          <form action="/" method="get" className="inline">
            <input type="hidden" name="search" value={search} />
            <input type="hidden" name="category" value={category} />
            <select
              name="sort"
              defaultValue={sort}
              onChange={(e) => e.target.form?.submit()}
              className="bg-card text-foreground border border-border rounded-lg px-4 py-2"
            >
              <option value="featured">Featured</option>
              <option value="latest">Latest</option>
              <option value="price-low">Price: Low to High</option>
              <option value="price-high">Price: High to Low</option>
            </select>
          </form>
        </div>

        {/* Projects Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {projectsWithAuthors.map((project) => (
            <ProjectCard
              key={project.id}
              project={{
                id: project.id,
                title: project.title,
                author: project.author_name || 'Unknown',
                price: parseFloat(String(project.price)),
                image: project.cover_image_url || 'https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=500&h=300&fit=crop',
                rating: 4.5,
                reviews: 0,
                category: project.category || 'Other',
                tech: project.tech_stack ? project.tech_stack.split(',').map((t) => t.trim()) : [],
              }}
              isWishlisted={false}
              onToggleWishlist={() => {}}
            />
          ))}
        </div>

        {/* Empty State */}
        {projectsWithAuthors.length === 0 && (
          <div className="text-center py-16">
            <p className="text-muted-foreground text-lg mb-4">No projects found matching your criteria.</p>
            <form action="/" method="get">
              <Button type="submit" variant="outline">
                Clear Filters
              </Button>
            </form>
          </div>
        )}
      </main>

      <Footer />
    </div>
  )
}
