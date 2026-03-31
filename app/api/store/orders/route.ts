import { createClient } from '@/lib/supabase/server'
import { NextRequest, NextResponse } from 'next/server'

async function isAdmin(supabase: Awaited<ReturnType<typeof createClient>>): Promise<boolean> {
  const { data: { user } } = await supabase.auth.getUser()
  return !!user?.email?.endsWith('@admin.com')
}

export async function GET(request: NextRequest) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const admin = await isAdmin(supabase)
  let query = supabase
    .from('orders')
    .select('*')
    .order('created_at', { ascending: false })

  if (!admin) {
    query = query.eq('user_id', user.id)
  }

  const { data, error } = await query
  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json(data)
}

export async function POST(request: NextRequest) {
  const supabase = await createClient()
  const body = await request.json()
  const { data: { user } } = await supabase.auth.getUser()

  if (!body.customer_email) {
    return NextResponse.json({ error: 'customer_email is required' }, { status: 400 })
  }
  if (!body.items || !Array.isArray(body.items) || body.items.length === 0) {
    return NextResponse.json({ error: 'items is required' }, { status: 400 })
  }

  const orderPayload: Record<string, unknown> = {
    customer_name: body.customer_name,
    customer_email: body.customer_email,
    items: body.items,
    total_price: body.total_price,
    payment_method: body.payment_method ?? 'simulated',
    status: 'new',
  }

  if (user) {
    orderPayload.user_id = user.id
  }

  const { data, error } = await supabase
    .from('orders')
    .insert(orderPayload)
    .select()
    .single()

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json(data, { status: 201 })
}
