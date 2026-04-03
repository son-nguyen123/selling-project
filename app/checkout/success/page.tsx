'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { CheckCircle, Download } from 'lucide-react'
import { Button } from '@/components/ui/button'

interface DownloadItem {
  name: string
  url: string
}

export default function CheckoutSuccessPage() {
  const [downloadLinks, setDownloadLinks] = useState<DownloadItem[]>([])

  useEffect(() => {
    const raw = sessionStorage.getItem('order_download_links')
    if (raw) {
      try {
        setDownloadLinks(JSON.parse(raw))
      } catch {
        // ignore malformed data
      }
      sessionStorage.removeItem('order_download_links')
    }
  }, [])

  return (
    <div className="flex min-h-screen items-center justify-center bg-background">
      <div className="mx-auto max-w-md px-4 py-16 text-center">
        <CheckCircle className="mx-auto mb-4 h-16 w-16 text-green-500" />
        <h1 className="mb-2 text-3xl font-bold text-foreground">Đặt hàng thành công!</h1>
        <p className="mb-6 text-muted-foreground">
          Cảm ơn bạn đã mua hàng. Đơn hàng của bạn đã được đặt thành công.
        </p>

        {downloadLinks.length > 0 && (
          <div className="mb-6 rounded-lg border border-border bg-card p-5 text-left">
            <h2 className="mb-3 text-sm font-semibold text-foreground">
              Tải xuống sản phẩm của bạn
            </h2>
            <div className="space-y-2">
              {downloadLinks.map((item, idx) => (
                <a
                  key={idx}
                  href={item.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-2 rounded-md border border-border bg-background px-4 py-2 text-sm font-medium text-primary transition-colors hover:bg-accent"
                >
                  <Download className="h-4 w-4 shrink-0" />
                  <span className="truncate">{item.name}</span>
                </a>
              ))}
            </div>
            <p className="mt-3 text-xs text-muted-foreground">
              Link tải cũng đã được gửi vào email của bạn.
            </p>
          </div>
        )}

        <div className="flex justify-center gap-4">
          <Button variant="outline" asChild>
            <Link href="/store">Tiếp tục mua sắm</Link>
          </Button>
        </div>
      </div>
    </div>
  )
}
