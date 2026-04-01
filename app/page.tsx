import { Badge } from '@/components/ui/badge'
import Header from '@/components/header'
import Hero from '@/components/hero'
import Footer from '@/components/footer'
import SortDropdown from '@/components/sort-dropdown'
import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { Suspense } from 'react'
import SkeletonCard from '@/components/skeleton-card'
import { redirect } from 'next/navigation'
import StoreProductCard from '@/components/store/store-product-card'

interface StoreProduct {
  id: string
  name: string
  price: number
  description?: string | null
  category?: string | null
  stock: number
  dashboard_image_url?: string | null
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

  // Use service role client to bypass RLS for public product listing.
  // Falls back to the regular session client if SUPABASE_SERVICE_ROLE_KEY is not set.
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  let supabase: any
  try {
    supabase = createAdminClient()
  } catch {
    supabase = await createClient()
  }

  let storeProducts: StoreProduct[] = []
  try {
    let spQuery = supabase
      .from('store_products')
      .select('id, name, price, description, category, stock, dashboard_image_url')

    if (category !== 'All') {
      spQuery = spQuery.eq('category', category)
    }

    if (search) {
      spQuery = spQuery.or(`name.ilike.%${search}%,description.ilike.%${search}%`)
    }

    if (sort === 'latest') {
      spQuery = spQuery.order('created_at', { ascending: false })
    } else if (sort === 'price-low') {
      spQuery = spQuery.order('price', { ascending: true })
    } else if (sort === 'price-high') {
      spQuery = spQuery.order('price', { ascending: false })
    } else {
      spQuery = spQuery.order('created_at', { ascending: false })
    }

    const { data: spData, error: spError } = await spQuery.limit(50)
    if (spError) console.error('[page] store_products fetch error:', spError.message)
    if (spData) storeProducts = spData as StoreProduct[]
  } catch (err) {
    console.error('[page] store_products unexpected error:', err)
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
            <span className="text-sm text-muted-foreground">{storeProducts.length} sản phẩm</span>
            <SortDropdown sort={sort} search={search} category={category} />
          </div>
        </div>

        {/* Primary product grid: admin-managed store products */}
        <Suspense fallback={
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-2.5">
            {Array.from({ length: 10 }).map((_, i) => <SkeletonCard key={i} />)}
          </div>
        }>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-2.5">
            {storeProducts.map((product) => (
              <StoreProductCard key={product.id} product={product} />
            ))}
          </div>
        </Suspense>

        {/* Empty State */}
        {storeProducts.length === 0 && (
          <div className="text-center py-16 border border-dashed border-border rounded-sm">
            <p className="text-muted-foreground text-lg mb-4">
              Không tìm thấy sản phẩm nào phù hợp.
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

