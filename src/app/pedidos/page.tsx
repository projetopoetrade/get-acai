// src/app/pedidos/page.tsx
'use client';

import { useState } from 'react';
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
  Receipt
} from 'lucide-react';
import { Header } from '@/components/layout/header';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Order, OrderStatus } from '@/types/cart';

// =====================================================
// CONFIGURAÇÃO - Número do WhatsApp da loja
// =====================================================
const STORE_WHATSAPP = '5585999999999'; // TODO: Mover para config da loja

// =====================================================
// MOCK DE PEDIDOS - Substituir por API
// =====================================================
// TODO: GET /api/orders ou /api/auth/orders (se autenticado)

const mockOrders: Order[] = [
  {
    id: 'order-1',
    orderNumber: '#1247',
    status: 'delivering',
    items: [
      {
        id: 'item-1',
        product: {
          id: 'monte-seu-500',
          name: 'Açaí 500ml',
          description: 'Monte seu açaí',
          price: 22,
          category: 'monte-seu',
          imageUrl: '/images/products/acai-500ml.jpg',
          available: true,
        },
        quantity: 2,
        unitPrice: 27,
        totalPrice: 54,
        customization: {
          sizeId: 'medio',
          toppings: [
            { toppingId: 't1', name: 'Morango', quantity: 1, unitPrice: 4, isFree: true },
            { toppingId: 't2', name: 'Granola', quantity: 1, unitPrice: 3, isFree: true },
            { toppingId: 't3', name: 'Nutella', quantity: 1, unitPrice: 6, isFree: false },
          ],
          wantsCutlery: true,
        },
      },
    ],
    subtotal: 54,
    discount: 0,
    deliveryFee: 5,
    total: 59,
    customer: {
      name: 'João Silva',
      phone: '85999999999',
    },
    deliveryType: 'delivery',
    deliveryAddress: {
      street: 'Rua das Flores',
      number: '123',
      complement: 'Apto 45',
      neighborhood: 'Centro',
      city: 'Fortaleza',
      state: 'CE',
      zipCode: '60000-000',
    },
    paymentMethod: 'pix',
    paymentStatus: 'paid',
    createdAt: new Date(Date.now() - 30 * 60 * 1000).toISOString(), // 30 min atrás
    confirmedAt: new Date(Date.now() - 25 * 60 * 1000).toISOString(),
    estimatedDeliveryTime: new Date(Date.now() + 10 * 60 * 1000).toISOString(), // 10 min
  },
  {
    id: 'order-2',
    orderNumber: '#1246',
    status: 'delivered',
    items: [
      {
        id: 'item-2',
        product: {
          id: 'classico-tropical',
          name: 'Açaí Tropical',
          description: 'Açaí com banana, granola e mel',
          price: 18,
          category: 'classicos',
          imageUrl: '/images/products/acai-tropical.jpg',
          available: true,
        },
        quantity: 1,
        unitPrice: 18,
        totalPrice: 18,
      },
    ],
    subtotal: 18,
    discount: 0,
    deliveryFee: 5,
    total: 23,
    customer: {
      name: 'João Silva',
      phone: '85999999999',
    },
    deliveryType: 'delivery',
    paymentMethod: 'credit',
    paymentStatus: 'paid',
    createdAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(), // 2 dias atrás
    deliveredAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000 + 45 * 60 * 1000).toISOString(),
  },
  {
    id: 'order-3',
    orderNumber: '#1245',
    status: 'cancelled',
    items: [
      {
        id: 'item-3',
        product: {
          id: 'combo-1',
          name: 'Promoção de 2 copos de 500ml',
          description: 'Não alteramos a composição',
          price: 46.90,
          category: 'combos',
          imageUrl: '/images/products/combo-500ml.jpg',
          available: true,
        },
        quantity: 1,
        unitPrice: 46.90,
        totalPrice: 46.90,
      },
    ],
    subtotal: 46.90,
    discount: 0,
    deliveryFee: 0,
    total: 46.90,
    customer: {
      name: 'João Silva',
      phone: '85999999999',
    },
    deliveryType: 'pickup',
    paymentMethod: 'pix',
    paymentStatus: 'refunded',
    createdAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(), // 5 dias atrás
  },
];

// =====================================================
// CONFIGURAÇÃO DE STATUS
// =====================================================

interface StatusConfig {
  label: string;
  description: string;
  icon: typeof Clock;
  color: string;
  bgColor: string;
}

const STATUS_CONFIG: Record<OrderStatus, StatusConfig> = {
  pending: {
    label: 'Aguardando',
    description: 'Aguardando confirmação da loja',
    icon: Clock,
    color: '#f59e0b',
    bgColor: 'rgba(245, 158, 11, 0.1)',
  },
  confirmed: {
    label: 'Confirmado',
    description: 'Pedido confirmado pela loja',
    icon: CheckCircle2,
    color: '#3b82f6',
    bgColor: 'rgba(59, 130, 246, 0.1)',
  },
  preparing: {
    label: 'Em preparo',
    description: 'Estamos preparando seu pedido',
    icon: ChefHat,
    color: '#8b5cf6',
    bgColor: 'rgba(139, 92, 246, 0.1)',
  },
  ready: {
    label: 'Pronto',
    description: 'Pedido pronto para retirada/entrega',
    icon: Package,
    color: '#10b981',
    bgColor: 'rgba(16, 185, 129, 0.1)',
  },
  delivering: {
    label: 'A caminho',
    description: 'Pedido saiu para entrega',
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
    description: 'Pedido foi cancelado',
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
  const diffMins = Math.floor(diffMs / (1000 * 60));
  const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

  if (diffMins < 60) {
    return `Há ${diffMins} min`;
  } else if (diffHours < 24) {
    return `Há ${diffHours}h`;
  } else if (diffDays === 1) {
    return 'Ontem';
  } else if (diffDays < 7) {
    return `Há ${diffDays} dias`;
  } else {
    return date.toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit' });
  }
}

function formatTime(dateString: string): string {
  return new Date(dateString).toLocaleTimeString('pt-BR', { 
    hour: '2-digit', 
    minute: '2-digit' 
  });
}

function getWhatsAppLink(orderNumber: string): string {
  const message = encodeURIComponent(
    `Olá! Gostaria de falar sobre o pedido ${orderNumber}`
  );
  return `https://wa.me/${STORE_WHATSAPP}?text=${message}`;
}

// =====================================================
// COMPONENTE DE CARD DO PEDIDO
// =====================================================

function OrderCard({ order }: { order: Order }) {
  const [expanded, setExpanded] = useState(false);
  const statusConfig = STATUS_CONFIG[order.status];
  const StatusIcon = statusConfig.icon;
  const isActive = ['pending', 'confirmed', 'preparing', 'ready', 'delivering'].includes(order.status);

  return (
    <div className={`bg-white dark:bg-neutral-900 rounded-2xl border-2 overflow-hidden transition-all ${
      isActive ? 'border-[#9d0094]/30' : 'border-neutral-200 dark:border-neutral-800'
    }`}>
      {/* Header do Card */}
      <button
        onClick={() => setExpanded(!expanded)}
        className="w-full p-4 text-left"
      >
        <div className="flex items-start justify-between gap-3">
          {/* Info principal */}
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-1">
              <span className="font-bold text-lg">{order.orderNumber}</span>
              <span className="text-neutral-400 text-sm">•</span>
              <span className="text-neutral-500 dark:text-neutral-400 text-sm">
                {formatDate(order.createdAt)}
              </span>
            </div>
            
            {/* Status */}
            <div 
              className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-sm font-medium"
              style={{ backgroundColor: statusConfig.bgColor, color: statusConfig.color }}
            >
              <StatusIcon className="w-4 h-4" />
              {statusConfig.label}
            </div>

            {/* Resumo dos itens */}
            <p className="text-sm text-neutral-600 dark:text-neutral-400 mt-2 line-clamp-1">
              {order.items.map(item => 
                `${item.quantity}x ${item.product.name}`
              ).join(', ')}
            </p>
          </div>

          {/* Valor e expand */}
          <div className="flex flex-col items-end gap-2">
            <span className="font-bold text-lg" style={{ color: '#9d0094' }}>
              R$ {order.total.toFixed(2)}
            </span>
            {expanded ? (
              <ChevronUp className="w-5 h-5 text-neutral-400" />
            ) : (
              <ChevronDown className="w-5 h-5 text-neutral-400" />
            )}
          </div>
        </div>
      </button>

      {/* Conteúdo expandido */}
      {expanded && (
        <div className="px-4 pb-4 border-t border-neutral-100 dark:border-neutral-800 pt-4 space-y-4">
          {/* Status detalhado */}
          {isActive && (
            <div className="p-3 rounded-xl" style={{ backgroundColor: statusConfig.bgColor }}>
              <p className="text-sm font-medium" style={{ color: statusConfig.color }}>
                {statusConfig.description}
              </p>
              {order.estimatedDeliveryTime && order.status === 'delivering' && (
                <p className="text-xs mt-1" style={{ color: statusConfig.color }}>
                  Previsão de chegada: {formatTime(order.estimatedDeliveryTime)}
                </p>
              )}
            </div>
          )}

          {/* Itens do pedido */}
          <div>
            <h4 className="text-sm font-semibold text-neutral-700 dark:text-neutral-300 mb-2 flex items-center gap-2">
              <Receipt className="w-4 h-4" />
              Itens do pedido
            </h4>
            <div className="space-y-2">
              {order.items.map((item) => (
                <div 
                  key={item.id}
                  className="flex justify-between items-start p-2 bg-neutral-50 dark:bg-neutral-800 rounded-lg"
                >
                  <div className="flex-1">
                    <p className="font-medium text-sm">{item.quantity}x {item.product.name}</p>
                    {item.customization?.toppings && item.customization.toppings.length > 0 && (
                      <p className="text-xs text-neutral-500 dark:text-neutral-400 mt-0.5">
                        + {item.customization.toppings.map(t => t.name).join(', ')}
                      </p>
                    )}
                  </div>
                  <span className="text-sm font-medium">
                    R$ {item.totalPrice.toFixed(2)}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Endereço de entrega */}
          {order.deliveryType === 'delivery' && order.deliveryAddress && (
            <div>
              <h4 className="text-sm font-semibold text-neutral-700 dark:text-neutral-300 mb-2 flex items-center gap-2">
                <MapPin className="w-4 h-4" />
                Endereço de entrega
              </h4>
              <p className="text-sm text-neutral-600 dark:text-neutral-400">
                {order.deliveryAddress.street}, {order.deliveryAddress.number}
                {order.deliveryAddress.complement && ` - ${order.deliveryAddress.complement}`}
                <br />
                {order.deliveryAddress.neighborhood}, {order.deliveryAddress.city}
              </p>
            </div>
          )}

          {/* Resumo de valores */}
          <div className="border-t border-neutral-100 dark:border-neutral-800 pt-3 space-y-1">
            <div className="flex justify-between text-sm">
              <span className="text-neutral-600 dark:text-neutral-400">Subtotal</span>
              <span>R$ {order.subtotal.toFixed(2)}</span>
            </div>
            {order.discount > 0 && (
              <div className="flex justify-between text-sm text-green-600">
                <span>Desconto</span>
                <span>- R$ {order.discount.toFixed(2)}</span>
              </div>
            )}
            {order.deliveryFee > 0 && (
              <div className="flex justify-between text-sm">
                <span className="text-neutral-600 dark:text-neutral-400">Taxa de entrega</span>
                <span>R$ {order.deliveryFee.toFixed(2)}</span>
              </div>
            )}
            <div className="flex justify-between font-bold pt-2 border-t border-neutral-100 dark:border-neutral-800">
              <span>Total</span>
              <span style={{ color: '#9d0094' }}>R$ {order.total.toFixed(2)}</span>
            </div>
          </div>

          {/* Pagamento */}
          <div className="flex items-center justify-between text-sm">
            <span className="text-neutral-600 dark:text-neutral-400">Pagamento</span>
            <Badge 
              variant={order.paymentStatus === 'paid' ? 'default' : 'secondary'}
              className={order.paymentStatus === 'paid' ? 'bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300' : ''}
            >
              {order.paymentMethod === 'pix' && 'PIX'}
              {order.paymentMethod === 'credit' && 'Cartão de Crédito'}
              {order.paymentMethod === 'debit' && 'Cartão de Débito'}
              {order.paymentMethod === 'cash' && 'Dinheiro'}
              {order.paymentStatus === 'paid' && ' • Pago'}
              {order.paymentStatus === 'pending' && ' • Pendente'}
              {order.paymentStatus === 'refunded' && ' • Reembolsado'}
            </Badge>
          </div>

          {/* Botão WhatsApp */}
          <a
            href={getWhatsAppLink(order.orderNumber)}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center justify-center gap-2 w-full py-3 px-4 rounded-xl font-semibold text-white transition-all hover:opacity-90"
            style={{ backgroundColor: '#25D366' }}
          >
            <MessageCircle className="w-5 h-5" />
            Falar sobre este pedido
          </a>
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
  
  // Separar pedidos ativos dos histórico
  const activeOrders = mockOrders.filter(o => 
    ['pending', 'confirmed', 'preparing', 'ready', 'delivering'].includes(o.status)
  );
  const pastOrders = mockOrders.filter(o => 
    ['delivered', 'cancelled'].includes(o.status)
  );

  return (
    <div className="min-h-screen bg-neutral-50 dark:bg-background pb-24">
      {/* Header */}
      <Header />

      {/* Conteúdo */}
      <div className="max-w-2xl mx-auto px-4 py-6">
        <h1 className="text-2xl font-bold text-neutral-900 dark:text-neutral-100 mb-6">
          Meus Pedidos
        </h1>

        {/* Pedidos ativos */}
        {activeOrders.length > 0 && (
          <section className="mb-8">
            <h2 className="text-sm font-semibold text-neutral-500 dark:text-neutral-400 uppercase tracking-wider mb-3">
              Em andamento
            </h2>
            <div className="space-y-3">
              {activeOrders.map((order) => (
                <OrderCard key={order.id} order={order} />
              ))}
            </div>
          </section>
        )}

        {/* Histórico */}
        {pastOrders.length > 0 && (
          <section>
            <h2 className="text-sm font-semibold text-neutral-500 dark:text-neutral-400 uppercase tracking-wider mb-3">
              Histórico
            </h2>
            <div className="space-y-3">
              {pastOrders.map((order) => (
                <OrderCard key={order.id} order={order} />
              ))}
            </div>
          </section>
        )}

        {/* Estado vazio */}
        {mockOrders.length === 0 && (
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
              className="text-white"
              style={{ backgroundColor: '#9d0094' }}
            >
              Ver cardápio
            </Button>
          </div>
        )}

        {/* Contato geral */}
        <div className="mt-8 p-4 bg-white dark:bg-neutral-900 rounded-2xl border border-neutral-200 dark:border-neutral-800">
          <h3 className="font-semibold text-neutral-800 dark:text-neutral-200 mb-2">
            Precisa de ajuda?
          </h3>
          <p className="text-sm text-neutral-600 dark:text-neutral-400 mb-3">
            Entre em contato conosco pelo WhatsApp para dúvidas, sugestões ou reclamações.
          </p>
          <a
            href={`https://wa.me/${STORE_WHATSAPP}`}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 text-sm font-medium"
            style={{ color: '#25D366' }}
          >
            <MessageCircle className="w-4 h-4" />
            Falar com a loja
          </a>
        </div>
      </div>
    </div>
  );
}
