// app/admin/pedidos/[id]/page.tsx
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Separator } from "@/components/ui/separator"
import { ArrowLeft, Clock, MapPin, Phone, User, Wallet } from "lucide-react"
import Link from "next/link"
import { OrderStatusUpdater } from "@/components/admin/orders/order-status-updater"
import { CancelOrderButton } from "@/components/admin/orders/cancel-order-button"

import { cookies } from 'next/headers'
import { redirect } from 'next/navigation'

async function getOrder(id: string) {
  if (!id) {
    throw new Error('ID do pedido não fornecido')
  }

  const cookieStore = await cookies()
  const token = cookieStore.get('auth_token')?.value
  
  if (!token) {
    redirect('/login?redirect=/admin/pedidos')
  }
  
  const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/orders/admin/all?limit=1000`, {
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    },
    cache: 'no-store'
  })

  if (!response.ok) {
    if (response.status === 401 || response.status === 403) {
      redirect('/login?redirect=/admin/pedidos')
    }
    const error = await response.text()
    console.error('Erro ao buscar pedidos:', error)
    throw new Error('Erro ao buscar pedido')
  }

  const orders = await response.json()
  
  const normalizedId = String(id || '').toLowerCase().replace(/-/g, '')
  const order = orders.find((o: any) => {
    const orderId = String(o.id || '').toLowerCase().replace(/-/g, '')
    return orderId === normalizedId
  })
  
  if (!order) {
    throw new Error('Pedido não encontrado')
  }

  return order
}

const statusMap = {
  awaiting_payment: { label: 'Aguardando Pagamento', variant: 'secondary' as const },
  payment_received: { label: 'Pagamento Recebido', variant: 'default' as const },
  pending: { label: 'Pendente', variant: 'secondary' as const },
  confirmed: { label: 'Confirmado', variant: 'default' as const },
  preparing: { label: 'Preparando', variant: 'default' as const },
  ready: { label: 'Pronto', variant: 'default' as const },
  delivering: { label: 'Saiu para Entrega', variant: 'default' as const },
  delivered: { label: 'Entregue', variant: 'default' as const },
  cancelled: { label: 'Cancelado', variant: 'destructive' as const }
}

const paymentMethodMap = {
  cash: 'Dinheiro',
  credit_card: 'Cartão de Crédito',
  debit_card: 'Cartão de Débito',
  pix: 'PIX'
}

export default async function OrderDetailsPage({ params }: { params: Promise<{ id: string }> | { id: string } }) {
  const resolvedParams = await Promise.resolve(params)
  const orderId = resolvedParams.id
  
  if (!orderId) {
    throw new Error('ID do pedido não encontrado na URL')
  }
  
  const order = await getOrder(orderId)
  const status = statusMap[order.status as keyof typeof statusMap]

  return (
    <div className="min-h-screen bg-neutral-50 dark:bg-neutral-950">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6 sm:py-8">
        {/* Header */}
        <div className="mb-6 sm:mb-8">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
            <div className="flex items-center gap-4">
              <Link href="/admin/pedidos">
                <Button variant="ghost" size="icon" className="hover:bg-neutral-100 dark:hover:bg-neutral-800">
                  <ArrowLeft className="h-5 w-5" />
                </Button>
              </Link>
              <div>
                <h1 className="text-2xl sm:text-3xl font-bold text-neutral-900 dark:text-neutral-100">
                  Pedido #{order.id.slice(0, 8)}
                </h1>
                <p className="text-sm sm:text-base text-neutral-600 dark:text-neutral-400 mt-1">
                  {new Date(order.createdAt).toLocaleString('pt-BR', {
                    dateStyle: 'long',
                    timeStyle: 'short'
                  })}
                </p>
              </div>
            </div>
            <Badge 
              variant={status.variant}
              className="text-sm px-4 py-1.5 font-semibold w-fit"
            >
              {status.label}
            </Badge>
          </div>
        </div>

        <div className="grid gap-6 lg:grid-cols-3">
        {/* Coluna Principal */}
        <div className="lg:col-span-2 space-y-6">
          {/* Atualizar Status */}
          {order.status !== 'cancelled' && order.status !== 'delivered' && (
            <Card className="border-2 border-neutral-200 dark:border-neutral-800 shadow-sm">
              <CardHeader className="pb-4">
                <CardTitle className="text-xl font-bold text-neutral-900 dark:text-neutral-100">
                  Atualizar Status
                </CardTitle>
                <CardDescription className="text-sm text-neutral-600 dark:text-neutral-400">
                  Altere o status do pedido conforme o progresso
                </CardDescription>
              </CardHeader>
              <CardContent>
                <OrderStatusUpdater orderId={order.id} currentStatus={order.status} />
              </CardContent>
            </Card>
          )}

          {/* Items do Pedido */}
          <Card className="border-2 border-neutral-200 dark:border-neutral-800 shadow-sm">
            <CardHeader className="pb-4">
              <CardTitle className="text-xl font-bold text-neutral-900 dark:text-neutral-100">
                Itens do Pedido
              </CardTitle>
              <CardDescription className="text-sm text-neutral-600 dark:text-neutral-400">
                {order.items.length} {order.items.length === 1 ? 'item' : 'itens'}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                {order.items.map((item: any, index: number) => {
                  // ✅ LÓGICA NOVA: Usar as notas formatadas
                  const hasNotes = !!item.notes && item.notes.trim().length > 0;
                  
                  // 1. Divide as notas por [ITEM X]
                  const noteSections = hasNotes 
                    ? item.notes.split(/(?=\[ITEM \d+\]:)/g).map((s: string) => s.trim()).filter(Boolean)
                    : [];

                  return (
                    <div key={index}>
                      <div className="flex justify-between items-start gap-4">
                        <div className="flex-1 min-w-0"> {/* min-w-0 é importante para o texto não estourar */}
                          <div className="flex items-center gap-2">
                            <span className="font-bold text-lg text-neutral-900 dark:text-neutral-100">
                              {item.quantity}x
                            </span>
                            <span className="font-semibold text-lg text-neutral-900 dark:text-neutral-100">
                              {item.product?.name || item.productName}
                            </span>
                          </div>
                          
                          {/* ✅ SUBSTITUIÇÃO DA LISTA ANTIGA PELA LISTA VERTICAL DE NOTAS */}
                          {hasNotes ? (
                            <div className="mt-3 space-y-3 w-full">
                              {noteSections.map((section: string, i: number) => {
                                // 2. Divide cada seção por vírgula para criar lista vertical
                                const ingredients = section.split(',').map(s => s.trim().replace(/\.$/, ''));

                                return (
                                  <div 
                                    key={i} 
                                    className="w-full text-sm text-neutral-700 dark:text-neutral-300 bg-amber-50/80 dark:bg-amber-900/20 p-3 rounded-lg border border-amber-200 dark:border-amber-800/30"
                                  >
                                    {ingredients.map((ing, j) => (
                                      <div key={j} className={`leading-relaxed ${j > 0 ? 'mt-1.5 border-t border-amber-200/50 dark:border-amber-800/30 pt-1.5' : ''}`}>
                                        {ing}
                                      </div>
                                    ))}
                                  </div>
                                );
                              })}
                            </div>
                          ) : (
                            <p className="text-sm text-neutral-500 mt-2 italic">
                              Sem adicionais
                            </p>
                          )}
                        </div>
                        
                        <span className="font-bold text-lg text-neutral-900 dark:text-neutral-100 whitespace-nowrap">
                          R$ {(() => {
                            const price = item.subtotal || 
                              item.totalPrice || 
                              (item.productPrice ? Number(item.productPrice) * item.quantity : null) ||
                              (item.product?.price ? Number(item.product.price) * item.quantity : null);
                            
                            if (!price) return '0.00';
                            const numPrice = typeof price === 'string' ? parseFloat(price) : Number(price);
                            return isNaN(numPrice) ? '0.00' : numPrice.toFixed(2);
                          })()}
                        </span>
                      </div>
                      {index < order.items.length - 1 && <Separator className="mt-6" />}
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>

          {/* Observações Gerais do Pedido */}
          {order.notes && (
            <Card className="border-2 border-red-200 dark:border-red-900/30 bg-red-50/50 dark:bg-red-950/20 shadow-sm">
              <CardHeader className="pb-4">
                <CardTitle className="text-xl font-bold text-red-900 dark:text-red-100">
                  Observações Gerais
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-base text-red-800 dark:text-red-200 leading-relaxed font-medium">
                  {order.notes}
                </p>
              </CardContent>
            </Card>
          )}
        </div>

        {/* Coluna Lateral */}
        <div className="space-y-6">
          {/* Informações do Cliente */}
          <Card className="border-2 border-neutral-200 dark:border-neutral-800 shadow-sm">
            <CardHeader className="pb-4">
              <CardTitle className="text-lg font-bold text-neutral-900 dark:text-neutral-100 flex items-center gap-2">
                <User className="h-5 w-5 text-[#9d0094]" />
                Cliente
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center gap-3 p-3 bg-neutral-50 dark:bg-neutral-900/50 rounded-lg">
                <User className="h-5 w-5 text-neutral-500 dark:text-neutral-400 flex-shrink-0" />
                <span className="text-sm font-medium text-neutral-900 dark:text-neutral-100">
                  {order.user?.name || 'N/A'}
                </span>
              </div>
              <div className="flex items-center gap-3 p-3 bg-neutral-50 dark:bg-neutral-900/50 rounded-lg">
                <Phone className="h-5 w-5 text-neutral-500 dark:text-neutral-400 flex-shrink-0" />
                <span className="text-sm font-medium text-neutral-900 dark:text-neutral-100">
                  {order.user?.phone || 'N/A'}
                </span>
              </div>
            </CardContent>
          </Card>

          {/* Entrega */}
          <Card className="border-2 border-neutral-200 dark:border-neutral-800 shadow-sm">
            <CardHeader className="pb-4">
              <CardTitle className="text-lg font-bold text-neutral-900 dark:text-neutral-100 flex items-center gap-2">
                <MapPin className="h-5 w-5 text-[#9d0094]" />
                {order.deliveryMethod === 'delivery' ? 'Entrega' : 'Retirada'}
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {order.deliveryMethod === 'delivery' && order.address ? (
                <div className="flex gap-3">
                  <MapPin className="h-5 w-5 text-neutral-500 dark:text-neutral-400 flex-shrink-0 mt-0.5" />
                  <div className="text-sm space-y-1">
                    <p className="font-semibold text-neutral-900 dark:text-neutral-100">
                      {order.address.street}, {order.address.number}
                    </p>
                    {order.address.complement && (
                      <p className="text-neutral-600 dark:text-neutral-400">{order.address.complement}</p>
                    )}
                    <p className="text-neutral-600 dark:text-neutral-400">{order.address.neighborhood}</p>
                    <p className="text-neutral-600 dark:text-neutral-400">
                      {order.address.city} - {order.address.state}
                    </p>
                    <p className="text-neutral-600 dark:text-neutral-400">CEP: {order.address.cep}</p>
                    {order.address.reference && (
                      <p className="text-neutral-500 dark:text-neutral-500 mt-2 text-xs italic">
                        📍 {order.address.reference}
                      </p>
                    )}
                  </div>
                </div>
              ) : (
                <p className="text-sm text-neutral-600 dark:text-neutral-400 flex items-center gap-2">
                  <MapPin className="h-4 w-4" />
                  Cliente vai retirar no local
                </p>
              )}
            </CardContent>
          </Card>

          {/* Pagamento */}
          <Card className="border-2 border-neutral-200 dark:border-neutral-800 shadow-sm">
            <CardHeader className="pb-4">
              <CardTitle className="text-lg font-bold text-neutral-900 dark:text-neutral-100 flex items-center gap-2">
                <Wallet className="h-5 w-5 text-[#9d0094]" />
                Pagamento
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center gap-3 p-3 bg-neutral-50 dark:bg-neutral-900/50 rounded-lg">
                <Wallet className="h-5 w-5 text-neutral-500 dark:text-neutral-400 flex-shrink-0" />
                <span className="text-sm font-semibold text-neutral-900 dark:text-neutral-100">
                  {paymentMethodMap[order.paymentMethod as keyof typeof paymentMethodMap] || order.paymentMethod}
                </span>
              </div>
              
              <div className="space-y-2 pt-2 border-t border-neutral-100 dark:border-neutral-800">
                 <div className="flex justify-between text-sm">
                    <span>Subtotal</span>
                    <span>R$ {Number(order.subtotal).toFixed(2)}</span>
                 </div>
                 <div className="flex justify-between text-sm">
                    <span>Entrega</span>
                    <span>R$ {Number(order.deliveryFee).toFixed(2)}</span>
                 </div>
                 {Number(order.discount) > 0 && (
                    <div className="flex justify-between text-sm text-green-600">
                        <span>Desconto</span>
                        <span>- R$ {Number(order.discount).toFixed(2)}</span>
                    </div>
                 )}
                 <div className="flex justify-between text-base font-bold pt-2">
                    <span>Total</span>
                    <span className="text-[#9d0094]">R$ {Number(order.total).toFixed(2)}</span>
                 </div>
              </div>

              {order.paymentMethod === 'cash' && order.changeFor && (
                <div className="text-sm space-y-1 p-3 bg-green-50 dark:bg-green-950/20 rounded-lg border border-green-200 dark:border-green-900/30">
                  <p className="text-neutral-600 dark:text-neutral-400">Troco para:</p>
                  <p className="font-bold text-lg text-green-700 dark:text-green-400">
                    R$ {Number(order.changeFor).toFixed(2)}
                  </p>
                  <p className="text-xs text-neutral-500 dark:text-neutral-500 mt-1">
                    Troco a levar: R$ {(Number(order.changeFor) - Number(order.total)).toFixed(2)}
                  </p>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Informações Adicionais */}
          <Card className="border-2 border-neutral-200 dark:border-neutral-800 shadow-sm">
            <CardHeader className="pb-4">
              <CardTitle className="text-lg font-bold text-neutral-900 dark:text-neutral-100 flex items-center gap-2">
                <Clock className="h-5 w-5 text-[#9d0094]" />
                Informações
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3 text-sm">
              <div className="flex items-center gap-3 p-2">
                <Clock className="h-4 w-4 text-neutral-500 dark:text-neutral-400 flex-shrink-0" />
                <div className="flex-1">
                  <span className="text-neutral-600 dark:text-neutral-400">Criado em:</span>
                  <span className="ml-2 font-medium text-neutral-900 dark:text-neutral-100">
                    {new Date(order.createdAt).toLocaleString('pt-BR')}
                  </span>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Ações */}
          {order.status !== 'cancelled' && order.status !== 'delivered' && (
            <CancelOrderButton orderId={order.id} />
          )}
        </div>
      </div>
      </div>
    </div>
  )
}