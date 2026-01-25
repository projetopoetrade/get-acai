// components/admin/reports/customers-report.tsx
'use client'

import { useMemo } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"

interface CustomersReportProps {
  orders: any[]
}

export function CustomersReport({ orders }: CustomersReportProps) {
  const stats = useMemo(() => {
    const customerOrders: Record<string, { count: number; total: number; user: any; neighborhoods: string[] }> = {}

    orders.forEach(order => {
      if (order.status === 'cancelled') return

      const userId = order.user?.id || order.userId
      if (!userId) return

      if (!customerOrders[userId]) {
        customerOrders[userId] = {
          count: 0,
          total: 0,
          user: order.user,
          neighborhoods: []
        }
      }

      customerOrders[userId].count += 1
      customerOrders[userId].total += parseFloat(order.total || 0)
      
      if (order.address?.neighborhood && !customerOrders[userId].neighborhoods.includes(order.address.neighborhood)) {
        customerOrders[userId].neighborhoods.push(order.address.neighborhood)
      }
    })

    const sortedCustomers = Object.values(customerOrders)
      .sort((a, b) => b.total - a.total)

    const topCustomers = sortedCustomers.slice(0, 10)
    const totalCustomers = sortedCustomers.length

    // Bairros mais atendidos
    const neighborhoodCount: Record<string, number> = {}
    orders.forEach(order => {
      if (order.status === 'cancelled' || !order.address?.neighborhood) return
      neighborhoodCount[order.address.neighborhood] = (neighborhoodCount[order.address.neighborhood] || 0) + 1
    })

    const topNeighborhoods = Object.entries(neighborhoodCount)
      .sort(([, a], [, b]) => b - a)
      .slice(0, 5)

    return { topCustomers, totalCustomers, topNeighborhoods }
  }, [orders])

  return (
    <div className="space-y-4">
      {/* Stats */}
      <div className="grid gap-4 md:grid-cols-2">
        <Card className="border-2 border-neutral-200 dark:border-neutral-800 shadow-sm">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-semibold text-neutral-900 dark:text-neutral-100">Total de Clientes</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-neutral-900 dark:text-neutral-100">{stats.totalCustomers}</div>
            <p className="text-xs text-neutral-600 dark:text-neutral-400 mt-1">
              Clientes únicos
            </p>
          </CardContent>
        </Card>

        <Card className="border-2 border-neutral-200 dark:border-neutral-800 shadow-sm">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-semibold text-neutral-900 dark:text-neutral-100">Melhor Cliente</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-neutral-900 dark:text-neutral-100">
              {stats.topCustomers[0]?.user?.name || 'N/A'}
            </div>
            <p className="text-xs text-neutral-600 dark:text-neutral-400 mt-1">
              {new Intl.NumberFormat('pt-BR', {
                style: 'currency',
                currency: 'BRL'
              }).format(stats.topCustomers[0]?.total || 0)} em pedidos
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Top Clientes */}
      <Card className="border-2 border-neutral-200 dark:border-neutral-800 shadow-sm">
        <CardHeader className="pb-4">
          <CardTitle className="text-lg font-bold text-neutral-900 dark:text-neutral-100">Top 10 Clientes</CardTitle>
          <CardDescription className="text-sm text-neutral-600 dark:text-neutral-400">
            Clientes com maior valor em pedidos
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            {stats.topCustomers.map((item, index) => (
              <div key={item.user?.id || index} className="flex items-center gap-4 p-3 border-2 border-neutral-200 dark:border-neutral-800 rounded-lg hover:bg-neutral-50 dark:hover:bg-neutral-900/50 transition-colors">
                <Badge className={`h-8 w-8 flex items-center justify-center text-lg font-semibold ${index === 0 ? 'bg-yellow-500 text-white' : ''}`}>
                  {index + 1}
                </Badge>

                <div className="flex-1">
                  <p className="font-semibold text-neutral-900 dark:text-neutral-100">{item.user?.name || 'Cliente não identificado'}</p>
                  <div className="flex items-center gap-2 text-sm text-neutral-600 dark:text-neutral-400">
                    <span>{item.count} pedidos</span>
                    {item.user?.phone && (
                      <>
                        <span>•</span>
                        <span>{item.user.phone}</span>
                      </>
                    )}
                  </div>
                </div>

                <div className="text-right">
                  <p className="font-semibold text-neutral-900 dark:text-neutral-100">
                    {new Intl.NumberFormat('pt-BR', {
                      style: 'currency',
                      currency: 'BRL'
                    }).format(item.total)}
                  </p>
                  <p className="text-xs text-neutral-600 dark:text-neutral-400">
                    Média: {new Intl.NumberFormat('pt-BR', {
                      style: 'currency',
                      currency: 'BRL'
                    }).format(item.total / item.count)}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Bairros mais atendidos */}
      <Card className="border-2 border-neutral-200 dark:border-neutral-800 shadow-sm">
        <CardHeader className="pb-4">
          <CardTitle className="text-lg font-bold text-neutral-900 dark:text-neutral-100">Top 5 Bairros</CardTitle>
          <CardDescription className="text-sm text-neutral-600 dark:text-neutral-400">
            Bairros com mais pedidos
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            {stats.topNeighborhoods.map(([neighborhood, count], index) => (
              <div key={neighborhood} className="flex items-center justify-between p-3 border-2 border-neutral-200 dark:border-neutral-800 rounded-lg hover:bg-neutral-50 dark:hover:bg-neutral-900/50 transition-colors">
                <div className="flex items-center gap-3">
                  <Badge variant="outline" className="font-medium">{index + 1}</Badge>
                  <span className="font-semibold text-neutral-900 dark:text-neutral-100">{neighborhood}</span>
                </div>
                <Badge className="font-medium">{count} pedidos</Badge>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
