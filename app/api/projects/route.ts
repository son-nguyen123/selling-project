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
        profiles!author_id(name, avatar_url)
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

    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Only admin users can create products – check role from profiles, with email fallback
    const { data: profile } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', user.id)
      .single()
    const adminUser = (profile as any)?.role === 'admin' || (user.email?.endsWith('@admin.com') ?? false)
    if (!adminUser) {
      return NextResponse.json({ error: 'Forbidden: admin access required' }, { status: 403 })
    }

    const body = await request.json()
    const { title, description, tech_stack, category, price, cover_image_url } = body

    // Server-side validation
    const ALLOWED_CATEGORIES = ['Web App', 'Mobile', 'Backend', 'Component Library', 'Other']

    if (!title || typeof title !== 'string' || title.trim().length === 0) {
      return NextResponse.json({ error: 'Title is required' }, { status: 400 })
    }
    if (title.trim().length > 200) {
      return NextResponse.json({ error: 'Title must be 200 characters or fewer' }, { status: 400 })
    }
    if (!category || !ALLOWED_CATEGORIES.includes(category)) {
      return NextResponse.json(
        { error: `Category must be one of: ${ALLOWED_CATEGORIES.join(', ')}` },
        { status: 400 },
      )
    }
    if (price === undefined || price === null) {
      return NextResponse.json({ error: 'Price is required' }, { status: 400 })
    }
    const parsedPrice = typeof price === 'number' ? price : parseFloat(price)
    if (isNaN(parsedPrice) || parsedPrice < 0) {
      return NextResponse.json({ error: 'Price must be a valid non-negative number' }, { status: 400 })
    }
    if (cover_image_url && typeof cover_image_url === 'string' && cover_image_url.length > 0) {
      try {
        const parsed = new URL(cover_image_url)
        if (parsed.protocol !== 'https:' && parsed.protocol !== 'http:') {
          return NextResponse.json({ error: 'Cover image URL must be a valid http(s) URL' }, { status: 400 })
        }
      } catch {
        return NextResponse.json({ error: 'Cover image URL must be a valid URL' }, { status: 400 })
      }
    }

    // Ensure a profile row exists for this user before inserting the project.
    // The profiles table is the target of the projects_author_id_fkey foreign
    // key, so the row must be present or the insert will be rejected.
    // auth.getUser() guarantees the user exists in auth.users, so this upsert
    // is always safe.
    const { error: profileError } = await supabase
      .from('profiles')
      .upsert({ id: user.id }, { onConflict: 'id', ignoreDuplicates: true })

    if (profileError) {
      console.error('POST /api/projects – profile upsert error:', profileError)
      return NextResponse.json({ error: 'Failed to ensure user profile' }, { status: 500 })
    }

    const { data, error } = await supabase
      .from('projects')
      .insert([
        {
          title: title.trim(),
          description: typeof description === 'string' ? description.trim() || null : null,
          tech_stack: typeof tech_stack === 'string' ? tech_stack.trim() || null : null,
          category,
          price: parsedPrice,
          author_id: user.id,
          cover_image_url: typeof cover_image_url === 'string' ? cover_image_url.trim() || null : null,
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
