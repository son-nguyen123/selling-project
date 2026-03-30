'use client'

import { useEffect, useRef, useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { Search } from 'lucide-react'
import { Input } from '@/components/ui/input'

interface SearchBarProps {
  defaultValue?: string
}

export default function SearchBar({ defaultValue = '' }: SearchBarProps) {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [value, setValue] = useState(defaultValue)
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  // Keep local state in sync when the URL changes (e.g. category filter click)
  useEffect(() => {
    setValue(searchParams.get('search') ?? '')
  }, [searchParams])

  function handleChange(e: React.ChangeEvent<HTMLInputElement>) {
    const v = e.target.value
    setValue(v)

    if (timerRef.current) clearTimeout(timerRef.current)

    timerRef.current = setTimeout(() => {
      const params = new URLSearchParams(searchParams.toString())
      if (v) {
        params.set('search', v)
      } else {
        params.delete('search')
      }
      router.push(`/?${params.toString()}`)
    }, 400)
  }

  return (
    <div className="flex-1 relative">
      <Search className="absolute left-3 top-3 h-5 w-5 text-muted-foreground pointer-events-none" />
      <Input
        placeholder="Search by project name, description, or technology..."
        className="pl-10"
        value={value}
        onChange={handleChange}
      />
    </div>
  )
}
