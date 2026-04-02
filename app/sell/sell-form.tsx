'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { toast } from 'sonner'
import { Upload, CheckCircle2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'

const SELL_CATEGORIES = [
  { value: 'Source code', label: '💻 Source code' },
  { value: 'Website', label: '🌐 Website' },
  { value: 'Phần mềm', label: '🖥️ Phần mềm' },
  { value: 'Ứng dụng', label: '📱 Ứng dụng' },
  { value: 'Dịch vụ máy chủ', label: '🖧 Dịch vụ máy chủ' },
]

function isSafeImageUrl(url: string): boolean {
  try {
    const parsed = new URL(url)
    return parsed.protocol === 'http:' || parsed.protocol === 'https:'
  } catch {
    return false
  }
}

export default function SellForm() {
  const router = useRouter()
  const [submitting, setSubmitting] = useState(false)
  const [success, setSuccess] = useState(false)

  const [name, setName] = useState('')
  const [description, setDescription] = useState('')
  const [price, setPrice] = useState('')
  const [category, setCategory] = useState('')
  const [imageUrl, setImageUrl] = useState('')

  const safePreviewUrl = imageUrl && isSafeImageUrl(imageUrl) ? new URL(imageUrl).href : null

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!name.trim() || !price) {
      toast.error('Vui lòng điền tên và giá sản phẩm.')
      return
    }
    if (!category) {
      toast.error('Vui lòng chọn danh mục sản phẩm.')
      return
    }

    setSubmitting(true)
    try {
      const res = await fetch('/api/sell', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, description, price, category, dashboard_image_url: imageUrl }),
      })

      if (!res.ok) {
        const err = await res.json()
        throw new Error(err.error ?? 'Đăng sản phẩm thất bại')
      }

      setSuccess(true)
      toast.success('Sản phẩm của bạn đã được đăng lên marketplace!')
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Đã có lỗi xảy ra, vui lòng thử lại.')
    } finally {
      setSubmitting(false)
    }
  }

  if (success) {
    return (
      <div className="flex flex-col items-center justify-center py-16 gap-5 text-center border border-border rounded-sm bg-card">
        <CheckCircle2 className="h-16 w-16 text-green-500" />
        <div>
          <h2 className="text-xl font-bold text-foreground">Đăng bán thành công!</h2>
          <p className="text-muted-foreground text-sm mt-1">
            Sản phẩm của bạn đã được đăng lên marketplace và sẵn sàng để mua bán.
          </p>
        </div>
        <div className="flex gap-3">
          <Button variant="outline" size="sm" onClick={() => { setSuccess(false); setName(''); setDescription(''); setPrice(''); setCategory(''); setImageUrl('') }}>
            Đăng thêm sản phẩm
          </Button>
          <Button size="sm" onClick={() => router.push('/')}>
            Xem marketplace
          </Button>
        </div>
      </div>
    )
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Tips */}
      <div className="rounded-sm border border-accent/30 bg-accent/5 px-4 py-3 text-sm text-muted-foreground">
        <p className="font-medium text-foreground mb-1">💡 Lưu ý khi đăng bán</p>
        <ul className="list-disc list-inside space-y-0.5">
          <li>Mô tả rõ ràng, chi tiết giúp tăng tỷ lệ bán hàng</li>
          <li>Đặt giá hợp lý theo chất lượng và tính năng sản phẩm</li>
          <li>Ảnh thumbnail rõ nét, chuyên nghiệp tạo ấn tượng tốt hơn</li>
        </ul>
      </div>

      {/* Product name */}
      <div>
        <Label htmlFor="name">
          Tên sản phẩm <span className="text-destructive">*</span>
        </Label>
        <Input
          id="name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="Ví dụ: Next.js SaaS Boilerplate với Stripe & Supabase"
          required
          className="mt-1"
          maxLength={200}
        />
      </div>

      {/* Description */}
      <div>
        <Label htmlFor="description">Mô tả sản phẩm</Label>
        <textarea
          id="description"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          rows={5}
          placeholder="Mô tả chi tiết tính năng, công nghệ sử dụng, hướng dẫn cài đặt và các điểm nổi bật của sản phẩm..."
          className="mt-1 w-full rounded-md border border-input bg-background px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring"
          maxLength={2000}
        />
        <p className="text-xs text-muted-foreground mt-1">{description.length}/2000 ký tự</p>
      </div>

      {/* Price and Category */}
      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <Label htmlFor="price">
            Giá bán (₫) <span className="text-destructive">*</span>
          </Label>
          <div className="relative mt-1">
            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-sm text-muted-foreground">₫</span>
            <Input
              id="price"
              type="number"
              step="1"
              min="0"
              value={price}
              onChange={(e) => setPrice(e.target.value)}
              placeholder="50000"
              required
              className="pl-7"
            />
          </div>
        </div>

        <div>
          <Label htmlFor="category">
            Danh mục <span className="text-destructive">*</span>
          </Label>
          <select
            id="category"
            value={category}
            onChange={(e) => setCategory(e.target.value)}
            required
            className="mt-1 w-full rounded-md border border-input bg-background px-3 py-2 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-ring"
          >
            <option value="">— Chọn danh mục —</option>
            {SELL_CATEGORIES.map((c) => (
              <option key={c.value} value={c.value}>{c.label}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Thumbnail image URL */}
      <div>
        <Label htmlFor="imageUrl">URL ảnh thumbnail</Label>
        <Input
          id="imageUrl"
          type="url"
          value={imageUrl}
          onChange={(e) => setImageUrl(e.target.value)}
          placeholder="https://example.com/product-thumbnail.jpg"
          className="mt-1"
        />
        {safePreviewUrl && (
          <div className="mt-2 h-32 w-48 overflow-hidden rounded-md border border-border">
            <img
              src={safePreviewUrl}
              alt="Preview thumbnail"
              className="h-full w-full object-cover"
              onError={(e) => { (e.currentTarget as HTMLImageElement).style.display = 'none' }}
            />
          </div>
        )}
        <p className="text-xs text-muted-foreground mt-1">
          Dán URL ảnh thumbnail của sản phẩm (tỷ lệ 1:1 hoặc 4:3 trông đẹp nhất).
        </p>
      </div>

      {/* Submit */}
      <div className="flex gap-3 pt-2 border-t border-border">
        <Button
          type="button"
          variant="outline"
          onClick={() => router.push('/')}
          disabled={submitting}
        >
          Huỷ
        </Button>
        <Button type="submit" disabled={submitting} className="gap-2">
          <Upload className="h-4 w-4" />
          {submitting ? 'Đang đăng...' : 'Đăng bán ngay'}
        </Button>
      </div>
    </form>
  )
}
