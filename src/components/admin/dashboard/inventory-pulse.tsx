import { Badge } from "@/components/ui/badge"

export function InventoryPulse({ toppings }: { toppings: any[] }) {
  // Ordena por estoque mais baixo para destacar o que é crítico
  const sortedToppings = [...toppings].sort((a, b) => a.stock - b.stock).slice(0, 6)

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h3 className="text-xs font-bold uppercase tracking-widest text-neutral-400">Pulso de Estoque</h3>
        <Badge variant="outline" className="text-[10px] border-neutral-200">6 Críticos</Badge>
      </div>

      <div className="space-y-5">
        {sortedToppings.map((item) => (
          <div key={item.id} className="space-y-1.5">
            <div className="flex justify-between text-sm">
              <span className="font-medium text-neutral-700 dark:text-neutral-300">{item.name}</span>
              <span className={item.stock < 10 ? "text-red-500 font-bold" : "text-neutral-500"}>
                {item.stock} un
              </span>
            </div>
            {/* Mini barra de progresso minimalista */}
            <div className="h-1 w-full bg-neutral-100 dark:bg-neutral-800 rounded-full overflow-hidden">
              <div 
                className={`h-full transition-all duration-500 ${
                  item.stock < 10 ? "bg-red-500" : item.stock < 20 ? "bg-amber-400" : "bg-neutral-300"
                }`}
                style={{ width: `${Math.min((item.stock / 50) * 100, 100)}%` }}
              />
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}