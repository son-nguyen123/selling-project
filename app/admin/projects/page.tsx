import { createClient } from '@/lib/supabase/server'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Card } from '@/components/ui/card'
import { Plus } from 'lucide-react'
import AdminProjectActions from './project-actions'

const PAGE_SIZE = 20

export default async function AdminProjectsPage({
  searchParams,
}: {
  searchParams: Promise<{ page?: string }>
}) {
  const { page: pageStr } = await searchParams
  const page = Math.max(1, parseInt(pageStr ?? '1', 10))
  const from = (page - 1) * PAGE_SIZE
  const to = from + PAGE_SIZE - 1

  const supabase = await createClient()
  const { data: projects, count } = await supabase
    .from('projects')
    .select('id, title, category, price, created_at', { count: 'exact' })
    .order('created_at', { ascending: false })
    .range(from, to)

  const totalPages = Math.ceil((count ?? 0) / PAGE_SIZE)

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-foreground">Projects (Homepage)</h1>
        <Button asChild>
          <Link href="/admin/projects/new">
            <Plus className="mr-2 h-4 w-4" />
            Add New Project
          </Link>
        </Button>
      </div>

      <Card>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border">
                <th className="px-4 py-3 text-left font-medium text-muted-foreground">Title</th>
                <th className="px-4 py-3 text-left font-medium text-muted-foreground">Category</th>
                <th className="px-4 py-3 text-left font-medium text-muted-foreground">Price</th>
                <th className="px-4 py-3 text-left font-medium text-muted-foreground">Created</th>
                <th className="px-4 py-3 text-left font-medium text-muted-foreground">Actions</th>
              </tr>
            </thead>
            <tbody>
              {(projects ?? []).map((project) => (
                <tr key={project.id} className="border-b border-border/50 hover:bg-muted/30">
                  <td className="px-4 py-3 font-medium text-foreground">{project.title}</td>
                  <td className="px-4 py-3">
                    {project.category ? (
                      <Badge variant="secondary" className="text-xs">
                        {project.category}
                      </Badge>
                    ) : (
                      <span className="text-muted-foreground">—</span>
                    )}
                  </td>
                  <td className="px-4 py-3 font-medium">${Number(project.price).toFixed(2)}</td>
                  <td className="px-4 py-3 text-muted-foreground">
                    {new Date(project.created_at).toLocaleDateString()}
                  </td>
                  <td className="px-4 py-3">
                    <AdminProjectActions projectId={project.id} />
                  </td>
                </tr>
              ))}
              {(projects ?? []).length === 0 && (
                <tr>
                  <td colSpan={5} className="px-4 py-8 text-center text-muted-foreground">
                    No projects yet.{' '}
                    <Link
                      href="/admin/projects/new"
                      className="text-primary underline-offset-4 hover:underline"
                    >
                      Add one
                    </Link>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </Card>

      {totalPages > 1 && (
        <div className="flex justify-center gap-2">
          {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => (
            <Link
              key={p}
              href={`/admin/projects?page=${p}`}
              className={`rounded px-3 py-1.5 text-sm font-medium transition-colors ${
                p === page
                  ? 'bg-primary text-primary-foreground'
                  : 'bg-muted text-muted-foreground hover:bg-muted/80'
              }`}
            >
              {p}
            </Link>
          ))}
        </div>
      )}
    </div>
  )
}
