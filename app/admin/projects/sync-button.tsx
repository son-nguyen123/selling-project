'use client'

import { useState } from 'react'
import { RefreshCw } from 'lucide-react'
import { toast } from 'sonner'

export default function SyncProjectsButton() {
  const [loading, setLoading] = useState(false)

  async function handleSync() {
    setLoading(true)
    try {
      const res = await fetch('/api/admin/sync-projects', { method: 'POST' })
      const json = await res.json()
      if (!res.ok) {
        toast.error(json.error ?? 'Sync failed')
        return
      }
      if (json.synced === 0) {
        toast.info(`Tất cả dự án đã được đồng bộ (${json.skipped} bỏ qua)`)
      } else {
        toast.success(`Đã đồng bộ ${json.synced} dự án vào store_products`)
      }
    } catch {
      toast.error('Sync failed')
    } finally {
      setLoading(false)
    }
  }

  return (
    <button
      onClick={handleSync}
      disabled={loading}
      className="flex items-center gap-1.5 rounded-md border border-zinc-700 bg-zinc-800 hover:bg-zinc-700 text-zinc-300 text-xs font-medium px-3 py-2 transition-colors disabled:opacity-50"
    >
      <RefreshCw className={`h-3.5 w-3.5 ${loading ? 'animate-spin' : ''}`} />
      {loading ? 'Đang đồng bộ...' : 'Đồng bộ vào Store'}
    </button>
  )
}
