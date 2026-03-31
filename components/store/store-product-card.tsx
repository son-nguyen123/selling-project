'use client'

import Image from 'next/image'
import Link from 'next/link'
import { ShoppingCart } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Card } from '@/components/ui/card'
import { useCart } from '@/app/context/cart-provider'
import { toast } from 'sonner'

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

  function handleAddToCart() {
    addToCart({
      id: product.id,
      name: product.name,
      price: product.price,
      image_url: product.dashboard_image_url ?? undefined,
    })
    toast.success(`${product.name} added to cart`)
  }

  return (
    <Card className="group flex flex-col overflow-hidden border border-border bg-card transition-all duration-200 hover:border-primary/50 hover:shadow-lg hover:shadow-primary/10">
      <div className="relative aspect-video overflow-hidden bg-muted">
        {product.dashboard_image_url ? (
          <Image
            src={product.dashboard_image_url}
            alt={product.name}
            fill
            className="object-cover transition-transform duration-300 group-hover:scale-105"
          />
        ) : (
          <div className="flex h-full items-center justify-center text-muted-foreground">
            <ShoppingCart className="h-12 w-12 opacity-30" />
          </div>
        )}
        {product.stock === 0 && (
          <div className="absolute inset-0 flex items-center justify-center bg-background/60">
            <span className="rounded bg-destructive px-2 py-1 text-xs font-semibold text-destructive-foreground">
              Out of Stock
            </span>
          </div>
        )}
      </div>

      <div className="flex flex-1 flex-col gap-3 p-4">
        <div className="flex items-start justify-between gap-2">
          <h3 className="line-clamp-2 text-sm font-semibold leading-tight text-foreground">
            {product.name}
          </h3>
          {product.category && (
            <Badge variant="secondary" className="shrink-0 text-xs">
              {product.category}
            </Badge>
          )}
        </div>

        <div className="flex items-center justify-between">
          <span className="text-lg font-bold text-primary">
            ${product.price.toFixed(2)}
          </span>
          <span className={`text-xs ${product.stock > 0 ? 'text-green-500' : 'text-destructive'}`}>
            {product.stock > 0 ? `${product.stock} in stock` : 'Out of stock'}
          </span>
        </div>

        <div className="mt-auto flex gap-2">
          <Button
            size="sm"
            variant="outline"
            className="flex-1"
            onClick={handleAddToCart}
            disabled={product.stock === 0}
          >
            <ShoppingCart className="mr-1 h-3.5 w-3.5" />
            Add to Cart
          </Button>
          <Button size="sm" className="flex-1" asChild>
            <Link href={`/store/${product.id}`}>View Details</Link>
          </Button>
        </div>
      </div>
    </Card>
  )
}
