'use client'

import { Heart, Star, Download, Eye } from 'lucide-react'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import Image from 'next/image'

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
  isWishlisted: boolean
  onToggleWishlist: () => void
}

export default function ProjectCard({ project, isWishlisted, onToggleWishlist }: ProjectCardProps) {
  return (
    <Card className="group overflow-hidden hover:shadow-lg transition-all duration-300 border border-border h-full flex flex-col">
      {/* Image Section */}
      <div className="relative overflow-hidden bg-muted h-40 sm:h-48">
        <img
          src={project.image}
          alt={project.title}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
        />
        {/* Overlay */}
        <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors flex items-center justify-center">
          <Button
            size="sm"
            className="opacity-0 group-hover:opacity-100 transition-opacity gap-2"
          >
            <Eye className="h-4 w-4" />
            Preview
          </Button>
        </div>
        
        {/* Wishlist Button */}
        <button
          onClick={onToggleWishlist}
          className="absolute top-3 right-3 bg-background/80 backdrop-blur p-2 rounded-lg hover:bg-background transition-all"
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
        <h3 className="font-bold text-lg text-foreground mb-1 line-clamp-2 hover:text-accent transition-colors cursor-pointer">
          {project.title}
        </h3>

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
          {project.tech.slice(0, 2).map(tech => (
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
        <div className="flex items-center justify-between mt-auto pt-4 border-t border-border">
          <div className="flex items-baseline gap-1">
            <span className="text-2xl font-bold text-foreground">${project.price}</span>
            <span className="text-xs text-muted-foreground">one-time</span>
          </div>
          <Button size="sm" className="gap-2">
            <Download className="h-4 w-4" />
            Buy Now
          </Button>
        </div>
      </div>
    </Card>
  )
}
