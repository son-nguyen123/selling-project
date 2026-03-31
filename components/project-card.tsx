'use client'

import { useState } from 'react'
import { Heart, Star, ShoppingCart, Eye, Download } from 'lucide-react'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
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

  async function handleToggleWishlist() {
    if (!isLoggedIn) {
      toast.error('Sign in to save projects to your wishlist.')
      return
    }

    // Optimistic update
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
        // Revert on error
        setIsWishlisted((prev) => !prev)
        toast.error(json.error ?? 'Failed to update wishlist.')
      } else {
        toast.success(json.wishlisted ? 'Added to wishlist' : 'Removed from wishlist')
      }
    } catch {
      setIsWishlisted((prev) => !prev)
      toast.error('Something went wrong. Please try again.')
    } finally {
      setWishlistLoading(false)
    }
  }

  return (
    <Card className="group overflow-hidden hover:shadow-lg transition-all duration-300 border border-border h-full flex flex-col">
      {/* Image Section */}
      <div className="relative overflow-hidden bg-muted h-40 sm:h-48">
        <img
          src={project.image}
          alt={project.title}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
        />
        {/* Hover overlay */}
        <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors flex items-center justify-center">
          <Link href={`/projects/${project.id}`}>
            <Button
              size="sm"
              className="opacity-0 group-hover:opacity-100 transition-opacity gap-2"
            >
              <Eye className="h-4 w-4" />
              Preview
            </Button>
          </Link>
        </div>

        {/* Wishlist Button */}
        <button
          onClick={handleToggleWishlist}
          disabled={wishlistLoading}
          aria-label={isWishlisted ? 'Remove from wishlist' : 'Add to wishlist'}
          className="absolute top-3 right-3 bg-background/80 backdrop-blur p-2 rounded-lg hover:bg-background transition-all disabled:opacity-50"
        >
          <Heart
            className={`h-5 w-5 transition-colors ${
              isWishlisted
                ? 'fill-accent text-accent'
                : 'text-muted-foreground hover:text-foreground'
            }`}
          />
        </button>

        {/* Category Badge */}
        <div className="absolute top-3 left-3">
          <Badge variant="secondary" className="bg-background/80 backdrop-blur">
            {project.category}
          </Badge>
        </div>
      </div>

      {/* Content Section */}
      <div className="p-4 flex-1 flex flex-col">
        {/* Title */}
        <Link href={`/projects/${project.id}`}>
          <h3 className="font-bold text-lg text-foreground mb-1 line-clamp-2 hover:text-accent transition-colors cursor-pointer">
            {project.title}
          </h3>
        </Link>

        {/* Author */}
        <p className="text-sm text-muted-foreground mb-3">by {project.author}</p>

        {/* Rating */}
        <div className="flex items-center gap-2 mb-3">
          <div className="flex items-center gap-1">
            <Star className="h-4 w-4 fill-accent text-accent" />
            <span className="font-semibold text-sm">{project.rating}</span>
          </div>
          <span className="text-xs text-muted-foreground">({project.reviews} reviews)</span>
        </div>

        {/* Tech Stack */}
        <div className="flex gap-1 flex-wrap mb-4">
          {project.tech.slice(0, 2).map((tech) => (
            <Badge key={tech} variant="outline" className="text-xs">
              {tech}
            </Badge>
          ))}
          {project.tech.length > 2 && (
            <Badge variant="outline" className="text-xs">
              +{project.tech.length - 2}
            </Badge>
          )}
        </div>

        {/* Footer */}
        <div className="mt-auto pt-4 border-t border-border space-y-3">
          <div className="flex items-baseline gap-1">
            <span className="text-2xl font-bold text-foreground">${project.price}</span>
            <span className="text-xs text-muted-foreground">one-time</span>
          </div>
          <div className="flex gap-2">
            <Link href={`/projects/${project.id}`} className="flex-1">
              <Button size="sm" variant="outline" className="w-full gap-1">
                <Eye className="h-3 w-3" />
                Xem Thêm
              </Button>
            </Link>
            <Link href={`/projects/${project.id}#buy-section`} className="flex-1">
              <Button size="sm" variant="outline" className="w-full gap-1">
                <ShoppingCart className="h-3 w-3" />
                Đặt Hàng
              </Button>
            </Link>
            <Link href={`/projects/${project.id}#buy-section`} className="flex-1">
              <Button size="sm" className="w-full gap-1">
                <Download className="h-3 w-3" />
                Mua Ngay
              </Button>
            </Link>
          </div>
        </div>
      </div>
    </Card>
  )
}

