// app/admin/estoque/page.tsx
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { ProductStockManager } from "@/components/admin/stock/product-stock-manager"
import { ToppingStockManager } from "@/components/admin/stock/topping-stock-manager"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Package, Cookie, AlertTriangle } from "lucide-react"
import { Badge } from "@/components/ui/badge"

async function getInventoryData() {
  const [products, toppings, productCategories, toppingCategories] = await Promise.all([
    fetch(`${process.env.NEXT_PUBLIC_API_URL}/products`, { cache: 'no-store' }).then(r => r.json()),
    fetch(`${process.env.NEXT_PUBLIC_API_URL}/toppings`, { cache: 'no-store' }).then(r => r.json()),
    fetch(`${process.env.NEXT_PUBLIC_API_URL}/products/categories`, { cache: 'no-store' }).then(r => r.json()),
    fetch(`${process.env.NEXT_PUBLIC_API_URL}/toppings/categories`, { cache: 'no-store' }).then(r => r.json())
  ])

  return { products, toppings, productCategories, toppingCategories }
}

export default async function StockPage() {
  const { products, toppings, productCategories, toppingCategories } = await getInventoryData()

  // Contar items com estoque baixo
  const lowStockProducts = products.filter((p: any) => p.stock !== null && p.stock < 10).length
  const lowStockToppings = toppings.filter((t: any) => t.stock !== null && t.stock < 10).length
  const totalLowStock = lowStockProducts + lowStockToppings

  return (
    <div className="min-h-screen bg-neutral-50 dark:bg-neutral-950">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6 sm:py-8">
        {/* Header */}
        <div className="mb-6 sm:mb-8">
          <h1 className="text-2xl sm:text-3xl font-bold text-neutral-900 dark:text-neutral-100">
            Gerenciar Estoque
          </h1>
          <p className="text-sm sm:text-base text-neutral-600 dark:text-neutral-400 mt-1">
            Controle o estoque de produtos e toppings
          </p>
        </div>

        {/* Stats */}
        <div className="grid gap-4 md:grid-cols-3 mb-6 sm:mb-8">
          <Card className="border-2 border-neutral-200 dark:border-neutral-800 shadow-sm">
            <CardHeader className="flex flex-row items-center justify-between pb-3">
              <CardTitle className="text-sm font-semibold text-neutral-900 dark:text-neutral-100">
                Total de Produtos
              </CardTitle>
              <div className="p-2 bg-[#9d0094]/10 rounded-lg">
                <Package className="h-5 w-5 text-[#9d0094]" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-neutral-900 dark:text-neutral-100">
                {products.length}
              </div>
              <p className="text-xs text-neutral-600 dark:text-neutral-400 mt-1">
                {products.filter((p: any) => p.available).length} disponíveis
              </p>
            </CardContent>
          </Card>

          <Card className="border-2 border-neutral-200 dark:border-neutral-800 shadow-sm">
            <CardHeader className="flex flex-row items-center justify-between pb-3">
              <CardTitle className="text-sm font-semibold text-neutral-900 dark:text-neutral-100">
                Total de Toppings
              </CardTitle>
              <div className="p-2 bg-[#9d0094]/10 rounded-lg">
                <Cookie className="h-5 w-5 text-[#9d0094]" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-neutral-900 dark:text-neutral-100">
                {toppings.length}
              </div>
              <p className="text-xs text-neutral-600 dark:text-neutral-400 mt-1">
                {toppings.filter((t: any) => t.available).length} disponíveis
              </p>
            </CardContent>
          </Card>

          <Card className={`border-2 shadow-sm ${
            totalLowStock > 0 
              ? 'border-orange-200 dark:border-orange-900/30 bg-orange-50/50 dark:bg-orange-950/20' 
              : 'border-neutral-200 dark:border-neutral-800'
          }`}>
            <CardHeader className="flex flex-row items-center justify-between pb-3">
              <CardTitle className="text-sm font-semibold text-neutral-900 dark:text-neutral-100">
                Estoque Baixo
              </CardTitle>
              <div className={`p-2 rounded-lg ${
                totalLowStock > 0 
                  ? 'bg-orange-100 dark:bg-orange-900/30' 
                  : 'bg-neutral-100 dark:bg-neutral-800'
              }`}>
                <AlertTriangle className={`h-5 w-5 ${
                  totalLowStock > 0 ? 'text-orange-600 dark:text-orange-400' : 'text-neutral-400'
                }`} />
              </div>
            </CardHeader>
            <CardContent>
              <div className={`text-3xl font-bold ${
                totalLowStock > 0 
                  ? 'text-orange-600 dark:text-orange-400' 
                  : 'text-neutral-900 dark:text-neutral-100'
              }`}>
                {totalLowStock}
              </div>
              <p className="text-xs text-neutral-600 dark:text-neutral-400 mt-1">
                {lowStockProducts} produtos, {lowStockToppings} toppings
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Tabs */}
        <Tabs defaultValue="products" className="space-y-4">
          <TabsList className="bg-white dark:bg-neutral-900 border-2 border-neutral-200 dark:border-neutral-800 p-1">
            <TabsTrigger 
              value="products" 
              className="relative data-[state=active]:bg-[#9d0094] data-[state=active]:text-white data-[state=active]:font-semibold"
            >
              <Package className="mr-2 h-4 w-4" />
              Produtos
              {lowStockProducts > 0 && (
                <Badge 
                  variant="destructive" 
                  className="ml-2 h-5 w-5 p-0 text-xs flex items-center justify-center"
                >
                  {lowStockProducts}
                </Badge>
              )}
            </TabsTrigger>
            <TabsTrigger 
              value="toppings" 
              className="relative data-[state=active]:bg-[#9d0094] data-[state=active]:text-white data-[state=active]:font-semibold"
            >
              <Cookie className="mr-2 h-4 w-4" />
              Toppings
              {lowStockToppings > 0 && (
                <Badge 
                  variant="destructive" 
                  className="ml-2 h-5 w-5 p-0 text-xs flex items-center justify-center"
                >
                  {lowStockToppings}
                </Badge>
              )}
            </TabsTrigger>
          </TabsList>

          <TabsContent value="products" className="space-y-4">
            <div className="bg-white dark:bg-neutral-900 rounded-xl border-2 border-neutral-200 dark:border-neutral-800 shadow-sm p-4 sm:p-6 mb-10">
              <ProductStockManager 
                products={products} 
                categories={productCategories}
              />
            </div>
          </TabsContent>

          <TabsContent value="toppings" className="space-y-4">
            <div className="bg-white dark:bg-neutral-900 rounded-xl border-2 border-neutral-200 dark:border-neutral-800 shadow-sm p-4 sm:p-6 mb-10">
              <ToppingStockManager 
                toppings={toppings} 
                categories={toppingCategories}
              />
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}
