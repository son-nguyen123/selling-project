'use client'

import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Chrome, Eye, EyeOff, UserPlus } from 'lucide-react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'

export default function RegisterPage() {
  const router = useRouter()

  const [fullName, setFullName] = useState('')
  const [phone, setPhone] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  async function handleRegister(e: React.FormEvent) {
    e.preventDefault()
    setError(null)

    if (fullName.trim().length < 2) {
      setError('Họ và tên phải có ít nhất 2 ký tự.')
      return
    }
    if (password.length < 8) {
      setError('Mật khẩu phải có ít nhất 8 ký tự.')
      return
    }
    if (password !== confirmPassword) {
      setError('Mật khẩu xác nhận không khớp.')
      return
    }

    setLoading(true)
    const supabase = createClient()

    const origin = process.env.NEXT_PUBLIC_APP_URL ?? window.location.origin

    const { data, error: signUpError } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          full_name: fullName.trim(),
          phone: phone.trim(),
        },
        emailRedirectTo: `${origin}/auth/callback`,
      },
    })

    if (signUpError) {
      setLoading(false)
      if (signUpError.message.includes('already registered') || signUpError.message.includes('already been registered')) {
        setError('Email này đã được đăng ký. Vui lòng đăng nhập.')
      } else if (
        signUpError.message.toLowerCase().includes('error sending confirmation email') ||
        signUpError.message.toLowerCase().includes('sending confirmation')
      ) {
        // Account was created but confirmation email failed to send.
        // Redirect to check-email so the user can request a resend.
        if (data?.user) {
          router.push('/check-email')
          return
        }
        setError('Không thể gửi email xác nhận. Vui lòng thử lại sau.')
      } else {
        setError(signUpError.message)
      }
      return
    }

    // Insert profile record right away (works even before email confirmation)
    if (data.user) {
      await supabase.from('profiles').upsert({
        id: data.user.id,
        name: fullName.trim(),
        avatar_url: null,
      })
    }

    setLoading(false)
    router.push('/check-email')
  }

  async function handleGoogleSignIn() {
    const supabase = createClient()
    await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: { redirectTo: `${window.location.origin}/auth/callback` },
    })
  }

  return (
    <div className="min-h-screen bg-background flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-md">
        {/* Logo */}
        <div className="flex items-center gap-2 justify-center mb-8">
          <div className="w-10 h-10 bg-gradient-to-br from-accent to-accent/60 rounded-lg flex items-center justify-center">
            <span className="text-accent-foreground font-bold text-xl">P</span>
          </div>
          <span className="text-2xl font-bold text-foreground">ProjectHub</span>
        </div>

        <div className="bg-card border border-border rounded-2xl p-8 shadow-lg">
          <h1 className="text-2xl font-bold text-foreground text-center mb-1">Tạo tài khoản</h1>
          <p className="text-muted-foreground text-center mb-8 text-sm">
            Điền thông tin để bắt đầu mua bán dự án.
          </p>

          {error && (
            <div className="bg-destructive/10 text-destructive text-sm rounded-lg px-4 py-3 mb-6">
              {error}
            </div>
          )}

          <form onSubmit={handleRegister} className="space-y-4">
            {/* Full Name */}
            <div className="space-y-1.5">
              <Label htmlFor="fullName">
                Họ và tên <span className="text-destructive">*</span>
              </Label>
              <Input
                id="fullName"
                type="text"
                placeholder="Nguyễn Văn A"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                required
                autoComplete="name"
              />
            </div>

            {/* Phone */}
            <div className="space-y-1.5">
              <Label htmlFor="phone">
                Số điện thoại{' '}
                <span className="text-muted-foreground text-xs">(không bắt buộc)</span>
              </Label>
              <Input
                id="phone"
                type="tel"
                placeholder="0901 234 567"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                autoComplete="tel"
              />
            </div>

            {/* Email */}
            <div className="space-y-1.5">
              <Label htmlFor="email">
                Email <span className="text-destructive">*</span>
              </Label>
              <Input
                id="email"
                type="email"
                placeholder="you@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                autoComplete="email"
              />
            </div>

            {/* Password */}
            <div className="space-y-1.5">
              <Label htmlFor="password">
                Mật khẩu <span className="text-destructive">*</span>
              </Label>
              <div className="relative">
                <Input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  placeholder="Tối thiểu 8 ký tự"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  autoComplete="new-password"
                  className="pr-10"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                  tabIndex={-1}
                >
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
            </div>

            {/* Confirm Password */}
            <div className="space-y-1.5">
              <Label htmlFor="confirmPassword">
                Xác nhận mật khẩu <span className="text-destructive">*</span>
              </Label>
              <div className="relative">
                <Input
                  id="confirmPassword"
                  type={showConfirmPassword ? 'text' : 'password'}
                  placeholder="Nhập lại mật khẩu"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  required
                  autoComplete="new-password"
                  className="pr-10"
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                  tabIndex={-1}
                >
                  {showConfirmPassword ? (
                    <EyeOff className="h-4 w-4" />
                  ) : (
                    <Eye className="h-4 w-4" />
                  )}
                </button>
              </div>
            </div>

            {/* Password strength hint */}
            {password.length > 0 && (
              <ul className="text-xs text-muted-foreground space-y-0.5 pl-1">
                <li className={password.length >= 8 ? 'text-green-500' : ''}>
                  {password.length >= 8 ? '✓' : '○'} Ít nhất 8 ký tự
                </li>
                <li className={/[A-Z]/.test(password) ? 'text-green-500' : ''}>
                  {/[A-Z]/.test(password) ? '✓' : '○'} Có chữ hoa
                </li>
                <li className={/[0-9]/.test(password) ? 'text-green-500' : ''}>
                  {/[0-9]/.test(password) ? '✓' : '○'} Có chữ số
                </li>
              </ul>
            )}

            <Button type="submit" className="w-full gap-2 mt-2" disabled={loading}>
              {loading ? (
                <span className="h-4 w-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
              ) : (
                <UserPlus className="h-4 w-4" />
              )}
              Tạo tài khoản
            </Button>
          </form>

          {/* Divider */}
          <div className="flex items-center gap-3 my-6">
            <div className="flex-1 h-px bg-border" />
            <span className="text-xs text-muted-foreground">hoặc</span>
            <div className="flex-1 h-px bg-border" />
          </div>

          {/* Google OAuth */}
          <Button onClick={handleGoogleSignIn} variant="outline" className="w-full gap-3">
            <Chrome className="h-4 w-4" />
            Đăng ký với Google
          </Button>

          {/* Login link */}
          <p className="text-sm text-muted-foreground text-center mt-6">
            Đã có tài khoản?{' '}
            <Link href="/login" className="text-accent hover:underline font-medium">
              Đăng nhập
            </Link>
          </p>

          <p className="text-xs text-muted-foreground text-center mt-4">
            Bằng cách đăng ký, bạn đồng ý với Điều khoản dịch vụ và Chính sách bảo mật.
          </p>
        </div>
      </div>
    </div>
  )
}
