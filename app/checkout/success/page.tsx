import Link from 'next/link'
import { CheckCircle } from 'lucide-react'
import { Button } from '@/components/ui/button'

export default function CheckoutSuccessPage() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-background">
      <div className="mx-auto max-w-md px-4 py-16 text-center">
        <CheckCircle className="mx-auto mb-4 h-16 w-16 text-green-500" />
        <h1 className="mb-2 text-3xl font-bold text-foreground">Order Confirmed!</h1>
        <p className="mb-6 text-muted-foreground">
          Thank you for your purchase. Your order has been placed successfully and will be
          processed shortly.
        </p>
        <div className="flex justify-center gap-4">
          <Button variant="outline" asChild>
            <Link href="/store">Continue Shopping</Link>
          </Button>
        </div>
      </div>
    </div>
  )
}
