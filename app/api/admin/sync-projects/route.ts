import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { NextResponse } from 'next/server'

/**
 * POST /api/admin/sync-projects
 *
 * Bulk-syncs all rows in the `projects` table into `store_products`.
 * Projects that are already linked (via specs->>'project_id') are skipped so
 * the operation is idempotent.
 */
export async function POST() {
  try {
    const supabase = await createClient()

    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const isAdmin =
      user.email?.endsWith('@admin.com') ??
      false

    if (!isAdmin) {
      // Also accept role = 'admin' from profiles
      const { data: profile } = await supabase
        .from('profiles')
        .select('role')
        .eq('id', user.id)
        .single()
      if ((profile as { role?: string } | null)?.role !== 'admin') {
        return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
      }
    }

    // Fetch all projects
    const { data: projects, error: projectsError } = await supabase
      .from('projects')
      .select('id, title, price, description, category, cover_image_url')

    if (projectsError) {
      return NextResponse.json({ error: projectsError.message }, { status: 500 })
    }

    if (!projects || projects.length === 0) {
      return NextResponse.json({ synced: 0, skipped: 0 })
    }

    // Fetch already-synced project IDs from store_products
    let writeClient: ReturnType<typeof createAdminClient> | typeof supabase
    try {
      writeClient = createAdminClient()
    } catch {
      writeClient = supabase
    }

    const { data: existing } = await writeClient
      .from('store_products')
      .select('specs')
      .not('specs', 'is', null)

    const syncedProjectIds = new Set<string>(
      (existing ?? [])
        .map((row: { specs: unknown }) => {
          const s = row.specs as { project_id?: string | number } | null
          return s?.project_id != null ? String(s.project_id) : null
        })
        .filter(Boolean) as string[]
    )

    const toInsert = projects.filter((p) => !syncedProjectIds.has(String(p.id)))

    if (toInsert.length === 0) {
      return NextResponse.json({ synced: 0, skipped: projects.length })
    }

    const rows = toInsert.map((p) => ({
      name: p.title,
      price: p.price,
      description: p.description ?? null,
      category: p.category ?? null,
      dashboard_image_url: p.cover_image_url ?? null,
      specs: { project_id: p.id },
    }))

    const { error: insertError } = await writeClient.from('store_products').insert(rows)

    if (insertError) {
      return NextResponse.json({ error: insertError.message }, { status: 500 })
    }

    return NextResponse.json({ synced: toInsert.length, skipped: syncedProjectIds.size })
  } catch (err) {
    console.error('POST /api/admin/sync-projects error:', err)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
