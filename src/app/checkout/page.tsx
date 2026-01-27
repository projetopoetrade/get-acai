// src/app/checkout/page.tsx
'use client';

import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import {
  ArrowLeft, MapPin, Plus, Check, Home, Briefcase, MapPinned,
  CreditCard, Banknote, QrCode, Loader2, Circle, Clock
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useCart } from '@/hooks/useCart';
import { toast } from 'sonner';
import { CreateOrderRequest } from '@/types/api';
import { PaymentMethod } from '@/types/cart';
import { ordersService } from '@/services/orders';
import { addressService, Address } from '@/services/address';
import { useDeliveryFee } from '@/hooks/useDeliveryFee';
import { useStoreConfig } from '@/hooks/useStoreConfig';
import { AddressModal } from '@/components/address/address-modal';
// ✅ IMPORTANTE: Import do componente de cupom
import { CouponInput } from '@/components/cart/coupon-input';

const PAYMENT_METHODS: { id: PaymentMethod; label: string; icon: any; description?: string }[] = [
  { id: 'pix', label: 'PIX', icon: QrCode, description: 'Aprovação instantânea' },
  { id: 'credit', label: 'Cartão de Crédito', icon: CreditCard, description: 'Débito na entrega' },
  { id: 'debit', label: 'Cartão de Débito', icon: CreditCard, description: 'Débito na entrega' },
  { id: 'cash', label: 'Dinheiro', icon: Banknote, description: 'Pague na entrega' },
];

export default function CheckoutPage() {
  const router = useRouter();
  const cart = useCart();

  // Hooks de Configuração e Frete
  const { calculateFee, loading: loadingFee } = useDeliveryFee();
  const { config: store, status: storeStatus, isLoading: loadingStore } = useStoreConfig();

  const isStoreOpen = storeStatus?.isOpen ?? store?.isOpen ?? false;

  // Estados locais
  const [addresses, setAddresses] = useState<Address[]>([]);
  const [selectedAddress, setSelectedAddress] = useState<Address | null>(null);
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('pix');
  const [changeFor, setChangeFor] = useState('');
  const [showAddressModal, setShowAddressModal] = useState(false);
  const [loading, setLoading] = useState(false);
  const [loadingAddresses, setLoadingAddresses] = useState(true);
  const [estimatedTime, setEstimatedTime] = useState<string | null>(null);

  // Selecionar endereço e calcular frete/tempo
  const handleSelectAddress = useCallback(async (address: Address) => {
    setSelectedAddress(address);
    setEstimatedTime(null);

    const TAXA_PADRAO = 5.00;

    try {
      console.log('[Checkout] Calculando frete para bairro:', address.neighborhood);
      const info = await calculateFee(address.neighborhood);
      
      if (info && typeof info.fee === 'number') {
        cart.setDeliveryFee(info.fee);

        if (info.deliveryTime) {
          setEstimatedTime(info.deliveryTime);
        } else if (info.estimatedTime) {
          setEstimatedTime(info.estimatedTime);
        }

        toast.success(`Taxa para ${address.neighborhood}: R$ ${info.fee.toFixed(2)}`);
      } else {
        console.warn('[Checkout] Bairro sem taxa específica, aplicando padrão.');
        cart.setDeliveryFee(TAXA_PADRAO);
      }
    } catch (err) {
      console.error("[Checkout] Erro ao calcular frete:", err);
      cart.setDeliveryFee(TAXA_PADRAO);
    }
  }, [calculateFee, cart]);

  // Carregar endereços ao iniciar
  useEffect(() => {
    async function loadData() {
      try {
        const data = await addressService.getMyAddresses();
        setAddresses(data);

        const defaultAddress = data.find(a => a.isDefault) || data[0];
        if (defaultAddress) {
          handleSelectAddress(defaultAddress);
        }
      } catch (error) {
        console.error("Erro ao carregar endereços", error);
      } finally {
        setLoadingAddresses(false);
      }
    }
    loadData();
  }, []);

  const handleAddressSaved = async (newAddress: Address) => {
    setAddresses(prev => [...prev, newAddress]);
    await handleSelectAddress(newAddress);
  };

  const getAddressIcon = (label: string) => {
    const l = label.toLowerCase();
    if (l.includes('casa')) return Home;
    if (l.includes('trab')) return Briefcase;
    return MapPinned;
  };

  // Enviar pedido para API
  const handlePlaceOrder = async () => {
    if (!selectedAddress) return toast.error('Selecione um endereço');
    if (!isStoreOpen) return toast.error('Loja fechada no momento');

    setLoading(true);
    try {
      const payload: CreateOrderRequest = {
        items: cart.items.map(item => ({
          productId: item.product.id,
          quantity: item.quantity,
          notes: item.customization?.observations,
          toppings: item.customization?.toppings.map(t => ({
            toppingId: t.id,
            quantity: t.quantity,
          })) || [],
        })),
        paymentMethod,
        deliveryMethod: 'delivery',
        addressId: selectedAddress.id,
        changeFor: paymentMethod === 'cash' && changeFor ? parseFloat(changeFor.replace(',', '.')) : undefined,
        
        // ✅ ENVIO DO CUPOM PARA O BACKEND
        couponCode: cart.couponCode || undefined, 
      };

      const newOrder = await ordersService.create(payload);

      toast.success('Pedido recebido! Aguardando pagamento.');
      cart.clearCart();
      router.push(`/pedidos/${newOrder.id}`);

    } catch (error: any) {
      console.error(error);
      toast.error(error.response?.data?.message || 'Erro ao criar pedido');
    } finally {
      setLoading(false);
    }
  };

  if (cart.items.length === 0) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Button onClick={() => router.push('/')} className="bg-[#9d0094]">Ver Cardápio</Button>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-neutral-50 dark:bg-neutral-950 pb-32">
      {/* Header */}
      <header className="sticky top-0 z-40 bg-white dark:bg-neutral-900 border-b p-4">
        <div className="max-w-2xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <button onClick={() => router.back()}><ArrowLeft /></button>
            <h1 className="font-bold text-lg">Finalizar Pedido</h1>
          </div>

          {!loadingStore && (
            <div className={`flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold ${isStoreOpen ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
              <Circle className="w-2 h-2 fill-current" />
              {isStoreOpen ? 'ABERTO' : 'FECHADO'}
            </div>
          )}
        </div>
      </header>

      <main className="max-w-2xl mx-auto p-4 space-y-4">
        
        {/* Seção 1: Endereços */}
        <section className="bg-white dark:bg-neutral-900 rounded-2xl p-4 shadow-sm border border-neutral-200 dark:border-neutral-800">
          <h2 className="font-semibold mb-4 flex items-center gap-2">
            <MapPin className="text-[#9d0094]" /> Endereço de entrega
          </h2>
          <div className="space-y-3">
            {loadingAddresses ? (
               <div className="p-4 text-center text-neutral-500">Carregando endereços...</div>
            ) : addresses.map(address => {
              const Icon = getAddressIcon(address.label);
              const isSelected = selectedAddress?.id === address.id;
              return (
                <button
                  key={address.id}
                  onClick={() => handleSelectAddress(address)}
                  className={`w-full p-4 rounded-xl border-2 flex items-center gap-4 transition-all ${isSelected ? 'border-[#9d0094] bg-[#9d0094]/5' : 'border-neutral-100 dark:border-neutral-800'}`}
                >
                  <Icon className={isSelected ? 'text-[#9d0094]' : 'text-neutral-400'} />
                  <div className="text-left flex-1">
                    <p className="font-bold text-sm">{address.label}</p>
                    <p className="text-xs text-neutral-500">{address.street}, {address.number} - {address.neighborhood}</p>
                  </div>
                  {isSelected && <Check className="text-[#9d0094] w-5 h-5" />}
                </button>
              );
            })}
            <Button variant="outline" className="w-full border-dashed" onClick={() => setShowAddressModal(true)}>
              <Plus className="w-4 h-4 mr-2" /> Adicionar novo endereço
            </Button>
          </div>
        </section>

        {/* Seção 2: Pagamento */}
        <section className="bg-white dark:bg-neutral-900 rounded-2xl p-4 shadow-sm border border-neutral-200 dark:border-neutral-800">
          <h2 className="font-semibold mb-4">Forma de pagamento</h2>
          <div className="grid grid-cols-1 gap-2">
            {PAYMENT_METHODS.map(m => (
              <button
                key={m.id}
                onClick={() => setPaymentMethod(m.id)}
                className={`flex items-center gap-3 py-3 px-4 rounded-2xl border-2 transition-all ${paymentMethod === m.id ? 'border-[#9d0094] bg-[#9d0094]/5' : 'border-neutral-100 dark:border-neutral-800'}`}
              >
                <m.icon className={`w-5 h-5 ${paymentMethod === m.id ? 'text-[#9d0094]' : ''}`} />
                <span className="font-medium text-sm">{m.label}</span>
              </button>
            ))}
          </div>

          {/* Troco (se dinheiro) */}
          {paymentMethod === 'cash' && (
            <div className="mt-4 pt-4 border-t border-neutral-100 dark:border-neutral-800 animate-in fade-in slide-in-from-top-2">
              <label className="text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-2 block">
                Troco para quanto?
              </label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-neutral-500">R$</span>
                <input
                  type="number"
                  placeholder="0,00"
                  value={changeFor}
                  onChange={(e) => setChangeFor(e.target.value)}
                  className="w-full pl-9 pr-4 py-2 rounded-xl border border-neutral-200 dark:border-neutral-700 bg-neutral-50 dark:bg-neutral-800 focus:outline-none focus:ring-2 focus:ring-[#9d0094]/20 focus:border-[#9d0094]"
                />
              </div>
              <p className="text-xs text-neutral-400 mt-1">Deixe em branco se não precisar de troco.</p>
            </div>
          )}
        </section>

        {/* Seção 3: Resumo, Cupom e Total */}
        <section className="bg-white dark:bg-neutral-900 rounded-2xl p-6 shadow-sm border border-neutral-200 dark:border-neutral-800 space-y-3">
          
          {/* ✅ CUPOM INPUT */}
          <div className="pb-6 mb-4 border-b border-neutral-100 dark:border-neutral-800">
             <CouponInput />
          </div>

          <div className="flex justify-between text-sm">
            <span className="text-neutral-500">Subtotal</span>
            <span>R$ {cart.subtotal.toFixed(2)}</span>
          </div>

          {/* ✅ DESCONTO VISUAL */}
          {cart.discount > 0 && (
            <div className="flex justify-between text-sm text-green-600 font-medium animate-in fade-in">
              <span>Desconto</span>
              <span>- R$ {cart.discount.toFixed(2)}</span>
            </div>
          )}

          <div className="flex justify-between text-sm">
            <span className="text-neutral-500">Taxa de entrega</span>
            {loadingFee ? <Loader2 className="w-4 h-4 animate-spin" /> : (
              <span className={cart.deliveryFee === 0 ? 'text-green-600 font-bold' : ''}>
                {cart.deliveryFee === 0 ? 'Grátis' : `R$ ${cart.deliveryFee.toFixed(2)}`}
              </span>
            )}
          </div>

          <div className="flex justify-between text-sm">
            <span className="text-neutral-500 flex items-center gap-1.5">
              <Clock className="w-3.5 h-3.5" /> Tempo estimado
            </span>
            {loadingFee ? (
              <span className="text-neutral-400">Calculando...</span>
            ) : (
              <span className="font-medium text-neutral-700 dark:text-neutral-300">
                {estimatedTime || '40-50 min'}
              </span>
            )}
          </div>

          <div className="flex justify-between items-center pt-4 border-t border-neutral-100 dark:border-neutral-800">
            <span className="font-bold text-lg">Total</span>
            <span className="text-2xl font-black text-[#9d0094]">R$ {cart.total.toFixed(2)}</span>
          </div>

          <Button
            disabled={loading || loadingFee || !selectedAddress || !isStoreOpen}
            onClick={handlePlaceOrder}
            className="w-full h-14 text-lg font-bold transition-transform active:scale-95 rounded-xl shadow-lg hover:brightness-110"
            style={{ backgroundColor: isStoreOpen ? '#139948' : '#666' }}
          >
            {loading ? <Loader2 className="animate-spin" /> : (isStoreOpen ? 'Finalizar Pedido' : 'Loja Fechada')}
          </Button>
        </section>
      </main>

      {/* Modal de Endereço */}
      <AddressModal
        isOpen={showAddressModal}
        onClose={() => setShowAddressModal(false)}
        onSave={handleAddressSaved}
      />
    </div>
  );
}