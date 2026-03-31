import { Card } from '@/components/ui/card'
import ProjectForm from '../project-form'

export default function NewProjectPage() {
  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-foreground">Add New Project</h1>
      <Card className="p-6">
        <ProjectForm mode="create" />
      </Card>
    </div>
  )
}
