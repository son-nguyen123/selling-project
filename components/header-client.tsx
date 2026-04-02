'use client'

import { useState, useRef, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useRouter, useSearchParams } from 'next/navigation'
import { User, Menu, X, LayoutDashboard, LogOut, LogIn, Search, ShoppingCart, Tag, Wallet, QrCode, Upload, Plus, CheckCircle, Clock } from 'lucide-react'
import { Button } from '@/components/ui/button'
import Link from 'next/link'
import { toast } from 'sonner'
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
  initialBalance?: number
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

type DepositStatus = 'idle' | 'submitting' | 'processing'

function DepositModal({
  onClose,
  onBalanceUpdate,
}: {
  onClose: () => void
  onBalanceUpdate: (balance: number) => void
}) {
  const [qrImage, setQrImage] = useState<string | null>(null)
  const [amount, setAmount] = useState('')
  const [proofFile, setProofFile] = useState<File | null>(null)
  const [proofPreview, setProofPreview] = useState<string | null>(null)
  const [status, setStatus] = useState<DepositStatus>('idle')
  const fileInputRef = useRef<HTMLInputElement>(null)

  const proofPreviewRef = useRef<string | null>(null)

  useEffect(() => {
    fetch('/api/wallet')
      .then((r) => r.json())
      .then((data) => {
        setQrImage(data.qr_image ?? null)
      })
      .catch(() => {})
    return () => {
      if (proofPreviewRef.current) {
        URL.revokeObjectURL(proofPreviewRef.current)
      }
    }
  }, [])

  function handleProofChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return
    if (proofPreviewRef.current) {
      URL.revokeObjectURL(proofPreviewRef.current)
    }
    setProofFile(file)
    const url = URL.createObjectURL(file)
    proofPreviewRef.current = url
    setProofPreview(url)
  }

  async function handleSubmit() {
    const amt = Number(amount)
    if (!amt || amt <= 0) {
      toast.error('Nhập số tiền hợp lệ')
      return
    }
    if (!proofFile) {
      toast.error('Vui lòng tải ảnh chuyển khoản')
      return
    }

    setStatus('submitting')
    try {
      // Upload proof image
      const fd = new FormData()
      fd.append('file', proofFile)
      const uploadRes = await fetch('/api/wallet/upload', { method: 'POST', body: fd })
      if (!uploadRes.ok) {
        const err = await uploadRes.json()
        throw new Error(err.error ?? 'Lỗi upload ảnh')
      }
      const { url: proofImageUrl } = await uploadRes.json()

      // Create pending deposit
      const depositRes = await fetch('/api/wallet', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          amount: amt,
          note: 'Nạp tiền qua QR',
          proof_image: proofImageUrl,
        }),
      })
      const depositData = await depositRes.json()
      if (!depositRes.ok) throw new Error(depositData.error ?? 'Lỗi gửi yêu cầu')

      setStatus('processing')
      onBalanceUpdate(depositData.balance)
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Lỗi nạp tiền')
      setStatus('idle')
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
      <div className="relative w-full max-w-sm rounded-2xl bg-card border border-border shadow-2xl p-6">
        <button
          aria-label="Đóng"
          onClick={onClose}
          className="absolute right-4 top-4 rounded-full p-1 hover:bg-muted transition-colors"
        >
          <X className="h-4 w-4 text-muted-foreground" />
        </button>

        {status === 'processing' ? (
          <div className="flex flex-col items-center gap-4 py-4">
            <Clock className="h-12 w-12 text-yellow-500 animate-pulse" />
            <h2 className="text-lg font-bold text-foreground">Đang xử lý</h2>
            <p className="text-sm text-center text-muted-foreground leading-relaxed">
              Yêu cầu nạp tiền của bạn đang được xử lý. Admin sẽ xác nhận trong thời gian sớm nhất.
            </p>
            <div className="w-full rounded-lg bg-yellow-500/10 border border-yellow-500/30 px-4 py-3 text-center">
              <p className="text-xs text-yellow-600 dark:text-yellow-400 font-medium">
                Số tiền: {Number(amount).toLocaleString('vi-VN')}₫
              </p>
            </div>
            <Button onClick={onClose} variant="outline" className="w-full rounded-xl">
              Đóng
            </Button>
          </div>
        ) : (
          <div className="flex flex-col items-center gap-4">
            <div className="flex items-center gap-2">
              <QrCode className="h-5 w-5 text-primary" />
              <h2 className="text-lg font-bold text-foreground">Nạp tiền vào ví</h2>
            </div>

            {qrImage ? (
              <img
                src={qrImage}
                alt="QR thanh toán"
                className="w-48 h-48 object-contain rounded-xl border border-border bg-white p-2"
              />
            ) : (
              <div className="w-48 h-48 flex items-center justify-center rounded-xl border border-dashed border-border bg-muted text-center">
                <p className="text-xs text-muted-foreground px-4">Admin chưa cập nhật mã QR</p>
              </div>
            )}

            <p className="text-xs text-center text-muted-foreground leading-relaxed">
              Chuyển khoản theo mã QR trên, sau đó nhập số tiền và tải ảnh xác nhận.
            </p>

            <div className="w-full space-y-3">
              <div>
                <label className="block text-xs font-medium text-muted-foreground mb-1">
                  Số tiền muốn nạp (₫)
                </label>
                <input
                  type="number"
                  min="1"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  placeholder="50000"
                  className="w-full rounded-lg border border-input bg-background px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-muted-foreground mb-1">
                  Ảnh chuyển khoản
                </label>
                {proofPreview ? (
                  <div className="relative">
                    <img
                      src={proofPreview}
                      alt="Proof"
                      className="w-full h-32 object-cover rounded-lg border border-border"
                    />
                    <button
                      aria-label="Xóa ảnh"
                      onClick={() => { setProofFile(null); setProofPreview(null) }}
                      className="absolute top-1 right-1 bg-black/60 rounded-full p-0.5 hover:bg-black/80"
                    >
                      <X className="h-3 w-3 text-white" />
                    </button>
                  </div>
                ) : (
                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    className="w-full h-24 rounded-lg border-2 border-dashed border-input hover:border-accent transition-colors flex flex-col items-center justify-center gap-1 text-muted-foreground hover:text-accent"
                  >
                    <Upload className="h-5 w-5" />
                    <span className="text-xs">Tải ảnh lên</span>
                  </button>
                )}
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={handleProofChange}
                />
              </div>
            </div>

            <Button
              onClick={handleSubmit}
              disabled={status === 'submitting'}
              className="w-full rounded-xl"
            >
              {status === 'submitting' ? 'Đang gửi...' : '✅ Xác nhận nạp tiền'}
            </Button>
          </div>
        )}
      </div>
    </div>
  )
}

export default function HeaderClient({ user, isAdmin = false, initialBalance = 0 }: HeaderClientProps) {
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const [showDeposit, setShowDeposit] = useState(false)
  const [balance, setBalance] = useState(initialBalance)
  const router = useRouter()

  useEffect(() => {
    if (!user || isAdmin) return
    fetch('/api/wallet')
      .then((r) => r.json())
      .then((data) => {
        if (typeof data.balance === 'number') {
          setBalance(data.balance)
        }
      })
      .catch(() => {})
  }, [user, isAdmin])

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
          {/* Sell link */}
          <Link href="/sell" className="hidden md:flex flex-col items-center gap-0.5 text-foreground hover:text-accent transition">
            <Tag className="h-5 w-5" />
            <span className="text-xs">Đăng bán</span>
          </Link>

          {/* Cart icon placeholder */}
          <Link href="/" className="hidden md:flex flex-col items-center gap-0.5 text-foreground hover:text-accent transition">
            <ShoppingCart className="h-5 w-5" />
            <span className="text-xs">Giỏ hàng</span>
          </Link>

          {/* Wallet widget – only for logged-in non-admin users */}
          {user && !isAdmin && (
            <button
              onClick={() => setShowDeposit(true)}
              className="hidden md:flex flex-col items-center gap-0.5 text-foreground hover:text-accent transition"
            >
              <div className="relative">
                <Wallet className="h-5 w-5" />
              </div>
              <span className="text-xs font-medium text-accent">
                {balance.toLocaleString('vi-VN')}₫
              </span>
            </button>
          )}

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
                {!isAdmin && (
                  <DropdownMenuItem
                    onClick={() => setShowDeposit(true)}
                    className="gap-2 cursor-pointer"
                  >
                    <Plus className="h-4 w-4" />
                    Nạp tiền
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
          <Link href={`/?category=${encodeURIComponent('Source code')}`} className="text-xs text-muted-foreground hover:text-accent transition py-1">Source code</Link>
          <Link href={`/?category=${encodeURIComponent('Website')}`} className="text-xs text-muted-foreground hover:text-accent transition py-1">Website</Link>
          <Link href={`/?category=${encodeURIComponent('Phần mềm')}`} className="text-xs text-muted-foreground hover:text-accent transition py-1">Phần mềm</Link>
          <Link href={`/?category=${encodeURIComponent('Ứng dụng')}`} className="text-xs text-muted-foreground hover:text-accent transition py-1">Ứng dụng</Link>
          <Link href={`/?category=${encodeURIComponent('Dịch vụ máy chủ')}`} className="text-xs text-muted-foreground hover:text-accent transition py-1">Dịch vụ máy chủ</Link>
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
            {user ? (
              <>
                <Link
                  href="/sell"
                  className="text-foreground hover:text-accent transition font-medium py-2"
                  onClick={() => setIsMenuOpen(false)}
                >
                  Đăng bán
                </Link>
                <Link
                  href="/dashboard"
                  className="text-foreground hover:text-accent transition font-medium py-2"
                  onClick={() => setIsMenuOpen(false)}
                >
                  Dashboard
                </Link>
                {!isAdmin && (
                  <button
                    className="flex items-center gap-2 text-foreground hover:text-accent transition font-medium py-2"
                    onClick={() => { setIsMenuOpen(false); setShowDeposit(true) }}
                  >
                    <Wallet className="h-4 w-4" />
                    Nạp tiền ({balance.toLocaleString('vi-VN')}₫)
                  </button>
                )}
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

      {/* Deposit Modal */}
      {showDeposit && user && (
        <DepositModal
          onClose={() => setShowDeposit(false)}
          onBalanceUpdate={(newBalance) => setBalance(newBalance)}
        />
      )}
    </header>
  )
}

