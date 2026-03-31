'use client'

import Image from 'next/image'
import Link from 'next/link'
import { ShoppingCart, Zap } from 'lucide-react'
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
    addToCart({
      id: product.id,
      name: product.name,
      price: product.price,
      image_url: product.dashboard_image_url ?? undefined,
    })
    router.push('/checkout')
  }

  return (
    <Card className="group relative flex flex-col overflow-hidden border border-border bg-card transition-all duration-300 hover:-translate-y-1 hover:border-primary/60 hover:shadow-xl hover:shadow-primary/10">
      {/* Image — entire area is a link to product detail */}
      <Link href={`/store/${product.id}`} className="block">
        <div className="relative aspect-square overflow-hidden bg-muted">
          {product.dashboard_image_url ? (
            <Image
              src={product.dashboard_image_url}
              alt={product.name}
              fill
              className="object-cover transition-transform duration-500 group-hover:scale-110"
            />
          ) : (
            <div className="flex h-full items-center justify-center text-muted-foreground">
              <ShoppingCart className="h-14 w-14 opacity-20" />
            </div>
          )}

          {/* Category badge — top-left */}
          {product.category && (
            <Badge
              variant="secondary"
              className="absolute left-2 top-2 z-10 bg-background/80 text-xs backdrop-blur-sm"
            >
              {product.category}
            </Badge>
          )}

          {/* Out-of-stock overlay */}
          {isOutOfStock && (
            <div className="absolute inset-0 flex items-center justify-center bg-background/70 backdrop-blur-[2px]">
              <span className="rounded-full bg-destructive px-3 py-1 text-xs font-bold tracking-wide text-destructive-foreground">
                Hết hàng
              </span>
            </div>
          )}
        </div>
      </Link>

      <div className="flex flex-1 flex-col gap-3 p-4">
        {/* Name — also links to detail page */}
        <Link href={`/store/${product.id}`} className="block">
          <h3 className="line-clamp-2 text-sm font-semibold leading-snug text-foreground transition-colors group-hover:text-primary">
            {product.name}
          </h3>
        </Link>

        {/* Price + stock */}
        <div className="flex items-end justify-between">
          <span className="text-xl font-extrabold text-primary">
            {product.price.toLocaleString('vi-VN')}₫
          </span>
          <span
            className={`text-xs font-medium ${
              product.stock > 0 ? 'text-green-500' : 'text-destructive'
            }`}
          >
            {product.stock > 0 ? `Còn ${product.stock} sản phẩm` : 'Hết hàng'}
          </span>
        </div>

        {/* Actions */}
        <div className="mt-auto grid grid-cols-2 gap-2">
          <Button
            size="sm"
            variant="outline"
            className="w-full"
            onClick={handleAddToCart}
            disabled={isOutOfStock}
          >
            <ShoppingCart className="mr-1.5 h-3.5 w-3.5" />
            Giỏ hàng
          </Button>
          <Button
            size="sm"
            className="w-full"
            onClick={handleBuyNow}
            disabled={isOutOfStock}
          >
            <Zap className="mr-1.5 h-3.5 w-3.5" />
            Mua ngay
          </Button>
        </div>
      </div>
    </Card>
  )
}
