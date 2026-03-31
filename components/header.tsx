import { createClient } from '@/lib/supabase/server'
import HeaderClient from '@/components/header-client'

export default async function Header() {
  try {
    const supabase = await createClient()

    const {
      data: { user },
    } = await supabase.auth.getUser()

    let userInfo = null
    if (user) {
      const { data: profile } = await supabase
        .from('profiles')
        .select('name, avatar_url')
        .eq('id', user.id)
        .single()

      userInfo = {
        id: user.id,
        name: profile?.name ?? (user.user_metadata?.full_name as string | null) ?? null,
        avatar_url: profile?.avatar_url ?? (user.user_metadata?.avatar_url as string | null) ?? (user.user_metadata?.picture as string | null) ?? null,
        email: user.email ?? null,
      }
    }

    return <HeaderClient user={userInfo} />
  } catch {
    // Fallback to unauthenticated header if Supabase is unavailable
    return <HeaderClient user={null} />
  }
}

