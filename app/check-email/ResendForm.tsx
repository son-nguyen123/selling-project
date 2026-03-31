'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { resendConfirmationEmail } from '@/app/actions/resend-email'

export function ResendForm() {
  const [email, setEmail] = useState('')
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)

  async function handleResend(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    setMessage(null)
    setError(null)

    const result = await resendConfirmationEmail(email)
    setLoading(false)

    if (result.error) {
      setError(result.error)
    } else {
      setMessage('Email xác nhận đã được gửi lại. Vui lòng kiểm tra hộp thư (kể cả thư mục Spam).')
    }
  }

  return (
    <form onSubmit={handleResend} className="space-y-4">
      {message && (
        <div className="bg-green-500/10 text-green-700 dark:text-green-400 text-sm rounded-lg px-4 py-3">
          {message}
        </div>
      )}
      {error && (
        <div className="bg-destructive/10 text-destructive text-sm rounded-lg px-4 py-3">
          {error}
        </div>
      )}
      <div className="space-y-1.5">
        <Label htmlFor="resend-email">Địa chỉ email đã đăng ký</Label>
        <Input
          id="resend-email"
          type="email"
          placeholder="you@example.com"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
          autoComplete="email"
        />
      </div>
      <Button type="submit" className="w-full gap-2" disabled={loading}>
        {loading ? (
          <span className="h-4 w-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
        ) : null}
        Gửi lại email xác nhận
      </Button>
    </form>
  )
}
