'use client'

import Image from 'next/image'
import Link from 'next/link'
import { ShoppingCart, Zap, Eye } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Card } from '@/components/ui/card'
import { useCart } from '@/app/context/cart-provider'
import { toast } from 'sonner'
import { useRouter } from 'next/navigation'

interface StoreProduct {
  id: string
  name: string
  price: number
  description?: string | null
  category?: string | null
  stock: number
  dashboard_image_url?: string | null
}

interface StoreProductCardProps {
  product: StoreProduct
}

export default function StoreProductCard({ product }: StoreProductCardProps) {
  const { addToCart } = useCart()
  const router = useRouter()
  const isOutOfStock = product.stock === 0

  function handleAddToCart(e: React.MouseEvent) {
    e.preventDefault()
    e.stopPropagation()
    addToCart({
      id: product.id,
      name: product.name,
      price: product.price,
      image_url: product.dashboard_image_url ?? undefined,
    })
    toast.success(`Đã thêm "${product.name}" vào giỏ hàng`)
  }

  function handleBuyNow(e: React.MouseEvent) {
    e.preventDefault()
    e.stopPropagation()
    addToCart({
      id: product.id,
      name: product.name,
      price: product.price,
      image_url: product.dashboard_image_url ?? undefined,
    })
    router.push('/checkout')
  }

  return (
    <Card className="group relative flex flex-col overflow-hidden rounded-2xl border border-border bg-card shadow-sm transition-all duration-300 hover:-translate-y-1.5 hover:border-primary/50 hover:shadow-2xl hover:shadow-primary/10">
      {/* Image Section */}
      <Link href={`/store/${product.id}`} className="block">
        <div className="relative aspect-[4/3] overflow-hidden bg-muted">
          {product.dashboard_image_url ? (
            <Image
              src={product.dashboard_image_url}
              alt={product.name}
              fill
              className="object-cover transition-transform duration-500 group-hover:scale-105"
            />
          ) : (
            <div className="flex h-full items-center justify-center bg-gradient-to-br from-muted to-muted/50">
              <ShoppingCart className="h-16 w-16 text-muted-foreground/30" />
            </div>
          )}

          {/* Hover overlay with preview button */}
          <div className="absolute inset-0 flex items-center justify-center bg-black/0 transition-colors duration-300 group-hover:bg-black/30">
            <span className="flex items-center gap-1.5 rounded-full bg-white/90 px-4 py-2 text-xs font-semibold text-gray-800 opacity-0 shadow-lg backdrop-blur-sm transition-all duration-300 group-hover:opacity-100 group-hover:scale-100 scale-95">
              <Eye className="h-3.5 w-3.5" />
              Xem chi tiết
            </span>
          </div>

          {/* Category badge */}
          {product.category && (
            <Badge
              variant="secondary"
              className="absolute left-2.5 top-2.5 z-10 bg-background/85 text-xs font-medium backdrop-blur-sm shadow-sm"
            >
              {product.category}
            </Badge>
          )}

          {/* Out-of-stock overlay */}
          {isOutOfStock && (
            <div className="absolute inset-0 flex items-center justify-center bg-background/75 backdrop-blur-[3px]">
              <span className="rounded-full bg-destructive px-4 py-1.5 text-xs font-bold tracking-widest uppercase text-destructive-foreground shadow-md">
                Hết hàng
              </span>
            </div>
          )}
        </div>
      </Link>

      {/* Content */}
      <div className="flex flex-1 flex-col gap-2.5 p-3">
        {/* Product name */}
        <Link href={`/store/${product.id}`} className="block">
          <h3 className="line-clamp-2 text-xs font-semibold leading-snug text-foreground transition-colors group-hover:text-primary sm:text-sm">
            {product.name}
          </h3>
        </Link>

        {/* Price bar */}
        <div className="flex items-center justify-between rounded-lg bg-primary/5 px-2.5 py-1.5">
          <div className="flex flex-col">
            <span className="text-base font-extrabold text-primary leading-tight sm:text-lg">
              {product.price.toLocaleString('vi-VN')}₫
            </span>
            <span className="text-[9px] font-medium text-muted-foreground uppercase tracking-wide">
              Giá bán
            </span>
          </div>
          <span
            className={`rounded-full px-2 py-0.5 text-[10px] font-semibold ${
              product.stock > 5
                ? 'bg-green-100 text-green-700 dark:bg-green-900/40 dark:text-green-400'
                : product.stock > 0
                ? 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/40 dark:text-yellow-400'
                : 'bg-red-100 text-red-700 dark:bg-red-900/40 dark:text-red-400'
            }`}
          >
            {product.stock > 0 ? `Còn ${product.stock}` : 'Hết'}
          </span>
        </div>

        {/* Action buttons — stacked vertically so they never overflow on any screen size */}
        <div className="mt-auto flex flex-col gap-1.5 pt-0.5">
          <Button
            size="sm"
            variant="outline"
            className="w-full rounded-xl border-primary/30 text-xs font-medium hover:border-primary hover:bg-primary/5 hover:text-primary disabled:opacity-50"
            onClick={handleAddToCart}
            disabled={isOutOfStock}
          >
            <ShoppingCart className="mr-1 h-3 w-3" />
            Giỏ hàng
          </Button>
          <Button
            size="sm"
            className="w-full rounded-xl bg-primary text-xs font-medium shadow-sm hover:bg-primary/90 hover:shadow-md disabled:opacity-50"
            onClick={handleBuyNow}
            disabled={isOutOfStock}
          >
            <Zap className="mr-1 h-3 w-3" />
            Mua ngay
          </Button>
        </div>
      </div>
    </Card>
  )
}
