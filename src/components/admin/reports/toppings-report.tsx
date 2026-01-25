// components/admin/reports/toppings-report.tsx
'use client'

import { useMemo } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"

interface ToppingsReportProps {
  orders: any[]
  toppings: any[]
}

export function ToppingsReport({ orders, toppings }: ToppingsReportProps) {
  const stats = useMemo(() => {
    const toppingSales: Record<string, { count: number; revenue: number; topping: any }> = {}

    orders.forEach(order => {
      if (order.status === 'cancelled') return

      order.items?.forEach((item: any) => {
        item.toppings?.forEach((topping: any) => {
          const toppingId = topping.id || topping.toppingId
          if (!toppingId) return

          if (!toppingSales[toppingId]) {
            toppingSales[toppingId] = {
              count: 0,
              revenue: 0,
              topping: topping || toppings.find(t => t.id === toppingId)
            }
          }

          toppingSales[toppingId].count += topping.quantity || 1
          if (!topping.isFree) {
            toppingSales[toppingId].revenue += parseFloat(topping.price || 0) * (topping.quantity || 1)
          }
        })
      })
    })

    const sortedToppings = Object.values(toppingSales)
      .sort((a, b) => b.count - a.count)

    const topToppings = sortedToppings.slice(0, 10)
    const totalToppingsSold = sortedToppings.reduce((sum, t) => sum + t.count, 0)
    const totalToppingsRevenue = sortedToppings.reduce((sum, t) => sum + t.revenue, 0)

    return { topToppings, totalToppingsSold, totalToppingsRevenue, sortedToppings }
  }, [orders, toppings])

  return (
    <div className="space-y-4">
      {/* Stats */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card className="border-2 border-neutral-200 dark:border-neutral-800 shadow-sm">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-semibold text-neutral-900 dark:text-neutral-100">Total de Toppings</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-neutral-900 dark:text-neutral-100">{stats.totalToppingsSold}</div>
            <p className="text-xs text-neutral-600 dark:text-neutral-400 mt-1">
              Unidades adicionadas
            </p>
          </CardContent>
        </Card>

        <Card className="border-2 border-neutral-200 dark:border-neutral-800 shadow-sm">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-semibold text-neutral-900 dark:text-neutral-100">Receita com Toppings</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-neutral-900 dark:text-neutral-100">
              {new Intl.NumberFormat('pt-BR', {
                style: 'currency',
                currency: 'BRL'
              }).format(stats.totalToppingsRevenue)}
            </div>
            <p className="text-xs text-neutral-600 dark:text-neutral-400 mt-1">
              Toppings pagos
            </p>
          </CardContent>
        </Card>

        <Card className="border-2 border-neutral-200 dark:border-neutral-800 shadow-sm">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-semibold text-neutral-900 dark:text-neutral-100">Topping Favorito</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-neutral-900 dark:text-neutral-100">
              {stats.topToppings[0]?.topping?.name || 'N/A'}
            </div>
            <p className="text-xs text-neutral-600 dark:text-neutral-400 mt-1">
              {stats.topToppings[0]?.count || 0} vezes
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Top 10 Toppings */}
      <Card className="border-2 border-neutral-200 dark:border-neutral-800 shadow-sm">
        <CardHeader className="pb-4">
          <CardTitle className="text-lg font-bold text-neutral-900 dark:text-neutral-100">Top 10 Toppings Mais Escolhidos</CardTitle>
          <CardDescription className="text-sm text-neutral-600 dark:text-neutral-400">
            Ranking de toppings mais populares
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            {stats.topToppings.map((item, index) => {
              const percentage = ((item.count / stats.totalToppingsSold) * 100).toFixed(1)
              return (
                <div key={item.topping?.id || index} className="flex items-center gap-4 p-3 border-2 border-neutral-200 dark:border-neutral-800 rounded-lg hover:bg-neutral-50 dark:hover:bg-neutral-900/50 transition-colors">
                  <Badge className="h-8 w-8 flex items-center justify-center text-lg font-semibold">
                    {index + 1}
                  </Badge>

                  <div className="flex-1">
                    <p className="font-semibold text-neutral-900 dark:text-neutral-100">{item.topping?.name || 'Topping não identificado'}</p>
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

      {/* Toppings por Categoria */}
      <Card className="border-2 border-neutral-200 dark:border-neutral-800 shadow-sm">
        <CardHeader className="pb-4">
          <CardTitle className="text-lg font-bold text-neutral-900 dark:text-neutral-100">Por Categoria</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            {Object.entries(
              stats.sortedToppings.reduce((acc, item) => {
                const category = item.topping?.category?.name || 'Sem categoria'
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
