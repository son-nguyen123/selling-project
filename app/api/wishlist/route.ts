import { createClient } from '@/lib/supabase/server'
import { NextRequest, NextResponse } from 'next/server'

/** GET /api/wishlist – returns the current user's wishlisted project IDs */
export async function GET() {
  try {
    const supabase = await createClient()

    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { data, error } = await supabase
      .from('wishlists')
      .select('project_id')
      .eq('user_id', user.id)

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    const projectIds = (data ?? []).map((row) => row.project_id as number)
    return NextResponse.json({ projectIds })
  } catch (err) {
    console.error('GET /api/wishlist error:', err)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

/** POST /api/wishlist – toggle wishlist for the current user */
export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient()

    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { projectId } = await request.json()
    if (!projectId) {
      return NextResponse.json({ error: 'projectId is required' }, { status: 400 })
    }

    // Check if already wishlisted
    const { data: existing } = await supabase
      .from('wishlists')
      .select('id')
      .eq('user_id', user.id)
      .eq('project_id', projectId)
      .maybeSingle()

    if (existing) {
      // Remove from wishlist
      const { error } = await supabase
        .from('wishlists')
        .delete()
        .eq('user_id', user.id)
        .eq('project_id', projectId)

      if (error) {
        return NextResponse.json({ error: error.message }, { status: 500 })
      }
      return NextResponse.json({ wishlisted: false })
    } else {
      // Add to wishlist
      const { error } = await supabase
        .from('wishlists')
        .insert({ user_id: user.id, project_id: projectId })

      if (error) {
        return NextResponse.json({ error: error.message }, { status: 500 })
      }
      return NextResponse.json({ wishlisted: true })
    }
  } catch (err) {
    console.error('POST /api/wishlist error:', err)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
