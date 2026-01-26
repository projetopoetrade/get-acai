import { DollarSign, ShoppingCart, TrendingUp, Package } from "lucide-react"

// ✅ Definimos exatamente o que o componente pode receber
interface OverviewProps {
  orders: any[];
  products: any[];
  toppings: any[];
}

export function DashboardOverview({ orders, products, toppings }: OverviewProps) {
  const today = new Date().toLocaleDateString()
  
  const todayOrders = orders.filter((o: any) => 
    new Date(o.createdAt).toLocaleDateString() === today && o.status !== 'CANCELLED'
  )

  const vendasHoje = todayOrders.reduce((acc: number, o: any) => acc + Number(o.total), 0)
  const pedidosHoje = todayOrders.length
  
  // $$Ticket\ Médio = \frac{\sum Vendas\ Reais}{Total\ de\ Pedidos}$$
  const ticketMedio = pedidosHoje > 0 ? vendasHoje / pedidosHoje : 0
  const produtosAtivos = products.filter((p: any) => p.available).length

  const cards = [
    { label: "Vendas Hoje", value: `R$ ${vendasHoje.toFixed(2)}`, icon: DollarSign, color: "text-purple-600", bg: "bg-purple-50" },
    { label: "Pedidos Hoje", value: pedidosHoje, icon: ShoppingCart, color: "text-pink-600", bg: "bg-pink-50" },
    { label: "Ticket Médio", value: `R$ ${ticketMedio.toFixed(2)}`, icon: TrendingUp, color: "text-purple-600", bg: "bg-purple-50" },
    { label: "Produtos Ativos", value: produtosAtivos, icon: Package, color: "text-purple-600", bg: "bg-purple-50", sub: `${toppings.length} toppings` },
  ]

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
      {cards.map((card, i) => (
        <div key={i} className="bg-white p-6 rounded-xl border border-neutral-200 shadow-sm flex justify-between items-start">
          <div>
            <p className="text-sm font-medium text-neutral-500 mb-4">{card.label}</p>
            <h3 className="text-2xl font-bold text-neutral-900">{card.value}</h3>
            {card.sub && <p className="text-xs text-neutral-400 mt-1">{card.sub}</p>}
          </div>
          <div className={`p-2 rounded-lg ${card.bg}`}>
            <card.icon className={`h-5 w-5 ${card.color}`} />
          </div>
        </div>
      ))}
    </div>
  )
}