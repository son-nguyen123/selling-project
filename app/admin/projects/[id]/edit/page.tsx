import { createClient } from '@/lib/supabase/server'
import { notFound } from 'next/navigation'
import { Card } from '@/components/ui/card'
import ProjectForm from '../../project-form'

export default async function EditProjectPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params
  const supabase = await createClient()

  const { data: project } = await supabase
    .from('projects')
    .select('id, title, description, tech_stack, category, price, cover_image_url')
    .eq('id', id)
    .single()

  if (!project) notFound()

  // Fetch matching store_products row to pre-populate store-specific fields
  const { data: storeProduct } = await supabase
    .from('store_products')
    .select('stock, single_image_url, demo_video_url, gallery_urls, specs')
    .contains('specs', { project_id: String(project.id) })
    .maybeSingle()

  // Strip internal project_id key so the specs editor only shows user-defined specs
  const customSpecs: Record<string, string> = {}
  if (storeProduct?.specs && typeof storeProduct.specs === 'object') {
    for (const [k, v] of Object.entries(storeProduct.specs as Record<string, unknown>)) {
      if (k !== 'project_id') customSpecs[k] = String(v)
    }
  }

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-foreground">Edit Project</h1>
      <Card className="p-6">
        <ProjectForm
          mode="edit"
          initialData={{
            id: String(project.id),
            title: project.title,
            description: project.description ?? '',
            tech_stack: project.tech_stack ?? '',
            category: project.category ?? '',
            price: String(project.price),
            cover_image_url: project.cover_image_url ?? '',
            stock: String(storeProduct?.stock ?? 0),
            single_image_url: storeProduct?.single_image_url ?? '',
            demo_video_url: storeProduct?.demo_video_url ?? '',
            gallery_urls: storeProduct?.gallery_urls ?? [],
            specs: customSpecs,
          }}
        />
      </Card>
    </div>
  )
}
