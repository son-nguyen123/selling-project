import { createClient } from '@/lib/supabase/server'
import Header from '@/components/header'
import StoreProductCard from '@/components/store/store-product-card'
import CartButton from '@/components/store/cart-button'
import Link from 'next/link'
import { Search } from 'lucide-react'

const CATEGORIES = ['All', 'Web App', 'Mobile', 'Backend', 'Component Library', 'Other']

interface SearchParams {
  search?: string
  category?: string
}

export default async function StorePage({
  searchParams,
}: {
  searchParams: Promise<SearchParams>
}) {
  const { search, category } = await searchParams
  const supabase = await createClient()

  let query = supabase
    .from('store_products')
    .select('id, name, price, description, category, stock, dashboard_image_url')
    .order('created_at', { ascending: false })

  if (search) {
    query = query.ilike('name', `%${search}%`)
  }

  if (category && category !== 'All') {
    query = query.eq('category', category)
  }

  const { data: productsData } = await query
  const products = productsData ?? []

  return (
    <div className="min-h-screen bg-background">
      <Header />

      <main className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-3xl font-bold text-foreground">Store</h1>
            <p className="mt-1 text-sm text-muted-foreground">
              {products.length} product{products.length !== 1 ? 's' : ''} found
            </p>
          </div>
          <CartButton />
        </div>

        {/* Search bar */}
        <form method="GET" className="mb-6 flex gap-3">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <input
              type="text"
              name="search"
              defaultValue={search ?? ''}
              placeholder="Search products..."
              className="w-full rounded-md border border-input bg-background py-2 pl-9 pr-4 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring"
            />
          </div>
          {category && category !== 'All' && (
            <input type="hidden" name="category" value={category} />
          )}
          <button
            type="submit"
            className="rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90"
          >
            Search
          </button>
        </form>

        {/* Category pills */}
        <div className="mb-8 flex flex-wrap gap-2">
          {CATEGORIES.map((cat) => {
            const isActive = (!category && cat === 'All') || category === cat
            const href =
              cat === 'All'
                ? search
                  ? `/store?search=${encodeURIComponent(search)}`
                  : '/store'
                : search
                ? `/store?search=${encodeURIComponent(search)}&category=${encodeURIComponent(cat)}`
                : `/store?category=${encodeURIComponent(cat)}`
            return (
              <Link
                key={cat}
                href={href}
                className={`rounded-full px-4 py-1.5 text-sm font-medium transition-colors ${
                  isActive
                    ? 'bg-primary text-primary-foreground'
                    : 'bg-muted text-muted-foreground hover:bg-muted/80'
                }`}
              >
                {cat}
              </Link>
            )
          })}
        </div>

        {/* Product grid */}
        {products.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 text-center">
            <p className="text-xl font-semibold text-muted-foreground">No products found</p>
            <p className="mt-2 text-sm text-muted-foreground">
              Try adjusting your search or filters.
            </p>
            <Link
              href="/store"
              className="mt-4 text-sm text-primary underline-offset-4 hover:underline"
            >
              Clear filters
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {products.map((product) => (
              <StoreProductCard key={product.id} product={product} />
            ))}
          </div>
        )}
      </main>
    </div>
  )
}
