'use client'

import Link from 'next/link'
import { Code2, Globe, Cpu, Smartphone, Server } from 'lucide-react'

const NAV_ITEMS = [
  { label: 'Source code mới nhất', category: 'Source code', icon: Code2 },
  { label: 'Website nổi bật', category: 'Website', icon: Globe },
  { label: 'Phần mềm nổi bật', category: 'Phần mềm', icon: Cpu },
  { label: 'Ứng dụng nổi bật', category: 'Ứng dụng', icon: Smartphone },
  { label: 'Dịch vụ máy chủ', category: 'Dịch vụ máy chủ', icon: Server },
]

interface TrustBarProps {
  activeCategory?: string
}

export default function TrustBar({ activeCategory }: TrustBarProps) {
  return (
    <div className="border-b border-border bg-card sticky top-0 z-30 shadow-sm">
      <div className="max-w-7xl mx-auto px-4">
        <nav className="flex items-center overflow-x-auto scrollbar-hide">
          {NAV_ITEMS.map(({ label, category, icon: Icon }) => {
            const isActive = activeCategory === category
            return (
              <Link
                key={category}
                href={`/?category=${encodeURIComponent(category)}`}
                className={`flex items-center gap-1.5 whitespace-nowrap px-4 py-3 text-sm font-medium border-b-2 transition-colors shrink-0
                  ${isActive
                    ? 'border-primary text-primary'
                    : 'border-transparent text-muted-foreground hover:text-foreground hover:border-border'
                  }`}
              >
                <Icon className="h-4 w-4" />
                {label}
              </Link>
            )
          })}
        </nav>
      </div>
    </div>
  )
}
