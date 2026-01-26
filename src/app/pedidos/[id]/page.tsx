'use client';

import { useEffect, useState } from 'react';
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

// =========================================================
// COMPONENTE VISUAL: TIMELINE DE PROGRESSO (Responsivo)
// =========================================================
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
      case 'pending': return 0;
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
    <div className="bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 p-3 md:p-4 rounded-xl md:rounded-2xl flex items-center gap-3 font-semibold justify-center text-sm md:text-base">
      <XCircle className="w-5 h-5 md:w-6 md:h-6" /> Pedido Cancelado
    </div>
  );

  return (
    <div className="w-full py-2 md:py-4">
      <div className="relative flex justify-between items-center px-2">
        {/* Linha de fundo */}
        <div className="absolute left-0 top-1/2 -translate-y-1/2 w-full h-0.5 md:h-1 bg-neutral-200 dark:bg-neutral-800 -z-10" />

        {/* Linha de progresso */}
        <div
          className="absolute left-0 top-1/2 -translate-y-1/2 h-0.5 md:h-1 bg-[#9d0094] transition-all duration-1000 ease-out -z-10"
          style={{ width: `${Math.max(0, (currentStep / (STEPS.length - 1)) * 100)}%` }}
        />

        {STEPS.map((step, idx) => {
          const isActive = idx <= currentStep;

          return (
            <div key={step.id} className="flex flex-col items-center gap-1.5 md:gap-2 bg-neutral-50 dark:bg-neutral-950 px-1">
              <div
                className={cn(
                  // Mobile: w-8 h-8 | Desktop: w-10 h-10
                  "w-8 h-8 md:w-12 md:h-12 rounded-full flex items-center justify-center border-2 transition-all duration-500",
                  isActive
                    ? "bg-[#9d0094] border-[#9d0094] text-white shadow-lg shadow-[#9d0094]/30 scale-110"
                    : "bg-white dark:bg-neutral-800 border-neutral-300 dark:border-neutral-700 text-neutral-400"
                )}
              >
                {/* Ícones menores no mobile */}
                <step.icon className="w-4 h-4 md:w-6 md:h-6" />
              </div>
              <span className={cn(
                // Texto bem pequeno no mobile
                "text-[9px] md:text-xs font-bold uppercase tracking-wide transition-colors duration-300",
                isActive ? "text-[#9d0094]" : "text-neutral-400"
              )}>
                {step.label}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}

// =========================================================
// PÁGINA PRINCIPAL
// =========================================================
export default function OrderDetailsPage() {
  const { id } = useParams();
  const router = useRouter();
  const [order, setOrder] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  // Polling (igual ao anterior)
  useEffect(() => {
    if (!id || id === 'undefined') return;
    let interval: NodeJS.Timeout;
    const fetchOrder = async () => {
      try {
        const data = await ordersService.getById(id as string);
        setOrder(data);
        setLoading(false);
        if (['delivered', 'cancelled'].includes(data.status)) clearInterval(interval);
      } catch (error) {
        toast.error('Erro ao carregar pedido');
        setLoading(false);
      }
    };
    fetchOrder();
    interval = setInterval(() => {
      if (['awaiting_payment', 'pending', 'payment_received', 'preparing', 'ready', 'delivering'].includes(order?.status)) {
        fetchOrder();
      }
    }, 5000);
    return () => clearInterval(interval);
  }, [id, order?.status]);

  if (loading) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-neutral-50 dark:bg-neutral-950 gap-4">
        <div className="w-12 h-12 md:w-16 md:h-16 border-4 border-[#9d0094]/30 border-t-[#9d0094] rounded-full animate-spin"></div>
      </div>
    );
  }

  if (!order) return null;

  const isPixPending = order.paymentMethod === 'pix' && order.status === 'awaiting_payment';
  const isPaid = order.status === 'payment_received';

  return (
    <div className="min-h-screen bg-neutral-50 dark:bg-black pb-24">

      {/* --- HEADER --- */}
      <header className="bg-white dark:bg-neutral-900 shadow-sm sticky top-0 z-20">
        <div className="max-w-5xl mx-auto px-4 h-14 md:h-16 flex items-center justify-between">
          <button
            onClick={() => router.push('/pedidos')}
            className="p-2 -ml-2 hover:bg-neutral-100 dark:hover:bg-neutral-800 rounded-full transition-colors"
          >
            <ArrowLeft className="w-5 h-5 text-neutral-700 dark:text-neutral-300" />
          </button>
          <div className="text-center">
            <h1 className="font-bold text-sm md:text-lg text-neutral-900 dark:text-white">Acompanhar Pedido</h1>
            <p className="text-[10px] md:text-xs text-neutral-500">#{order.id.slice(0, 8).toUpperCase()}</p>
          </div>
          <div className="w-9" />
        </div>
      </header>

      {/* --- LAYOUT GRID RESPONSIVO --- */}
      {/* Mobile: 1 coluna | Desktop: 2 colunas (Principal + Lateral Sticky) */}
      <main className="max-w-5xl mx-auto p-3 md:p-6 grid grid-cols-1 md:grid-cols-3 gap-4 md:gap-8">

        {/* ================= COLUNA ESQUERDA (STATUS E INFO) ================= */}
        <div className="md:col-span-2 space-y-4 md:space-y-6">

          {/* 1. CARD STATUS */}
          {/* 1. CARD STATUS */}
          <div className="bg-white dark:bg-neutral-900 p-4 md:p-6 rounded-2xl md:rounded-3xl shadow-sm border border-neutral-100 dark:border-neutral-800 space-y-4 md:space-y-6">
            <div className="text-center space-y-1">
              <h2 className="text-xl md:text-3xl font-bold text-[#9d0094]">
                {isPixPending ? 'Falta pouco!' : isPaid ? 'Tudo certo!' : 'Pedido em andamento'}
              </h2>

              {/* 👇 ALTERAÇÃO AQUI: Exibição destacada do tempo estimado */}
              {!isPixPending && order.estimatedDeliveryTime && (
                <div className="flex items-center justify-center gap-2 text-neutral-600 dark:text-neutral-300 mt-2 bg-neutral-100 dark:bg-neutral-800 py-1.5 px-4 rounded-full w-fit mx-auto">
                  <Clock className="w-4 h-4 text-[#9d0094]" />
                  <span className="text-sm font-semibold">
                    Previsão: {order.estimatedDeliveryTime}
                  </span>
                </div>
              )}

              <p className="text-xs md:text-sm text-neutral-500">
                {isPixPending ? 'Realize o pagamento para confirmar' :
                  isPaid ? 'Pagamento recebido, vamos preparar!' :
                    'Acompanhe o progresso abaixo'}
              </p>
            </div>

            <OrderTimeline status={order.status} />
          </div>

          {/* 2. CARD PIX (SE NECESSÁRIO) */}
          {isPixPending && order.pixQrCodeBase64 && (
            <div className="animate-in slide-in-from-bottom-4 duration-500">
              <PixPayment
                qrCode={order.pixQrCode}
                qrCodeBase64={order.pixQrCodeBase64}
                expiresAt={order.pixExpiresAt}
              />
            </div>
          )}

          {/* 3. CARD SUCESSO PAGAMENTO */}
          {isPaid && (
            <div className="bg-green-500 text-white p-5 md:p-8 rounded-2xl md:rounded-3xl shadow-lg shadow-green-500/20 text-center animate-in zoom-in duration-300 relative overflow-hidden">
              <div className="absolute inset-0 bg-[url('/confetti.png')] opacity-20 mix-blend-overlay"></div>
              <CheckCircle2 className="w-10 h-10 md:w-16 md:h-16 mx-auto mb-3" />
              <h3 className="text-lg md:text-2xl font-bold">Pagamento Confirmado!</h3>
              <p className="text-green-100 text-xs md:text-base mt-1">
                Já enviamos seu pedido para a cozinha. Agora é só relaxar!
              </p>
            </div>
          )}

          {/* 4. CARD ENTREGA (Versão Desktop e Mobile) */}
          <div className="bg-white dark:bg-neutral-900 p-4 md:p-6 rounded-2xl md:rounded-3xl shadow-sm border border-neutral-100 dark:border-neutral-800 space-y-3">
            <h3 className="font-bold text-base md:text-xl flex items-center gap-2 text-neutral-800 dark:text-white">
              <MapPin className="w-4 h-4 md:w-5 md:h-5 text-[#9d0094]" /> Entrega
            </h3>

            <div className="pl-3 border-l-2 border-neutral-100 dark:border-neutral-800 ml-1 space-y-1">
              <p className="font-medium text-sm md:text-base text-neutral-900 dark:text-neutral-200">
                {order.address?.street}, {order.address?.number}
              </p>
              <p className="text-xs md:text-sm text-neutral-500">
                {order.address?.neighborhood} - {order.address?.city}
              </p>
              {order.address?.complement && (
                <p className="text-xs text-neutral-400 mt-1">Comp: {order.address?.complement}</p>
              )}
            </div>
          </div>
        </div>

        {/* ================= COLUNA DIREITA (RESUMO - STICKY NO DESKTOP) ================= */}
        <div className="md:col-span-1">
          <div className="md:sticky md:top-20 space-y-4">

            {/* 5. CARD RESUMO */}
            <div className="bg-white dark:bg-neutral-900 p-4 md:p-6 rounded-2xl md:rounded-3xl shadow-sm border border-neutral-100 dark:border-neutral-800 space-y-4">
              <h3 className="font-bold text-base md:text-xl flex items-center gap-2 text-neutral-800 dark:text-white">
                <ShoppingBag className="w-4 h-4 md:w-5 md:h-5 text-[#9d0094]" /> Resumo
              </h3>

              {/* Lista de Itens Compacta */}
              <div className="space-y-3 md:space-y-4">
                {order.items.map((item: any, idx: number) => (
                  <div key={idx} className="flex gap-3">
                    <div className="w-8 h-8 md:w-10 md:h-10 bg-neutral-100 dark:bg-neutral-800 rounded-lg flex items-center justify-center font-bold text-xs md:text-sm text-neutral-600 dark:text-neutral-400 shrink-0">
                      {item.quantity}x
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-xs md:text-sm text-neutral-900 dark:text-white truncate">
                        {item.productName}
                      </p>
                      {item.toppings?.length > 0 && (
                        <p className="text-[10px] md:text-xs text-neutral-500 mt-0.5 line-clamp-2">
                          + {item.toppings.map((t: any) => t.toppingName).join(', ')}
                        </p>
                      )}
                      {item.notes && (
                        <p className="text-[9px] text-amber-600 bg-amber-50 dark:bg-amber-900/20 px-1.5 py-0.5 rounded-md inline-block mt-1">
                          Obs: {item.notes}
                        </p>
                      )}
                    </div>
                    <div className="text-xs md:text-sm font-semibold text-neutral-700 dark:text-neutral-300">
                      R$ {Number(item.subtotal).toFixed(2)}
                    </div>
                  </div>
                ))}
              </div>

              <div className="border-t border-dashed border-neutral-200 dark:border-neutral-800 my-3" />

              {/* Totais */}
              <div className="space-y-1.5 text-xs md:text-sm">
                <div className="flex justify-between text-neutral-500">
                  <span>Subtotal</span>
                  <span>R$ {Number(order.subtotal).toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-neutral-500">
                  <span>Entrega</span>
                  <span className="text-green-600">{Number(order.deliveryFee) === 0 ? 'Grátis' : `R$ ${Number(order.deliveryFee).toFixed(2)}`}</span>
                </div>
                {Number(order.discount) > 0 && (
                  <div className="flex justify-between text-green-600">
                    <span>Desconto</span>
                    <span>- R$ {Number(order.discount).toFixed(2)}</span>
                  </div>
                )}
                <div className="flex justify-between items-end pt-2">
                  <span className="font-bold text-sm md:text-base text-neutral-900 dark:text-white">Total</span>
                  <span className="text-xl md:text-2xl font-bold text-[#9d0094]">
                    R$ {Number(order.total).toFixed(2)}
                  </span>
                </div>
              </div>
            </div>

            {/* 6. BOTÃO DE AJUDA */}
            <a
              href={`https://wa.me/5571999999999?text=Ajuda com pedido #${order.id.slice(0, 8)}`}
              target="_blank"
              className="block w-full"
            >
              <Button variant="outline" className="w-full h-12 md:h-14 rounded-xl md:rounded-2xl gap-2 text-xs md:text-sm text-neutral-600 dark:text-neutral-300 border-neutral-200 dark:border-neutral-800 hover:bg-neutral-50 dark:hover:bg-neutral-900 transition-transform active:scale-95">
                <Phone className="w-3 h-3 md:w-4 md:h-4" /> Preciso de ajuda
              </Button>
            </a>
          </div>
        </div>

      </main>
    </div>
  );
}