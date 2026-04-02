'use client'

import Image from 'next/image'
import Link from 'next/link'
import { useState } from 'react'
import { ShoppingCart, Zap, Star, Minus, Plus, Shield, RotateCcw, CheckCircle2, Play, Download } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { useCart } from '@/app/context/cart-provider'
import { toast } from 'sonner'
import { useRouter } from 'next/navigation'

function getVideoInfo(url: string): { isYoutube: boolean; embedUrl: string; thumbnailUrl?: string } {
  try {
    const parsed = new URL(url)
    const ytId = parsed.searchParams.get('v')
    if (parsed.hostname.includes('youtube.com') && ytId) {
      return {
        isYoutube: true,
        embedUrl: `https://www.youtube.com/embed/${ytId}?autoplay=1&rel=0`,
        thumbnailUrl: `https://img.youtube.com/vi/${ytId}/mqdefault.jpg`,
      }
    }
    if (parsed.hostname === 'youtu.be') {
      const id = parsed.pathname.slice(1)
      return {
        isYoutube: true,
        embedUrl: `https://www.youtube.com/embed/${id}?autoplay=1&rel=0`,
        thumbnailUrl: `https://img.youtube.com/vi/${id}/mqdefault.jpg`,
      }
    }
  } catch { /* invalid url */ }
  return { isYoutube: false, embedUrl: url }
}

interface StoreProduct {
  id: string
  name: string
  price: number
  description?: string | null
  category?: string | null
  stock: number
  dashboard_image_url?: string | null
  /** Primary detail page image (alias used in some DB schemas) */
  single_image?: string | null
  single_image_url?: string | null
  demo_video_url?: string | null
  gallery_urls?: string[] | null
  /** Array of demo/live-preview URLs */
  demo_urls?: string[] | null
  specs?: Record<string, string> | null
  [key: string]: unknown
}

interface Review {
  id: string
  rating: number
  comment?: string | null
  created_at: string
  user_id: string
}

interface FeaturedProduct {
  id: string
  name: string
  price: number
  category?: string | null
  dashboard_image_url?: string | null
}

interface ProductDetailProps {
  product: StoreProduct
  reviews: Review[]
  currentUserEmail?: string | null
  currentUserId?: string | null
  relatedProducts?: StoreProduct[]
  featuredProducts?: FeaturedProduct[]
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

function InteractiveStars({ value, onChange }: { value: number; onChange: (v: number) => void }) {
  const [hovered, setHovered] = useState(0)
  return (
    <div className="flex items-center gap-1">
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
            className={`h-7 w-7 transition-colors ${
              s <= (hovered || value) ? 'fill-yellow-400 text-yellow-400' : 'text-muted-foreground'
            }`}
          />
        </button>
      ))}
    </div>
  )
}

function RatingBar({ star, count, total }: { star: number; count: number; total: number }) {
  const pct = total > 0 ? Math.round((count / total) * 100) : 0
  return (
    <div className="flex items-center gap-2 text-xs">
      <span className="w-6 text-right text-muted-foreground">{star}</span>
      <Star className="h-3 w-3 fill-yellow-400 text-yellow-400" />
      <div className="h-2 flex-1 overflow-hidden rounded-full bg-muted">
        <div className="h-full rounded-full bg-yellow-400 transition-all" style={{ width: `${pct}%` }} />
      </div>
      <span className="w-6 text-muted-foreground">{count}</span>
    </div>
  )
}

function FeaturedSidebar({ products }: { products: FeaturedProduct[] }) {
  if (products.length === 0) return null
  return (
    <aside className="hidden lg:block w-64 shrink-0">
      <div className="rounded-xl border border-border bg-card shadow-sm sticky top-4">
        <div className="flex items-center gap-2 border-b border-border px-4 py-3">
          <div className="w-1 h-4 bg-primary rounded-full" />
          <h3 className="text-sm font-bold text-foreground">Code nổi bật</h3>
        </div>
        <div className="divide-y divide-border">
          {products.map((p) => (
            <Link
              key={p.id}
              href={`/store/${p.id}`}
              className="flex items-center gap-3 p-3 hover:bg-muted/50 transition-colors"
            >
              <div className="relative h-12 w-16 shrink-0 overflow-hidden rounded-md bg-muted border border-border">
                {p.dashboard_image_url ? (
                  <Image src={p.dashboard_image_url} alt={p.name} fill className="object-cover" />
                ) : (
                  <div className="flex h-full items-center justify-center">
                    <ShoppingCart className="h-5 w-5 text-muted-foreground/30" />
                  </div>
                )}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-xs font-medium text-foreground line-clamp-2 leading-snug">{p.name}</p>
                <p className="mt-1 text-sm font-bold text-primary">
                  {p.price.toLocaleString('vi-VN')}&#8363;
                </p>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </aside>
  )
}

export function ProductDetail({
  product,
  reviews,
  currentUserId,
  relatedProducts = [],
  featuredProducts = [],
}: ProductDetailProps) {
  const { addToCart } = useCart()
  const router = useRouter()

  const hasVideo = !!product.demo_video_url
  const videoInfo = hasVideo ? getVideoInfo(product.demo_video_url!) : null

  const allImages = [
    ...(product.single_image_url
      ? [product.single_image_url]
      : product.single_image
        ? [product.single_image]
        : product.dashboard_image_url
          ? [product.dashboard_image_url]
          : []),
    ...(Array.isArray(product.gallery_urls) ? product.gallery_urls : []),
  ]

  const [activeMedia, setActiveMedia] = useState<string | '__video__'>(
    hasVideo ? '__video__' : (allImages[0] ?? ''),
  )
  const [quantity, setQuantity] = useState(1)
  const [reviewRating, setReviewRating] = useState(5)
  const [reviewComment, setReviewComment] = useState('')
  const [submittingReview, setSubmittingReview] = useState(false)

  const showThumbnails = (hasVideo && allImages.length > 0) || allImages.length > 1

  const avgRating =
    reviews.length > 0
      ? reviews.reduce((s, r) => s + r.rating, 0) / reviews.length
      : 0
  const avgRatingRounded = Math.round(avgRating)
  const ratingCounts = [5, 4, 3, 2, 1].map((star) => ({
    star,
    count: reviews.filter((r) => r.rating === star).length,
  }))

  function handleAddToCart() {
    addToCart({
      id: product.id,
      name: product.name,
      price: product.price,
      image_url: product.dashboard_image_url ?? product.single_image_url ?? undefined,
    })
    toast.success(`Đã thêm ${product.name} vào giỏ hàng`)
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
      toast.error('Bạn cần đăng nhập để đánh giá sản phẩm')
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
      toast.success('Đã gửi đánh giá thành công!')
      setReviewComment('')
      setReviewRating(5)
      router.refresh()
    } catch {
      toast.error('Gửi đánh giá thất bại, vui lòng thử lại')
    } finally {
      setSubmittingReview(false)
    }
  }

  const installGuide = product.specs?.['Hướng dẫn cài đặt'] ?? product.specs?.install_guide ?? null

  return (
    <div className="space-y-6">
      {/* Main product card */}
      <div className="overflow-hidden rounded-xl border border-border bg-card shadow-sm">
        <div className="grid gap-0 lg:grid-cols-2">
          {/* Left: image gallery */}
          <div className="border-b border-border p-5 lg:border-b-0 lg:border-r">
            <div className={`relative overflow-hidden rounded-xl border border-border bg-muted ${hasVideo ? 'aspect-video' : 'aspect-square'}`}>
              {hasVideo && activeMedia === '__video__' ? (
                videoInfo?.isYoutube ? (
                  <iframe
                    src={videoInfo.embedUrl}
                    className="h-full w-full"
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                    allowFullScreen
                    title={`Demo: ${product.name}`}
                  />
                ) : (
                  <video
                    src={product.demo_video_url!}
                    autoPlay
                    muted
                    loop
                    playsInline
                    controls
                    className="h-full w-full object-cover"
                  />
                )
              ) : activeMedia && activeMedia !== '__video__' ? (
                <Image
                  src={activeMedia}
                  alt={product.name}
                  fill
                  className="object-contain p-2 transition-transform duration-300 motion-safe:hover:scale-105"
                  priority
                />
              ) : (
                <div className="flex h-full flex-col items-center justify-center gap-3 text-muted-foreground">
                  <ShoppingCart className="h-20 w-20 opacity-10" />
                  <p className="text-xs opacity-50">Chưa có hình ảnh</p>
                </div>
              )}
            </div>

            {showThumbnails && (
              <div className="mt-3 flex gap-2 overflow-x-auto pb-1">
                {hasVideo && (
                  <button
                    onClick={() => setActiveMedia('__video__')}
                    className={`relative h-16 w-24 shrink-0 overflow-hidden rounded-lg border-2 transition-all duration-200 ${
                      activeMedia === '__video__'
                        ? 'border-primary shadow-sm shadow-primary/30'
                        : 'border-transparent opacity-60 hover:border-border hover:opacity-100'
                    }`}
                    title="Xem video"
                  >
                    {videoInfo?.thumbnailUrl ? (
                      <Image src={videoInfo.thumbnailUrl} alt="Video demo" fill className="object-cover" />
                    ) : (
                      <div className="flex h-full items-center justify-center bg-black/80">
                        <Play className="h-6 w-6 text-white" />
                      </div>
                    )}
                    <div className="absolute inset-0 flex items-center justify-center bg-black/25">
                      <div className="flex h-7 w-7 items-center justify-center rounded-full bg-white/90 shadow">
                        <Play className="h-3.5 w-3.5 fill-gray-800 text-gray-800" />
                      </div>
                    </div>
                  </button>
                )}
                {allImages.map((url, idx) => (
                  <button
                    key={idx}
                    onClick={() => setActiveMedia(url)}
                    className={`relative h-16 w-16 shrink-0 overflow-hidden rounded-lg border-2 transition-all duration-200 ${
                      activeMedia === url
                        ? 'border-primary shadow-sm shadow-primary/30'
                        : 'border-transparent opacity-60 hover:border-border hover:opacity-100'
                    }`}
                  >
                    <Image src={url} alt={`Ảnh ${idx + 1}`} fill className="object-cover" />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Right: product info */}
          <div className="flex flex-col gap-4 p-5">
            <div className="flex flex-wrap items-center gap-2">
              {product.category && (
                <Badge variant="secondary" className="rounded-full px-3 py-0.5 text-xs font-medium">
                  {product.category}
                </Badge>
              )}
              {product.stock > 0 ? (
                <Badge className="rounded-full bg-green-600 px-3 py-0.5 text-xs font-medium hover:bg-green-700">
                  Còn hàng
                </Badge>
              ) : (
                <Badge variant="destructive" className="rounded-full px-3 py-0.5 text-xs font-medium">
                  Hết hàng
                </Badge>
              )}
            </div>

            <h1 className="text-2xl font-bold leading-snug text-foreground">{product.name}</h1>

            <div className="flex items-center gap-3 border-b border-border pb-4">
              <span className="text-base font-semibold text-yellow-400">
                {avgRating > 0 ? avgRating.toFixed(1) : '—'}
              </span>
              <StarRating rating={avgRatingRounded} />
              <span className="text-sm text-muted-foreground">{reviews.length} đánh giá</span>
            </div>

            <div className="flex items-baseline gap-2 rounded-xl bg-primary/5 px-4 py-3">
              <span className="text-3xl font-extrabold text-primary">
                {product.price.toLocaleString('vi-VN')}&#8363;
              </span>
            </div>

            <div className="flex flex-wrap gap-3 text-xs text-muted-foreground">
              <span className="flex items-center gap-1">
                <Shield className="h-3.5 w-3.5 text-green-500" />
                Hàng chính hãng
              </span>
              <span className="flex items-center gap-1">
                <RotateCcw className="h-3.5 w-3.5 text-blue-500" />
                Hỗ trợ 7 ngày
              </span>
              <span className="flex items-center gap-1">
                <CheckCircle2 className="h-3.5 w-3.5 text-primary" />
                Hỗ trợ 24/7
              </span>
            </div>

            {product.stock > 0 && (
              <div className="flex items-center gap-4">
                <span className="text-sm text-muted-foreground">Số lượng</span>
                <div className="flex items-center rounded-lg border border-border">
                  <button
                    type="button"
                    onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                    className="flex h-9 w-9 items-center justify-center rounded-l-lg text-muted-foreground transition-colors hover:bg-muted hover:text-foreground disabled:opacity-40"
                    disabled={quantity <= 1}
                  >
                    <Minus className="h-3.5 w-3.5" />
                  </button>
                  <span className="flex h-9 w-12 items-center justify-center border-x border-border text-sm font-medium text-foreground">
                    {quantity}
                  </span>
                  <button
                    type="button"
                    onClick={() => setQuantity((q) => Math.min(product.stock, q + 1))}
                    className="flex h-9 w-9 items-center justify-center rounded-r-lg text-muted-foreground transition-colors hover:bg-muted hover:text-foreground disabled:opacity-40"
                    disabled={quantity >= product.stock}
                  >
                    <Plus className="h-3.5 w-3.5" />
                  </button>
                </div>
                <span className="text-xs text-muted-foreground">{product.stock} có sẵn</span>
              </div>
            )}

            <div className="flex gap-3 pt-1">
              <Button
                size="lg"
                variant="outline"
                className="flex-1 rounded-xl border-primary/40 py-6 text-sm font-semibold hover:border-primary hover:bg-primary/5 hover:text-primary disabled:opacity-50"
                onClick={handleAddToCart}
                disabled={product.stock === 0}
              >
                <ShoppingCart className="mr-2 h-4 w-4" />
                Thêm vào giỏ
              </Button>
              <Button
                size="lg"
                className="flex-1 rounded-xl py-6 text-sm font-semibold shadow-md hover:shadow-lg disabled:opacity-50"
                onClick={handleBuyNow}
                disabled={product.stock === 0}
              >
                <Download className="mr-2 h-4 w-4" />
                Mua / Tải ngay
              </Button>
            </div>
          </div>
        </div>

        {product.specs && Object.entries(product.specs).filter(([k]) => k !== 'project_id' && k !== 'Hướng dẫn cài đặt' && k !== 'install_guide').length > 0 && (
          <div className="border-t border-border px-5 py-4">
            <h3 className="mb-3 text-sm font-semibold text-foreground">Thông số kỹ thuật</h3>
            <table className="w-full text-sm">
              <tbody>
                {Object.entries(product.specs)
                  .filter(([key]) => key !== 'project_id' && key !== 'Hướng dẫn cài đặt' && key !== 'install_guide')
                  .map(([key, val], i) => (
                  <tr key={key} className={`${i % 2 === 0 ? 'bg-muted/30' : ''} rounded`}>
                    <td className="w-1/3 py-2 pl-2 pr-4 font-medium text-muted-foreground">{key}</td>
                    <td className="py-2 pr-2 text-foreground">{val}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* Demo URLs */}
        {Array.isArray(product.demo_urls) && product.demo_urls.length > 0 && (
          <div className="border-t border-border px-5 py-4">
            <h3 className="mb-3 text-sm font-semibold text-foreground flex items-center gap-2">
              <Play className="h-4 w-4 text-primary" />
              Link Demo
            </h3>
            <ul className="space-y-2">
              {product.demo_urls.map((url, idx) => (
                <li key={idx}>
                  <a
                    href={url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-2 text-sm text-primary hover:underline underline-offset-4 break-all"
                  >
                    <Download className="h-3.5 w-3.5 shrink-0" />
                    {url}
                  </a>
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* Debug: full product data */}
        <details className="border-t border-border px-5 py-4">
          <summary className="cursor-pointer text-xs font-medium text-muted-foreground hover:text-foreground select-none">
            🔍 Debug: Dữ liệu sản phẩm (raw)
          </summary>
          <pre className="mt-3 overflow-x-auto rounded-lg bg-muted p-4 text-xs text-foreground/80 whitespace-pre-wrap break-all">
            {JSON.stringify(product, null, 2)}
          </pre>
        </details>
      </div>

      {/* Content + Sidebar */}
      <div className="flex gap-6 items-start">
        <div className="flex-1 min-w-0">
          <Tabs defaultValue="description" className="w-full">
            <TabsList className="w-full justify-start border-b border-border bg-transparent rounded-none h-auto p-0 mb-0">
              <TabsTrigger
                value="description"
                className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent data-[state=active]:text-primary px-4 py-3 text-sm font-medium"
              >
                Mô tả chi tiết
              </TabsTrigger>
              <TabsTrigger
                value="install"
                className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent data-[state=active]:text-primary px-4 py-3 text-sm font-medium"
              >
                Hướng dẫn cài đặt
              </TabsTrigger>
              <TabsTrigger
                value="comments"
                className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent data-[state=active]:text-primary px-4 py-3 text-sm font-medium"
              >
                Bình luận (0)
              </TabsTrigger>
              <TabsTrigger
                value="reviews"
                className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent data-[state=active]:text-primary px-4 py-3 text-sm font-medium"
              >
                Đánh giá ({reviews.length})
              </TabsTrigger>
            </TabsList>

            <TabsContent value="description" className="mt-0 rounded-b-xl rounded-tr-xl border border-border bg-card p-5 shadow-sm">
              {product.description ? (
                <p className="whitespace-pre-line text-sm leading-relaxed text-muted-foreground">
                  {product.description}
                </p>
              ) : (
                <p className="text-sm text-muted-foreground">Chưa có mô tả chi tiết.</p>
              )}
            </TabsContent>

            <TabsContent value="install" className="mt-0 rounded-b-xl rounded-tr-xl border border-border bg-card p-5 shadow-sm">
              {installGuide ? (
                <p className="whitespace-pre-line text-sm leading-relaxed text-muted-foreground">
                  {installGuide}
                </p>
              ) : (
                <div className="space-y-3 text-sm text-muted-foreground">
                  <p className="font-medium text-foreground">Hướng dẫn cài đặt chung:</p>
                  <ol className="list-decimal list-inside space-y-2 pl-2">
                    <li>Tải xuống file sau khi thanh toán thành công</li>
                    <li>Giải nén file ZIP vào thư mục dự án</li>
                    <li>Chạy <code className="bg-muted px-1.5 py-0.5 rounded text-xs font-mono">npm install</code> để cài đặt dependencies</li>
                    <li>Cấu hình file <code className="bg-muted px-1.5 py-0.5 rounded text-xs font-mono">.env</code> theo hướng dẫn trong README</li>
                    <li>Chạy <code className="bg-muted px-1.5 py-0.5 rounded text-xs font-mono">npm run dev</code> để khởi động dự án</li>
                  </ol>
                  <p className="text-xs opacity-70 mt-4">* Liên hệ hỗ trợ nếu gặp vấn đề trong quá trình cài đặt.</p>
                </div>
              )}
            </TabsContent>

            <TabsContent value="comments" className="mt-0 rounded-b-xl rounded-tr-xl border border-border bg-card p-5 shadow-sm">
              <p className="text-sm text-muted-foreground">
                Chưa có bình luận nào.{' '}
                {!currentUserId && (
                  <><a href="/login" className="text-primary underline-offset-4 hover:underline">Đăng nhập</a> để bình luận.</>
                )}
              </p>
            </TabsContent>

            <TabsContent value="reviews" className="mt-0 rounded-b-xl rounded-tr-xl border border-border bg-card p-5 shadow-sm space-y-4">
              {reviews.length > 0 ? (
                <>
                  <div className="flex flex-col items-center gap-6 rounded-xl border border-border bg-muted/30 p-5 sm:flex-row">
                    <div className="flex flex-col items-center gap-1">
                      <span className="text-5xl font-extrabold text-yellow-400">{avgRating.toFixed(1)}</span>
                      <StarRating rating={avgRatingRounded} size="lg" />
                      <span className="mt-1 text-xs text-muted-foreground">{reviews.length} đánh giá</span>
                    </div>
                    <div className="flex flex-1 flex-col gap-1.5">
                      {ratingCounts.map(({ star, count }) => (
                        <RatingBar key={star} star={star} count={count} total={reviews.length} />
                      ))}
                    </div>
                  </div>
                  <div className="space-y-3">
                    {reviews.map((review) => (
                      <div key={review.id} className="rounded-xl border border-border bg-background p-4">
                        <div className="mb-1.5 flex items-center justify-between">
                          <StarRating rating={review.rating} />
                          <span className="text-xs text-muted-foreground">
                            {new Date(review.created_at).toLocaleDateString('vi-VN')}
                          </span>
                        </div>
                        {review.comment && <p className="text-sm text-foreground/80">{review.comment}</p>}
                      </div>
                    ))}
                  </div>
                </>
              ) : (
                <p className="text-sm text-muted-foreground">Chưa có đánh giá nào. Hãy là người đầu tiên!</p>
              )}

              {currentUserId ? (
                <form onSubmit={handleReviewSubmit} className="space-y-4 rounded-xl border border-border bg-muted/20 p-5">
                  <h3 className="font-semibold text-foreground">Viết đánh giá của bạn</h3>
                  <div>
                    <label className="mb-2 block text-sm text-muted-foreground">Xếp hạng</label>
                    <InteractiveStars value={reviewRating} onChange={setReviewRating} />
                  </div>
                  <div>
                    <label className="mb-2 block text-sm text-muted-foreground">
                      Nhận xét <span className="text-xs opacity-60">(không bắt buộc)</span>
                    </label>
                    <textarea
                      value={reviewComment}
                      onChange={(e) => setReviewComment(e.target.value)}
                      rows={3}
                      placeholder="Chia sẻ trải nghiệm của bạn..."
                      className="w-full rounded-lg border border-input bg-background px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring"
                    />
                  </div>
                  <Button type="submit" disabled={submittingReview} className="rounded-lg">
                    {submittingReview ? 'Đang gửi...' : 'Gửi đánh giá'}
                  </Button>
                </form>
              ) : (
                <p className="text-sm text-muted-foreground">
                  <a href="/login" className="text-primary underline-offset-4 hover:underline">Đăng nhập</a>{' '}
                  để viết đánh giá sản phẩm.
                </p>
              )}
            </TabsContent>
          </Tabs>
        </div>

        <FeaturedSidebar products={featuredProducts} />
      </div>

      {/* Related products */}
      {relatedProducts.length > 0 && (
        <section>
          <div className="flex items-center gap-3 mb-4">
            <div className="w-1 h-6 bg-primary rounded-full" />
            <h2 className="text-lg font-bold text-foreground">Sản phẩm tương tự</h2>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3">
            {relatedProducts.map((p) => (
              <Link
                key={p.id}
                href={`/store/${p.id}`}
                className="group rounded-xl border border-border bg-card overflow-hidden shadow-sm hover:border-primary/50 hover:shadow-md transition-all"
              >
                <div className="relative aspect-[4/3] bg-muted overflow-hidden">
                  {p.dashboard_image_url ? (
                    <Image src={p.dashboard_image_url} alt={p.name} fill className="object-cover group-hover:scale-105 transition-transform duration-300" />
                  ) : (
                    <div className="flex h-full items-center justify-center">
                      <ShoppingCart className="h-8 w-8 text-muted-foreground/20" />
                    </div>
                  )}
                </div>
                <div className="p-3">
                  <p className="text-xs font-medium text-foreground line-clamp-2 leading-snug group-hover:text-primary transition-colors">{p.name}</p>
                  <p className="mt-1.5 text-sm font-bold text-primary">{p.price.toLocaleString('vi-VN')}&#8363;</p>
                </div>
              </Link>
            ))}
          </div>
        </section>
      )}

      {/* Recommended for you */}
      {featuredProducts.length > 0 && (
        <section>
          <div className="flex items-center gap-3 mb-4">
            <div className="w-1 h-6 bg-primary rounded-full" />
            <h2 className="text-lg font-bold text-foreground">Gợi ý cho bạn</h2>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3">
            {featuredProducts.slice(0, 5).map((p) => (
              <Link
                key={p.id}
                href={`/store/${p.id}`}
                className="group rounded-xl border border-border bg-card overflow-hidden shadow-sm hover:border-primary/50 hover:shadow-md transition-all"
              >
                <div className="relative aspect-[4/3] bg-muted overflow-hidden">
                  {p.dashboard_image_url ? (
                    <Image src={p.dashboard_image_url} alt={p.name} fill className="object-cover group-hover:scale-105 transition-transform duration-300" />
                  ) : (
                    <div className="flex h-full items-center justify-center">
                      <ShoppingCart className="h-8 w-8 text-muted-foreground/20" />
                    </div>
                  )}
                </div>
                <div className="p-3">
                  <p className="text-xs font-medium text-foreground line-clamp-2 leading-snug group-hover:text-primary transition-colors">{p.name}</p>
                  <p className="mt-1.5 text-sm font-bold text-primary">{p.price.toLocaleString('vi-VN')}&#8363;</p>
                </div>
              </Link>
            ))}
          </div>
        </section>
      )}
    </div>
  )
}
