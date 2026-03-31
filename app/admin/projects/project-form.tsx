'use client'

import { useState, useRef } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { toast } from 'sonner'
import { Upload } from 'lucide-react'
import Image from 'next/image'

const CATEGORIES = ['Web App', 'Mobile', 'Backend', 'Component Library', 'Other']

interface ProjectFormData {
  id?: string
  title: string
  description: string
  tech_stack: string
  category: string
  price: string
  cover_image_url: string
}

interface ProjectFormProps {
  initialData?: Partial<ProjectFormData>
  mode: 'create' | 'edit'
}

function getSubmitLabel(mode: 'create' | 'edit', submitting: boolean): string {
  if (mode === 'edit') return submitting ? 'Saving...' : 'Save Changes'
  return submitting ? 'Creating...' : 'Create Project'
}

async function uploadFile(file: File): Promise<string> {
  const fd = new FormData()
  fd.append('file', file)
  fd.append('bucket', 'product-images')
  const res = await fetch('/api/store/upload', { method: 'POST', body: fd })
  if (!res.ok) {
    const err = await res.json()
    throw new Error(err.error ?? 'Upload failed')
  }
  const data = await res.json()
  return data.url as string
}

export default function ProjectForm({ initialData, mode }: ProjectFormProps) {
  const router = useRouter()
  const [submitting, setSubmitting] = useState(false)

  const [title, setTitle] = useState(initialData?.title ?? '')
  const [description, setDescription] = useState(initialData?.description ?? '')
  const [techStack, setTechStack] = useState(initialData?.tech_stack ?? '')
  const [category, setCategory] = useState(initialData?.category ?? '')
  const [price, setPrice] = useState(initialData?.price ?? '')
  const [coverImageUrl, setCoverImageUrl] = useState(initialData?.cover_image_url ?? '')

  const coverInputRef = useRef<HTMLInputElement>(null)

  async function handleCoverUpload(file: File) {
    try {
      const url = await uploadFile(file)
      setCoverImageUrl(url)
      toast.success('Image uploaded')
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Upload failed')
    }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!title || !price) {
      toast.error('Title and price are required')
      return
    }
    setSubmitting(true)
    try {
      const payload = {
        title,
        description: description || null,
        tech_stack: techStack || null,
        category: category || null,
        price: parseFloat(price),
        cover_image_url: coverImageUrl || null,
      }

      const url =
        mode === 'edit' ? `/api/projects/${initialData?.id}` : '/api/projects'
      const method = mode === 'edit' ? 'PUT' : 'POST'

      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      })

      if (!res.ok) {
        const err = await res.json()
        throw new Error(err.error ?? 'Failed to save project')
      }

      toast.success(mode === 'edit' ? 'Project updated!' : 'Project created!')
      router.push('/admin/projects')
      router.refresh()
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Failed to save project')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="grid gap-4 sm:grid-cols-2">
        <div className="sm:col-span-2">
          <Label htmlFor="title">Title *</Label>
          <Input
            id="title"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Project title"
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
            placeholder="Project description..."
            className="mt-1 w-full rounded-md border border-input bg-background px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring"
          />
        </div>
        <div>
          <Label htmlFor="price">Price ($) *</Label>
          <Input
            id="price"
            type="number"
            step="0.01"
            min="0"
            value={price}
            onChange={(e) => setPrice(e.target.value)}
            placeholder="0.00"
            required
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
              <option key={c} value={c}>
                {c}
              </option>
            ))}
          </select>
        </div>
        <div className="sm:col-span-2">
          <Label htmlFor="tech_stack">Tech Stack</Label>
          <Input
            id="tech_stack"
            value={techStack}
            onChange={(e) => setTechStack(e.target.value)}
            placeholder="e.g. React, TypeScript, Tailwind CSS"
            className="mt-1"
          />
          <p className="mt-1 text-xs text-muted-foreground">Separate technologies with commas</p>
        </div>
      </div>

      {/* Cover image */}
      <div>
        <Label>Cover Image</Label>
        <div className="mt-2 flex items-center gap-3">
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => coverInputRef.current?.click()}
          >
            <Upload className="mr-2 h-3.5 w-3.5" />
            Upload
          </Button>
          <input
            ref={coverInputRef}
            type="file"
            accept="image/*"
            className="hidden"
            onChange={(e) => {
              const f = e.target.files?.[0]
              if (f) handleCoverUpload(f)
            }}
          />
        </div>
        {coverImageUrl && (
          <div className="relative mt-2 h-32 w-48 overflow-hidden rounded-md border border-border">
            <Image src={coverImageUrl} alt="Cover preview" fill className="object-cover" />
          </div>
        )}
        <Input
          value={coverImageUrl}
          onChange={(e) => setCoverImageUrl(e.target.value)}
          placeholder="Or paste image URL..."
          className="mt-2"
        />
      </div>

      <div className="flex gap-3 pt-2">
        <Button type="button" variant="outline" onClick={() => router.push('/admin/projects')}>
          Cancel
        </Button>
        <Button type="submit" disabled={submitting}>
          {getSubmitLabel(mode, submitting)}
        </Button>
      </div>
    </form>
  )
}
