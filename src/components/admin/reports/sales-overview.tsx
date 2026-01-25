// components/admin/reports/sales-overview.tsx
'use client'

import { useMemo, useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Download } from "lucide-react"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"

interface SalesOverviewProps {
  orders: any[]
}

export function SalesOverview({ orders }: SalesOverviewProps) {
  const [period, setPeriod] = useState('7days')

  const stats = useMemo(() => {
    const now = new Date()
    const periodDays = period === '7days' ? 7 : period === '30days' ? 30 : 90

    const filteredOrders = orders.filter(order => {
      const orderDate = new Date(order.createdAt)
      const diffTime = Math.abs(now.getTime() - orderDate.getTime())
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))
      return diffDays <= periodDays && order.status !== 'cancelled'
    })

    const totalRevenue = filteredOrders.reduce((sum, order) => {
      return sum + parseFloat(order.total)
    }, 0)

    const totalOrders = filteredOrders.length
    const averageTicket = totalOrders > 0 ? totalRevenue / totalOrders : 0

    // Vendas por dia
    const salesByDay: Record<string, number> = {}
    const ordersByDay: Record<string, number> = {}

    filteredOrders.forEach(order => {
      const date = new Date(order.createdAt).toLocaleDateString('pt-BR')
      salesByDay[date] = (salesByDay[date] || 0) + parseFloat(order.total)
      ordersByDay[date] = (ordersByDay[date] || 0) + 1
    })

    // Vendas por método de pagamento
    const paymentMethods: Record<string, number> = {}
    filteredOrders.forEach(order => {
      const method = order.paymentMethod || 'Não informado'
      paymentMethods[method] = (paymentMethods[method] || 0) + 1
    })

    // Vendas por tipo de entrega
    const deliveryMethods: Record<string, number> = {}
    filteredOrders.forEach(order => {
      const method = order.deliveryMethod === 'delivery' ? 'Delivery' : 'Retirada'
      deliveryMethods[method] = (deliveryMethods[method] || 0) + 1
    })

    // Horários de pico
    const hourlyOrders: Record<number, number> = {}
    filteredOrders.forEach(order => {
      const hour = new Date(order.createdAt).getHours()
      hourlyOrders[hour] = (hourlyOrders[hour] || 0) + 1
    })

    const peakHour = Object.entries(hourlyOrders)
      .sort(([, a], [, b]) => b - a)[0]

    return {
      totalRevenue,
      totalOrders,
      averageTicket,
      salesByDay: Object.entries(salesByDay).map(([date, value]) => ({ date, value })),
      ordersByDay: Object.entries(ordersByDay).map(([date, count]) => ({ date, count })),
      paymentMethods,
      deliveryMethods,
      peakHour: peakHour ? `${peakHour[0]}h - ${parseInt(peakHour[0]) + 1}h` : 'N/A'
    }
  }, [orders, period])

  const exportCSV = () => {
    const csv = [
      ['Data', 'Pedidos', 'Receita'],
      ...stats.salesByDay.map((item, idx) => [
        item.date,
        stats.ordersByDay[idx]?.count || 0,
        item.value.toFixed(2)
      ])
    ].map(row => row.join(',')).join('\n')

    const blob = new Blob([csv], { type: 'text/csv' })
    const url = window.URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `vendas_${period}.csv`
    a.click()
  }

  const periodLabels: Record<string, string> = {
    '7days': 'Últimos 7 dias',
    '30days': 'Últimos 30 dias',
    '90days': 'Últimos 90 dias'
  }

  return (
    <div className="space-y-4">
      {/* Filtros */}
      <Card className="border-2 border-neutral-200 dark:border-neutral-800 shadow-sm">
        <CardContent className="flex items-center justify-between p-4">
          <div className="flex items-center gap-3">
            <span className="text-sm font-semibold text-neutral-900 dark:text-neutral-100">Período:</span>
            <Select value={period} onValueChange={setPeriod}>
              <SelectTrigger className="w-[180px] border-2">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="7days">Últimos 7 dias</SelectItem>
                <SelectItem value="30days">Últimos 30 dias</SelectItem>
                <SelectItem value="90days">Últimos 90 dias</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <Button variant="outline" onClick={exportCSV} className="border-2">
            <Download className="mr-2 h-4 w-4" />
            Exportar CSV
          </Button>
        </CardContent>
      </Card>

      {/* KPIs */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card className="border-2 border-neutral-200 dark:border-neutral-800 shadow-sm">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-semibold text-neutral-900 dark:text-neutral-100">Receita Total</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-neutral-900 dark:text-neutral-100">
              {new Intl.NumberFormat('pt-BR', {
                style: 'currency',
                currency: 'BRL'
              }).format(stats.totalRevenue)}
            </div>
            <p className="text-xs text-neutral-600 dark:text-neutral-400 mt-1">
              {periodLabels[period]}
            </p>
          </CardContent>
        </Card>

        <Card className="border-2 border-neutral-200 dark:border-neutral-800 shadow-sm">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-semibold text-neutral-900 dark:text-neutral-100">Total de Pedidos</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-neutral-900 dark:text-neutral-100">{stats.totalOrders}</div>
            <p className="text-xs text-neutral-600 dark:text-neutral-400 mt-1">
              {periodLabels[period]}
            </p>
          </CardContent>
        </Card>

        <Card className="border-2 border-neutral-200 dark:border-neutral-800 shadow-sm">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-semibold text-neutral-900 dark:text-neutral-100">Ticket Médio</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-neutral-900 dark:text-neutral-100">
              {new Intl.NumberFormat('pt-BR', {
                style: 'currency',
                currency: 'BRL'
              }).format(stats.averageTicket)}
            </div>
            <p className="text-xs text-neutral-600 dark:text-neutral-400 mt-1">
              Por pedido
            </p>
          </CardContent>
        </Card>

        <Card className="border-2 border-neutral-200 dark:border-neutral-800 shadow-sm">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-semibold text-neutral-900 dark:text-neutral-100">Horário de Pico</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-neutral-900 dark:text-neutral-100">{stats.peakHour}</div>
            <p className="text-xs text-neutral-600 dark:text-neutral-400 mt-1">
              Mais pedidos
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Vendas por Dia */}
      <Card className="border-2 border-neutral-200 dark:border-neutral-800 shadow-sm">
        <CardHeader className="pb-4">
          <CardTitle className="text-lg font-bold text-neutral-900 dark:text-neutral-100">Vendas por Dia</CardTitle>
          <CardDescription className="text-sm text-neutral-600 dark:text-neutral-400">
            Receita diária no período
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            {stats.salesByDay.slice(0, 10).map((item, idx) => (
              <div key={item.date} className="flex items-center justify-between p-3 border-2 border-neutral-200 dark:border-neutral-800 rounded-lg hover:bg-neutral-50 dark:hover:bg-neutral-900/50 transition-colors">
                <div className="flex items-center gap-3">
                  <Badge variant="outline" className="font-medium">{item.date}</Badge>
                  <span className="text-sm text-neutral-600 dark:text-neutral-400">
                    {stats.ordersByDay[idx]?.count || 0} pedidos
                  </span>
                </div>
                <span className="font-semibold text-neutral-900 dark:text-neutral-100">
                  {new Intl.NumberFormat('pt-BR', {
                    style: 'currency',
                    currency: 'BRL'
                  }).format(item.value)}
                </span>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Métodos de Pagamento */}
      <div className="grid gap-4 md:grid-cols-2">
        <Card className="border-2 border-neutral-200 dark:border-neutral-800 shadow-sm">
          <CardHeader className="pb-4">
            <CardTitle className="text-lg font-bold text-neutral-900 dark:text-neutral-100">Métodos de Pagamento</CardTitle>
            <CardDescription className="text-sm text-neutral-600 dark:text-neutral-400">
              Distribuição por forma de pagamento
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {Object.entries(stats.paymentMethods).map(([method, count]) => {
                const percentage = (count / stats.totalOrders * 100).toFixed(1)
                const methodLabels: Record<string, string> = {
                  cash: 'Dinheiro',
                  credit_card: 'Cartão de Crédito',
                  debit_card: 'Cartão de Débito',
                  pix: 'PIX'
                }
                return (
                  <div key={method} className="flex items-center justify-between p-3 border-2 border-neutral-200 dark:border-neutral-800 rounded-lg hover:bg-neutral-50 dark:hover:bg-neutral-900/50 transition-colors">
                    <span className="text-sm font-medium text-neutral-900 dark:text-neutral-100">{methodLabels[method] || method}</span>
                    <div className="flex items-center gap-2">
                      <span className="text-sm text-neutral-600 dark:text-neutral-400">{count} pedidos</span>
                      <Badge className="font-medium">{percentage}%</Badge>
                    </div>
                  </div>
                )
              })}
            </div>
          </CardContent>
        </Card>

        <Card className="border-2 border-neutral-200 dark:border-neutral-800 shadow-sm">
          <CardHeader className="pb-4">
            <CardTitle className="text-lg font-bold text-neutral-900 dark:text-neutral-100">Tipo de Entrega</CardTitle>
            <CardDescription className="text-sm text-neutral-600 dark:text-neutral-400">
              Delivery vs Retirada
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {Object.entries(stats.deliveryMethods).map(([method, count]) => {
                const percentage = (count / stats.totalOrders * 100).toFixed(1)
                return (
                  <div key={method} className="flex items-center justify-between p-3 border-2 border-neutral-200 dark:border-neutral-800 rounded-lg hover:bg-neutral-50 dark:hover:bg-neutral-900/50 transition-colors">
                    <span className="text-sm font-medium text-neutral-900 dark:text-neutral-100">{method}</span>
                    <div className="flex items-center gap-2">
                      <span className="text-sm text-neutral-600 dark:text-neutral-400">{count} pedidos</span>
                      <Badge className="font-medium">{percentage}%</Badge>
                    </div>
                  </div>
                )
              })}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
