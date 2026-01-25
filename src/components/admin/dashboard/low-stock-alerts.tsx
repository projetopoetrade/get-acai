// components/admin/dashboard/low-stock-alerts.tsx
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { AlertTriangle, Package, Plus } from "lucide-react"
import Link from "next/link"
import { Alert, AlertDescription } from "@/components/ui/alert"

async function getLowStockItems() {
  const [productsRes, toppingsRes] = await Promise.all([
    fetch(`${process.env.NEXT_PUBLIC_API_URL}/products/stock/low`, {
      headers: {
        'Authorization': `Bearer ${process.env.ADMIN_TOKEN}`
      },
      cache: 'no-store'
    }),
    fetch(`${process.env.NEXT_PUBLIC_API_URL}/toppings/stock/low`, {
      headers: {
        'Authorization': `Bearer ${process.env.ADMIN_TOKEN}`
      },
      cache: 'no-store'
    })
  ])

  const products = productsRes.ok ? await productsRes.json() : []
  const toppings = toppingsRes.ok ? await toppingsRes.json() : []

  return { products, toppings }
}

export async function LowStockAlerts() {
  const { products, toppings } = await getLowStockItems()
  const totalAlerts = products.length + toppings.length

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <div>
          <CardTitle className="flex items-center gap-2">
            Alertas de Estoque
            {totalAlerts > 0 && (
              <Badge variant="destructive" className="ml-2">
                {totalAlerts}
              </Badge>
            )}
          </CardTitle>
          <CardDescription>
            Produtos e toppings com estoque baixo (menos de 10 unidades)
          </CardDescription>
        </div>
      </CardHeader>
      <CardContent>
        {totalAlerts === 0 ? (
          <Alert className="border-green-200 bg-green-50">
            <Package className="h-4 w-4 text-green-600" />
            <AlertDescription className="text-green-800">
              Todos os itens estão com estoque adequado!
            </AlertDescription>
          </Alert>
        ) : (
          <div className="space-y-4">
            {/* Produtos com estoque baixo */}
            {products.length > 0 && (
              <div>
                <div className="flex items-center justify-between mb-2">
                  <h4 className="text-sm font-semibold">Produtos</h4>
                  <Link href="/admin/produtos/estoque">
                    <Button variant="ghost" size="sm">
                      Ver Todos
                    </Button>
                  </Link>
                </div>
                <div className="space-y-2">
                  {products.map((product: any) => (
                    <div
                      key={product.id}
                      className="flex items-center justify-between p-3 border rounded-md bg-orange-50 border-orange-200"
                    >
                      <div className="flex items-center gap-3">
                        <AlertTriangle className="h-4 w-4 text-orange-600" />
                        <div>
                          <p className="font-medium text-sm">{product.name}</p>
                          <p className="text-xs text-muted-foreground">
                            Estoque: {product.stock ?? 0} unidades
                          </p>
                        </div>
                      </div>
                      <Link href={`/admin/produtos/${product.id}/editar`}>
                        <Button variant="outline" size="sm">
                          <Plus className="h-4 w-4 mr-1" />
                          Repor
                        </Button>
                      </Link>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Toppings com estoque baixo */}
            {toppings.length > 0 && (
              <div>
                <div className="flex items-center justify-between mb-2">
                  <h4 className="text-sm font-semibold">Toppings</h4>
                  <Link href="/admin/toppings/estoque">
                    <Button variant="ghost" size="sm">
                      Ver Todos
                    </Button>
                  </Link>
                </div>
                <div className="space-y-2">
                  {toppings.map((topping: any) => (
                    <div
                      key={topping.id}
                      className="flex items-center justify-between p-3 border rounded-md bg-orange-50 border-orange-200"
                    >
                      <div className="flex items-center gap-3">
                        <AlertTriangle className="h-4 w-4 text-orange-600" />
                        <div className="flex items-center gap-2">
                          {topping.icon && (
                            <span className="text-lg">{topping.icon}</span>
                          )}
                          <div>
                            <p className="font-medium text-sm">{topping.name}</p>
                            <p className="text-xs text-muted-foreground">
                              Estoque: {topping.stock ?? 0} unidades
                            </p>
                          </div>
                        </div>
                      </div>
                      <Link href={`/admin/toppings/${topping.id}/editar`}>
                        <Button variant="outline" size="sm">
                          <Plus className="h-4 w-4 mr-1" />
                          Repor
                        </Button>
                      </Link>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  )
}
