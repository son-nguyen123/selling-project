import { createClient } from '@/lib/supabase/server'
import { NextRequest, NextResponse } from 'next/server'

export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient()

    const searchParams = request.nextUrl.searchParams
    const search = searchParams.get('search') || ''
    const category = searchParams.get('category')
    const sort = searchParams.get('sort') || 'featured'

    let query = supabase
      .from('projects')
      .select(`
        id,
        title,
        description,
        tech_stack,
        category,
        price,
        author_id,
        cover_image_url,
        created_at,
        updated_at,
        users!author_id(name)
      `)
      .limit(50)

    if (category && category !== 'All') {
      query = query.eq('category', category)
    }

    if (search) {
      query = query.or(
        `title.ilike.%${search}%,description.ilike.%${search}%,tech_stack.ilike.%${search}%`
      )
    }

    if (sort === 'latest') {
      query = query.order('created_at', { ascending: false })
    } else if (sort === 'price-low') {
      query = query.order('price', { ascending: true })
    } else if (sort === 'price-high') {
      query = query.order('price', { ascending: false })
    } else {
      query = query.order('created_at', { ascending: false })
    }

    const { data, error } = await query

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json(data)
  } catch (err) {
    console.error('GET /api/projects error. Check NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_PUBLISHABLE_DEFAULT_KEY env vars:', err)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient()

    const body = await request.json()
    const { title, description, tech_stack, category, price, cover_image_url } = body

    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { data, error } = await supabase
      .from('projects')
      .insert([
        {
          title,
          description,
          tech_stack,
          category,
          price,
          author_id: user.id,
          cover_image_url,
        },
      ])
      .select()

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json(data, { status: 201 })
  } catch (err) {
    console.error('POST /api/projects error. Check NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_PUBLISHABLE_DEFAULT_KEY env vars:', err)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
