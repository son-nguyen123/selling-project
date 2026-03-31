import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import Header from '@/components/header'
import Footer from '@/components/footer'
import UploadForm from '@/components/upload-form'

export default async function UploadPage() {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect('/login')
  }

  const { data: profile } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', user.id)
    .single()

  const isAdmin = (profile as any)?.role === 'admin' || (user.email?.endsWith('@admin.com') ?? false)
  if (!isAdmin) {
    redirect('/')
  }

  return (
    <div className="min-h-screen bg-background">
      <Header />

      <main className="max-w-2xl mx-auto px-4 py-12">
        <h1 className="text-3xl font-bold text-foreground mb-2">Upload a Project</h1>
        <p className="text-muted-foreground mb-8">
          Share your work with the community and start selling.
        </p>

        <UploadForm />
      </main>

      <Footer />
    </div>
  )
}

