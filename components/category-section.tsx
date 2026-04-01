import Link from 'next/link'
import StoreProductCard from '@/components/store/store-product-card'
import { ChevronRight } from 'lucide-react'

interface Product {
  id: string
  name: string
  price: number
  description?: string | null
  category?: string | null
  stock: number
  dashboard_image_url?: string | null
}

interface CategorySectionProps {
  title: string
  category: string
  products: Product[]
}

export default function CategorySection({ title, category, products }: CategorySectionProps) {
  if (products.length === 0) return null

  return (
    <section className="mb-10">
      {/* Section header */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-3">
          <div className="w-1 h-6 bg-primary rounded-full" />
          <h2 className="text-lg font-bold text-foreground">{title}</h2>
        </div>
        <Link
          href={`/?category=${encodeURIComponent(category)}`}
          className="flex items-center gap-1 text-sm text-primary hover:text-primary/80 transition-colors font-medium"
        >
          Xem tất cả
          <ChevronRight className="h-4 w-4" />
        </Link>
      </div>

      {/* Product grid */}
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-2.5">
        {products.slice(0, 5).map((product) => (
          <StoreProductCard key={product.id} product={product} />
        ))}
      </div>
    </section>
  )
}
