import { Card } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'

export default function SkeletonCard() {
  return (
    <Card className="overflow-hidden border border-border h-full flex flex-col">
      <Skeleton className="h-48 w-full rounded-none" />
      <div className="p-4 flex-1 flex flex-col gap-3">
        <Skeleton className="h-5 w-3/4" />
        <Skeleton className="h-4 w-1/3" />
        <Skeleton className="h-4 w-1/2" />
        <div className="flex gap-2 mt-auto pt-4">
          <Skeleton className="h-8 w-16" />
          <Skeleton className="h-8 w-16" />
        </div>
      </div>
    </Card>
  )
}
