import { createClient } from '@/lib/supabase/server'
import { Package, ShoppingCart, DollarSign, AlertCircle, FolderOpen, Plus } from 'lucide-react'
import Link from 'next/link'

export default async function AdminDashboard() {
  const supabase = await createClient()

  const [
    { count: totalProducts },
    { count: totalProjects },
    { count: totalOrders },
    { count: newOrders },
    { data: revenueData },
    { data: recentOrders },
  ] = await Promise.all([
    supabase.from('store_products').select('*', { count: 'exact', head: true }),
    supabase.from('projects').select('*', { count: 'exact', head: true }),
    supabase.from('orders').select('*', { count: 'exact', head: true }),
    supabase.from('orders').select('*', { count: 'exact', head: true }).eq('status', 'new'),
    supabase.from('orders').select('total_price').eq('status', 'delivered'),
    supabase
      .from('orders')
      .select('id, customer_email, total_price, status, created_at')
      .order('created_at', { ascending: false })
      .limit(8),
  ])

  const totalRevenue = (revenueData ?? []).reduce(
    (sum, o) => sum + (o.total_price ?? 0),
    0,
  )

  const stats = [
    {
      label: 'Dự án',
      value: totalProjects ?? 0,
      icon: FolderOpen,
      bg: 'bg-blue-500/10',
      iconColor: 'text-blue-400',
      href: '/admin/projects',
    },
    {
      label: 'Sản phẩm',
      value: totalProducts ?? 0,
      icon: Package,
      bg: 'bg-purple-500/10',
      iconColor: 'text-purple-400',
      href: '/admin/products',
    },
    {
      label: 'Đơn hàng mới',
      value: newOrders ?? 0,
      icon: AlertCircle,
      bg: 'bg-yellow-500/10',
      iconColor: 'text-yellow-400',
      href: '/admin/orders',
    },
    {
      label: 'Doanh thu',
      value: `$${totalRevenue.toFixed(2)}`,
      icon: DollarSign,
      bg: 'bg-green-500/10',
      iconColor: 'text-green-400',
      href: '/admin/orders',
    },
  ]

  const statusColors: Record<string, string> = {
    new: 'bg-blue-500/20 text-blue-300',
    processing: 'bg-yellow-500/20 text-yellow-300',
    delivered: 'bg-green-500/20 text-green-300',
    cancelled: 'bg-red-500/20 text-red-300',
  }

  return (
    <div className="space-y-8">
      {/* Header row */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white">Tổng quan</h1>
          <p className="text-sm text-zinc-400 mt-0.5">Quản lý toàn bộ hệ thống</p>
        </div>
        <div className="flex gap-2">
          <Link
            href="/admin/projects/new"
            className="flex items-center gap-1.5 rounded-md bg-zinc-800 hover:bg-zinc-700 text-zinc-200 text-xs font-medium px-3 py-2 transition-colors border border-zinc-700"
          >
            <Plus className="h-3.5 w-3.5" />
            Thêm dự án
          </Link>
          <Link
            href="/admin/products/new"
            className="flex items-center gap-1.5 rounded-md bg-accent hover:bg-accent/90 text-white text-xs font-medium px-3 py-2 transition-colors"
          >
            <Plus className="h-3.5 w-3.5" />
            Thêm sản phẩm
          </Link>
        </div>
      </div>

      {/* Stats grid */}
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        {stats.map(({ label, value, icon: Icon, bg, iconColor, href }) => (
          <Link
            key={label}
            href={href}
            className="group rounded-xl border border-zinc-800 bg-zinc-900 p-5 hover:border-zinc-600 transition-colors"
          >
            <div className={`inline-flex items-center justify-center rounded-lg p-2.5 ${bg} mb-3`}>
              <Icon className={`h-5 w-5 ${iconColor}`} />
            </div>
            <p className="text-2xl font-bold text-white">{value}</p>
            <p className="text-xs text-zinc-500 mt-0.5">{label}</p>
          </Link>
        ))}
      </div>

      {/* Quick links */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {[
          { href: '/admin/projects', label: 'Quản lý dự án', icon: FolderOpen },
          { href: '/admin/products', label: 'Quản lý sản phẩm', icon: Package },
          { href: '/admin/orders', label: 'Quản lý đơn hàng', icon: ShoppingCart },
          { href: '/admin/projects/new', label: 'Đăng dự án mới', icon: Plus },
        ].map(({ href, label, icon: Icon }) => (
          <Link
            key={href}
            href={href}
            className="flex items-center gap-2 rounded-lg border border-zinc-800 bg-zinc-900 px-4 py-3 text-sm text-zinc-300 hover:bg-zinc-800 hover:text-white transition-colors"
          >
            <Icon className="h-4 w-4 text-zinc-500" />
            {label}
          </Link>
        ))}
      </div>

      {/* Recent Orders */}
      <div>
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-base font-semibold text-white">Đơn hàng gần đây</h2>
          <Link href="/admin/orders" className="text-xs text-accent hover:underline">
            Xem tất cả →
          </Link>
        </div>
        <div className="rounded-xl border border-zinc-800 bg-zinc-900 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-zinc-800 bg-zinc-800/50">
                  <th className="px-4 py-3 text-left text-xs font-medium text-zinc-500 uppercase tracking-wider">Order ID</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-zinc-500 uppercase tracking-wider">Khách hàng</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-zinc-500 uppercase tracking-wider">Tổng tiền</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-zinc-500 uppercase tracking-wider">Trạng thái</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-zinc-500 uppercase tracking-wider">Ngày</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-800">
                {(recentOrders ?? []).map((order) => (
                  <tr key={order.id} className="hover:bg-zinc-800/40 transition-colors">
                    <td className="px-4 py-3 font-mono text-xs">
                      <Link href={`/admin/orders/${order.id}`} className="text-accent hover:underline">
                        {order.id.slice(0, 8)}…
                      </Link>
                    </td>
                    <td className="px-4 py-3 text-zinc-400">{order.customer_email}</td>
                    <td className="px-4 py-3 font-semibold text-white">${(order.total_price ?? 0).toFixed(2)}</td>
                    <td className="px-4 py-3">
                      <span className={`rounded-full px-2.5 py-0.5 text-xs font-medium ${statusColors[order.status] ?? 'bg-zinc-700 text-zinc-300'}`}>
                        {order.status}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-zinc-500 text-xs">
                      {new Date(order.created_at).toLocaleDateString('vi-VN')}
                    </td>
                  </tr>
                ))}
                {(recentOrders ?? []).length === 0 && (
                  <tr>
                    <td colSpan={5} className="px-4 py-12 text-center text-zinc-600">
                      Chưa có đơn hàng nào
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  )
}

