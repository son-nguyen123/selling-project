import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { NextRequest, NextResponse } from 'next/server'

async function requireAdmin(supabase: Awaited<ReturnType<typeof createClient>>) {
  const { data: { user } } = await supabase.auth.getUser()
  if (!user?.email?.endsWith('@admin.com')) return null
  return user
}

/**
 * GET /api/admin/wallet
 * Returns QR image URL and list of all transactions (for admin review).
 */
export async function GET() {
  try {
    const supabase = await createClient()
    if (!(await requireAdmin(supabase))) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    const adminSupabase = createAdminClient()

    const [{ data: qrRow }, { data: transactions }] = await Promise.all([
      adminSupabase.from('admin_settings').select('value').eq('key', 'qr_image').single(),
      adminSupabase
        .from('transactions')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(50),
    ])

    return NextResponse.json({
      qr_image: qrRow?.value ?? null,
      transactions: transactions ?? [],
    })
  } catch (err) {
    console.error('GET /api/admin/wallet error:', err)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

/**
 * POST /api/admin/wallet
 * Actions:
 *   { action: 'update_qr', qr_image: string } — update admin QR image URL
 *   { action: 'topup', user_id: string, amount: number, note?: string } — credit user balance
 */
export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient()
    if (!(await requireAdmin(supabase))) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    const body = await request.json()
    const adminSupabase = createAdminClient()

    if (body.action === 'update_qr') {
      if (typeof body.qr_image !== 'string') {
        return NextResponse.json({ error: 'qr_image phải là chuỗi URL' }, { status: 400 })
      }
      const { error } = await adminSupabase
        .from('admin_settings')
        .upsert({ key: 'qr_image', value: body.qr_image }, { onConflict: 'key' })
      if (error) return NextResponse.json({ error: error.message }, { status: 500 })
      return NextResponse.json({ success: true })
    }

    if (body.action === 'topup') {
      const userId = body.user_id as string
      const amount = Number(body.amount)
      if (!userId) return NextResponse.json({ error: 'user_id is required' }, { status: 400 })
      if (!amount || amount <= 0) return NextResponse.json({ error: 'amount phải > 0' }, { status: 400 })

      // Get current balance
      const { data: profile, error: profileErr } = await adminSupabase
        .from('profiles')
        .select('balance')
        .eq('id', userId)
        .single()

      if (profileErr) return NextResponse.json({ error: profileErr.message }, { status: 500 })

      const newBalance = (profile?.balance ?? 0) + amount

      const { error: updateErr } = await adminSupabase
        .from('profiles')
        .update({ balance: newBalance })
        .eq('id', userId)

      if (updateErr) return NextResponse.json({ error: updateErr.message }, { status: 500 })

      // Record transaction
      await adminSupabase.from('transactions').insert({
        user_id: userId,
        amount,
        type: 'topup',
        status: 'completed',
        note: body.note ?? 'Admin cộng tiền thủ công',
      })

      return NextResponse.json({ balance: newBalance })
    }

    return NextResponse.json({ error: 'Unknown action' }, { status: 400 })
  } catch (err) {
    console.error('POST /api/admin/wallet error:', err)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
