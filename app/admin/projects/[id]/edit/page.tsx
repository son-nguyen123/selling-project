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
          }}
        />
      </Card>
    </div>
  )
}
