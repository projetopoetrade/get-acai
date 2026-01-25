'use client';

import { useEffect, useState, useCallback } from 'react'; // Adicionado useCallback
import { useParams, useRouter } from 'next/navigation';
import { 
  ArrowLeft, MapPin, ShoppingBag, CheckCircle2, Clock, 
  XCircle, ChefHat, Truck, Package, Phone
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { ordersService } from '@/services/orders';
import { PixPayment } from '@/components/checkout/pix-payment';
import { toast } from 'sonner';
import { cn } from '@/lib/utils'; 

const STEPS = [
  { id: 'confirmed', label: 'Confirmado', icon: CheckCircle2 },
  { id: 'preparing', label: 'Preparando', icon: ChefHat },
  { id: 'delivering', label: 'Saiu', icon: Truck },
  { id: 'delivered', label: 'Entregue', icon: Package },
];

function OrderTimeline({ status }: { status: string }) {
  const getCurrentStep = () => {
    switch (status) {
      case 'awaiting_payment': return -1;
      case 'pending': 
      case 'payment_received': 
      case 'confirmed': return 0;
      case 'preparing': 
      case 'ready': return 1;
      case 'delivering': return 2;
      case 'delivered': return 3;
      default: return -1;
    }
  };

  const currentStep = getCurrentStep();
  
  if (status === 'cancelled') return (
    <div className="bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 p-4 rounded-2xl flex items-center gap-3 font-semibold justify-center">
      <XCircle className="w-6 h-6" /> Pedido Cancelado
    </div>
  );

  return (
    <div className="w-full py-4">
      <div className="relative flex justify-between items-center px-2">
        <div className="absolute left-0 top-1/2 -translate-y-1/2 w-full h-1 bg-neutral-200 dark:bg-neutral-800 -z-10" />
        <div 
          className="absolute left-0 top-1/2 -translate-y-1/2 h-1 bg-[#9d0094] transition-all duration-1000 ease-out -z-10"
          style={{ width: `${Math.max(0, (currentStep / (STEPS.length - 1)) * 100)}%` }}
        />

        {STEPS.map((step, idx) => {
          const isActive = idx <= currentStep;
          return (
            <div key={step.id} className="flex flex-col items-center gap-2 bg-neutral-50 dark:bg-neutral-950 px-1">
              <div className={cn(
                  "w-10 h-10 md:w-12 md:h-12 rounded-full flex items-center justify-center border-2 transition-all duration-500",
                  isActive ? "bg-[#9d0094] border-[#9d0094] text-white shadow-lg" : "bg-white dark:bg-neutral-800 border-neutral-300 text-neutral-400"
                )}>
                <step.icon className="w-5 h-5 md:w-6 md:h-6" />
              </div>
              <span className={cn("text-[10px] md:text-xs font-bold uppercase", isActive ? "text-[#9d0094]" : "text-neutral-400")}>
                {step.label}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}

export default function OrderDetailsPage() {
  const { id } = useParams();
  const router = useRouter();
  const [order, setOrder] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  // 1. Busca de dados centralizada
  const fetchOrder = useCallback(async () => {
    try {
      const data = await ordersService.getById(id as string);
      setOrder(data);
      setLoading(false);
    } catch (error) {
      console.error('Erro ao carregar pedido:', error);
      setLoading(false);
    }
  }, [id]);

  // 2. Título Dinâmico da Aba
  useEffect(() => {
    if (!order) return;
    const labels: any = {
      payment_received: "✅ Pago!",
      confirmed: "👍 Confirmado!",
      preparing: "🍧 Preparando...",
      delivering: "🛵 Saiu para Entrega!",
      delivered: "😋 Entregue!"
    };
    if (labels[order.status]) document.title = `${labels[order.status]} | GetAçaí`;
  }, [order?.status]);

  // 3. Polling com Backoff Exponencial
  useEffect(() => {
    if (!id || id === 'undefined') return;
    fetchOrder();

    const getInterval = () => {
      if (!order) return 5000;
      if (order.status === 'awaiting_payment') return 3000; // Rápido para detectar Pix
      if (['preparing', 'ready'].includes(order.status)) return 10000; // Lento na cozinha
      if (order.status === 'delivering') return 30000; // Lento na rua
      return 5000;
    };

    const interval = setInterval(() => {
      const isFinalStatus = ['delivered', 'cancelled'].includes(order?.status);
      if (!isFinalStatus) fetchOrder();
    }, getInterval());

    return () => clearInterval(interval);
  }, [id, order?.status, fetchOrder]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-neutral-50 dark:bg-neutral-950">
        <div className="w-16 h-16 border-4 border-[#9d0094]/30 border-t-[#9d0094] rounded-full animate-spin"></div>
      </div>
    );
  }

  if (!order) return null;

  // Verificação atualizada para incluir o status 'confirmed' vindo do seu backend
  const isPixPending = order.paymentMethod === 'pix' && order.status === 'awaiting_payment';
  const isPaid = ['payment_received', 'confirmed', 'preparing', 'ready', 'delivering', 'delivered'].includes(order.status);

  return (
    <div className="min-h-screen bg-neutral-50 dark:bg-black pb-24">
      <header className="bg-white dark:bg-neutral-900 shadow-sm sticky top-0 z-20">
        <div className="max-w-5xl mx-auto px-4 h-14 md:h-16 flex items-center justify-between">
          <button onClick={() => router.push('/pedidos')} className="p-2 hover:bg-neutral-100 rounded-full">
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div className="text-center">
            <h1 className="font-bold text-sm md:text-lg">Acompanhar Pedido</h1>
            <p className="text-[10px] md:text-xs text-neutral-500">#{order.id.slice(0, 8).toUpperCase()}</p>
          </div>
          <div className="w-9" /> 
        </div>
      </header>

      <main className="max-w-5xl mx-auto p-3 md:p-6 grid grid-cols-1 md:grid-cols-3 gap-4 md:gap-8">
        <div className="md:col-span-2 space-y-4 md:space-y-6">
          <div className="bg-white dark:bg-neutral-900 p-6 rounded-3xl shadow-sm border border-neutral-100 dark:border-neutral-800 space-y-6">
            <div className="text-center space-y-1">
              <h2 className="text-xl md:text-3xl font-bold text-[#9d0094]">
                {isPixPending ? 'Falta pouco!' : isPaid ? 'Tudo certo!' : 'Pedido em andamento'}
              </h2>
              <p className="text-xs md:text-sm text-neutral-500">
                {isPixPending ? 'Realize o pagamento para confirmar' : 
                 order.status === 'confirmed' || order.status === 'payment_received' ? 'Pagamento confirmado, estamos preparando!' :
                 `Previsão: ${order.estimatedDeliveryTime || '30-40 min'}`}
              </p>
            </div>
            <OrderTimeline status={order.status} />
          </div>

          {isPixPending && order.pixQrCodeBase64 && (
            <PixPayment 
              qrCode={order.pixQrCode}
              qrCodeBase64={order.pixQrCodeBase64}
              expiresAt={order.pixExpiresAt}
            />
          )}

          {isPaid && order.status !== 'delivered' && (
            <div className="bg-green-500 text-white p-6 rounded-3xl shadow-lg text-center animate-in zoom-in">
              <CheckCircle2 className="w-12 h-12 mx-auto mb-2" />
              <h3 className="text-lg md:text-xl font-bold">Pagamento Confirmado!</h3>
              <p className="text-green-50 text-sm">O pessoal da cozinha já recebeu seu pedido.</p>
            </div>
          )}

          <div className="bg-white dark:bg-neutral-900 p-6 rounded-3xl shadow-sm border border-neutral-800 space-y-3">
            <h3 className="font-bold text-lg flex items-center gap-2">
              <MapPin className="w-5 h-5 text-[#9d0094]" /> Entrega
            </h3>
            <div className="pl-3 border-l-2 border-neutral-800 ml-1">
              <p className="font-medium">{order.address?.street}, {order.address?.number}</p>
              <p className="text-sm text-neutral-500">{order.address?.neighborhood} - {order.address?.city}</p>
            </div>
          </div>
        </div>

        <div className="md:col-span-1">
          <div className="md:sticky md:top-24 space-y-4">
            <div className="bg-white dark:bg-neutral-900 p-6 rounded-3xl shadow-sm border border-neutral-800 space-y-4">
              <h3 className="font-bold text-lg flex items-center gap-2 text-[#9d0094]">
                <ShoppingBag className="w-5 h-5" /> Resumo
              </h3>
              <div className="space-y-4">
                {order.items.map((item: any, idx: number) => (
                  <div key={idx} className="flex justify-between items-start text-sm">
                    <span className="text-neutral-500">{item.quantity}x {item.productName}</span>
                    <span className="font-semibold">R$ {Number(item.subtotal).toFixed(2)}</span>
                  </div>
                ))}
              </div>
              <div className="border-t border-neutral-800 pt-4 space-y-2">
                <div className="flex justify-between text-sm">
                  <span>Entrega</span>
                  <span className="text-green-500">Grátis</span>
                </div>
                <div className="flex justify-between font-bold text-lg">
                  <span>Total</span>
                  <span className="text-[#9d0094]">R$ {Number(order.total).toFixed(2)}</span>
                </div>
              </div>
            </div>
            <a href={`https://wa.me/5571985350741?text=Ajuda com pedido #${order.id.slice(0,8)}`} target="_blank">
              <Button variant="outline" className="w-full h-14 rounded-2xl gap-2">
                <Phone className="w-4 h-4" /> Preciso de ajuda
              </Button>
            </a>
          </div>
        </div>
      </main>
    </div>
  );
}