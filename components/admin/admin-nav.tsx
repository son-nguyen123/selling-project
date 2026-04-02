'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { LayoutDashboard, Package, ShoppingCart, FolderOpen, LogOut, Wallet } from 'lucide-react'

const navItems = [
  { href: '/admin', label: 'Tổng quan', icon: LayoutDashboard, exact: true },
  { href: '/admin/projects', label: 'Dự án', icon: FolderOpen, exact: false },
  { href: '/admin/products', label: 'Sản phẩm', icon: Package, exact: false },
  { href: '/admin/orders', label: 'Đơn hàng', icon: ShoppingCart, exact: false },
  { href: '/admin/wallet', label: 'Ví tiền', icon: Wallet, exact: false },
]

export default function AdminNav({ adminEmail }: { adminEmail: string }) {
  const pathname = usePathname()

  function isActive(href: string, exact: boolean) {
    if (exact) return pathname === href
    return pathname.startsWith(href)
  }

  return (
    <aside className="w-60 shrink-0 min-h-[calc(100vh-56px)] bg-zinc-900 border-r border-zinc-800 flex flex-col">
      {/* Admin branding */}
      <div className="px-5 py-5 border-b border-zinc-800">
        <span className="text-xs font-bold uppercase tracking-widest text-zinc-500">
          Admin Panel
        </span>
        <p className="mt-1 text-xs text-zinc-400 truncate">{adminEmail}</p>
      </div>

      {/* Nav links */}
      <nav className="flex-1 px-3 py-4 space-y-0.5">
        {navItems.map(({ href, label, icon: Icon, exact }) => {
          const active = isActive(href, exact)
          return (
            <Link
              key={href}
              href={href}
              className={`flex items-center gap-3 rounded-md px-3 py-2.5 text-sm font-medium transition-colors ${
                active
                  ? 'bg-accent text-white'
                  : 'text-zinc-400 hover:bg-zinc-800 hover:text-zinc-100'
              }`}
            >
              <Icon className="h-4 w-4 shrink-0" />
              {label}
            </Link>
          )
        })}
      </nav>

      {/* Quick actions */}
      <div className="px-3 py-4 border-t border-zinc-800 space-y-0.5">
        <Link
          href="/admin/projects/new"
          className="flex items-center gap-3 rounded-md px-3 py-2.5 text-sm font-medium text-zinc-400 hover:bg-zinc-800 hover:text-zinc-100 transition-colors"
        >
          <FolderOpen className="h-4 w-4 shrink-0" />
          + Thêm dự án
        </Link>
        <Link
          href="/admin/products/new"
          className="flex items-center gap-3 rounded-md px-3 py-2.5 text-sm font-medium text-zinc-400 hover:bg-zinc-800 hover:text-zinc-100 transition-colors"
        >
          <Package className="h-4 w-4 shrink-0" />
          + Thêm sản phẩm
        </Link>
        <Link
          href="/"
          className="flex items-center gap-3 rounded-md px-3 py-2.5 text-sm font-medium text-zinc-500 hover:bg-zinc-800 hover:text-zinc-300 transition-colors"
        >
          <LogOut className="h-4 w-4 shrink-0" />
          Về trang chủ
        </Link>
      </div>
    </aside>
  )
}
