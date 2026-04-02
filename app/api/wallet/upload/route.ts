import { createAdminClient } from '@/lib/supabase/admin'
import { createClient } from '@/lib/supabase/server'
import { NextRequest, NextResponse } from 'next/server'

const ALLOWED_TYPES = ['image/jpeg', 'image/png', 'image/webp', 'image/gif']

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const formData = await request.formData()
    const file = formData.get('file') as File | null
    if (!file) return NextResponse.json({ error: 'No file provided' }, { status: 400 })
    if (!ALLOWED_TYPES.includes(file.type)) {
      return NextResponse.json({ error: 'Chỉ chấp nhận ảnh (jpg, png, webp, gif)' }, { status: 400 })
    }
    if (file.size > 5 * 1024 * 1024) {
      return NextResponse.json({ error: 'Ảnh không được vượt quá 5MB' }, { status: 400 })
    }

    const ext = file.name.split('.').pop() ?? 'jpg'
    const filename = `deposit-proofs/${user.id}-${Date.now()}.${ext}`

    const adminSupabase = createAdminClient()
    const { error: uploadError } = await adminSupabase.storage
      .from('product-images')
      .upload(filename, file, { contentType: file.type, upsert: false })

    if (uploadError) {
      console.error('Deposit proof upload error:', uploadError)
      return NextResponse.json({ error: uploadError.message }, { status: 500 })
    }

    const { data: { publicUrl } } = adminSupabase.storage.from('product-images').getPublicUrl(filename)
    return NextResponse.json({ url: publicUrl }, { status: 201 })
  } catch (err) {
    console.error('POST /api/wallet/upload error:', err)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
