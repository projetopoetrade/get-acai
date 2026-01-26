import { MapPin, Zap } from "lucide-react"

export function LogisticsMiniMap({ orders }: { orders: any[] }) {
  // Lógica: Calcula os 4 bairros com mais pedidos em Camaçari
  const hotspots = orders.reduce((acc: any, order) => {
    const neighborhood = order.address?.neighborhood?.name || "Balcão"
    acc[neighborhood] = (acc[neighborhood] || 0) + 1
    return acc
  }, {})

  const sortedHotspots = Object.entries(hotspots)
    .sort(([, a]: any, [, b]: any) => b - a)
    .slice(0, 4)

  return (
    <div className="space-y-6">
      <h3 className="text-xs font-bold uppercase tracking-widest text-neutral-400">Zonas Ativas (Camaçari)</h3>
      
      <div className="grid gap-4">
        {sortedHotspots.map(([name, count]: any) => (
          <div key={name} className="flex items-center justify-between p-3 rounded-2xl bg-neutral-50 dark:bg-neutral-900/50 border border-neutral-100 dark:border-neutral-800">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-white dark:bg-neutral-800 rounded-lg shadow-sm">
                <MapPin className="h-3.5 w-3.5 text-[#9d0094]" />
              </div>
              <div>
                <p className="text-xs font-bold text-neutral-800 dark:text-neutral-200">{name}</p>
                <p className="text-[10px] text-neutral-500">{count} entregas hoje</p>
              </div>
            </div>
            {count > 3 && (
              <Zap className="h-3 w-3 text-amber-500 fill-amber-500" aria-label="Alta Demanda" />
            )}
          </div>
        ))}

        {sortedHotspots.length === 0 && (
          <p className="text-xs text-neutral-500 text-center py-4 italic">Aguardando primeiros pedidos...</p>
        )}
      </div>
    </div>
  )
}