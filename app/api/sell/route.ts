import { createAdminClient } from '@/lib/supabase/admin'
import { createClient } from '@/lib/supabase/server'
import { NextRequest, NextResponse } from 'next/server'

const ALLOWED_CATEGORIES = ['Source code', 'Website', 'Phần mềm', 'Ứng dụng', 'Dịch vụ máy chủ']

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: 'Bạn cần đăng nhập để đăng bán sản phẩm.' }, { status: 401 })
    }

    const body = await request.json()
    const { name, description, price, category, dashboard_image_url } = body

    if (!name || !price) {
      return NextResponse.json({ error: 'Tên và giá sản phẩm là bắt buộc.' }, { status: 400 })
    }

    const parsedPrice = parseFloat(price)
    if (isNaN(parsedPrice) || parsedPrice < 0) {
      return NextResponse.json({ error: 'Giá sản phẩm không hợp lệ.' }, { status: 400 })
    }

    if (category && !ALLOWED_CATEGORIES.includes(category)) {
      return NextResponse.json({ error: 'Danh mục sản phẩm không hợp lệ.' }, { status: 400 })
    }

    const adminSupabase = createAdminClient()
    const { data, error } = await adminSupabase
      .from('store_products')
      .insert({
        name: name.trim(),
        description: description?.trim() || null,
        price: parsedPrice,
        category: category || null,
        stock: 999,
        dashboard_image_url: dashboard_image_url?.trim() || null,
      })
      .select()
      .single()

    if (error) {
      console.error('[POST /api/sell] insert error:', error)
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json(data, { status: 201 })
  } catch (err) {
    console.error('[POST /api/sell] unexpected error:', err)
    return NextResponse.json({ error: 'Lỗi máy chủ nội bộ.' }, { status: 500 })
  }
}
