'use client'

import { useState } from 'react'
import { ShoppingCart, User, Menu, X } from 'lucide-react'
import { Button } from '@/components/ui/button'

export default function Header() {
  const [isMenuOpen, setIsMenuOpen] = useState(false)

  return (
    <header className="sticky top-0 z-50 bg-background border-b border-border">
      <div className="max-w-7xl mx-auto px-4 py-4 flex justify-between items-center">
        {/* Logo */}
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 bg-gradient-to-br from-accent to-accent/60 rounded-lg flex items-center justify-center">
            <span className="text-accent-foreground font-bold text-lg">P</span>
          </div>
          <span className="text-xl font-bold text-foreground">ProjectHub</span>
        </div>

        {/* Desktop Navigation */}
        <nav className="hidden md:flex gap-8">
          <a href="#" className="text-foreground hover:text-accent transition font-medium">Projects</a>
          <a href="#" className="text-foreground hover:text-accent transition font-medium">Categories</a>
          <a href="#" className="text-foreground hover:text-accent transition font-medium">Sell</a>
          <a href="#" className="text-foreground hover:text-accent transition font-medium">About</a>
        </nav>

        {/* Right Section */}
        <div className="flex items-center gap-3">
          <Button variant="ghost" size="icon">
            <ShoppingCart className="h-5 w-5" />
            <span className="absolute top-2 right-2 w-5 h-5 bg-accent text-accent-foreground rounded-full flex items-center justify-center text-xs font-bold">
              3
            </span>
          </Button>
          <Button variant="ghost" size="icon">
            <User className="h-5 w-5" />
          </Button>
          
          {/* Mobile Menu Button */}
          <button
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            className="md:hidden p-2"
          >
            {isMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
        </div>
      </div>

      {/* Mobile Menu */}
      {isMenuOpen && (
        <div className="md:hidden bg-card border-t border-border">
          <nav className="flex flex-col p-4 gap-3">
            <a href="#" className="text-foreground hover:text-accent transition font-medium py-2">Projects</a>
            <a href="#" className="text-foreground hover:text-accent transition font-medium py-2">Categories</a>
            <a href="#" className="text-foreground hover:text-accent transition font-medium py-2">Sell</a>
            <a href="#" className="text-foreground hover:text-accent transition font-medium py-2">About</a>
            <Button className="w-full gap-2 mt-2">
              <User className="h-4 w-4" />
              Sign In
            </Button>
          </nav>
        </div>
      )}
    </header>
  )
}
