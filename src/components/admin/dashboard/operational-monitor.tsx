import { AlertCircle, PackageCheck, PowerOff } from "lucide-react"
import { Badge } from "@/components/ui/badge"

export function OperationalMonitor({ products, toppings }: { products: any[], toppings: any[] }) {
  // Assertividade: Alerta apenas o que está CRÍTICO (menos de 15 unidades)
  const lowStockToppings = toppings.filter(t => t.stock < 15)
  const inactiveProducts = products.filter(p => !p.available)

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      {/* Alertas de Estoque */}
      <div className="bg-white dark:bg-neutral-900 p-6 rounded-[32px] border-2 border-red-100 dark:border-red-900/20 shadow-sm">
        <h3 className="flex items-center gap-2 font-bold text-red-600 mb-4">
          <AlertCircle className="h-5 w-5" /> Crítico: Reposição Necessária
        </h3>
        <div className="space-y-3">
          {lowStockToppings.length > 0 ? lowStockToppings.map(t => (
            <div key={t.id} className="flex justify-between items-center p-3 bg-red-50 dark:bg-red-950/20 rounded-xl">
              <span className="text-sm font-medium">{t.name}</span>
              <Badge variant="destructive">{t.stock} un</Badge>
            </div>
          )) : (
            <p className="text-sm text-neutral-500 text-center py-4">Tudo sob controle no estoque!</p>
          )}
        </div>
      </div>

      {/* Monitor de Cardápio */}
      <div className="bg-white dark:bg-neutral-900 p-6 rounded-[32px] border-2 border-neutral-100 dark:border-neutral-800 shadow-sm">
        <h3 className="flex items-center gap-2 font-bold text-neutral-900 dark:text-white mb-4">
          <PowerOff className="h-5 w-5" /> Itens Pausados
        </h3>
        <div className="flex flex-wrap gap-2">
          {inactiveProducts.length > 0 ? inactiveProducts.map(p => (
            <Badge key={p.id} variant="outline" className="px-3 py-1 border-neutral-300">
              {p.name}
            </Badge>
          )) : (
            <p className="text-sm text-neutral-500">Todos os produtos estão ativos.</p>
          )}
        </div>
      </div>
    </div>
  )
}