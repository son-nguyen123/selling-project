import { createClient } from '@/lib/supabase/server'
import { notFound } from 'next/navigation'
import { Card } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import Link from 'next/link'
import { ArrowLeft } from 'lucide-react'
import AdminOrderStatusUpdate from '../order-status-update'

const STATUS_COLORS: Record<string, string> = {
  new: 'bg-blue-500/20 text-blue-400 border-blue-500/30',
  processing: 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30',
  delivered: 'bg-green-500/20 text-green-400 border-green-500/30',
}

interface OrderItem {
  product_id: string
  name: string
  price: number
  quantity: number
  image_url?: string
}

export default async function AdminOrderDetailPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params
  const supabase = await createClient()

  const { data: order } = await supabase
    .from('orders')
    .select('*')
    .eq('id', id)
    .single()

  if (!order) notFound()

  const items = (order.items ?? []) as OrderItem[]

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <Link href="/admin/orders" className="text-muted-foreground hover:text-foreground">
          <ArrowLeft className="h-5 w-5" />
        </Link>
        <h1 className="text-2xl font-bold text-foreground">Order Details</h1>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        {/* Customer info */}
        <Card className="p-5">
          <h2 className="mb-4 font-semibold text-foreground">Customer Information</h2>
          <dl className="space-y-2 text-sm">
            <div className="flex justify-between">
              <dt className="text-muted-foreground">Name</dt>
              <dd className="font-medium text-foreground">{order.customer_name || '—'}</dd>
            </div>
            <div className="flex justify-between">
              <dt className="text-muted-foreground">Email</dt>
              <dd className="font-medium text-foreground">{order.customer_email}</dd>
            </div>
            <div className="flex justify-between">
              <dt className="text-muted-foreground">Payment</dt>
              <dd className="font-medium text-foreground capitalize">{order.payment_method}</dd>
            </div>
            <div className="flex justify-between">
              <dt className="text-muted-foreground">Date</dt>
              <dd className="font-medium text-foreground">
                {new Date(order.created_at).toLocaleString()}
              </dd>
            </div>
          </dl>
        </Card>

        {/* Status */}
        <Card className="p-5">
          <h2 className="mb-4 font-semibold text-foreground">Order Status</h2>
          <div className="flex items-center gap-4">
            <span className={`rounded-full border px-3 py-1 text-sm font-medium capitalize ${STATUS_COLORS[order.status] ?? ''}`}>
              {order.status}
            </span>
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              Update:
              <AdminOrderStatusUpdate orderId={order.id} currentStatus={order.status} />
            </div>
          </div>
          <p className="mt-2 font-mono text-xs text-muted-foreground">ID: {order.id}</p>
        </Card>
      </div>

      {/* Items */}
      <Card className="p-5">
        <h2 className="mb-4 font-semibold text-foreground">Order Items</h2>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border">
                <th className="pb-2 text-left font-medium text-muted-foreground">Product</th>
                <th className="pb-2 text-right font-medium text-muted-foreground">Price</th>
                <th className="pb-2 text-right font-medium text-muted-foreground">Qty</th>
                <th className="pb-2 text-right font-medium text-muted-foreground">Subtotal</th>
              </tr>
            </thead>
            <tbody>
              {items.map((item, idx) => (
                <tr key={idx} className="border-b border-border/50">
                  <td className="py-3 text-foreground">{item.name}</td>
                  <td className="py-3 text-right text-muted-foreground">${item.price.toFixed(2)}</td>
                  <td className="py-3 text-right text-muted-foreground">{item.quantity}</td>
                  <td className="py-3 text-right font-medium text-foreground">
                    ${(item.price * item.quantity).toFixed(2)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <Separator className="my-4" />
        <div className="flex justify-end">
          <span className="text-lg font-bold text-foreground">
            Total: <span className="text-primary">${(order.total_price ?? 0).toFixed(2)}</span>
          </span>
        </div>
      </Card>
    </div>
  )
}
