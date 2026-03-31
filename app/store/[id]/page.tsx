import { createClient } from '@/lib/supabase/server'
import { notFound } from 'next/navigation'
import Link from 'next/link'
import Header from '@/components/header'
import { ArrowLeft } from 'lucide-react'
import { ProductDetail } from './product-detail'

export default async function StoreProductPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params
  const supabase = await createClient()

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

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main className="mx-auto max-w-6xl px-4 py-8 sm:px-6 lg:px-8">
        <Link
          href="/store"
          className="mb-6 inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to Store
        </Link>

        <ProductDetail
          product={product}
          reviews={reviews ?? []}
          currentUserId={user?.id ?? null}
          currentUserEmail={user?.email ?? null}
        />
      </main>
    </div>
  )
}
