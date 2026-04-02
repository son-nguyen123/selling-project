import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { NextRequest, NextResponse } from 'next/server'

/**
 * POST /api/wallet/pay
 * Body: { amount: number, note?: string }
 * Deducts `amount` from the current user's wallet balance.
 * Returns updated balance.
 */
export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const body = await request.json()
    const amount = Number(body.amount)
    if (!amount || amount <= 0) {
      return NextResponse.json({ error: 'amount phải lớn hơn 0' }, { status: 400 })
    }

    const adminSupabase = createAdminClient()

    // Check current balance
    const { data: profile, error: profileErr } = await adminSupabase
      .from('profiles')
      .select('balance')
      .eq('id', user.id)
      .single()

    if (profileErr) {
      return NextResponse.json({ error: profileErr.message }, { status: 500 })
    }

    const currentBalance = profile?.balance ?? 0
    if (currentBalance < amount) {
      return NextResponse.json(
        { error: `Số dư không đủ. Hiện có: ${currentBalance.toLocaleString('vi-VN')}₫` },
        { status: 400 },
      )
    }

    const newBalance = currentBalance - amount

    // Deduct balance
    const { error: updateErr } = await adminSupabase
      .from('profiles')
      .update({ balance: newBalance })
      .eq('id', user.id)

    if (updateErr) {
      return NextResponse.json({ error: updateErr.message }, { status: 500 })
    }

    // Record transaction
    await adminSupabase.from('transactions').insert({
      user_id: user.id,
      amount: -amount,
      type: 'payment',
      status: 'completed',
      note: body.note ?? 'Thanh toán đơn hàng',
    })

    return NextResponse.json({ balance: newBalance })
  } catch (err) {
    console.error('POST /api/wallet/pay error:', err)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
