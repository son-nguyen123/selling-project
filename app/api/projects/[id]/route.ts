import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { NextRequest, NextResponse } from 'next/server'

async function isAdmin(supabase: Awaited<ReturnType<typeof createClient>>): Promise<boolean> {
  const {
    data: { user },
  } = await supabase.auth.getUser()
  return !!user?.email?.endsWith('@admin.com')
}

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const { id } = await params
    const supabase = await createClient()

    const { data, error } = await supabase
      .from('projects')
      .select(
        `
        id,
        title,
        description,
        tech_stack,
        category,
        price,
        cover_image_url,
        created_at,
        author_id,
        profiles!author_id(name, avatar_url)
      `,
      )
      .eq('id', id)
      .single()

    if (error || !data) {
      return NextResponse.json({ error: 'Project not found' }, { status: 404 })
    }

    return NextResponse.json(data)
  } catch (err) {
    console.error('GET /api/projects/[id] error:', err)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const { id } = await params
    const supabase = await createClient()

    if (!(await isAdmin(supabase))) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    const body = await request.json()
    const { title, description, tech_stack, category, price, cover_image_url } = body

    const { data, error } = await supabase
      .from('projects')
      .update({
        title,
        description: description || null,
        tech_stack: tech_stack || null,
        category: category || null,
        price,
        cover_image_url: cover_image_url || null,
      })
      .eq('id', id)
      .select()
      .single()

    if (error) return NextResponse.json({ error: error.message }, { status: 500 })
    if (!data) return NextResponse.json({ error: 'Project not found' }, { status: 404 })

    // Sync update to store_products.
    try {
      const adminClient = createAdminClient()
      const { error: syncError } = await adminClient
        .from('store_products')
        .update({
          name: data.title,
          price: data.price,
          description: data.description ?? null,
          category: data.category ?? null,
          dashboard_image_url: data.cover_image_url ?? null,
        })
        .contains('specs', { project_id: Number(id) })
      if (syncError) {
        console.error('PUT /api/projects/[id] – store_products sync error:', syncError)
      }
    } catch (syncErr) {
      console.error('PUT /api/projects/[id] – store_products sync error:', syncErr)
    }

    return NextResponse.json(data)
  } catch (err) {
    console.error('PUT /api/projects/[id] error:', err)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function DELETE(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const { id } = await params
    const supabase = await createClient()

    if (!(await isAdmin(supabase))) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    const { error } = await supabase.from('projects').delete().eq('id', id)

    if (error) return NextResponse.json({ error: error.message }, { status: 500 })

    // Sync deletion to store_products.
    try {
      const adminClient = createAdminClient()
      const { error: syncError } = await adminClient
        .from('store_products')
        .delete()
        .contains('specs', { project_id: Number(id) })
      if (syncError) {
        console.error('DELETE /api/projects/[id] – store_products sync error:', syncError)
      }
    } catch (syncErr) {
      console.error('DELETE /api/projects/[id] – store_products sync error:', syncErr)
    }

    return NextResponse.json({ success: true })
  } catch (err) {
    console.error('DELETE /api/projects/[id] error:', err)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
