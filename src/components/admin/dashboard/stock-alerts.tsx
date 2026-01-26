import { PackageCheck, AlertTriangle } from "lucide-react"

interface StockAlertsProps {
  products: any[];
  toppings: any[];
}

export function StockAlerts({ products, toppings }: StockAlertsProps) {
  // Assertividade: Itens com menos de 10 unidades
  const lowStockProducts = products.filter(p => p.stock < 10);
  const lowStockToppings = toppings.filter(t => t.stock < 10);
  
  const allLowStock = [...lowStockProducts, ...lowStockToppings];
  const isOk = allLowStock.length === 0;

  return (
    <div className="bg-white p-6 rounded-xl border border-neutral-200 shadow-sm h-full">
      <div className="mb-6">
        <h3 className="font-bold text-neutral-900">Alertas de Estoque</h3>
        <p className="text-xs text-neutral-500">Produtos e toppings com estoque baixo (menos de 10 unidades)</p>
      </div>

      {isOk ? (
        <div className="flex items-center gap-3 p-4 bg-green-50 border border-green-100 rounded-lg text-green-700">
          <PackageCheck className="h-5 w-5" />
          <p className="text-sm font-medium">Todos os itens estão com estoque adequado!</p>
        </div>
      ) : (
        <div className="space-y-3">
          {allLowStock.map((item, i) => (
            <div key={i} className="flex items-center justify-between p-3 bg-red-50 border border-red-100 rounded-lg text-red-700">
              <div className="flex items-center gap-2">
                <AlertTriangle className="h-4 w-4" />
                <span className="text-sm font-medium">{item.name}</span>
              </div>
              <span className="text-xs font-bold">{item.stock} un</span>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}