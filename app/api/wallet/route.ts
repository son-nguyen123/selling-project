import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { NextRequest, NextResponse } from 'next/server'

/**
 * GET /api/wallet
 * Returns current user's balance, recent transactions, and admin QR image.
 *
 * POST /api/wallet
 * Body: { amount: number, note?: string, proof_image?: string }
 * Creates a PENDING deposit transaction that requires admin confirmation.
 * Admin approves via /api/admin/wallet with action 'confirm_deposit'.
 */

export async function GET() {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const adminSupabase = createAdminClient()

    const [{ data: profile }, txnResult, qrResult] = await Promise.all([
      supabase.from('profiles').select('balance').eq('id', user.id).single(),
      supabase
        .from('transactions')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })
        .limit(20),
      adminSupabase.from('admin_settings').select('value').eq('key', 'qr_image').single(),
    ])

    if (txnResult.error?.message?.includes('relation') || txnResult.error?.message?.includes('schema cache')) {
      return NextResponse.json({
        balance: profile?.balance ?? 0,
        transactions: [],
        qr_image: qrResult.data?.value ?? null,
        warning: 'Bảng transactions chưa tồn tại. Vui lòng chạy migration 006_ensure_complete_schema.sql trong Supabase SQL editor.',
      })
    }

    return NextResponse.json({
      balance: profile?.balance ?? 0,
      transactions: txnResult.data ?? [],
      qr_image: qrResult.data?.value ?? null,
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

    // Insert PENDING transaction – admin must confirm to credit balance
    const { data: txn, error: txnErr } = await adminSupabase
      .from('transactions')
      .insert({
        user_id: user.id,
        amount,
        type: 'deposit',
        status: 'pending',
        note: body.note ?? 'Nạp tiền qua QR',
        proof_image: body.proof_image ?? null,
      })
      .select()
      .single()

    if (txnErr) {
      console.error('INSERT transaction error:', txnErr)
      const msg = txnErr.message?.includes('relation') || txnErr.message?.includes('schema cache')
        ? 'Bảng transactions chưa tồn tại. Vui lòng chạy migration 006_ensure_complete_schema.sql trong Supabase SQL editor.'
        : txnErr.message
      return NextResponse.json({ error: msg }, { status: 500 })
    }

    const { data: profile } = await adminSupabase
      .from('profiles')
      .select('balance')
      .eq('id', user.id)
      .single()

    return NextResponse.json({ balance: profile?.balance ?? 0, transaction: txn }, { status: 201 })
  } catch (err) {
    console.error('POST /api/wallet error:', err)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
