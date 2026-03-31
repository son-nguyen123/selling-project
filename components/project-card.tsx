'use client'

import { useState } from 'react'
import { Heart, ShoppingCart, Eye, Download } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import Link from 'next/link'
import { toast } from 'sonner'

interface Project {
  id: number
  title: string
  author: string
  price: number
  image: string
  rating: number
  reviews: number
  category: string
  tech: string[]
}

interface ProjectCardProps {
  project: Project
  initialIsWishlisted?: boolean
  isLoggedIn?: boolean
}

export default function ProjectCard({
  project,
  initialIsWishlisted = false,
  isLoggedIn = false,
}: ProjectCardProps) {
  const [isWishlisted, setIsWishlisted] = useState(initialIsWishlisted)
  const [wishlistLoading, setWishlistLoading] = useState(false)

  async function handleToggleWishlist(e: React.MouseEvent) {
    e.preventDefault()
    if (!isLoggedIn) {
      toast.error('Đăng nhập để lưu dự án yêu thích.')
      return
    }

    setIsWishlisted((prev) => !prev)
    setWishlistLoading(true)

    try {
      const res = await fetch('/api/wishlist', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ projectId: project.id }),
      })

      const json = await res.json()

      if (!res.ok) {
        setIsWishlisted((prev) => !prev)
        toast.error(json.error ?? 'Không thể cập nhật danh sách yêu thích.')
      } else {
        toast.success(json.wishlisted ? 'Đã thêm vào yêu thích' : 'Đã xoá khỏi yêu thích')
      }
    } catch {
      setIsWishlisted((prev) => !prev)
      toast.error('Đã xảy ra lỗi. Vui lòng thử lại.')
    } finally {
      setWishlistLoading(false)
    }
  }

  return (
    <Link href={`/projects/${project.id}`} className="group block bg-card border border-border rounded-sm hover:shadow-md transition-all duration-200 overflow-hidden">
      {/* Image */}
      <div className="relative overflow-hidden bg-muted aspect-square">
        <img
          src={project.image}
          alt={project.title}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
        />

        {/* Category Badge */}
        <div className="absolute top-2 left-2">
          <Badge className="bg-accent text-accent-foreground text-xs px-1.5 py-0.5 rounded-sm border-0">
            {project.category}
          </Badge>
        </div>

        {/* Wishlist Button */}
        <button
          onClick={handleToggleWishlist}
          disabled={wishlistLoading}
          aria-label={isWishlisted ? 'Bỏ yêu thích' : 'Yêu thích'}
          className="absolute top-2 right-2 bg-background/80 backdrop-blur p-1.5 rounded-full hover:bg-background transition-all disabled:opacity-50 opacity-0 group-hover:opacity-100"
        >
          <Heart
            className={`h-4 w-4 transition-colors ${
              isWishlisted ? 'fill-accent text-accent' : 'text-muted-foreground'
            }`}
          />
        </button>

        {/* Hover overlay with actions */}
        <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/60 to-transparent py-2 px-2 flex gap-1.5 translate-y-full group-hover:translate-y-0 transition-transform duration-200">
          <Link
            href={`/projects/${project.id}#buy-section`}
            onClick={(e) => e.stopPropagation()}
            className="flex-1 flex items-center justify-center gap-1 py-1.5 bg-accent hover:bg-accent/90 text-accent-foreground text-xs font-medium rounded-sm transition-colors"
          >
            <Download className="h-3 w-3" />
            Mua Ngay
          </Link>
          <Link
            href={`/projects/${project.id}#buy-section`}
            onClick={(e) => e.stopPropagation()}
            className="flex items-center justify-center gap-1 px-2 py-1.5 bg-background/90 hover:bg-background text-foreground text-xs rounded-sm transition-colors border border-border"
          >
            <ShoppingCart className="h-3 w-3" />
          </Link>
          <Link
            href={`/projects/${project.id}`}
            onClick={(e) => e.stopPropagation()}
            className="flex items-center justify-center gap-1 px-2 py-1.5 bg-background/90 hover:bg-background text-foreground text-xs rounded-sm transition-colors border border-border"
          >
            <Eye className="h-3 w-3" />
          </Link>
        </div>
      </div>

      {/* Content */}
      <div className="p-2.5">
        <h3 className="text-sm text-foreground line-clamp-2 leading-snug mb-1.5 min-h-[2.5rem]">
          {project.title}
        </h3>

        <div className="flex items-center justify-between">
          <span className="text-accent font-bold text-base">
            ${Number(project.price).toFixed(0)}
          </span>
          <span className="text-xs text-muted-foreground">by {project.author}</span>
        </div>
      </div>
    </Link>
  )
}

