import { Card } from '@/components/ui/card'
import ProductForm from '../product-form'

export default function NewProductPage() {
  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-foreground">Add New Product</h1>
      <Card className="p-6">
        <ProductForm mode="create" />
      </Card>
    </div>
  )
}
