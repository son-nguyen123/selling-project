import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import Header from '@/components/header'
import Footer from '@/components/footer'
import SellForm from './sell-form'

export default async function SellPage() {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect('/login?next=/sell')
  }

  return (
    <div className="min-h-screen bg-background">
      <Header />

      <main className="max-w-3xl mx-auto px-4 py-10">
        {/* Page header */}
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-foreground">Đăng bán sản phẩm</h1>
          <p className="text-muted-foreground text-sm mt-1">
            Điền thông tin bên dưới để đưa sản phẩm của bạn lên marketplace.
          </p>
        </div>

        <SellForm />
      </main>

      <Footer />
    </div>
  )
}
