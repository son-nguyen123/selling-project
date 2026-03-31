'use client'

import { useState, useRef, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useRouter, useSearchParams } from 'next/navigation'
import { User, Menu, X, LayoutDashboard, Upload, LogOut, LogIn, Search, ShoppingCart } from 'lucide-react'
import { Button } from '@/components/ui/button'
import Link from 'next/link'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'

interface UserInfo {
  id: string
  name: string | null
  avatar_url: string | null
  email: string | null
}

interface HeaderClientProps {
  user: UserInfo | null
  isAdmin?: boolean
}

function HeaderSearch() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [value, setValue] = useState(searchParams.get('search') ?? '')
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  useEffect(() => {
    setValue(searchParams.get('search') ?? '')
  }, [searchParams])

  useEffect(() => {
    return () => {
      if (timerRef.current) clearTimeout(timerRef.current)
    }
  }, [])

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

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    const params = new URLSearchParams(searchParams.toString())
    if (value) {
      params.set('search', value)
    } else {
      params.delete('search')
    }
    router.push(`/?${params.toString()}`)
  }

  return (
    <form onSubmit={handleSubmit} className="flex-1 max-w-2xl flex">
      <input
        type="text"
        placeholder="Tìm kiếm dự án, công nghệ..."
        value={value}
        onChange={handleChange}
        className="flex-1 px-4 py-2 text-sm bg-background border border-accent/40 rounded-l-sm focus:outline-none focus:border-accent text-foreground placeholder:text-muted-foreground"
      />
      <button
        type="submit"
        className="px-5 py-2 bg-accent hover:bg-accent/90 text-accent-foreground rounded-r-sm transition-colors"
      >
        <Search className="h-4 w-4" />
      </button>
    </form>
  )
}

export default function HeaderClient({ user, isAdmin = false }: HeaderClientProps) {
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const router = useRouter()

  async function handleSignOut() {
    const supabase = createClient()
    await supabase.auth.signOut()
    router.refresh()
  }

  return (
    <header className="sticky top-0 z-50 bg-background border-b border-border">
      {/* Main header row */}
      <div className="max-w-7xl mx-auto px-4 py-3 flex items-center gap-6">
        {/* Logo */}
        <Link href="/" className="flex items-center gap-2 shrink-0">
          <div className="w-8 h-8 bg-gradient-to-br from-accent to-accent/60 rounded-lg flex items-center justify-center">
            <span className="text-accent-foreground font-bold text-lg">P</span>
          </div>
          <span className="text-xl font-bold text-foreground hidden sm:block">ProjectHub</span>
        </Link>

        {/* Search bar - center, Shopee-style */}
        <div className="hidden md:flex flex-1">
          <HeaderSearch />
        </div>

        {/* Right actions */}
        <div className="flex items-center gap-4 shrink-0 ml-auto md:ml-0">
          {/* Sell link - admin only */}
          {isAdmin && (
            <Link href="/upload" className="hidden md:flex flex-col items-center gap-0.5 text-foreground hover:text-accent transition">
              <Upload className="h-5 w-5" />
              <span className="text-xs">Bán hàng</span>
            </Link>
          )}

          {/* Cart icon placeholder */}
          <Link href="/" className="hidden md:flex flex-col items-center gap-0.5 text-foreground hover:text-accent transition">
            <ShoppingCart className="h-5 w-5" />
            <span className="text-xs">Giỏ hàng</span>
          </Link>

          {/* User menu */}
          {user ? (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <button className="flex flex-col items-center gap-0.5 hover:text-accent transition-all">
                  <div className="w-7 h-7 rounded-full bg-muted flex items-center justify-center overflow-hidden">
                    {user.avatar_url ? (
                      <img
                        src={user.avatar_url}
                        alt={user.name ?? 'User'}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <User className="h-4 w-4 text-muted-foreground" />
                    )}
                  </div>
                  <span className="text-xs hidden md:block max-w-[80px] truncate">{user.name ?? 'Tài khoản'}</span>
                </button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-52">
                <div className="px-3 py-2">
                  <p className="text-sm font-medium text-foreground truncate">
                    {user.name ?? 'User'}
                  </p>
                  <p className="text-xs text-muted-foreground truncate">{user.email}</p>
                </div>
                <DropdownMenuSeparator />
                <DropdownMenuItem asChild>
                  <Link href="/dashboard" className="gap-2 cursor-pointer">
                    <LayoutDashboard className="h-4 w-4" />
                    Dashboard
                  </Link>
                </DropdownMenuItem>
                {isAdmin && (
                  <DropdownMenuItem asChild>
                    <Link href="/upload" className="gap-2 cursor-pointer">
                      <Upload className="h-4 w-4" />
                      Đăng sản phẩm
                    </Link>
                  </DropdownMenuItem>
                )}
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={handleSignOut} className="gap-2 cursor-pointer text-destructive focus:text-destructive">
                  <LogOut className="h-4 w-4" />
                  Đăng xuất
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          ) : (
            <Link href="/login">
              <Button size="sm" className="gap-2 bg-accent hover:bg-accent/90 text-accent-foreground">
                <LogIn className="h-4 w-4" />
                Đăng nhập
              </Button>
            </Link>
          )}

          {/* Mobile Menu Button */}
          <button onClick={() => setIsMenuOpen(!isMenuOpen)} className="md:hidden p-1">
            {isMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
        </div>
      </div>

      {/* Navigation row - category links */}
      <div className="hidden md:block border-t border-border/50">
        <div className="max-w-7xl mx-auto px-4 py-1 flex items-center gap-6">
          <Link href="/" className="text-xs text-muted-foreground hover:text-accent transition py-1">Trang chủ</Link>
          <Link href={`/?category=${encodeURIComponent('Web App')}`} className="text-xs text-muted-foreground hover:text-accent transition py-1">Web App</Link>
          <Link href={`/?category=${encodeURIComponent('Mobile')}`} className="text-xs text-muted-foreground hover:text-accent transition py-1">Mobile</Link>
          <Link href={`/?category=${encodeURIComponent('Backend')}`} className="text-xs text-muted-foreground hover:text-accent transition py-1">Backend</Link>
          <Link href={`/?category=${encodeURIComponent('Component Library')}`} className="text-xs text-muted-foreground hover:text-accent transition py-1">Component Library</Link>
          <Link href={`/?category=${encodeURIComponent('Other')}`} className="text-xs text-muted-foreground hover:text-accent transition py-1">Khác</Link>
          {user && (
            <Link href="/dashboard" className="text-xs text-muted-foreground hover:text-accent transition py-1 ml-auto">Dashboard</Link>
          )}
        </div>
      </div>

      {/* Mobile Search */}
      <div className="md:hidden px-4 pb-3">
        <HeaderSearch />
      </div>

      {/* Mobile Menu */}
      {isMenuOpen && (
        <div className="md:hidden bg-card border-t border-border">
          <nav className="flex flex-col p-4 gap-3">
            <Link
              href="/"
              className="text-foreground hover:text-accent transition font-medium py-2"
              onClick={() => setIsMenuOpen(false)}
            >
              Trang chủ
            </Link>
            {isAdmin && (
              <Link
                href="/upload"
                className="text-foreground hover:text-accent transition font-medium py-2"
                onClick={() => setIsMenuOpen(false)}
              >
                Bán hàng
              </Link>
            )}
            {user ? (
              <>
                <Link
                  href="/dashboard"
                  className="text-foreground hover:text-accent transition font-medium py-2"
                  onClick={() => setIsMenuOpen(false)}
                >
                  Dashboard
                </Link>
                <Button
                  variant="outline"
                  className="w-full gap-2 mt-2"
                  onClick={() => {
                    setIsMenuOpen(false)
                    handleSignOut()
                  }}
                >
                  <LogOut className="h-4 w-4" />
                  Đăng xuất
                </Button>
              </>
            ) : (
              <Link href="/login" onClick={() => setIsMenuOpen(false)}>
                <Button className="w-full gap-2 mt-2 bg-accent text-accent-foreground">
                  <LogIn className="h-4 w-4" />
                  Đăng nhập
                </Button>
              </Link>
            )}
          </nav>
        </div>
      )}
    </header>
  )
}
