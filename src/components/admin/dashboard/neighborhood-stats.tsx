import { MapPin } from "lucide-react"

export function NeighborhoodStats({ orders, neighborhoods }: { orders: any[], neighborhoods: any[] }) {
  // Agrupa pedidos por bairro para ver a demanda logística
  const neighborhoodDemand = orders.reduce((acc: any, order) => {
    const name = order.address?.neighborhood?.name || "Balcão"
    acc[name] = (acc[name] || 0) + 1
    return acc
  }, {})

  const topNeighborhoods = Object.entries(neighborhoodDemand)
    .sort(([, a]: any, [, b]: any) => b - a)
    .slice(0, 5)

  return (
    <div className="bg-white dark:bg-neutral-900 p-6 rounded-[32px] border-2 border-neutral-100 shadow-sm">
      <h3 className="flex items-center gap-2 font-bold text-neutral-900 mb-6">
        <MapPin className="h-5 w-5 text-[#9d0094]" /> Onde os pedidos estão saindo
      </h3>
      <div className="space-y-4">
        {topNeighborhoods.map(([name, count]: any) => (
          <div key={name} className="space-y-2">
            <div className="flex justify-between text-sm font-medium">
              <span>{name}</span>
              <span>{count} pedidos</span>
            </div>
            {/* Barra de progresso visual simples */}
            <div className="w-full bg-neutral-100 h-2 rounded-full overflow-hidden">
              <div 
                className="bg-[#9d0094] h-full transition-all duration-1000" 
                style={{ width: `${(count / orders.length) * 100}%` }}
              />
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}