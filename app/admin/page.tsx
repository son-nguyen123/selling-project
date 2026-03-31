import { createClient } from '@/lib/supabase/server'
import { Card } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Package, ShoppingCart, DollarSign, AlertCircle } from 'lucide-react'
import Link from 'next/link'

export default async function AdminDashboard() {
  const supabase = await createClient()

  const [
    { count: totalProducts },
    { count: totalOrders },
    { count: newOrders },
    { data: revenueData },
    { data: recentOrders },
  ] = await Promise.all([
    supabase.from('store_products').select('*', { count: 'exact', head: true }),
    supabase.from('orders').select('*', { count: 'exact', head: true }),
    supabase.from('orders').select('*', { count: 'exact', head: true }).eq('status', 'new'),
    supabase.from('orders').select('total_price').eq('status', 'delivered'),
    supabase
      .from('orders')
      .select('id, customer_email, total_price, status, created_at')
      .order('created_at', { ascending: false })
      .limit(5),
  ])

  const totalRevenue = (revenueData ?? []).reduce(
    (sum, o) => sum + (o.total_price ?? 0),
    0,
  )

  const stats = [
    {
      label: 'Total Products',
      value: totalProducts ?? 0,
      icon: Package,
      color: 'text-blue-500',
    },
    {
      label: 'Total Orders',
      value: totalOrders ?? 0,
      icon: ShoppingCart,
      color: 'text-purple-500',
    },
    {
      label: 'New Orders',
      value: newOrders ?? 0,
      icon: AlertCircle,
      color: 'text-yellow-500',
    },
    {
      label: 'Revenue (Delivered)',
      value: `$${totalRevenue.toFixed(2)}`,
      icon: DollarSign,
      color: 'text-green-500',
    },
  ]

  const statusColors: Record<string, string> = {
    new: 'bg-blue-500/20 text-blue-400',
    processing: 'bg-yellow-500/20 text-yellow-400',
    delivered: 'bg-green-500/20 text-green-400',
  }

  return (
    <div className="space-y-8">
      <h1 className="text-2xl font-bold text-foreground">Admin Dashboard</h1>

      {/* Stats */}
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        {stats.map(({ label, value, icon: Icon, color }) => (
          <Card key={label} className="p-4">
            <div className="flex items-center gap-3">
              <Icon className={`h-8 w-8 ${color}`} />
              <div>
                <p className="text-xs text-muted-foreground">{label}</p>
                <p className="text-xl font-bold text-foreground">{value}</p>
              </div>
            </div>
          </Card>
        ))}
      </div>

      {/* Recent Orders */}
      <div>
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-lg font-semibold text-foreground">Recent Orders</h2>
          <Link href="/admin/orders" className="text-sm text-primary hover:underline">
            View all
          </Link>
        </div>
        <Card>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border">
                  <th className="px-4 py-3 text-left font-medium text-muted-foreground">Order ID</th>
                  <th className="px-4 py-3 text-left font-medium text-muted-foreground">Customer</th>
                  <th className="px-4 py-3 text-left font-medium text-muted-foreground">Total</th>
                  <th className="px-4 py-3 text-left font-medium text-muted-foreground">Status</th>
                  <th className="px-4 py-3 text-left font-medium text-muted-foreground">Date</th>
                </tr>
              </thead>
              <tbody>
                {(recentOrders ?? []).map((order) => (
                  <tr key={order.id} className="border-b border-border/50 hover:bg-muted/30">
                    <td className="px-4 py-3 font-mono text-xs">
                      <Link href={`/admin/orders/${order.id}`} className="text-primary hover:underline">
                        {order.id.slice(0, 8)}…
                      </Link>
                    </td>
                    <td className="px-4 py-3 text-muted-foreground">{order.customer_email}</td>
                    <td className="px-4 py-3 font-semibold">${(order.total_price ?? 0).toFixed(2)}</td>
                    <td className="px-4 py-3">
                      <span className={`rounded-full px-2 py-0.5 text-xs font-medium ${statusColors[order.status] ?? ''}`}>
                        {order.status}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-muted-foreground">
                      {new Date(order.created_at).toLocaleDateString()}
                    </td>
                  </tr>
                ))}
                {(recentOrders ?? []).length === 0 && (
                  <tr>
                    <td colSpan={5} className="px-4 py-8 text-center text-muted-foreground">
                      No orders yet
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </Card>
      </div>
    </div>
  )
}
