import { createClient } from '@/lib/supabase/server'
import { notFound } from 'next/navigation'
import Link from 'next/link'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { ArrowLeft, Pencil, Package, Tag, DollarSign, Layers } from 'lucide-react'
import Image from 'next/image'

function getVideoInfo(url: string): { isYoutube: boolean; embedUrl: string } {
  if (!url || typeof url !== 'string') return { isYoutube: false, embedUrl: url ?? '' }
  const ytIdRegex = /^[a-zA-Z0-9_-]{1,20}$/
  try {
    const parsed = new URL(url)
    const ytId = parsed.searchParams.get('v')
    if (parsed.hostname.includes('youtube.com') && ytId && ytIdRegex.test(ytId)) {
      return { isYoutube: true, embedUrl: `https://www.youtube.com/embed/${ytId}?rel=0` }
    }
    if (parsed.hostname === 'youtu.be') {
      const id = parsed.pathname.slice(1)
      if (id && ytIdRegex.test(id)) {
        return { isYoutube: true, embedUrl: `https://www.youtube.com/embed/${id}?rel=0` }
      }
    }
  } catch { /* invalid url */ }
  return { isYoutube: false, embedUrl: url }
}

export default async function AdminProductDetailPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params
  const supabase = await createClient()

  const { data: product } = await supabase
    .from('store_products')
    .select('*')
    .eq('id', id)
    .single()

  if (!product) notFound()

  const allImages: string[] = [
    ...(product.single_image_url ? [product.single_image_url] : []),
    ...(product.gallery_urls ?? []),
  ]

  const specs = product.specs as Record<string, string> | null

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-3">
          <Button asChild variant="ghost" size="icon" className="shrink-0">
            <Link href="/admin/products">
              <ArrowLeft className="h-4 w-4" />
            </Link>
          </Button>
          <div>
            <h1 className="text-2xl font-bold text-foreground">{product.name}</h1>
            <p className="text-sm text-muted-foreground">Chi tiết sản phẩm</p>
          </div>
        </div>
        <Button asChild>
          <Link href={`/admin/products/${product.id}/edit`}>
            <Pencil className="mr-2 h-4 w-4" />
            Chỉnh sửa
          </Link>
        </Button>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Left column: images */}
        <div className="space-y-4 lg:col-span-2">
          {/* Main image */}
          <Card className="overflow-hidden">
            <div className="relative aspect-video w-full bg-muted">
              {product.dashboard_image_url ? (
                <Image
                  src={product.dashboard_image_url}
                  alt={product.name}
                  fill
                  className="object-cover"
                  priority
                />
              ) : allImages[0] ? (
                <Image
                  src={allImages[0]}
                  alt={product.name}
                  fill
                  className="object-cover"
                  priority
                />
              ) : (
                <div className="flex h-full items-center justify-center text-muted-foreground">
                  <Package className="h-16 w-16 opacity-20" />
                </div>
              )}
            </div>
          </Card>

          {/* Gallery thumbnails */}
          {allImages.length > 0 && (
            <div>
              <p className="mb-2 text-sm font-medium text-muted-foreground">Thư viện ảnh</p>
              <div className="flex flex-wrap gap-2">
                {allImages.map((url, idx) => (
                  <div
                    key={idx}
                    className="relative h-20 w-28 overflow-hidden rounded-md border border-border"
                  >
                    <Image src={url} alt={`Gallery ${idx + 1}`} fill className="object-cover" />
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Demo video */}
          {product.demo_video_url && (() => {
            const videoInfo = getVideoInfo(product.demo_video_url)
            return (
              <div>
                <p className="mb-2 text-sm font-medium text-muted-foreground">Video demo</p>
                {videoInfo.isYoutube ? (
                  <div className="aspect-video w-full overflow-hidden rounded-lg border border-border">
                    <iframe
                      src={videoInfo.embedUrl}
                      className="h-full w-full"
                      allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                      allowFullScreen
                      title="Video demo"
                    />
                  </div>
                ) : (
                  <video
                    src={videoInfo.embedUrl}
                    controls
                    className="w-full rounded-lg border border-border"
                  />
                )}
              </div>
            )
          })()}

          {/* Description */}
          {product.description && (
            <Card className="p-5">
              <h2 className="mb-2 text-sm font-semibold text-foreground">Mô tả sản phẩm</h2>
              <p className="whitespace-pre-wrap text-sm leading-relaxed text-muted-foreground">
                {product.description}
              </p>
            </Card>
          )}
        </div>

        {/* Right column: info */}
        <div className="space-y-4">
          {/* Summary card */}
          <Card className="p-5">
            <h2 className="mb-4 text-sm font-semibold text-foreground">Thông tin chung</h2>
            <ul className="space-y-3 text-sm">
              <li className="flex items-center gap-3">
                <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-primary/10">
                  <Tag className="h-4 w-4 text-primary" />
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">Danh mục</p>
                  <p className="font-medium text-foreground">{product.category ?? '—'}</p>
                </div>
              </li>
              <li className="flex items-center gap-3">
                <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-primary/10">
                  <DollarSign className="h-4 w-4 text-primary" />
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">Giá bán</p>
                  <p className="text-lg font-bold text-primary">
                    {Number(product.price).toLocaleString('vi-VN')}₫
                  </p>
                </div>
              </li>
              <li className="flex items-center gap-3">
                <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-primary/10">
                  <Layers className="h-4 w-4 text-primary" />
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">Tồn kho</p>
                  <Badge
                    variant={product.stock > 0 ? 'default' : 'destructive'}
                    className={product.stock > 0 ? 'bg-green-600 hover:bg-green-700' : ''}
                  >
                    {product.stock > 0 ? `${product.stock} sản phẩm` : 'Hết hàng'}
                  </Badge>
                </div>
              </li>
            </ul>
          </Card>

          {/* Specs */}
          {specs && Object.keys(specs).length > 0 && (
            <Card className="p-5">
              <h2 className="mb-3 text-sm font-semibold text-foreground">Thông số kỹ thuật</h2>
              <table className="w-full text-sm">
                <tbody>
                  {Object.entries(specs).map(([key, val]) => (
                    <tr key={key} className="border-b border-border/50 last:border-0">
                      <td className="py-2 pr-4 font-medium text-muted-foreground">{key}</td>
                      <td className="py-2 text-foreground">{val}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </Card>
          )}

          {/* Dates */}
          <Card className="p-5">
            <h2 className="mb-3 text-sm font-semibold text-foreground">Thời gian</h2>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Ngày tạo</span>
                <span className="font-medium text-foreground">
                  {new Date(product.created_at).toLocaleDateString('vi-VN')}
                </span>
              </div>
              {product.updated_at && (
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Cập nhật</span>
                  <span className="font-medium text-foreground">
                    {new Date(product.updated_at).toLocaleDateString('vi-VN')}
                  </span>
                </div>
              )}
            </div>
          </Card>
        </div>
      </div>
    </div>
  )
}
