import Link from 'next/link'
import { Mail } from 'lucide-react'
import { Button } from '@/components/ui/button'

export default function CheckEmailPage() {
  return (
    <div className="min-h-screen bg-background flex items-center justify-center px-4">
      <div className="w-full max-w-md text-center">
        {/* Logo */}
        <div className="flex items-center gap-2 justify-center mb-8">
          <div className="w-10 h-10 bg-gradient-to-br from-accent to-accent/60 rounded-lg flex items-center justify-center">
            <span className="text-accent-foreground font-bold text-xl">P</span>
          </div>
          <span className="text-2xl font-bold text-foreground">ProjectHub</span>
        </div>

        <div className="bg-card border border-border rounded-2xl p-8 shadow-lg">
          <div className="flex justify-center mb-6">
            <div className="w-16 h-16 bg-accent/10 rounded-full flex items-center justify-center">
              <Mail className="h-8 w-8 text-accent" />
            </div>
          </div>

          <h1 className="text-2xl font-bold text-foreground mb-3">Kiểm tra email của bạn</h1>
          <p className="text-muted-foreground mb-6">
            Chúng tôi đã gửi một liên kết xác nhận đến email của bạn. Vui lòng kiểm tra hộp thư
            (kể cả thư mục Spam) và nhấn vào liên kết để kích hoạt tài khoản.
          </p>

          <div className="bg-muted/50 rounded-lg px-4 py-3 mb-6 text-sm text-muted-foreground">
            Sau khi xác nhận email, bạn có thể đăng nhập bình thường.
          </div>

          <Link href="/login">
            <Button variant="outline" className="w-full">
              Quay lại trang đăng nhập
            </Button>
          </Link>
        </div>
      </div>
    </div>
  )
}
