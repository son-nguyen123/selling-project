'use server'

import { createClient } from '@/lib/supabase/server'
import { headers } from 'next/headers'

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

export async function resendConfirmationEmail(email: string): Promise<{ error?: string }> {
  if (!email || !EMAIL_REGEX.test(email)) {
    return { error: 'Địa chỉ email không hợp lệ.' }
  }

  const supabase = await createClient()
  const headersList = await headers()
  const host = headersList.get('host') ?? 'localhost:3000'
  const proto = headersList.get('x-forwarded-proto') ?? 'http'
  const origin =
    process.env.NEXT_PUBLIC_SITE_URL ??
    process.env.NEXT_PUBLIC_APP_URL ??
    `${proto}://${host}`

  const { error } = await supabase.auth.resend({
    type: 'signup',
    email,
    options: {
      emailRedirectTo: `${origin}/auth/callback`,
    },
  })

  if (error) {
    return { error: error.message }
  }

  return {}
}
