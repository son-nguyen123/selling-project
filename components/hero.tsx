'use client'

import { ArrowRight, Sparkles } from 'lucide-react'
import { Button } from '@/components/ui/button'

export default function Hero() {
  return (
    <section className="relative overflow-hidden bg-gradient-to-b from-muted to-background py-20 md:py-32">
      {/* Background Elements */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-accent/10 rounded-full blur-3xl" />
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-accent/5 rounded-full blur-3xl" />
      </div>

      <div className="relative max-w-7xl mx-auto px-4 text-center">
        {/* Badge */}
        <div className="inline-flex items-center gap-2 px-4 py-2 bg-accent/10 rounded-full border border-accent/20 mb-6">
          <Sparkles className="h-4 w-4 text-accent" />
          <span className="text-accent font-semibold text-sm">Discover Premium Digital Projects</span>
        </div>

        {/* Main Heading */}
        <h1 className="text-4xl md:text-6xl font-bold text-foreground mb-6 leading-tight">
          Build Faster with
          <br />
          <span className="bg-gradient-to-r from-accent to-accent/60 bg-clip-text text-transparent">
            Quality Code & Design
          </span>
        </h1>

        {/* Subheading */}
        <p className="text-lg md:text-xl text-muted-foreground mb-8 max-w-2xl mx-auto leading-relaxed">
          Access thousands of professionally crafted projects, templates, and components from top creators. Speed up your development and ship faster.
        </p>

        {/* CTA Buttons */}
        <div className="flex flex-col sm:flex-row gap-4 justify-center items-center mb-12">
          <Button size="lg" className="gap-2 px-8">
            Browse Projects
            <ArrowRight className="h-4 w-4" />
          </Button>
          <Button variant="outline" size="lg" className="px-8">
            Start Selling
          </Button>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 pt-12 border-t border-border">
          <div>
            <p className="text-3xl md:text-4xl font-bold text-foreground mb-2">2,500+</p>
            <p className="text-muted-foreground">Quality Projects</p>
          </div>
          <div>
            <p className="text-3xl md:text-4xl font-bold text-foreground mb-2">150K+</p>
            <p className="text-muted-foreground">Active Users</p>
          </div>
          <div>
            <p className="text-3xl md:text-4xl font-bold text-foreground mb-2">4.8★</p>
            <p className="text-muted-foreground">Average Rating</p>
          </div>
        </div>
      </div>
    </section>
  )
}
