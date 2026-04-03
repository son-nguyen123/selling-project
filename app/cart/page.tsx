'use client'

import Image from 'next/image'
import Link from 'next/link'
import { Trash2, Minus, Plus, ShoppingBag } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { useCart } from '@/app/context/cart-provider'
import { Separator } from '@/components/ui/separator'

export default function CartPage() {
  const { items, removeFromCart, updateQuantity, totalPrice, hydrated } = useCart()

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
          <h1 className="mb-2 text-2xl font-bold text-foreground">Giỏ hàng trống</h1>
          <p className="mb-6 text-sm text-muted-foreground">
            Bạn chưa thêm sản phẩm nào vào giỏ.
          </p>
          <Button asChild>
            <Link href="/">Mua sắm ngay</Link>
          </Button>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="mx-auto max-w-3xl px-4 py-10 sm:px-6">
        <h1 className="mb-8 text-3xl font-bold text-foreground">Giỏ hàng</h1>

        <div className="space-y-4">
          {items.map((item) => (
            <div
              key={item.id}
              className="flex flex-col gap-3 rounded-lg border border-border bg-card p-4 sm:flex-row sm:items-center sm:gap-4"
            >
              {/* Row 1: Image + Info */}
              <div className="flex items-center gap-3 sm:contents">
                {/* Image */}
                <div className="relative h-16 w-20 shrink-0 overflow-hidden rounded-md bg-muted">
                  {item.image_url ? (
                    <Image src={item.image_url} alt={item.name} fill className="object-cover" />
                  ) : (
                    <div className="flex h-full items-center justify-center">
                      <ShoppingBag className="h-6 w-6 text-muted-foreground opacity-40" />
                    </div>
                  )}
                </div>

                {/* Info */}
                <div className="flex-1 min-w-0">
                  <p className="line-clamp-2 font-medium text-foreground">{item.name}</p>
                  <p className="text-sm text-muted-foreground">{item.price.toLocaleString('vi-VN')}₫ / sản phẩm</p>
                </div>
              </div>

              {/* Row 2 (mobile) / continuation (desktop): Qty + Total + Remove */}
              <div className="flex items-center gap-3 sm:contents">
                {/* Quantity stepper */}
                <div className="flex items-center gap-1.5">
                  <Button
                    variant="outline"
                    size="icon"
                    className="h-7 w-7 shrink-0"
                    onClick={() => updateQuantity(item.id, item.quantity - 1)}
                  >
                    <Minus className="h-3 w-3" />
                  </Button>
                  <span className="w-8 text-center text-sm font-medium text-foreground">
                    {item.quantity}
                  </span>
                  <Button
                    variant="outline"
                    size="icon"
                    className="h-7 w-7 shrink-0"
                    onClick={() => updateQuantity(item.id, item.quantity + 1)}
                  >
                    <Plus className="h-3 w-3" />
                  </Button>
                </div>

                {/* Line total */}
                <div className="flex-1 text-right font-semibold text-foreground sm:w-20 sm:flex-none">
                  {(item.price * item.quantity).toLocaleString('vi-VN')}₫
                </div>

                {/* Remove */}
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8 shrink-0 text-destructive hover:bg-destructive/10"
                  onClick={() => removeFromCart(item.id)}
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            </div>
          ))}
        </div>

        <Separator className="my-6" />

        <div className="flex items-center justify-between text-lg font-semibold">
          <span>Tổng tiền</span>
          <span className="text-primary">{totalPrice.toLocaleString('vi-VN')}₫</span>
        </div>

        <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:justify-between">
          <Button variant="outline" asChild>
            <Link href="/">Tiếp tục mua sắm</Link>
          </Button>
          <Button asChild>
            <Link href="/checkout">Thanh toán</Link>
          </Button>
        </div>
      </div>
    </div>
  )
}
