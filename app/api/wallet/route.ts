import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { NextRequest, NextResponse } from 'next/server'

/**
 * GET /api/wallet
 * Returns current user's balance and recent transactions.
 *
 * POST /api/wallet
 * Body: { amount: number, note?: string }
 * Creates a pending deposit transaction.
 * Admin must approve it via /api/admin/wallet to credit the balance.
 * For demo purposes the transaction is immediately marked 'completed'
 * and the balance is credited right away.
 */

export async function GET() {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const [{ data: profile }, { data: transactions }] = await Promise.all([
      supabase.from('profiles').select('balance').eq('id', user.id).single(),
      supabase
        .from('transactions')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })
        .limit(20),
    ])

    return NextResponse.json({
      balance: profile?.balance ?? 0,
      transactions: transactions ?? [],
    })
  } catch (err) {
    console.error('GET /api/wallet error:', err)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

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

    // Insert transaction (demo: status = completed, credit immediately)
    const { data: txn, error: txnErr } = await adminSupabase
      .from('transactions')
      .insert({
        user_id: user.id,
        amount,
        type: 'deposit',
        status: 'completed',
        note: body.note ?? 'Nạp tiền qua QR (demo)',
      })
      .select()
      .single()

    if (txnErr) {
      console.error('INSERT transaction error:', txnErr)
      return NextResponse.json({ error: txnErr.message }, { status: 500 })
    }

    // Credit balance
    const { data: profile, error: profileErr } = await adminSupabase
      .from('profiles')
      .select('balance')
      .eq('id', user.id)
      .single()

    if (profileErr) {
      return NextResponse.json({ error: profileErr.message }, { status: 500 })
    }

    const newBalance = (profile?.balance ?? 0) + amount
    const { error: updateErr } = await adminSupabase
      .from('profiles')
      .update({ balance: newBalance })
      .eq('id', user.id)

    if (updateErr) {
      return NextResponse.json({ error: updateErr.message }, { status: 500 })
    }

    return NextResponse.json({ balance: newBalance, transaction: txn }, { status: 201 })
  } catch (err) {
    console.error('POST /api/wallet error:', err)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
