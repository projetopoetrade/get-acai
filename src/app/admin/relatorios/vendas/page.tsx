import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { DollarSign, CreditCard, CalendarDays, TrendingUp } from "lucide-react"

export function SalesOverview({ orders }: { orders: any[] }) {
  // 1. Cálculos Totais
  const totalRevenue = orders.reduce((acc, order) => acc + Number(order.total), 0)
  const totalOrders = orders.length
  const averageTicket = totalOrders > 0 ? totalRevenue / totalOrders : 0

  // 2. Agrupamento por Forma de Pagamento
  const paymentStats = orders.reduce((acc: any, order) => {
    const method = order.paymentMethod || 'Outros'
    acc[method] = (acc[method] || 0) + 1
    return acc
  }, {})

  // 3. Vendas dos últimos 7 dias (Simulação de gráfico simples)
  const last7Days = [...Array(7)].map((_, i) => {
    const d = new Date()
    d.setDate(d.getDate() - i)
    const dateStr = d.toLocaleDateString()
    const dailyTotal = orders
      .filter(o => new Date(o.createdAt).toLocaleDateString() === dateStr)
      .reduce((acc, o) => acc + Number(o.total), 0)
    return { date: dateStr.slice(0, 5), value: dailyTotal }
  }).reverse()

  return (
    <div className="space-y-6">
      {/* KPIs Principais */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Receita Total</CardTitle>
            <DollarSign className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">R$ {totalRevenue.toFixed(2)}</div>
            <p className="text-xs text-muted-foreground">{totalOrders} pedidos concluídos</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Ticket Médio</CardTitle>
            <TrendingUp className="h-4 w-4 text-[#9d0094]" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">R$ {averageTicket.toFixed(2)}</div>
            <p className="text-xs text-muted-foreground">Média por pedido</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Método Principal</CardTitle>
            <CreditCard className="h-4 w-4 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold capitalize">
              {Object.entries(paymentStats).sort((a:any,b:any) => b[1]-a[1])[0]?.[0] || '-'}
            </div>
            <p className="text-xs text-muted-foreground">O preferido dos clientes</p>
          </CardContent>
        </Card>
      </div>

      {/* Mini Gráfico de Barras CSS (Últimos 7 dias) */}
      <Card className="p-6">
        <h3 className="font-semibold mb-6">Faturamento Recente (7 dias)</h3>
        <div className="flex items-end justify-between gap-2 h-40">
          {last7Days.map((day, i) => {
            // Calcula altura relativa (max 100%)
            const maxVal = Math.max(...last7Days.map(d => d.value)) || 1
            const height = (day.value / maxVal) * 100
            return (
              <div key={i} className="flex flex-col items-center gap-2 flex-1 group">
                <div className="text-xs font-bold opacity-0 group-hover:opacity-100 transition-opacity">
                  R${Math.round(day.value)}
                </div>
                <div 
                  className="w-full bg-[#9d0094] rounded-t-sm opacity-80 hover:opacity-100 transition-all min-h-[4px]"
                  style={{ height: `${height}%` }}
                />
                <span className="text-[10px] text-neutral-500">{day.date}</span>
              </div>
            )
          })}
        </div>
      </Card>
    </div>
  )
}