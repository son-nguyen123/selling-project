import { createClient } from '@/lib/supabase/server'
import Link from 'next/link'
import { Plus } from 'lucide-react'
import AdminProductActions from './product-actions'

const PAGE_SIZE = 20

export default async function AdminProductsPage({
  searchParams,
}: {
  searchParams: Promise<{ page?: string }>
}) {
  const { page: pageStr } = await searchParams
  const page = Math.max(1, parseInt(pageStr ?? '1', 10))
  const from = (page - 1) * PAGE_SIZE
  const to = from + PAGE_SIZE - 1

  const supabase = await createClient()
  const { data: products, count } = await supabase
    .from('store_products')
    .select('id, name, category, price, stock, created_at', { count: 'exact' })
    .order('created_at', { ascending: false })
    .range(from, to)

  const totalPages = Math.ceil((count ?? 0) / PAGE_SIZE)

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-white">Quản lý sản phẩm</h1>
        <Link
          href="/admin/products/new"
          className="flex items-center gap-1.5 rounded-md bg-accent hover:bg-accent/90 text-white text-xs font-medium px-3 py-2 transition-colors"
        >
          <Plus className="h-3.5 w-3.5" />
          Thêm sản phẩm mới
        </Link>
      </div>

      <div className="rounded-xl border border-zinc-800 bg-zinc-900 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-zinc-800 bg-zinc-800/50">
                <th className="px-4 py-3 text-left text-xs font-medium text-zinc-500 uppercase tracking-wider">Tên sản phẩm</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-zinc-500 uppercase tracking-wider">Danh mục</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-zinc-500 uppercase tracking-wider">Giá</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-zinc-500 uppercase tracking-wider">Tồn kho</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-zinc-500 uppercase tracking-wider">Ngày tạo</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-zinc-500 uppercase tracking-wider">Thao tác</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-800">
              {(products ?? []).map((product) => (
                <tr key={product.id} className="hover:bg-zinc-800/40 transition-colors">
                  <td className="px-4 py-3 font-medium text-zinc-200">
                    <Link href={`/admin/products/${product.id}`} className="hover:text-accent hover:underline">
                      {product.name}
                    </Link>
                  </td>
                  <td className="px-4 py-3">
                    {product.category ? (
                      <span className="rounded-full bg-zinc-700 text-zinc-300 text-xs px-2.5 py-0.5">{product.category}</span>
                    ) : (
                      <span className="text-zinc-600">—</span>
                    )}
                  </td>
                  <td className="px-4 py-3 font-medium text-white">${product.price.toFixed(2)}</td>
                  <td className="px-4 py-3">
                    <span className={product.stock > 0 ? 'text-green-400' : 'text-red-400'}>
                      {product.stock}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-zinc-500 text-xs">
                    {new Date(product.created_at).toLocaleDateString('vi-VN')}
                  </td>
                  <td className="px-4 py-3">
                    <AdminProductActions productId={product.id} />
                  </td>
                </tr>
              ))}
              {(products ?? []).length === 0 && (
                <tr>
                  <td colSpan={6} className="px-4 py-12 text-center text-zinc-600">
                    Chưa có sản phẩm nào.{' '}
                    <Link href="/admin/products/new" className="text-accent hover:underline">
                      Thêm ngay
                    </Link>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex justify-center gap-2">
          {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => (
            <Link
              key={p}
              href={`/admin/products?page=${p}`}
              className={`rounded px-3 py-1.5 text-sm font-medium transition-colors ${
                p === page
                  ? 'bg-accent text-white'
                  : 'bg-zinc-800 text-zinc-400 hover:bg-zinc-700'
              }`}
            >
              {p}
            </Link>
          ))}
        </div>
      )}
    </div>
  )
}

