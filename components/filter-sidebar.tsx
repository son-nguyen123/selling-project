'use client'

import { Card } from '@/components/ui/card'
import { Checkbox } from '@/components/ui/checkbox'
import { Label } from '@/components/ui/label'
import { Slider } from '@/components/ui/slider'

export default function FilterSidebar() {
  return (
    <div className="space-y-6">
      {/* Price Range */}
      <Card className="p-6">
        <h3 className="font-bold text-foreground mb-4">Khoảng giá</h3>
        <Slider defaultValue={[0, 100]} max={100} step={1} className="mb-4" />
        <div className="flex justify-between text-sm text-muted-foreground">
          <span>0₫</span>
          <span>5,000,000₫+</span>
        </div>
      </Card>

      {/* Category */}
      <Card className="p-6">
        <h3 className="font-bold text-foreground mb-4">Category</h3>
        <div className="space-y-3">
          {['Web App', 'Mobile', 'Backend', 'Component Library', 'Template'].map(cat => (
            <div key={cat} className="flex items-center">
              <Checkbox id={cat} />
              <Label htmlFor={cat} className="ml-2 cursor-pointer">{cat}</Label>
            </div>
          ))}
        </div>
      </Card>

      {/* Technology */}
      <Card className="p-6">
        <h3 className="font-bold text-foreground mb-4">Technology</h3>
        <div className="space-y-3">
          {['React', 'Vue', 'Next.js', 'Node.js', 'Python'].map(tech => (
            <div key={tech} className="flex items-center">
              <Checkbox id={tech} />
              <Label htmlFor={tech} className="ml-2 cursor-pointer">{tech}</Label>
            </div>
          ))}
        </div>
      </Card>

      {/* Rating */}
      <Card className="p-6">
        <h3 className="font-bold text-foreground mb-4">Rating</h3>
        <div className="space-y-3">
          {['4.5★ & up', '4.0★ & up', '3.5★ & up', '3.0★ & up'].map(rating => (
            <div key={rating} className="flex items-center">
              <Checkbox id={rating} />
              <Label htmlFor={rating} className="ml-2 cursor-pointer">{rating}</Label>
            </div>
          ))}
        </div>
      </Card>
    </div>
  )
}
