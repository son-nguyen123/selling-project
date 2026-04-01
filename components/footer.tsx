'use client'

import { Github, Twitter, Linkedin, Mail } from 'lucide-react'
import { Button } from '@/components/ui/button'

const PAYMENT_METHODS = [
  { label: 'VNPay', bg: 'bg-[#0066B2] text-white', abbr: 'VN' },
  { label: 'MoMo', bg: 'bg-[#A50064] text-white', abbr: 'MM' },
  { label: 'ZaloPay', bg: 'bg-[#006AF5] text-white', abbr: 'ZP' },
  { label: 'Banking', bg: 'bg-green-600 text-white', abbr: 'ATM' },
  { label: 'Visa', bg: 'bg-[#1A1F71] text-white', abbr: 'VISA' },
  { label: 'Mastercard', bg: 'bg-[#EB001B] text-white', abbr: 'MC' },
]

export default function Footer() {
  const currentYear = new Date().getFullYear()

  return (
    <footer className="bg-card border-t border-border mt-20">
      <div className="max-w-7xl mx-auto px-4 py-16">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-12">
          {/* Brand */}
          <div>
            <div className="flex items-center gap-2 mb-4">
              <div className="w-8 h-8 bg-gradient-to-br from-accent to-accent/60 rounded-lg flex items-center justify-center">
                <span className="text-accent-foreground font-bold">P</span>
              </div>
              <span className="text-lg font-bold">ProjectHub</span>
            </div>
            <p className="text-muted-foreground text-sm mb-4">
              Nền tảng mua bán source code & sản phẩm số hàng đầu Việt Nam.
            </p>
            {/* Payment methods */}
            <div>
              <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-2">
                Phương thức thanh toán
              </p>
              <div className="flex flex-wrap gap-1.5">
                {PAYMENT_METHODS.map(({ label, bg, abbr }) => (
                  <span
                    key={label}
                    title={label}
                    className={`inline-flex items-center justify-center rounded px-2 py-1 text-[10px] font-bold tracking-wide ${bg}`}
                  >
                    {abbr}
                  </span>
                ))}
              </div>
            </div>
          </div>

          {/* Company */}
          <div>
            <h4 className="font-bold text-foreground mb-4">Công ty</h4>
            <ul className="space-y-2 text-sm">
              <li><a href="#" className="text-muted-foreground hover:text-foreground transition">Về chúng tôi</a></li>
              <li><a href="#" className="text-muted-foreground hover:text-foreground transition">Blog</a></li>
              <li><a href="#" className="text-muted-foreground hover:text-foreground transition">Tuyển dụng</a></li>
              <li><a href="#" className="text-muted-foreground hover:text-foreground transition">Báo chí</a></li>
            </ul>
          </div>

          {/* Resources */}
          <div>
            <h4 className="font-bold text-foreground mb-4">Tài nguyên</h4>
            <ul className="space-y-2 text-sm">
              <li><a href="#" className="text-muted-foreground hover:text-foreground transition">Tài liệu</a></li>
              <li><a href="#" className="text-muted-foreground hover:text-foreground transition">Cộng đồng</a></li>
              <li><a href="#" className="text-muted-foreground hover:text-foreground transition">Hỗ trợ</a></li>
              <li><a href="#" className="text-muted-foreground hover:text-foreground transition">API Docs</a></li>
            </ul>
          </div>

          {/* Legal */}
          <div>
            <h4 className="font-bold text-foreground mb-4">Pháp lý</h4>
            <ul className="space-y-2 text-sm">
              <li><a href="#" className="text-muted-foreground hover:text-foreground transition">Chính sách bảo mật</a></li>
              <li><a href="#" className="text-muted-foreground hover:text-foreground transition">Điều khoản dịch vụ</a></li>
              <li><a href="#" className="text-muted-foreground hover:text-foreground transition">Chính sách cookie</a></li>
              <li><a href="#" className="text-muted-foreground hover:text-foreground transition">Chính sách hoàn tiền</a></li>
            </ul>
          </div>
        </div>

        <div className="border-t border-border my-8" />

        <div className="flex flex-col md:flex-row justify-between items-center gap-6">
          <p className="text-muted-foreground text-sm">
            © {currentYear} ProjectHub. Tất cả quyền được bảo lưu.
          </p>
          <div className="flex gap-4">
            <Button variant="ghost" size="icon" className="rounded-full">
              <Twitter className="h-5 w-5" />
            </Button>
            <Button variant="ghost" size="icon" className="rounded-full">
              <Github className="h-5 w-5" />
            </Button>
            <Button variant="ghost" size="icon" className="rounded-full">
              <Linkedin className="h-5 w-5" />
            </Button>
            <Button variant="ghost" size="icon" className="rounded-full">
              <Mail className="h-5 w-5" />
            </Button>
          </div>
        </div>
      </div>
    </footer>
  )
}
