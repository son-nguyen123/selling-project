'use client'

import Image from 'next/image'
import { useState } from 'react'
import { ShoppingCart, Zap, Star } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
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
  single_image_url?: string | null
  demo_video_url?: string | null
  gallery_urls?: string[] | null
  specs?: Record<string, string> | null
}

interface Review {
  id: string
  rating: number
  comment?: string | null
  created_at: string
  user_id: string
}

interface ProductDetailProps {
  product: StoreProduct
  reviews: Review[]
  currentUserEmail?: string | null
  currentUserId?: string | null
}

function StarRating({ rating, size = 'sm' }: { rating: number; size?: 'sm' | 'lg' }) {
  return (
    <div className="flex items-center gap-0.5">
      {[1, 2, 3, 4, 5].map((s) => (
        <Star
          key={s}
          className={`${size === 'lg' ? 'h-5 w-5' : 'h-4 w-4'} ${
            s <= rating ? 'fill-yellow-400 text-yellow-400' : 'text-muted-foreground'
          }`}
        />
      ))}
    </div>
  )
}

function InteractiveStars({
  value,
  onChange,
}: {
  value: number
  onChange: (v: number) => void
}) {
  const [hovered, setHovered] = useState(0)
  return (
    <div className="flex items-center gap-0.5">
      {[1, 2, 3, 4, 5].map((s) => (
        <button
          key={s}
          type="button"
          onClick={() => onChange(s)}
          onMouseEnter={() => setHovered(s)}
          onMouseLeave={() => setHovered(0)}
          className="focus:outline-none"
        >
          <Star
            className={`h-6 w-6 ${
              s <= (hovered || value) ? 'fill-yellow-400 text-yellow-400' : 'text-muted-foreground'
            }`}
          />
        </button>
      ))}
    </div>
  )
}

export function ProductDetail({ product, reviews, currentUserId }: ProductDetailProps) {
  const { addToCart } = useCart()
  const router = useRouter()
  const [activeImage, setActiveImage] = useState<string | null>(
    product.single_image_url ?? (product.gallery_urls?.[0] ?? null),
  )
  const [reviewRating, setReviewRating] = useState(5)
  const [reviewComment, setReviewComment] = useState('')
  const [submittingReview, setSubmittingReview] = useState(false)

  const allImages = [
    ...(product.single_image_url ? [product.single_image_url] : []),
    ...(product.gallery_urls ?? []),
  ]

  function handleAddToCart() {
    addToCart({
      id: product.id,
      name: product.name,
      price: product.price,
      image_url: product.dashboard_image_url ?? product.single_image_url ?? undefined,
    })
    toast.success(`${product.name} added to cart`)
  }

  function handleBuyNow() {
    addToCart({
      id: product.id,
      name: product.name,
      price: product.price,
      image_url: product.dashboard_image_url ?? product.single_image_url ?? undefined,
    })
    router.push('/checkout')
  }

  async function handleReviewSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!currentUserId) {
      toast.error('You must be logged in to leave a review')
      return
    }
    setSubmittingReview(true)
    try {
      const res = await fetch('/api/store/products', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          _action: 'review',
          product_id: product.id,
          rating: reviewRating,
          comment: reviewComment,
        }),
      })
      if (!res.ok) throw new Error('Failed to submit review')
      toast.success('Review submitted!')
      setReviewComment('')
      setReviewRating(5)
      router.refresh()
    } catch {
      toast.error('Failed to submit review')
    } finally {
      setSubmittingReview(false)
    }
  }

  const avgRating =
    reviews.length > 0
      ? Math.round(reviews.reduce((s, r) => s + r.rating, 0) / reviews.length)
      : 0

  return (
    <div className="space-y-10">
      {/* Hero */}
      <div className="grid gap-8 lg:grid-cols-2">
        <div className="space-y-4">
          {/* Main media */}
          <div className="relative aspect-video overflow-hidden rounded-2xl border border-border bg-muted shadow-md">
            {product.demo_video_url ? (
              <video
                src={product.demo_video_url}
                autoPlay
                muted
                loop
                playsInline
                controls
                className="h-full w-full object-cover"
              />
            ) : activeImage ? (
              <Image
                src={activeImage}
                alt={product.name}
                fill
                className="object-cover"
                priority
              />
            ) : (
              <div className="flex h-full items-center justify-center text-muted-foreground">
                <ShoppingCart className="h-16 w-16 opacity-20" />
              </div>
            )}
          </div>

          {/* Gallery thumbnails */}
          {allImages.length > 1 && (
            <div className="flex gap-2 overflow-x-auto pb-1">
              {allImages.map((url, idx) => (
                <button
                  key={idx}
                  onClick={() => setActiveImage(url)}
                  className={`relative h-16 w-24 shrink-0 overflow-hidden rounded-xl border-2 transition-all duration-200 ${
                    activeImage === url
                      ? 'border-primary shadow-md shadow-primary/20'
                      : 'border-transparent hover:border-border'
                  }`}
                >
                  <Image src={url} alt={`Gallery ${idx + 1}`} fill className="object-cover" />
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Product info */}
        <div className="flex flex-col gap-5">
          {/* Badges */}
          <div className="flex flex-wrap items-center gap-2">
            {product.category && (
              <Badge variant="secondary" className="rounded-full px-3 py-1 text-xs font-medium">
                {product.category}
              </Badge>
            )}
            <Badge
              variant={product.stock > 0 ? 'default' : 'destructive'}
              className={`rounded-full px-3 py-1 text-xs font-medium ${
                product.stock > 0 ? 'bg-green-600 hover:bg-green-700' : ''
              }`}
            >
              {product.stock > 0 ? `Còn ${product.stock} sản phẩm` : 'Hết hàng'}
            </Badge>
          </div>

          {/* Name */}
          <h1 className="text-3xl font-bold leading-tight text-foreground">{product.name}</h1>

          {/* Rating */}
          {reviews.length > 0 && (
            <div className="flex items-center gap-2">
              <StarRating rating={avgRating} />
              <span className="text-sm text-muted-foreground">
                ({reviews.length} review{reviews.length !== 1 ? 's' : ''})
              </span>
            </div>
          )}

          {/* Price bar */}
          <div className="flex items-center justify-between rounded-2xl border border-border bg-gradient-to-r from-primary/5 to-primary/10 px-5 py-4 shadow-sm">
            <div>
              <p className="text-xs font-medium uppercase tracking-widest text-muted-foreground">
                Giá bán
              </p>
              <p className="mt-0.5 text-4xl font-extrabold text-primary">
                {product.price.toLocaleString('vi-VN')}₫
              </p>
            </div>
            {product.stock > 0 && (
              <span className="rounded-full bg-green-100 px-3 py-1 text-xs font-semibold text-green-700 dark:bg-green-900/40 dark:text-green-400">
                Còn hàng
              </span>
            )}
          </div>

          {/* Description */}
          {product.description && (
            <p className="text-sm leading-relaxed text-muted-foreground">{product.description}</p>
          )}

          {/* Action buttons */}
          <div className="flex gap-3 pt-1">
            <Button
              size="lg"
              variant="outline"
              className="flex-1 rounded-xl border-primary/30 py-6 text-base font-semibold hover:border-primary hover:bg-primary/5 hover:text-primary disabled:opacity-50"
              onClick={handleAddToCart}
              disabled={product.stock === 0}
            >
              <ShoppingCart className="mr-2 h-5 w-5" />
              Thêm vào giỏ
            </Button>
            <Button
              size="lg"
              className="flex-1 rounded-xl py-6 text-base font-semibold shadow-md hover:shadow-lg disabled:opacity-50"
              onClick={handleBuyNow}
              disabled={product.stock === 0}
            >
              <Zap className="mr-2 h-5 w-5" />
              Mua ngay
            </Button>
          </div>

          {/* Specs */}
          {product.specs && Object.keys(product.specs).length > 0 && (
            <div className="mt-2 rounded-xl border border-border p-4">
              <h3 className="mb-3 text-sm font-semibold text-foreground">Thông số kỹ thuật</h3>
              <table className="w-full text-sm">
                <tbody>
                  {Object.entries(product.specs).map(([key, val]) => (
                    <tr key={key} className="border-b border-border/50 last:border-0">
                      <td className="py-2 pr-4 font-medium text-muted-foreground">{key}</td>
                      <td className="py-2 text-foreground">{val}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>

      {/* Reviews */}
      <div>
        <h2 className="mb-6 text-xl font-bold text-foreground">
          Reviews ({reviews.length})
        </h2>

        {reviews.length > 0 ? (
          <div className="space-y-4">
            {reviews.map((review) => (
              <div key={review.id} className="rounded-lg border border-border bg-card p-4">
                <div className="mb-2 flex items-center justify-between">
                  <StarRating rating={review.rating} />
                  <span className="text-xs text-muted-foreground">
                    {new Date(review.created_at).toLocaleDateString()}
                  </span>
                </div>
                {review.comment && (
                  <p className="text-sm text-muted-foreground">{review.comment}</p>
                )}
              </div>
            ))}
          </div>
        ) : (
          <p className="text-sm text-muted-foreground">No reviews yet. Be the first!</p>
        )}

        {/* Add review form */}
        {currentUserId ? (
          <form onSubmit={handleReviewSubmit} className="mt-6 space-y-4 rounded-lg border border-border bg-card p-4">
            <h3 className="font-semibold text-foreground">Leave a Review</h3>
            <div>
              <label className="mb-1 block text-sm text-muted-foreground">Rating</label>
              <InteractiveStars value={reviewRating} onChange={setReviewRating} />
            </div>
            <div>
              <label className="mb-1 block text-sm text-muted-foreground">Comment (optional)</label>
              <textarea
                value={reviewComment}
                onChange={(e) => setReviewComment(e.target.value)}
                rows={3}
                placeholder="Share your experience..."
                className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring"
              />
            </div>
            <Button type="submit" disabled={submittingReview}>
              {submittingReview ? 'Submitting...' : 'Submit Review'}
            </Button>
          </form>
        ) : (
          <p className="mt-4 text-sm text-muted-foreground">
            <a href="/login" className="text-primary underline-offset-4 hover:underline">
              Log in
            </a>{' '}
            to leave a review.
          </p>
        )}
      </div>
    </div>
  )
}
