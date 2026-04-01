import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { notFound } from 'next/navigation'
import Link from 'next/link'
import Header from '@/components/header'
import Footer from '@/components/footer'
import { ArrowLeft } from 'lucide-react'
import { ProductDetail } from './product-detail'

export default async function StoreProductPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params
  const supabase = await createClient()

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  let adminSupabase: any
  try {
    adminSupabase = createAdminClient()
  } catch {
    adminSupabase = supabase
  }

  const [{ data: product }, { data: reviews }, { data: { user } }] = await Promise.all([
    supabase
      .from('store_products')
      .select('*')
      .eq('id', id)
      .single(),
    supabase
      .from('product_reviews')
      .select('id, rating, comment, created_at, user_id')
      .eq('product_id', id)
      .order('created_at', { ascending: false }),
    supabase.auth.getUser(),
  ])

  if (!product) {
    notFound()
  }

  // Fetch related products (same category, exclude current)
  const { data: relatedProducts } = await adminSupabase
    .from('store_products')
    .select('id, name, price, category, stock, dashboard_image_url, description')
    .eq('category', product.category ?? '')
    .neq('id', id)
    .order('created_at', { ascending: false })
    .limit(5)

  // Fetch featured sidebar products (latest, any category, exclude current)
  const { data: featuredProducts } = await adminSupabase
    .from('store_products')
    .select('id, name, price, category, stock, dashboard_image_url')
    .neq('id', id)
    .order('created_at', { ascending: false })
    .limit(8)

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        <Link
          href="/"
          className="mb-6 inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground"
        >
          <ArrowLeft className="h-4 w-4" />
          Về trang chủ
        </Link>

        <ProductDetail
          product={product}
          reviews={reviews ?? []}
          currentUserId={user?.id ?? null}
          currentUserEmail={user?.email ?? null}
          relatedProducts={relatedProducts ?? []}
          featuredProducts={featuredProducts ?? []}
        />
      </main>
      <Footer />
    </div>
  )
}
