'use client'

import { Github, Twitter, Linkedin, Mail } from 'lucide-react'
import { Button } from '@/components/ui/button'

export default function Footer() {
  const currentYear = new Date().getFullYear()

  return (
    <footer className="bg-card border-t border-border mt-20">
      <div className="max-w-7xl mx-auto px-4 py-16">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-12">
          {/* Brand */}
          <div>
            <div className="flex items-center gap-2 mb-4">
              <div className="w-8 h-8 bg-gradient-to-br from-accent to-accent/60 rounded-lg flex items-center justify-center">
                <span className="text-accent-foreground font-bold">P</span>
              </div>
              <span className="text-lg font-bold">ProjectHub</span>
            </div>
            <p className="text-muted-foreground text-sm">Premium digital projects and components for developers and designers.</p>
          </div>

          {/* Company */}
          <div>
            <h4 className="font-bold text-foreground mb-4">Company</h4>
            <ul className="space-y-2 text-sm">
              <li><a href="#" className="text-muted-foreground hover:text-foreground transition">About Us</a></li>
              <li><a href="#" className="text-muted-foreground hover:text-foreground transition">Blog</a></li>
              <li><a href="#" className="text-muted-foreground hover:text-foreground transition">Careers</a></li>
              <li><a href="#" className="text-muted-foreground hover:text-foreground transition">Press</a></li>
            </ul>
          </div>

          {/* Resources */}
          <div>
            <h4 className="font-bold text-foreground mb-4">Resources</h4>
            <ul className="space-y-2 text-sm">
              <li><a href="#" className="text-muted-foreground hover:text-foreground transition">Documentation</a></li>
              <li><a href="#" className="text-muted-foreground hover:text-foreground transition">Community</a></li>
              <li><a href="#" className="text-muted-foreground hover:text-foreground transition">Support</a></li>
              <li><a href="#" className="text-muted-foreground hover:text-foreground transition">API Docs</a></li>
            </ul>
          </div>

          {/* Legal */}
          <div>
            <h4 className="font-bold text-foreground mb-4">Legal</h4>
            <ul className="space-y-2 text-sm">
              <li><a href="#" className="text-muted-foreground hover:text-foreground transition">Privacy Policy</a></li>
              <li><a href="#" className="text-muted-foreground hover:text-foreground transition">Terms of Service</a></li>
              <li><a href="#" className="text-muted-foreground hover:text-foreground transition">Cookie Policy</a></li>
              <li><a href="#" className="text-muted-foreground hover:text-foreground transition">Refund Policy</a></li>
            </ul>
          </div>
        </div>

        {/* Divider */}
        <div className="border-t border-border my-8" />

        {/* Bottom Section */}
        <div className="flex flex-col md:flex-row justify-between items-center gap-6">
          <p className="text-muted-foreground text-sm">
            © {currentYear} ProjectHub. All rights reserved.
          </p>

          {/* Social Links */}
          <div className="flex gap-4">
            <Button variant="ghost" size="icon" className="rounded-full">
              <Twitter className="h-5 w-5" />
            </Button>
            <Button variant="ghost" size="icon" className="rounded-full">
              <Github className="h-5 w-5" />
            </Button>
            <Button variant="ghost" size="icon" className="rounded-full">
              <Linkedin className="h-5 w-5" />
            </Button>
            <Button variant="ghost" size="icon" className="rounded-full">
              <Mail className="h-5 w-5" />
            </Button>
          </div>
        </div>
      </div>
    </footer>
  )
}
