'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { useCart } from '@/app/context/cart-provider'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Separator } from '@/components/ui/separator'
import { toast } from 'sonner'
import { ShoppingBag, Wallet } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'

export default function CheckoutPage() {
  const { items, totalPrice, clearCart, hydrated } = useCart()
  const router = useRouter()
  const [submitting, setSubmitting] = useState(false)
  const [paymentMethod, setPaymentMethod] = useState<'simulated' | 'wallet'>('simulated')
  const [walletBalance, setWalletBalance] = useState<number | null>(null)
  const [form, setForm] = useState({
    name: '',
    email: '',
    address: '',
  })

  useEffect(() => {
    async function prefillUser() {
      const supabase = createClient()
      const { data: { user } } = await supabase.auth.getUser()
      if (user) {
        setForm((f) => ({
          ...f,
          email: user.email ?? '',
          name: (user.user_metadata?.full_name as string) ?? '',
        }))
        // Fetch wallet balance
        const res = await fetch('/api/wallet')
        if (res.ok) {
          const data = await res.json()
          setWalletBalance(data.balance ?? 0)
        }
      }
    }
    prefillUser()
  }, [])

  if (!hydrated) {
    return (
      <div className="min-h-screen bg-background">
        <div className="mx-auto max-w-3xl px-4 py-16 text-center sm:px-6">
          <div className="mx-auto h-16 w-16 rounded-full bg-muted animate-pulse mb-4" />
        </div>
      </div>
    )
  }

  if (items.length === 0) {
    return (
      <div className="min-h-screen bg-background">
        <div className="mx-auto max-w-3xl px-4 py-16 text-center sm:px-6">
          <ShoppingBag className="mx-auto mb-4 h-16 w-16 text-muted-foreground opacity-40" />
          <h1 className="mb-2 text-2xl font-bold text-foreground">Nothing to checkout</h1>
          <p className="mb-6 text-sm text-muted-foreground">
            Your cart is empty.
          </p>
          <Button asChild>
            <Link href="/store">Browse Products</Link>
          </Button>
        </div>
      </div>
    )
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!form.email) {
      toast.error('Email is required')
      return
    }
    setSubmitting(true)
    try {
      const supabase = createClient()
      const { data: { user } } = await supabase.auth.getUser()

      // Wallet payment: deduct balance first
      if (paymentMethod === 'wallet') {
        if (walletBalance === null || walletBalance < totalPrice) {
          toast.error(
            `Số dư ví không đủ. Hiện có: ${(walletBalance ?? 0).toLocaleString('vi-VN')}₫ — cần ${totalPrice.toLocaleString('vi-VN')}₫`,
          )
          setSubmitting(false)
          return
        }
        const payRes = await fetch('/api/wallet/pay', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            amount: totalPrice,
            note: `Thanh toán đơn hàng (${items.map((i) => i.name).join(', ')})`,
          }),
        })
        const payData = await payRes.json()
        if (!payRes.ok) {
          toast.error(payData.error ?? 'Thanh toán bằng ví thất bại')
          setSubmitting(false)
          return
        }
        setWalletBalance(payData.balance)
      }

      const orderItems = items.map((item) => ({
        product_id: item.id,
        name: item.name,
        price: item.price,
        quantity: item.quantity,
        image_url: item.image_url,
      }))

      const payload: Record<string, unknown> = {
        customer_name: form.name,
        customer_email: form.email,
        items: orderItems,
        total_price: totalPrice,
        payment_method: paymentMethod,
        address: form.address,
      }
      if (user) payload.user_id = user.id

      const res = await fetch('/api/store/orders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      })

      if (!res.ok) {
        let errorMsg = 'Failed to place order'
        try {
          const err = await res.json()
          errorMsg = typeof err.error === 'string' ? err.error : errorMsg
        } catch {
          // Response body was not JSON (e.g. HTML error page) – use generic message
        }
        throw new Error(errorMsg)
      }

      const resData = await res.json()

      // Store download links so the success page can display them
      const downloadLinks: Array<{ name: string; url: string }> = []
      if (resData.download_links) {
        for (const item of items) {
          const url = resData.download_links[item.id]
          if (url) downloadLinks.push({ name: item.name, url })
        }
      }
      if (downloadLinks.length > 0) {
        sessionStorage.setItem('order_download_links', JSON.stringify(downloadLinks))
      } else {
        sessionStorage.removeItem('order_download_links')
      }

      clearCart()
      router.push('/checkout/success')
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Failed to place order')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="mx-auto max-w-5xl px-4 py-10 sm:px-6">
        <h1 className="mb-8 text-3xl font-bold text-foreground">Checkout</h1>

        <div className="grid gap-8 lg:grid-cols-2">
          {/* Order summary */}
          <div className="rounded-lg border border-border bg-card p-6">
            <h2 className="mb-4 text-lg font-semibold text-foreground">Order Summary</h2>
            <div className="space-y-3">
              {items.map((item) => (
                <div key={item.id} className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">
                    {item.name} × {item.quantity}
                  </span>
                  <span className="font-medium text-foreground">
                    {(item.price * item.quantity).toLocaleString('vi-VN')}₫
                  </span>
                </div>
              ))}
            </div>
            <Separator className="my-4" />
            <div className="flex items-center justify-between font-semibold">
              <span>Total</span>
              <span className="text-primary text-lg">{totalPrice.toLocaleString('vi-VN')}₫</span>
            </div>
          </div>

          {/* Customer form */}
          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <Label htmlFor="name">Full Name</Label>
              <Input
                id="name"
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                placeholder="John Doe"
                className="mt-1"
              />
            </div>
            <div>
              <Label htmlFor="email">Email *</Label>
              <Input
                id="email"
                type="email"
                required
                value={form.email}
                onChange={(e) => setForm({ ...form, email: e.target.value })}
                placeholder="john@example.com"
                className="mt-1"
              />
            </div>
            <div>
              <Label htmlFor="address">Shipping Address</Label>
              <textarea
                id="address"
                value={form.address}
                onChange={(e) => setForm({ ...form, address: e.target.value })}
                rows={3}
                placeholder="123 Main St, City, Country"
                className="mt-1 w-full rounded-md border border-input bg-background px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring"
              />
            </div>

            {/* Payment method */}
            <div className="space-y-2">
              <Label>Phương thức thanh toán</Label>

              <button
                type="button"
                onClick={() => setPaymentMethod('simulated')}
                className={`flex w-full items-start gap-3 rounded-lg border p-3 text-left transition-colors ${
                  paymentMethod === 'simulated'
                    ? 'border-primary bg-primary/5'
                    : 'border-border hover:border-muted-foreground'
                }`}
              >
                <ShoppingBag className="mt-0.5 h-4 w-4 shrink-0 text-muted-foreground" />
                <div>
                  <p className="text-sm font-medium text-foreground">Thanh toán giả lập</p>
                  <p className="text-xs text-muted-foreground">Không tính phí thực tế (demo)</p>
                </div>
              </button>

              {walletBalance !== null && (
                <button
                  type="button"
                  onClick={() => setPaymentMethod('wallet')}
                  className={`flex w-full items-start gap-3 rounded-lg border p-3 text-left transition-colors ${
                    paymentMethod === 'wallet'
                      ? 'border-primary bg-primary/5'
                      : 'border-border hover:border-muted-foreground'
                  }`}
                >
                  <Wallet className="mt-0.5 h-4 w-4 shrink-0 text-primary" />
                  <div>
                    <p className="text-sm font-medium text-foreground">Thanh toán bằng ví</p>
                    <p className="text-xs text-muted-foreground">
                      Số dư hiện tại:{' '}
                      <span className={walletBalance >= totalPrice ? 'text-green-600 dark:text-green-400 font-medium' : 'text-red-500 font-medium'}>
                        {walletBalance.toLocaleString('vi-VN')}₫
                      </span>
                      {walletBalance < totalPrice && (
                        <span className="ml-1 text-red-500">(không đủ)</span>
                      )}
                    </p>
                  </div>
                </button>
              )}
            </div>

            <div className="flex gap-3">
              <Button type="button" variant="outline" asChild className="flex-1">
                <Link href="/cart">Back to Cart</Link>
              </Button>
              <Button
                type="submit"
                className="flex-1"
                disabled={submitting || (paymentMethod === 'wallet' && (walletBalance === null || walletBalance < totalPrice))}
              >
                {submitting
                  ? 'Đang xử lý...'
                  : paymentMethod === 'wallet'
                  ? `Thanh toán bằng ví ${totalPrice.toLocaleString('vi-VN')}₫`
                  : `Đặt hàng ${totalPrice.toLocaleString('vi-VN')}₫`}
              </Button>
            </div>
          </form>
        </div>
      </div>
    </div>
  )
}
