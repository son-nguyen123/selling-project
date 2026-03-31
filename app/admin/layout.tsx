import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import AdminNav from '@/components/admin/admin-nav'
import Link from 'next/link'
import { LayoutDashboard } from 'lucide-react'

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user?.email?.endsWith('@admin.com')) {
    redirect('/')
  }

  return (
    <div className="min-h-screen bg-zinc-950 text-foreground flex flex-col">
      {/* Admin top bar */}
      <header className="h-14 border-b border-zinc-800 bg-zinc-900 flex items-center px-6 shrink-0">
        <Link href="/admin" className="flex items-center gap-2">
          <div className="bg-accent rounded p-1">
            <LayoutDashboard className="h-4 w-4 text-white" />
          </div>
          <span className="font-bold text-white text-sm tracking-tight">ProjectHub Admin</span>
        </Link>
        <div className="ml-auto flex items-center gap-3">
          <span className="text-xs text-zinc-400 hidden sm:block">{user.email}</span>
        </div>
      </header>

      {/* Body: sidebar + content */}
      <div className="flex flex-1 overflow-hidden">
        <AdminNav adminEmail={user.email ?? ''} />
        <main className="flex-1 overflow-y-auto p-6 bg-zinc-950 min-w-0">{children}</main>
      </div>
    </div>
  )
}

