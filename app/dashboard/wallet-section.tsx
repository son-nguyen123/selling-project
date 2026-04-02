'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { toast } from 'sonner'
import { Wallet, QrCode, X, Plus } from 'lucide-react'

interface Transaction {
  id: number
  amount: number
  type: string
  status: string
  note: string | null
  created_at: string
}

interface WalletSectionProps {
  initialBalance: number
  initialTransactions: Transaction[]
  qrImage: string | null
}

function TopupModal({
  qrImage,
  onClose,
  onSuccess,
}: {
  qrImage: string | null
  onClose: () => void
  onSuccess: (newBalance: number, txn: Transaction) => void
}) {
  const [amount, setAmount] = useState('')
  const [loading, setLoading] = useState(false)

  async function handleConfirm() {
    const amt = Number(amount)
    if (!amt || amt <= 0) {
      toast.error('Nhập số tiền hợp lệ')
      return
    }
    setLoading(true)
    try {
      const res = await fetch('/api/wallet', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ amount: amt, note: 'Nạp tiền qua QR' }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error ?? 'Lỗi nạp tiền')
      toast.success(`Nạp ${amt.toLocaleString('vi-VN')}₫ thành công!`)
      onSuccess(data.balance, data.transaction)
      onClose()
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Lỗi nạp tiền')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
      <div className="relative w-full max-w-sm rounded-2xl bg-card border border-border shadow-2xl p-6">
        <button
          onClick={onClose}
          className="absolute right-4 top-4 rounded-full p-1 hover:bg-muted transition-colors"
        >
          <X className="h-4 w-4 text-muted-foreground" />
        </button>

        <div className="flex flex-col items-center gap-4">
          <div className="flex items-center gap-2">
            <QrCode className="h-5 w-5 text-primary" />
            <h2 className="text-lg font-bold text-foreground">Nạp tiền vào ví</h2>
          </div>

          {qrImage ? (
            <img
              src={qrImage}
              alt="QR thanh toán"
              className="w-48 h-48 object-contain rounded-xl border border-border bg-white p-2"
            />
          ) : (
            <div className="w-48 h-48 flex items-center justify-center rounded-xl border border-dashed border-border bg-muted text-center">
              <p className="text-xs text-muted-foreground px-4">Admin chưa cập nhật mã QR</p>
            </div>
          )}

          <p className="text-xs text-center text-muted-foreground leading-relaxed">
            Chuyển khoản theo mã QR trên, sau đó nhập số tiền đã chuyển và nhấn xác nhận.
          </p>

          <div className="w-full">
            <label className="block text-xs font-medium text-muted-foreground mb-1">
              Số tiền đã chuyển (₫)
            </label>
            <input
              type="number"
              min="1"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              placeholder="50000"
              className="w-full rounded-lg border border-input bg-background px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring"
            />
          </div>

          <Button onClick={handleConfirm} disabled={loading} className="w-full rounded-xl">
            {loading ? 'Đang xử lý...' : '✅ Tôi đã chuyển khoản'}
          </Button>
        </div>
      </div>
    </div>
  )
}

export default function WalletSection({
  initialBalance,
  initialTransactions,
  qrImage,
}: WalletSectionProps) {
  const [balance, setBalance] = useState(initialBalance)
  const [transactions, setTransactions] = useState<Transaction[]>(initialTransactions)
  const [showTopup, setShowTopup] = useState(false)

  function handleTopupSuccess(newBalance: number, txn: Transaction) {
    setBalance(newBalance)
    setTransactions((prev) => [txn, ...prev])
  }

  return (
    <>
      <section className="mb-8">
        <div className="rounded-2xl border border-border bg-gradient-to-br from-primary/5 to-primary/10 p-6 flex flex-col sm:flex-row sm:items-center gap-4">
          <div className="flex items-center gap-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10">
              <Wallet className="h-6 w-6 text-primary" />
            </div>
            <div>
              <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">Số dư ví</p>
              <p className="text-3xl font-extrabold text-primary leading-tight">
                {balance.toLocaleString('vi-VN')}₫
              </p>
            </div>
          </div>
          <Button onClick={() => setShowTopup(true)} className="sm:ml-auto rounded-xl gap-2">
            <Plus className="h-4 w-4" />
            Nạp tiền
          </Button>
        </div>

        {transactions.length > 0 && (
          <div className="mt-4 rounded-xl border border-border bg-card overflow-hidden">
            <div className="px-4 py-3 border-b border-border">
              <h3 className="text-sm font-semibold text-foreground">Lịch sử giao dịch</h3>
            </div>
            <div className="divide-y divide-border">
              {transactions.slice(0, 10).map((txn) => (
                <div key={txn.id} className="flex items-center justify-between px-4 py-3">
                  <div>
                    <p className="text-sm font-medium text-foreground">{txn.note ?? txn.type}</p>
                    <p className="text-xs text-muted-foreground">
                      {new Date(txn.created_at).toLocaleString('vi-VN')}
                      {' · '}
                      <span className={
                        txn.status === 'completed'
                          ? 'text-green-600 dark:text-green-400'
                          : txn.status === 'pending'
                          ? 'text-yellow-600 dark:text-yellow-400'
                          : 'text-red-600 dark:text-red-400'
                      }>
                        {txn.status === 'completed' ? 'Thành công' : txn.status === 'pending' ? 'Chờ duyệt' : 'Từ chối'}
                      </span>
                    </p>
                  </div>
                  <span className={`text-sm font-bold ${txn.amount > 0 ? 'text-green-600 dark:text-green-400' : 'text-red-500'}`}>
                    {txn.amount > 0 ? '+' : ''}{txn.amount.toLocaleString('vi-VN')}₫
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}
      </section>

      {showTopup && (
        <TopupModal
          qrImage={qrImage}
          onClose={() => setShowTopup(false)}
          onSuccess={handleTopupSuccess}
        />
      )}
    </>
  )
}
