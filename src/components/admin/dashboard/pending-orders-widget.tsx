// components/admin/dashboard/pending-orders-widget.tsx
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Clock, Eye } from "lucide-react"
import Link from "next/link"

async function getPendingOrders() {
  const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/orders/admin/all?status=pending`, {
    headers: {
      'Authorization': `Bearer ${process.env.ADMIN_TOKEN}` // ou pegar do cookie/session
    },
    cache: 'no-store' // Para sempre buscar dados atualizados
  })
  
  if (!response.ok) return []
  return response.json()
}

export async function PendingOrdersWidget() {
  const orders = await getPendingOrders()
  
  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <div>
          <CardTitle>Pedidos Pendentes</CardTitle>
          <CardDescription>
            {orders.length} {orders.length === 1 ? 'pedido aguardando' : 'pedidos aguardando'} confirmação
          </CardDescription>
        </div>
        <Link href="/admin/pedidos?status=pending">
          <Button variant="outline" size="sm">
            Ver Todos
          </Button>
        </Link>
      </CardHeader>
      <CardContent>
        {orders.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            <Clock className="mx-auto h-12 w-12 mb-2 opacity-20" />
            <p>Nenhum pedido pendente</p>
          </div>
        ) : (
          <div className="space-y-4">
            {orders.slice(0, 5).map((order: any) => (
              <div
                key={order.id}
                className="flex items-center justify-between p-4 border rounded-lg hover:bg-muted/50 transition-colors"
              >
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <p className="font-medium">Pedido #{order.id.slice(0, 8)}</p>
                    <Badge variant="outline" className="text-xs">
                      {order.deliveryMethod === 'delivery' ? 'Delivery' : 'Retirada'}
                    </Badge>
                  </div>
                  <p className="text-sm text-muted-foreground">
                    {order.items.length} {order.items.length === 1 ? 'item' : 'itens'} • R$ {order.total.toFixed(2)}
                  </p>
                  <p className="text-xs text-muted-foreground mt-1">
                    {new Date(order.createdAt).toLocaleString('pt-BR')}
                  </p>
                </div>
                <Link href={`/admin/pedidos/${order.id}`}>
                  <Button variant="ghost" size="sm">
                    <Eye className="h-4 w-4" />
                  </Button>
                </Link>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  )
}
