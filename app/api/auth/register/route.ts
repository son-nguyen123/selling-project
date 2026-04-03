import { createAdminClient } from '@/lib/supabase/admin'
import { createClient } from '@/lib/supabase/server'
import { NextRequest, NextResponse } from 'next/server'

/**
 * POST /api/auth/register
 *
 * Creates a new user account and **immediately marks the email as confirmed**
 * so the user can log in right away without waiting for a verification email.
 *
 * Body: { email, password, fullName?, phone? }
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { email, password, fullName, phone } = body as {
      email?: string
      password?: string
      fullName?: string
      phone?: string
    }

    if (!email || !password) {
      return NextResponse.json({ error: 'email và password là bắt buộc' }, { status: 400 })
    }

    const adminSupabase = createAdminClient()

    // Create the user via admin API – email_confirm: true skips the verification email
    const { data, error } = await adminSupabase.auth.admin.createUser({
      email,
      password,
      email_confirm: true,        // ← account is active immediately, no email sent
      user_metadata: {
        full_name: fullName?.trim() ?? '',
        phone: phone?.trim() ?? '',
      },
    })

    if (error) {
      if (
        error.message.toLowerCase().includes('already registered') ||
        error.message.toLowerCase().includes('already been registered') ||
        error.message.toLowerCase().includes('user already exists')
      ) {
        return NextResponse.json(
          { error: 'Email này đã được đăng ký. Vui lòng đăng nhập.' },
          { status: 409 },
        )
      }
      return NextResponse.json({ error: error.message }, { status: 400 })
    }

    const userId = data.user.id

    // Insert a profile row right away so the rest of the app can rely on it
    await adminSupabase.from('profiles').upsert({
      id: userId,
      name: fullName?.trim() ?? null,
      avatar_url: null,
    })

    // Sign the user in automatically so the browser gets a session cookie
    const supabase = await createClient()
    const { error: signInError } = await supabase.auth.signInWithPassword({ email, password })
    if (signInError) {
      // Account created but auto-login failed – user can still log in manually
      console.error('[register] Auto sign-in failed:', signInError.message)
      return NextResponse.json({ autoLogin: false }, { status: 201 })
    }

    return NextResponse.json({ autoLogin: true }, { status: 201 })
  } catch (err) {
    console.error('POST /api/auth/register error:', err)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
