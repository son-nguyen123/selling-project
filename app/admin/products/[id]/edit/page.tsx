import { createClient } from '@/lib/supabase/server'
import { notFound } from 'next/navigation'
import { Card } from '@/components/ui/card'
import ProductForm from '../../product-form'

export default async function EditProductPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params
  const supabase = await createClient()

  const { data: product } = await supabase
    .from('store_products')
    .select('*')
    .eq('id', id)
    .single()

  if (!product) notFound()

  const specsEntries = product.specs
    ? Object.entries(product.specs as Record<string, string>).map(([key, value]) => ({ key, value }))
    : []

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-foreground">Edit Product</h1>
      <Card className="p-6">
        <ProductForm
          mode="edit"
          initialData={{
            id: product.id,
            name: product.name,
            description: product.description ?? '',
            price: String(product.price),
            category: product.category ?? '',
            stock: String(product.stock ?? 0),
            dashboard_image_url: product.dashboard_image_url ?? '',
            single_image_url: product.single_image_url ?? '',
            demo_video_url: product.demo_video_url ?? '',
            gallery_urls: product.gallery_urls ?? [],
            specs: specsEntries,
          }}
        />
      </Card>
    </div>
  )
}
