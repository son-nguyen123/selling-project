'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Pencil, Trash2 } from 'lucide-react'
import { toast } from 'sonner'

export default function AdminProductActions({ productId }: { productId: string }) {
  const [deleting, setDeleting] = useState(false)
  const router = useRouter()

  async function handleDelete() {
    if (!confirm('Delete this product? This action cannot be undone.')) return
    setDeleting(true)
    try {
      const res = await fetch(`/api/store/products/${productId}`, { method: 'DELETE' })
      if (!res.ok) throw new Error('Failed to delete product')
      toast.success('Product deleted')
      router.refresh()
    } catch {
      toast.error('Failed to delete product')
    } finally {
      setDeleting(false)
    }
  }

  return (
    <div className="flex items-center gap-2">
      <Button variant="ghost" size="icon" className="h-8 w-8" asChild>
        <Link href={`/admin/products/${productId}/edit`}>
          <Pencil className="h-3.5 w-3.5" />
        </Link>
      </Button>
      <Button
        variant="ghost"
        size="icon"
        className="h-8 w-8 text-destructive hover:bg-destructive/10"
        onClick={handleDelete}
        disabled={deleting}
      >
        <Trash2 className="h-3.5 w-3.5" />
      </Button>
    </div>
  )
}
