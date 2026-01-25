// src/app/pedidos/page.tsx
'use client';

import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { 
  ArrowLeft, 
  Clock, 
  CheckCircle2, 
  Truck, 
  Package, 
  XCircle,
  ChefHat,
  MessageCircle,
  ChevronDown,
  ChevronUp,
  MapPin,
  Receipt,
  Ban,
  Loader2,
  Star
} from 'lucide-react';
import { Header } from '@/components/layout/header';
import { Button } from '@/components/ui/button';
import { ordersService, Order } from '@/services/orders'; // Importando Order e Service juntos
import { toast } from 'sonner';
import { ReviewForm } from '@/components/reviews/review-form';

// =====================================================
// CONFIGURAÇÃO - WhatsApp
// =====================================================
const STORE_WHATSAPP = '5585999999999'; 

// =====================================================
// CONFIGURAÇÃO DE STATUS
// =====================================================
interface StatusConfig {
  label: string;
  description: string;
  icon: any;
  color: string;
  bgColor: string;
}

const STATUS_CONFIG: Record<string, StatusConfig> = {
  awaiting_payment: {
    label: 'Aguardando Pagamento',
    description: 'Realize o pagamento para confirmarmos seu pedido',
    icon: Clock,
    color: '#f59e0b',
    bgColor: 'rgba(245, 158, 11, 0.1)',
  },
  pending: {
    label: 'Pendente',
    description: 'Aguardando confirmação da loja',
    icon: Clock,
    color: '#f59e0b',
    bgColor: 'rgba(245, 158, 11, 0.1)',
  },
  payment_received: {
    label: 'Pago',
    description: 'Pagamento confirmado, aguardando preparo',
    icon: CheckCircle2,
    color: '#10b981',
    bgColor: 'rgba(16, 185, 129, 0.1)',
  },
  preparing: {
    label: 'Em preparo',
    description: 'Estamos preparando seu açaí com carinho',
    icon: ChefHat,
    color: '#8b5cf6',
    bgColor: 'rgba(139, 92, 246, 0.1)',
  },
  ready: {
    label: 'Pronto',
    description: 'Pedido pronto para saída',
    icon: Package,
    color: '#10b981',
    bgColor: 'rgba(16, 185, 129, 0.1)',
  },
  delivering: {
    label: 'A caminho',
    description: 'O entregador saiu para o seu endereço',
    icon: Truck,
    color: '#9d0094',
    bgColor: 'rgba(157, 0, 148, 0.1)',
  },
  delivered: {
    label: 'Entregue',
    description: 'Pedido entregue com sucesso',
    icon: CheckCircle2,
    color: '#10b981',
    bgColor: 'rgba(16, 185, 129, 0.1)',
  },
  cancelled: {
    label: 'Cancelado',
    description: 'Este pedido foi cancelado',
    icon: XCircle,
    color: '#ef4444',
    bgColor: 'rgba(239, 68, 68, 0.1)',
  },
};

// =====================================================
// HELPERS
// =====================================================
function formatDate(dateString: string): string {
  const date = new Date(dateString);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

  if (diffDays === 0) return 'Hoje';
  if (diffDays === 1) return 'Ontem';
  return date.toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit' });
}

function formatTime(dateString: string): string {
  return new Date(dateString).toLocaleTimeString('pt-BR', { 
    hour: '2-digit', 
    minute: '2-digit' 
  });
}

function getWhatsAppLink(orderNumber: string): string {
  const message = encodeURIComponent(`Olá! Gostaria de falar sobre o pedido #${orderNumber}`);
  return `https://wa.me/${STORE_WHATSAPP}?text=${message}`;
}

// =====================================================
// COMPONENTE: CARD DO PEDIDO
// =====================================================
interface OrderCardProps {
  order: Order;
  onCancel: (id: string) => Promise<void>;
  isCancelling: boolean;
}

function OrderCard({ order, onCancel, isCancelling }: OrderCardProps) {
  const [expanded, setExpanded] = useState(false);
  const [reviewingProductId, setReviewingProductId] = useState<string | null>(null);
  
  const statusKey = order.status.toLowerCase();
  const statusConfig = STATUS_CONFIG[statusKey] || STATUS_CONFIG['pending'];
  const StatusIcon = statusConfig.icon;
  
  const isActive = [
    'pending', 
    'awaiting_payment', 
    'payment_received', 
    'confirmed', 
    'preparing', 
    'ready', 
    'delivering'
  ].includes(statusKey);

  const isDelivered = statusKey === 'delivered';

  // ✅ CORREÇÃO: Fallback seguro para o endereço
  const address = order.address;
  // Usa deliveryMethod (da API) ou deliveryType (compatibilidade)
  const deliveryMethod = order.deliveryMethod || order.deliveryType;

  return (
    <div className={`bg-white dark:bg-neutral-900 rounded-2xl border-2 overflow-hidden transition-all ${
      isActive ? 'border-[#9d0094]/30' : 'border-neutral-200 dark:border-neutral-800'
    }`}>
      {/* --- HEADER DO CARD --- */}
      <button
        onClick={() => setExpanded(!expanded)}
        className="w-full p-4 text-left hover:bg-neutral-50 dark:hover:bg-neutral-800/50 transition-colors"
      >
        <div className="flex items-start justify-between gap-3">
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-1">
              <span className="font-bold text-lg">
                #{order.orderNumber || order.id.substring(0, 8)}
              </span>
              <span className="text-neutral-400 text-sm">•</span>
              <span className="text-neutral-500 dark:text-neutral-400 text-sm">
                {formatDate(order.createdAt)} às {formatTime(order.createdAt)}
              </span>
            </div>
            
            <div 
              className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-sm font-medium"
              style={{ backgroundColor: statusConfig.bgColor, color: statusConfig.color }}
            >
              <StatusIcon className="w-4 h-4" />
              {statusConfig.label}
            </div>

            <p className="text-sm text-neutral-600 dark:text-neutral-400 mt-2 line-clamp-1">
              {order.items.map(item => {
                const productName = item.product?.name || item.productName || 'Produto';
                return `${item.quantity}x ${productName}`;
              }).join(', ')}
            </p>
          </div>

          <div className="flex flex-col items-end gap-2">
            <span className="font-bold text-lg" style={{ color: '#9d0094' }}>
              R$ {Number(order.total).toFixed(2)}
            </span>
            {expanded ? (
              <ChevronUp className="w-5 h-5 text-neutral-400" />
            ) : (
              <ChevronDown className="w-5 h-5 text-neutral-400" />
            )}
          </div>
        </div>
      </button>

      {/* --- CONTEÚDO EXPANDIDO --- */}
      {expanded && (
        <div className="px-4 pb-4 border-t border-neutral-100 dark:border-neutral-800 pt-4 space-y-4">
          
          {/* 1. Status Detalhado */}
          <div className="p-3 rounded-xl flex items-start gap-3" style={{ backgroundColor: statusConfig.bgColor }}>
            <StatusIcon className="w-5 h-5 mt-0.5" style={{ color: statusConfig.color }} />
            <div>
               <p className="text-sm font-medium" style={{ color: statusConfig.color }}>
                 {statusConfig.description}
               </p>
            </div>
          </div>

          {/* 2. Lista de Itens */}
          <div>
            <h4 className="text-sm font-semibold text-neutral-700 dark:text-neutral-300 mb-2 flex items-center gap-2">
              <Receipt className="w-4 h-4" />
              Itens do pedido
            </h4>
            <div className="space-y-2">
              {order.items.map((item, idx) => {
                // Suporta tanto product.name quanto productName direto
                const productName = item.product?.name || item.productName || 'Produto';
                // Suporta toppings em duas estruturas: direto no item ou em customization
                const toppings = item.toppings || item.customization?.toppings || [];
                
                // Função helper para extrair o nome do topping
                const getToppingName = (topping: any): string => {
                  if (topping && typeof topping === 'object') {
                    if ('toppingName' in topping && topping.toppingName) return String(topping.toppingName);
                    if ('name' in topping && topping.name) return String(topping.name);
                  }
                  return 'Topping';
                };
                
                return (
                  <div key={idx} className="flex justify-between items-start p-2 bg-neutral-50 dark:bg-neutral-800 rounded-lg">
                    <div className="flex-1">
                      <p className="font-medium text-sm">
                        {item.quantity}x {productName} 
                      </p>
                      {toppings.length > 0 && (
                        <p className="text-xs text-neutral-500 mt-0.5">
                          + {toppings.map(getToppingName).join(', ')}
                        </p>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* 3. ✅ ENDEREÇO DE ENTREGA CORRIGIDO */}
          {/* Usamos deliveryMethod (da API) ou deliveryType (compatibilidade) */}
          {deliveryMethod === 'delivery' && address && (
            <div>
              <h4 className="text-sm font-semibold text-neutral-700 dark:text-neutral-300 mb-2 flex items-center gap-2">
                <MapPin className="w-4 h-4" />
                Endereço de entrega
              </h4>
              <div className="text-sm text-neutral-600 dark:text-neutral-400 bg-neutral-50 dark:bg-neutral-800 p-3 rounded-lg border border-neutral-100 dark:border-neutral-700">
                <p className="font-medium text-neutral-900 dark:text-neutral-200">
                  {address.street}, {address.number}
                </p>
                <p>
                  {address.neighborhood} - {address.city}/{address.state}
                </p>
                {address.complement && (
                   <p className="text-xs text-neutral-500 mt-1">
                     Comp: {address.complement}
                   </p>
                )}
                {address.reference && (
                   <p className="text-xs text-neutral-500">
                     Ref: {address.reference}
                   </p>
                )}
              </div>
            </div>
          )}

          {/* 4. Resumo Financeiro */}
          <div className="border-t border-neutral-100 dark:border-neutral-800 pt-3 space-y-1">
             <div className="flex justify-between text-sm">
                <span className="text-neutral-600">Forma de Pagamento</span>
                <span className="font-medium capitalize">
                  {order.paymentMethod === 'credit' ? 'Cartão de Crédito' : 
                   order.paymentMethod === 'debit' ? 'Cartão de Débito' : 
                   order.paymentMethod === 'cash' ? 'Dinheiro' : order.paymentMethod}
                </span>
             </div>
             
             {/* Taxa de entrega */}
             {deliveryMethod === 'delivery' && (
                <div className="flex justify-between text-sm">
                   <span className="text-neutral-600">Taxa de entrega</span>
                   <span>
                     {Number(order.deliveryFee) === 0 ? 'Grátis' : `R$ ${Number(order.deliveryFee).toFixed(2)}`}
                   </span>
                </div>
             )}

             {/* Desconto */}
             {Number(order.discount) > 0 && (
                <div className="flex justify-between text-sm text-green-600">
                   <span>Desconto</span>
                   <span>- R$ {Number(order.discount).toFixed(2)}</span>
                </div>
             )}

             <div className="flex justify-between font-bold pt-2 border-t border-neutral-100 dark:border-neutral-800 mt-2">
                <span>Total</span>
                <span style={{ color: '#9d0094' }}>R$ {Number(order.total).toFixed(2)}</span>
             </div>
          </div>

          {/* 5. Avaliar Produtos (apenas para pedidos entregues) */}
          {isDelivered && order.items.length > 0 && (
            <div className="border-t border-neutral-100 dark:border-neutral-800 pt-4">
              <h4 className="text-sm font-semibold text-neutral-700 dark:text-neutral-300 mb-3 flex items-center gap-2">
                <Star className="w-4 h-4" />
                Avaliar Produtos
              </h4>
              <div className="space-y-3">
                {order.items.map((item, idx) => {
                  const productId = item.product?.id || item.productId;
                  const productName = item.product?.name || item.productName || 'Produto';
                  
                  if (!productId) return null;

                  const isReviewing = reviewingProductId === productId;

                  return (
                    <div key={idx} className="border-2 border-neutral-200 dark:border-neutral-800 rounded-lg p-3">
                      {!isReviewing ? (
                        <div className="flex items-center justify-between">
                          <div>
                            <p className="font-medium text-sm text-neutral-900 dark:text-neutral-100">
                              {item.quantity}x {productName}
                            </p>
                            <p className="text-xs text-neutral-500 dark:text-neutral-400 mt-0.5">
                              Como foi sua experiência?
                            </p>
                          </div>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => setReviewingProductId(productId)}
                            className="flex items-center gap-2"
                          >
                            <Star className="w-4 h-4" />
                            Avaliar
                          </Button>
                        </div>
                      ) : (
                        <div>
                          <div className="flex items-center justify-between mb-3">
                            <p className="font-medium text-sm text-neutral-900 dark:text-neutral-100">
                              Avaliar: {productName}
                            </p>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => setReviewingProductId(null)}
                              className="h-6 w-6 p-0"
                            >
                              ×
                            </Button>
                          </div>
                          <ReviewForm
                            productId={productId}
                            productName={productName}
                            orderId={order.id}
                            onSuccess={() => setReviewingProductId(null)}
                          />
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* 6. Ações (Botões) */}
          <div className="flex flex-col gap-2 pt-2">
             <a
               href={getWhatsAppLink(order.orderNumber || order.id.substring(0, 8))}
               target="_blank"
               rel="noopener noreferrer"
               className="flex items-center justify-center gap-2 w-full py-3 px-4 rounded-xl font-semibold text-white transition-all hover:opacity-90"
               style={{ backgroundColor: '#25D366' }}
             >
               <MessageCircle className="w-5 h-5" />
               Falar com a loja
             </a>

             {/* Botão Cancelar */}
             {(statusKey === 'pending' || statusKey === 'awaiting_payment') && (
               <Button 
                 variant="outline"
                 onClick={() => onCancel(order.id)}
                 disabled={isCancelling}
                 className="w-full border-red-200 text-red-600 hover:bg-red-50 dark:border-red-900/30 dark:hover:bg-red-900/20"
               >
                 {isCancelling ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : <Ban className="w-4 h-4 mr-2" />}
                 Cancelar Pedido
               </Button>
             )}
          </div>
        </div>
      )}
    </div>
  );
}

// =====================================================
// PÁGINA PRINCIPAL
// =====================================================

export default function PedidosPage() {
  const router = useRouter();
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [cancellingId, setCancellingId] = useState<string | null>(null);

  const loadOrders = useCallback(async () => {
    try {
      const data = await ordersService.getMyOrders();
      setOrders(data.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()));
    } catch (err) {
      console.error(err);
      toast.error('Não foi possível carregar seus pedidos.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadOrders();
    const interval = setInterval(loadOrders, 30000);
    return () => clearInterval(interval);
  }, [loadOrders]);

  const handleCancelOrder = async (id: string) => {
     if (!confirm('Tem certeza que deseja cancelar este pedido?')) return;

     setCancellingId(id);
     try {
        await ordersService.cancelOrder(id);
        toast.success('Pedido cancelado com sucesso.');
        loadOrders();
     } catch (error: any) {
        toast.error(error.response?.data?.message || 'Erro ao cancelar');
     } finally {
        setCancellingId(null);
     }
  };

  const activeOrders = orders.filter(o => {
    const status = o.status?.toLowerCase();
    return ['pending', 'awaiting_payment', 'payment_received', 'confirmed', 'preparing', 'ready', 'delivering'].includes(status);
  });
  
  const pastOrders = orders.filter(o => {
    const status = o.status?.toLowerCase();
    return ['delivered', 'cancelled'].includes(status);
  });

  return (
    <div className="min-h-screen bg-neutral-50 dark:bg-background pb-24">
      <Header />

      <div className="max-w-2xl mx-auto px-4 py-6">
        <h1 className="text-2xl font-bold text-neutral-900 dark:text-neutral-100 mb-6">
          Meus Pedidos
        </h1>

        {loading ? (
          <div className="text-center py-12">
            <Loader2 className="w-8 h-8 animate-spin text-[#9d0094] mx-auto" />
            <p className="text-neutral-500 mt-2">Carregando pedidos...</p>
          </div>
        ) : orders.length === 0 ? (
          <div className="text-center py-16">
            <div 
              className="w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-4"
              style={{ backgroundColor: 'rgba(157, 0, 148, 0.1)' }}
            >
              <Receipt className="w-10 h-10" style={{ color: '#9d0094' }} />
            </div>
            <h3 className="text-lg font-semibold text-neutral-800 dark:text-neutral-200 mb-2">
              Nenhum pedido ainda
            </h3>
            <p className="text-neutral-500 dark:text-neutral-400 mb-6">
              Que tal pedir um açaí agora?
            </p>
            <Button
              onClick={() => router.push('/')}
              className="text-white font-semibold px-8"
              style={{ backgroundColor: '#9d0094' }}
            >
              Ver cardápio
            </Button>
          </div>
        ) : (
          <>
            {activeOrders.length > 0 && (
              <section className="mb-8">
                <h2 className="text-sm font-semibold text-neutral-500 dark:text-neutral-400 uppercase tracking-wider mb-3 flex items-center gap-2">
                  <Clock className="w-4 h-4" /> Em andamento
                </h2>
                <div className="space-y-3">
                  {activeOrders.map((order) => (
                    <OrderCard 
                      key={order.id} 
                      order={order} 
                      onCancel={handleCancelOrder}
                      isCancelling={cancellingId === order.id}
                    />
                  ))}
                </div>
              </section>
            )}

            {pastOrders.length > 0 && (
              <section>
                <h2 className="text-sm font-semibold text-neutral-500 dark:text-neutral-400 uppercase tracking-wider mb-3 flex items-center gap-2">
                   <CheckCircle2 className="w-4 h-4" /> Histórico
                </h2>
                <div className="space-y-3">
                  {pastOrders.map((order) => (
                    <OrderCard 
                      key={order.id} 
                      order={order}
                      onCancel={handleCancelOrder}
                      isCancelling={cancellingId === order.id}
                    />
                  ))}
                </div>
              </section>
            )}
          </>
        )}
      </div>
    </div>
  );
}