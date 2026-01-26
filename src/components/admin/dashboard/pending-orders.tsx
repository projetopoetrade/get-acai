import { Clock } from "lucide-react"
import { Button } from "@/components/ui/button"

export function PendingOrders({ orders }: any) {
  const pending = orders.filter((o: any) => o.status === 'PENDING')

  return (
    <div className="bg-white p-6 rounded-xl border border-neutral-200 shadow-sm">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h3 className="font-bold text-neutral-900">Pedidos Pendentes</h3>
          <p className="text-xs text-neutral-500">{pending.length} pedidos aguardando confirmação</p>
        </div>
        <Button variant="outline" size="sm" className="rounded-lg">Ver Todos</Button>
      </div>

      <div className="flex flex-col items-center justify-center py-10 text-neutral-400">
        <Clock className="h-12 w-12 mb-3 opacity-20" />
        <p className="text-sm">Nenhum pedido pendente</p>
      </div>
    </div>
  )
}