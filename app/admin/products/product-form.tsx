'use client'

import { useState, useRef } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { toast } from 'sonner'
import { Plus, Trash2, Upload } from 'lucide-react'


const CATEGORIES = ['Source code', 'Website', 'Phần mềm', 'Ứng dụng', 'Dịch vụ máy chủ', 'Other']

interface SpecEntry {
  key: string
  value: string
}

interface ProductFormData {
  id?: string
  name: string
  description: string
  price: string
  category: string
  stock: string
  dashboard_image_url: string
  single_image_url: string
  demo_video_url: string
  gallery_urls: string[]
  demo_urls: string[]
  specs: SpecEntry[]
}

interface ProductFormProps {
  initialData?: Partial<ProductFormData>
  mode: 'create' | 'edit'
}

function getSubmitLabel(mode: 'create' | 'edit', submitting: boolean): string {
  if (mode === 'edit') return submitting ? 'Saving...' : 'Save Changes'
  return submitting ? 'Creating...' : 'Create Product'
}

async function uploadFile(file: File, bucket: string): Promise<string> {
  const fd = new FormData()
  fd.append('file', file)
  fd.append('bucket', bucket)
  const res = await fetch('/api/store/upload', { method: 'POST', body: fd })
  if (!res.ok) {
    const err = await res.json()
    throw new Error(err.error ?? 'Upload failed')
  }
  const data = await res.json()
  return data.url as string
}

export default function ProductForm({ initialData, mode }: ProductFormProps) {
  const router = useRouter()
  const [submitting, setSubmitting] = useState(false)

  const [name, setName] = useState(initialData?.name ?? '')
  const [description, setDescription] = useState(initialData?.description ?? '')
  const [price, setPrice] = useState(initialData?.price ?? '')
  const [category, setCategory] = useState(initialData?.category ?? '')
  const [stock, setStock] = useState(initialData?.stock ?? '0')
  const [dashboardImageUrl, setDashboardImageUrl] = useState(initialData?.dashboard_image_url ?? '')
  const [singleImageUrl, setSingleImageUrl] = useState(initialData?.single_image_url ?? '')
  const [demoVideoUrl, setDemoVideoUrl] = useState(initialData?.demo_video_url ?? '')
  const [galleryUrls, setGalleryUrls] = useState<string[]>(initialData?.gallery_urls ?? [])
  const [demoUrls, setDemoUrls] = useState<string[]>(initialData?.demo_urls ?? [])
  const [specs, setSpecs] = useState<SpecEntry[]>(initialData?.specs ?? [])

  const dashboardInputRef = useRef<HTMLInputElement>(null)
  const singleInputRef = useRef<HTMLInputElement>(null)
  const videoInputRef = useRef<HTMLInputElement>(null)
  const galleryInputRef = useRef<HTMLInputElement>(null)

  async function handleFileUpload(
    file: File,
    bucket: string,
    setter: (url: string) => void,
  ) {
    try {
      const url = await uploadFile(file, bucket)
      setter(url)
      toast.success('File uploaded')
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Upload failed')
    }
  }

  async function handleGalleryUpload(files: FileList) {
    const uploaded: string[] = []
    for (const file of Array.from(files)) {
      try {
        const url = await uploadFile(file, 'product-images')
        uploaded.push(url)
      } catch {
        toast.error(`Failed to upload ${file.name}`)
      }
    }
    setGalleryUrls((prev) => [...prev, ...uploaded])
    if (uploaded.length > 0) toast.success(`${uploaded.length} image(s) uploaded`)
  }

  function addSpec() {
    setSpecs((prev) => [...prev, { key: '', value: '' }])
  }

  function updateSpec(idx: number, field: 'key' | 'value', val: string) {
    setSpecs((prev) => prev.map((s, i) => (i === idx ? { ...s, [field]: val } : s)))
  }

  function removeSpec(idx: number) {
    setSpecs((prev) => prev.filter((_, i) => i !== idx))
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!name || !price) {
      toast.error('Name and price are required')
      return
    }
    setSubmitting(true)
    try {
      const specsObj = specs
        .filter((s) => s.key.trim() && s.value.trim())
        .reduce<Record<string, string>>((acc, s) => ({ ...acc, [s.key.trim()]: s.value.trim() }), {})

      const payload = {
        name,
        description: description || null,
        price: parseFloat(price),
        category: category || null,
        stock: parseInt(stock, 10) || 0,
        dashboard_image_url: dashboardImageUrl || null,
        single_image_url: singleImageUrl || null,
        demo_video_url: demoVideoUrl || null,
        gallery_urls: galleryUrls.length > 0 ? galleryUrls : null,
        demo_urls: demoUrls.length > 0 ? demoUrls : null,
        specs: Object.keys(specsObj).length > 0 ? specsObj : null,
      }

      const url = mode === 'edit' ? `/api/store/products/${initialData?.id}` : '/api/store/products'
      const method = mode === 'edit' ? 'PUT' : 'POST'

      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      })

      if (!res.ok) {
        const err = await res.json()
        throw new Error(err.error ?? 'Failed to save product')
      }

      toast.success(mode === 'edit' ? 'Product updated!' : 'Product created!')
      router.push('/admin/products')
      router.refresh()
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Failed to save product')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Basic info */}
      <div className="grid gap-4 sm:grid-cols-2">
        <div className="sm:col-span-2">
          <Label htmlFor="name">Name *</Label>
          <Input
            id="name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Product name"
            required
            className="mt-1"
          />
        </div>
        <div className="sm:col-span-2">
          <Label htmlFor="description">Description</Label>
          <textarea
            id="description"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            rows={4}
            placeholder="Product description..."
            className="mt-1 w-full rounded-md border border-input bg-background px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring"
          />
        </div>
        <div>
          <Label htmlFor="price">Giá (₫) *</Label>
          <Input
            id="price"
            type="number"
            step="1"
            min="0"
            value={price}
            onChange={(e) => setPrice(e.target.value)}
            placeholder="50000"
            required
            className="mt-1"
          />
        </div>
        <div>
          <Label htmlFor="stock">Stock</Label>
          <Input
            id="stock"
            type="number"
            min="0"
            value={stock}
            onChange={(e) => setStock(e.target.value)}
            placeholder="0"
            className="mt-1"
          />
        </div>
        <div>
          <Label htmlFor="category">Category</Label>
          <select
            id="category"
            value={category}
            onChange={(e) => setCategory(e.target.value)}
            className="mt-1 w-full rounded-md border border-input bg-background px-3 py-2 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-ring"
          >
            <option value="">— Select —</option>
            {CATEGORIES.map((c) => (
              <option key={c} value={c}>{c}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Dashboard image */}
      <div>
        <Label>Dashboard Image</Label>
        <div className="mt-2 flex items-center gap-3">
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => dashboardInputRef.current?.click()}
          >
            <Upload className="mr-2 h-3.5 w-3.5" />
            Upload
          </Button>
          <input
            ref={dashboardInputRef}
            type="file"
            accept="image/*"
            className="hidden"
            onChange={(e) => {
              const f = e.target.files?.[0]
              if (f) handleFileUpload(f, 'product-images', setDashboardImageUrl)
            }}
          />
          {dashboardImageUrl && (
            <a href={dashboardImageUrl} target="_blank" rel="noopener noreferrer" className="text-xs text-primary underline-offset-4 hover:underline">
              View current
            </a>
          )}
        </div>
        {dashboardImageUrl && (
          <div className="relative mt-2 h-32 w-48 overflow-hidden rounded-md border border-border">
            <img src={dashboardImageUrl} alt="Dashboard preview" className="h-full w-full object-cover" onError={(e) => { (e.currentTarget as HTMLImageElement).style.display = 'none' }} />
          </div>
        )}
        <Input
          value={dashboardImageUrl}
          onChange={(e) => setDashboardImageUrl(e.target.value)}
          placeholder="Or paste URL..."
          className="mt-2"
        />
      </div>

      {/* Single page image */}
      <div>
        <Label>Single Page Image</Label>
        <div className="mt-2 flex items-center gap-3">
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => singleInputRef.current?.click()}
          >
            <Upload className="mr-2 h-3.5 w-3.5" />
            Upload
          </Button>
          <input
            ref={singleInputRef}
            type="file"
            accept="image/*"
            className="hidden"
            onChange={(e) => {
              const f = e.target.files?.[0]
              if (f) handleFileUpload(f, 'product-images', setSingleImageUrl)
            }}
          />
        </div>
        {singleImageUrl && (
          <div className="relative mt-2 h-32 w-48 overflow-hidden rounded-md border border-border">
            <img src={singleImageUrl} alt="Single page preview" className="h-full w-full object-cover" onError={(e) => { (e.currentTarget as HTMLImageElement).style.display = 'none' }} />
          </div>
        )}
        <Input
          value={singleImageUrl}
          onChange={(e) => setSingleImageUrl(e.target.value)}
          placeholder="Or paste URL..."
          className="mt-2"
        />
      </div>

      {/* Demo video */}
      <div>
        <Label>Demo Video</Label>
        <div className="mt-2 flex items-center gap-3">
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => videoInputRef.current?.click()}
          >
            <Upload className="mr-2 h-3.5 w-3.5" />
            Upload Video
          </Button>
          <input
            ref={videoInputRef}
            type="file"
            accept="video/*"
            className="hidden"
            onChange={(e) => {
              const f = e.target.files?.[0]
              if (f) handleFileUpload(f, 'product-videos', setDemoVideoUrl)
            }}
          />
        </div>
        {demoVideoUrl && (
          <video src={demoVideoUrl} controls className="mt-2 max-h-40 rounded-md border border-border" />
        )}
        <Input
          value={demoVideoUrl}
          onChange={(e) => setDemoVideoUrl(e.target.value)}
          placeholder="Or paste video URL..."
          className="mt-2"
        />
      </div>

      {/* Gallery */}
      <div>
        <Label>Gallery Images</Label>
        <div className="mt-2 flex items-center gap-3">
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => galleryInputRef.current?.click()}
          >
            <Upload className="mr-2 h-3.5 w-3.5" />
            Upload Images
          </Button>
          <input
            ref={galleryInputRef}
            type="file"
            accept="image/*"
            multiple
            className="hidden"
            onChange={(e) => {
              if (e.target.files) handleGalleryUpload(e.target.files)
            }}
          />
        </div>
        {/* Gallery URL paste input */}
        <div className="mt-2 flex gap-2">
          <Input
            placeholder="Hoặc dán URL ảnh gallery rồi nhấn Enter..."
            className="flex-1 text-sm"
            onKeyDown={(e) => {
              if (e.key === 'Enter') {
                e.preventDefault()
                const val = (e.currentTarget as HTMLInputElement).value.trim()
                if (val) {
                  setGalleryUrls((prev) => [...prev, val])
                  ;(e.currentTarget as HTMLInputElement).value = ''
                }
              }
            }}
          />
        </div>
        {galleryUrls.length > 0 && (
          <div className="mt-3 flex flex-wrap gap-2">
            {galleryUrls.map((url, idx) => (
              <div key={idx} className="group relative h-20 w-28 overflow-hidden rounded-md border border-border">
                <img src={url} alt={`Gallery ${idx + 1}`} className="h-full w-full object-cover" onError={(e) => { (e.currentTarget as HTMLImageElement).style.display = 'none' }} />
                <button
                  type="button"
                  onClick={() => setGalleryUrls((prev) => prev.filter((_, i) => i !== idx))}
                  className="absolute right-1 top-1 hidden rounded-full bg-destructive p-0.5 group-hover:block"
                >
                  <Trash2 className="h-3 w-3 text-destructive-foreground" />
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Demo / Live Preview URLs */}
      <div>
        <Label>Demo / Live Preview URLs</Label>
        <div className="mt-2 flex gap-2">
          <Input
            placeholder="Dán URL demo/live preview rồi nhấn Enter..."
            className="flex-1 text-sm"
            onKeyDown={(e) => {
              if (e.key === 'Enter') {
                e.preventDefault()
                const val = (e.currentTarget as HTMLInputElement).value.trim()
                if (val) {
                  setDemoUrls((prev) => [...prev, val])
                  ;(e.currentTarget as HTMLInputElement).value = ''
                }
              }
            }}
          />
        </div>
        {demoUrls.length > 0 && (
          <div className="mt-3 space-y-1.5">
            {demoUrls.map((url, idx) => (
              <div key={idx} className="flex items-center gap-2 rounded-md border border-border bg-muted/40 px-3 py-1.5">
                <span className="flex-1 truncate text-xs text-foreground">{url}</span>
                <button
                  type="button"
                  onClick={() => setDemoUrls((prev) => prev.filter((_, i) => i !== idx))}
                  className="shrink-0 rounded p-0.5 text-destructive hover:bg-destructive/10"
                >
                  <Trash2 className="h-3.5 w-3.5" />
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Specs */}
      <div>
        <div className="flex items-center justify-between">
          <Label>Specifications</Label>
          <Button type="button" variant="ghost" size="sm" onClick={addSpec}>
            <Plus className="mr-1 h-3.5 w-3.5" />
            Add Spec
          </Button>
        </div>
        <div className="mt-2 space-y-2">
          {specs.map((spec, idx) => (
            <div key={idx} className="flex items-center gap-2">
              <Input
                value={spec.key}
                onChange={(e) => updateSpec(idx, 'key', e.target.value)}
                placeholder="Key (e.g. Weight)"
                className="flex-1"
              />
              <Input
                value={spec.value}
                onChange={(e) => updateSpec(idx, 'value', e.target.value)}
                placeholder="Value (e.g. 500g)"
                className="flex-1"
              />
              <Button
                type="button"
                variant="ghost"
                size="icon"
                className="h-8 w-8 shrink-0 text-destructive"
                onClick={() => removeSpec(idx)}
              >
                <Trash2 className="h-3.5 w-3.5" />
              </Button>
            </div>
          ))}
        </div>
      </div>

      <div className="flex gap-3 pt-2">
        <Button type="button" variant="outline" onClick={() => router.push('/admin/products')}>
          Cancel
        </Button>
        <Button type="submit" disabled={submitting}>
          {getSubmitLabel(mode, submitting)}
        </Button>
      </div>
    </form>
  )
}
