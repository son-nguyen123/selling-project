'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { toast } from 'sonner'
import { Loader2, Upload } from 'lucide-react'

const CATEGORIES = ['Web App', 'Mobile', 'Backend', 'Component Library', 'Other']

export default function UploadForm() {
  const router = useRouter()
  const [loading, setLoading] = useState(false)

  const [form, setForm] = useState({
    title: '',
    description: '',
    tech_stack: '',
    category: '',
    price: '',
    cover_image_url: '',
  })

  function handleChange(field: string, value: string) {
    setForm((prev) => ({ ...prev, [field]: value }))
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()

    if (!form.title || !form.category || !form.price) {
      toast.error('Please fill in title, category, and price.')
      return
    }

    const price = parseFloat(form.price)
    if (isNaN(price) || price < 0) {
      toast.error('Price must be a valid positive number.')
      return
    }

    setLoading(true)
    try {
      const res = await fetch('/api/projects', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...form, price }),
      })

      const json = await res.json()

      if (!res.ok) {
        toast.error(json.error ?? 'Failed to create project.')
        return
      }

      toast.success('Project published!')
      router.push('/dashboard')
    } catch {
      toast.error('Something went wrong. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Title */}
      <div className="space-y-2">
        <Label htmlFor="title">Project Title *</Label>
        <Input
          id="title"
          placeholder="e.g. Modern E-Commerce Dashboard"
          value={form.title}
          onChange={(e) => handleChange('title', e.target.value)}
          required
        />
      </div>

      {/* Description */}
      <div className="space-y-2">
        <Label htmlFor="description">Description</Label>
        <Textarea
          id="description"
          placeholder="Describe what your project does, what problems it solves, and what's included..."
          className="min-h-[120px]"
          value={form.description}
          onChange={(e) => handleChange('description', e.target.value)}
        />
      </div>

      {/* Tech Stack */}
      <div className="space-y-2">
        <Label htmlFor="tech_stack">Tech Stack</Label>
        <Input
          id="tech_stack"
          placeholder="e.g. React, TypeScript, Tailwind CSS"
          value={form.tech_stack}
          onChange={(e) => handleChange('tech_stack', e.target.value)}
        />
        <p className="text-xs text-muted-foreground">Separate technologies with commas</p>
      </div>

      {/* Category + Price row */}
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label>Category *</Label>
          <Select
            value={form.category}
            onValueChange={(v) => handleChange('category', v)}
            required
          >
            <SelectTrigger>
              <SelectValue placeholder="Select category" />
            </SelectTrigger>
            <SelectContent>
              {CATEGORIES.map((cat) => (
                <SelectItem key={cat} value={cat}>
                  {cat}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label htmlFor="price">Price (USD) *</Label>
          <Input
            id="price"
            type="number"
            min="0"
            step="0.01"
            placeholder="e.g. 49.00"
            value={form.price}
            onChange={(e) => handleChange('price', e.target.value)}
            required
          />
        </div>
      </div>

      {/* Cover Image URL */}
      <div className="space-y-2">
        <Label htmlFor="cover_image_url">Cover Image URL</Label>
        <Input
          id="cover_image_url"
          type="url"
          placeholder="https://..."
          value={form.cover_image_url}
          onChange={(e) => handleChange('cover_image_url', e.target.value)}
        />
      </div>

      {/* Preview */}
      {form.cover_image_url && (
        <div className="rounded-xl overflow-hidden border border-border aspect-video bg-muted">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={form.cover_image_url}
            alt="Cover preview"
            className="w-full h-full object-cover"
            onError={(e) => {
              ;(e.target as HTMLImageElement).style.display = 'none'
            }}
          />
        </div>
      )}

      <Button type="submit" className="w-full gap-2 py-6 text-base" disabled={loading}>
        {loading ? (
          <Loader2 className="h-5 w-5 animate-spin" />
        ) : (
          <Upload className="h-5 w-5" />
        )}
        {loading ? 'Publishing…' : 'Publish Project'}
      </Button>
    </form>
  )
}
