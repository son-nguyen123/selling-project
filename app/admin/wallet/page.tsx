'use client'

import { useEffect, useRef, useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { toast } from 'sonner'
import { QrCode, Upload, Wallet, Plus } from 'lucide-react'

interface Transaction {
  id: number
  user_id: string
  amount: number
  type: string
  status: string
  note: string | null
  created_at: string
}

async function uploadFile(file: File): Promise<string> {
  const fd = new FormData()
  fd.append('file', file)
  fd.append('bucket', 'product-images')
  const res = await fetch('/api/store/upload', { method: 'POST', body: fd })
  if (!res.ok) {
    const err = await res.json()
    throw new Error(err.error ?? 'Upload failed')
  }
  const data = await res.json()
  return data.url as string
}

export default function AdminWalletPage() {
  const [qrImage, setQrImage] = useState<string>('')
  const [transactions, setTransactions] = useState<Transaction[]>([])
  const [loading, setLoading] = useState(true)
  const [savingQr, setSavingQr] = useState(false)
  const [topupUserId, setTopupUserId] = useState('')
  const [topupAmount, setTopupAmount] = useState('')
  const [topupNote, setTopupNote] = useState('')
  const [toppingUp, setToppingUp] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    fetch('/api/admin/wallet')
      .then((r) => r.json())
      .then((data) => {
        setQrImage(data.qr_image ?? '')
        setTransactions(data.transactions ?? [])
        setLoading(false)
      })
      .catch(() => setLoading(false))
  }, [])

  async function handleQrFileUpload(file: File) {
    try {
      const url = await uploadFile(file)
      setQrImage(url)
      toast.success('Đã upload ảnh QR')
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Upload failed')
    }
  }

  async function handleSaveQr() {
    setSavingQr(true)
    try {
      const res = await fetch('/api/admin/wallet', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'update_qr', qr_image: qrImage }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error ?? 'Lỗi lưu QR')
      toast.success('Đã cập nhật mã QR!')
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Lỗi lưu QR')
    } finally {
      setSavingQr(false)
    }
  }

  async function handleTopup(e: React.FormEvent) {
    e.preventDefault()
    const amount = Number(topupAmount)
    if (!topupUserId.trim()) {
      toast.error('Nhập User ID')
      return
    }
    if (!amount || amount <= 0) {
      toast.error('Nhập số tiền hợp lệ')
      return
    }
    setToppingUp(true)
    try {
      const res = await fetch('/api/admin/wallet', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'topup',
          user_id: topupUserId.trim(),
          amount,
          note: topupNote.trim() || 'Admin cộng tiền thủ công',
        }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error ?? 'Lỗi nạp tiền')
      toast.success(`Đã cộng ${amount.toLocaleString('vi-VN')}₫ cho user`)
      setTopupUserId('')
      setTopupAmount('')
      setTopupNote('')
      // Reload transactions
      const refreshRes = await fetch('/api/admin/wallet')
      if (refreshRes.ok) {
        const refreshData = await refreshRes.json()
        setTransactions(refreshData.transactions ?? [])
      }
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Lỗi nạp tiền')
    } finally {
      setToppingUp(false)
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <p className="text-sm text-zinc-400">Đang tải...</p>
      </div>
    )
  }

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-white">Quản lý ví tiền</h1>
        <p className="text-sm text-zinc-400 mt-0.5">Cập nhật QR thanh toán và nạp tiền thủ công cho user</p>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        {/* QR Management */}
        <div className="rounded-xl border border-zinc-800 bg-zinc-900 p-6 space-y-4">
          <div className="flex items-center gap-2">
            <QrCode className="h-5 w-5 text-accent" />
            <h2 className="text-base font-semibold text-white">Mã QR thanh toán</h2>
          </div>

          {qrImage ? (
            <img
              src={qrImage}
              alt="QR thanh toán"
              className="w-48 h-48 object-contain rounded-xl border border-zinc-700 bg-white p-2"
            />
          ) : (
            <div className="w-48 h-48 flex items-center justify-center rounded-xl border border-dashed border-zinc-700 bg-zinc-800 text-center">
              <p className="text-xs text-zinc-500 px-4">Chưa có mã QR</p>
            </div>
          )}

          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <Button
                type="button"
                variant="outline"
                size="sm"
                className="border-zinc-700 text-zinc-300 hover:bg-zinc-800"
                onClick={() => fileInputRef.current?.click()}
              >
                <Upload className="mr-2 h-3.5 w-3.5" />
                Upload ảnh QR
              </Button>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                className="hidden"
                onChange={(e) => {
                  const f = e.target.files?.[0]
                  if (f) handleQrFileUpload(f)
                }}
              />
            </div>
            <Input
              value={qrImage}
              onChange={(e) => setQrImage(e.target.value)}
              placeholder="Hoặc dán URL ảnh QR..."
              className="bg-zinc-800 border-zinc-700 text-zinc-200 placeholder:text-zinc-500"
            />
          </div>

          <Button onClick={handleSaveQr} disabled={savingQr} className="w-full">
            {savingQr ? 'Đang lưu...' : 'Lưu mã QR'}
          </Button>
        </div>

        {/* Manual Topup */}
        <div className="rounded-xl border border-zinc-800 bg-zinc-900 p-6 space-y-4">
          <div className="flex items-center gap-2">
            <Plus className="h-5 w-5 text-accent" />
            <h2 className="text-base font-semibold text-white">Cộng tiền thủ công</h2>
          </div>

          <form onSubmit={handleTopup} className="space-y-3">
            <div>
              <Label className="text-zinc-300 text-xs">User ID (UUID)</Label>
              <Input
                value={topupUserId}
                onChange={(e) => setTopupUserId(e.target.value)}
                placeholder="xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx"
                className="mt-1 bg-zinc-800 border-zinc-700 text-zinc-200 placeholder:text-zinc-500 text-xs"
              />
            </div>
            <div>
              <Label className="text-zinc-300 text-xs">Số tiền (₫)</Label>
              <Input
                type="number"
                min="1"
                value={topupAmount}
                onChange={(e) => setTopupAmount(e.target.value)}
                placeholder="50000"
                className="mt-1 bg-zinc-800 border-zinc-700 text-zinc-200 placeholder:text-zinc-500"
              />
            </div>
            <div>
              <Label className="text-zinc-300 text-xs">Ghi chú (tùy chọn)</Label>
              <Input
                value={topupNote}
                onChange={(e) => setTopupNote(e.target.value)}
                placeholder="Admin cộng tiền thủ công"
                className="mt-1 bg-zinc-800 border-zinc-700 text-zinc-200 placeholder:text-zinc-500"
              />
            </div>
            <Button type="submit" disabled={toppingUp} className="w-full">
              {toppingUp ? 'Đang xử lý...' : 'Cộng tiền'}
            </Button>
          </form>
        </div>
      </div>

      {/* Transaction History */}
      <div>
        <div className="flex items-center gap-2 mb-4">
          <Wallet className="h-4 w-4 text-accent" />
          <h2 className="text-base font-semibold text-white">Lịch sử giao dịch</h2>
        </div>
        <div className="rounded-xl border border-zinc-800 bg-zinc-900 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-zinc-800 bg-zinc-800/50">
                  <th className="px-4 py-3 text-left text-xs font-medium text-zinc-500 uppercase">ID</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-zinc-500 uppercase">User ID</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-zinc-500 uppercase">Loại</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-zinc-500 uppercase">Số tiền</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-zinc-500 uppercase">Trạng thái</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-zinc-500 uppercase">Ghi chú</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-zinc-500 uppercase">Thời gian</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-800">
                {transactions.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="px-4 py-12 text-center text-zinc-600">
                      Chưa có giao dịch nào
                    </td>
                  </tr>
                ) : (
                  transactions.map((txn) => (
                    <tr key={txn.id} className="hover:bg-zinc-800/40 transition-colors">
                      <td className="px-4 py-3 text-zinc-400 text-xs font-mono">{txn.id}</td>
                      <td className="px-4 py-3 text-zinc-400 text-xs font-mono max-w-[120px] truncate">
                        {txn.user_id}
                      </td>
                      <td className="px-4 py-3">
                        <span className={`rounded-full px-2 py-0.5 text-xs font-medium ${
                          txn.type === 'deposit' || txn.type === 'topup'
                            ? 'bg-green-500/20 text-green-400'
                            : 'bg-red-500/20 text-red-400'
                        }`}>
                          {txn.type}
                        </span>
                      </td>
                      <td className={`px-4 py-3 font-semibold text-sm ${txn.amount > 0 ? 'text-green-400' : 'text-red-400'}`}>
                        {txn.amount > 0 ? '+' : ''}{txn.amount.toLocaleString('vi-VN')}₫
                      </td>
                      <td className="px-4 py-3">
                        <span className={`rounded-full px-2 py-0.5 text-xs font-medium ${
                          txn.status === 'completed'
                            ? 'bg-green-500/20 text-green-400'
                            : txn.status === 'pending'
                            ? 'bg-yellow-500/20 text-yellow-400'
                            : 'bg-red-500/20 text-red-400'
                        }`}>
                          {txn.status}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-zinc-400 text-xs max-w-[180px] truncate">{txn.note ?? '—'}</td>
                      <td className="px-4 py-3 text-zinc-500 text-xs">
                        {new Date(txn.created_at).toLocaleString('vi-VN')}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  )
}
