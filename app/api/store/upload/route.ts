import { createAdminClient } from '@/lib/supabase/admin'
import { createClient } from '@/lib/supabase/server'
import { NextRequest, NextResponse } from 'next/server'

const ALLOWED_BUCKETS = ['product-images', 'product-videos']

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user?.email?.endsWith('@admin.com')) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    const formData = await request.formData()
    const file = formData.get('file') as File | null
    const bucket = (formData.get('bucket') as string) ?? 'product-images'

    if (!file) return NextResponse.json({ error: 'No file provided' }, { status: 400 })
    if (!ALLOWED_BUCKETS.includes(bucket)) {
      return NextResponse.json({ error: 'Invalid bucket' }, { status: 400 })
    }

    const ext = file.name.split('.').pop() ?? 'bin'
    const filename = `${Date.now()}-${Math.random().toString(36).slice(2)}.${ext}`

    const adminSupabase = createAdminClient()
    const { error: uploadError } = await adminSupabase.storage
      .from(bucket)
      .upload(filename, file, { contentType: file.type, upsert: false })

    if (uploadError) {
      console.error('UPLOAD ERROR:', uploadError)
      return NextResponse.json({ error: uploadError.message }, { status: 500 })
    }

    const { data: { publicUrl } } = adminSupabase.storage.from(bucket).getPublicUrl(filename)

    return NextResponse.json({ url: publicUrl }, { status: 201 })
  } catch (err) {
    console.error('POST /api/store/upload error:', err)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
