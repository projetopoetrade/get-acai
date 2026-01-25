// components/admin/reports/products-report.tsx
'use client'

import { useMemo } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"

interface ProductsReportProps {
  orders: any[]
  products: any[]
}

export function ProductsReport({ orders, products }: ProductsReportProps) {
  const stats = useMemo(() => {
    const productSales: Record<string, { count: number; revenue: number; product: any }> = {}

    orders.forEach(order => {
      if (order.status === 'cancelled') return

      order.items?.forEach((item: any) => {
        const productId = item.product?.id || item.productId
        if (!productId) return

        if (!productSales[productId]) {
          productSales[productId] = {
            count: 0,
            revenue: 0,
            product: item.product || products.find(p => p.id === productId)
          }
        }

        productSales[productId].count += item.quantity || 1
        productSales[productId].revenue += parseFloat(item.price || 0)
      })
    })

    const sortedProducts = Object.values(productSales)
      .sort((a, b) => b.count - a.count)

    const topProducts = sortedProducts.slice(0, 10)
    const totalProductsSold = sortedProducts.reduce((sum, p) => sum + p.count, 0)

    return { topProducts, totalProductsSold, sortedProducts }
  }, [orders, products])

  return (
    <div className="space-y-4">
      {/* Stats */}
      <div className="grid gap-4 md:grid-cols-2">
        <Card className="border-2 border-neutral-200 dark:border-neutral-800 shadow-sm">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-semibold text-neutral-900 dark:text-neutral-100">Total de Produtos Vendidos</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-neutral-900 dark:text-neutral-100">{stats.totalProductsSold}</div>
            <p className="text-xs text-neutral-600 dark:text-neutral-400 mt-1">
              {stats.sortedProducts.length} produtos diferentes
            </p>
          </CardContent>
        </Card>

        <Card className="border-2 border-neutral-200 dark:border-neutral-800 shadow-sm">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-semibold text-neutral-900 dark:text-neutral-100">Produto Mais Vendido</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-neutral-900 dark:text-neutral-100">
              {stats.topProducts[0]?.product?.name || 'N/A'}
            </div>
            <p className="text-xs text-neutral-600 dark:text-neutral-400 mt-1">
              {stats.topProducts[0]?.count || 0} unidades vendidas
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Top 10 Produtos */}
      <Card className="border-2 border-neutral-200 dark:border-neutral-800 shadow-sm">
        <CardHeader className="pb-4">
          <CardTitle className="text-lg font-bold text-neutral-900 dark:text-neutral-100">Top 10 Produtos Mais Vendidos</CardTitle>
          <CardDescription className="text-sm text-neutral-600 dark:text-neutral-400">
            Ranking de produtos por quantidade vendida
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            {stats.topProducts.map((item, index) => {
              const percentage = ((item.count / stats.totalProductsSold) * 100).toFixed(1)
              return (
                <div key={item.product?.id || index} className="flex items-center gap-4 p-3 border-2 border-neutral-200 dark:border-neutral-800 rounded-lg hover:bg-neutral-50 dark:hover:bg-neutral-900/50 transition-colors">
                  <Badge className="h-8 w-8 flex items-center justify-center text-lg font-semibold">
                    {index + 1}
                  </Badge>
                  
                  <div className="flex-1">
                    <p className="font-semibold text-neutral-900 dark:text-neutral-100">{item.product?.name || 'Produto não identificado'}</p>
                    <div className="flex items-center gap-2 text-sm text-neutral-600 dark:text-neutral-400">
                      <span>{item.count} unidades</span>
                      <span>•</span>
                      <span>{percentage}% do total</span>
                    </div>
                  </div>

                  <div className="text-right">
                    <p className="font-semibold text-neutral-900 dark:text-neutral-100">
                      {new Intl.NumberFormat('pt-BR', {
                        style: 'currency',
                        currency: 'BRL'
                      }).format(item.revenue)}
                    </p>
                    <p className="text-xs text-neutral-600 dark:text-neutral-400">em vendas</p>
                  </div>
                </div>
              )
            })}
          </div>
        </CardContent>
      </Card>

      {/* Produtos por Categoria */}
      <Card className="border-2 border-neutral-200 dark:border-neutral-800 shadow-sm">
        <CardHeader className="pb-4">
          <CardTitle className="text-lg font-bold text-neutral-900 dark:text-neutral-100">Vendas por Categoria</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            {Object.entries(
              stats.sortedProducts.reduce((acc, item) => {
                const category = item.product?.category?.name || 'Sem categoria'
                acc[category] = (acc[category] || 0) + item.count
                return acc
              }, {} as Record<string, number>)
            )
              .sort(([, a], [, b]) => b - a)
              .map(([category, count]) => (
                <div key={category} className="flex items-center justify-between p-3 border-2 border-neutral-200 dark:border-neutral-800 rounded-lg hover:bg-neutral-50 dark:hover:bg-neutral-900/50 transition-colors">
                  <span className="font-semibold text-neutral-900 dark:text-neutral-100">{category}</span>
                  <Badge variant="outline" className="font-medium">{count} unidades</Badge>
                </div>
              ))}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
