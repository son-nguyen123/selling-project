import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { NextRequest, NextResponse } from 'next/server'
import { sendOrderConfirmationEmail } from '@/lib/email'

async function isAdmin(supabase: Awaited<ReturnType<typeof createClient>>): Promise<boolean> {
  const { data: { user } } = await supabase.auth.getUser()
  return !!user?.email?.endsWith('@admin.com')
}

export async function GET(request: NextRequest) {
  try {
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
  } catch (err) {
    console.error('GET /api/store/orders error:', err)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
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

    // Send order confirmation email with download links
    try {
    // Fetch product download links using admin client to access all products
    // regardless of RLS policies, since this runs server-side for a confirmed order.
      const adminSupabase = createAdminClient()
      const productIds = body.items
        .map((i: { product_id?: string }) => i.product_id)
        .filter(Boolean) as string[]

      let downloadLinksMap: Record<string, string | null> = {}
      if (productIds.length > 0) {
        const { data: products } = await adminSupabase
          .from('store_products')
          .select('id, download_link')
          .in('id', productIds)
        if (products) {
          downloadLinksMap = Object.fromEntries(
            products.map((p: { id: string; download_link: string | null }) => [p.id, p.download_link]),
          )
        }
      }

      const emailItems = body.items.map((item: { product_id?: string; name: string; price: number; quantity: number }) => ({
        name: item.name,
        price: item.price,
        quantity: item.quantity,
        download_link: item.product_id ? downloadLinksMap[item.product_id] ?? null : null,
      }))

      await sendOrderConfirmationEmail({
        to: body.customer_email,
        customerName: body.customer_name ?? '',
        orderId: data.id,
        items: emailItems,
        totalPrice: body.total_price,
      })
    } catch (emailErr) {
      console.error('Order email send error:', emailErr)
      // Non-fatal: order is already created, just log the error
    }

    return NextResponse.json(data, { status: 201 })
  } catch (err) {
    console.error('POST /api/store/orders error:', err)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
