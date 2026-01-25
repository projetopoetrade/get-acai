'use client';

import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { 
  ArrowLeft, MapPin, Plus, Check, Home, Briefcase, MapPinned,
  CreditCard, Banknote, QrCode, Truck, X, Loader2, Circle
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useCart } from '@/hooks/useCart';
import { toast } from 'sonner';
import { CreateOrderRequest } from '@/types/api';
import { PaymentMethod } from '@/types/cart'; 
import { sanitizeMoneyValue } from '@/lib/sanitize';
import { ordersService } from '@/services/orders';
import { addressService, Address } from '@/services/address';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useDeliveryFee } from '@/hooks/useDeliveryFee';
import { useStoreConfig } from '@/hooks/useStoreConfig';
import { AddressModal } from '@/components/address/address-modal'; 

// =====================================================
// SCHEMA DE VALIDAÇÃO DO ENDEREÇO
// =====================================================
const addressFormSchema = z.object({
  cep: z.string().min(8, 'CEP inválido').transform(v => v.replace(/\D/g, '')),
  street: z.string().min(3, 'Rua obrigatória'),
  number: z.string().min(1, 'Número obrigatório'),
  neighborhood: z.string().min(3, 'Bairro obrigatório'),
  city: z.string().min(3, 'Cidade obrigatória'),
  state: z.string().length(2, 'UF inválida'),
  complement: z.string().optional(),
  reference: z.string().optional(),
  label: z.string().min(1, 'Dê um nome (ex: Casa)'),
});

type AddressFormData = z.infer<typeof addressFormSchema>;

const PAYMENT_METHODS: { id: PaymentMethod; label: string; icon: any; description?: string }[] = [
  { id: 'pix', label: 'PIX', icon: QrCode, description: 'Aprovação instantânea' },
  { id: 'credit', label: 'Cartão de Crédito', icon: CreditCard, description: 'Débito na entrega' },
  { id: 'debit', label: 'Cartão de Débito', icon: CreditCard, description: 'Débito na entrega' },
  { id: 'cash', label: 'Dinheiro', icon: Banknote, description: 'Pague na entrega' },
];

// =====================================================
// PÁGINA PRINCIPAL
// =====================================================
export default function CheckoutPage() {
  const router = useRouter();
  const cart = useCart();
  
  // Hooks dinâmicos integrados
  const { calculateFee, loading: loadingFee } = useDeliveryFee(); // Frete
  const { config: store, status: storeStatus, isLoading: loadingStore } = useStoreConfig(); // Status da Loja
  
  // ✅ Usa status.isOpen se disponível (vem do endpoint /settings/status)
  // Se não tiver status, usa config.isOpen como fallback
  const isStoreOpen = storeStatus?.isOpen ?? store?.isOpen ?? false;
  
  const [addresses, setAddresses] = useState<Address[]>([]);
  const [selectedAddress, setSelectedAddress] = useState<Address | null>(null);
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('pix');
  const [changeFor, setChangeFor] = useState('');
  const [showAddressModal, setShowAddressModal] = useState(false);
  const [loading, setLoading] = useState(false);
  const [loadingAddresses, setLoadingAddresses] = useState(true);

  const handleSelectAddress = useCallback(async (address: Address) => {
    setSelectedAddress(address);
    try {
      const info = await calculateFee(address.neighborhood);
      if (info) {
        cart.setDeliveryFee(info.fee);
        toast.success(`Taxa para ${address.neighborhood}: R$ ${info.fee.toFixed(2)}`);
      }
    } catch (err) {
      cart.setDeliveryFee(0);
      toast.error("Erro ao calcular frete para este bairro.");
    }
  }, [calculateFee, cart]);


  // Carregar endereços salvos
  useEffect(() => {
    async function loadData() {
      try {
        const data = await addressService.getMyAddresses();
        setAddresses(data);
        
        // PRIORIDADE 1: Endereço padrão (isDefault: true)
        // PRIORIDADE 2: Primeiro endereço da lista como fallback
        const defaultAddress = data.find(a => a.isDefault) || data[0];
        
        if (defaultAddress) {
          handleSelectAddress(defaultAddress); // Seleciona e já calcula o frete automaticamente
        }
      } catch (error) {
        console.error("Erro ao carregar endereços", error);
      } finally {
        setLoadingAddresses(false);
      }
    }
    loadData();
  }, []);

  // Seleção de endereço com gatilho de frete dinâmico

  // Handler para quando um novo endereço é salvo
  const handleAddressSaved = async (newAddress: Address) => {
    // Adiciona o novo endereço à lista
    setAddresses(prev => [...prev, newAddress]);
    // Seleciona automaticamente o novo endereço
    await handleSelectAddress(newAddress);
  };

  const handlePlaceOrder = async () => {
    if (!selectedAddress) return toast.error('Selecione um endereço');
    if (!isStoreOpen) return toast.error('Loja fechada no momento'); // Validação de segurança

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
        changeFor: paymentMethod === 'cash' ? parseFloat(changeFor.replace(',', '.')) : undefined,
      };

      await ordersService.create(payload);
      toast.success('Pedido enviado!');
      cart.clearCart();
      router.push('/pedidos');
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Erro ao criar pedido');
    } finally {
      setLoading(false);
    }
  };

  const getAddressIcon = (label: string) => {
    const l = label.toLowerCase();
    if (l.includes('casa')) return Home;
    if (l.includes('trab')) return Briefcase;
    return MapPinned;
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
      <header className="sticky top-0 z-40 bg-white dark:bg-neutral-900 border-b p-4">
        <div className="max-w-2xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <button onClick={() => router.back()}><ArrowLeft /></button>
            <h1 className="font-bold text-lg">Finalizar Pedido</h1>
          </div>
          
          {/* Status da Loja no Header */}
          {!loadingStore && (
            <div className={`flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold ${
              isStoreOpen ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
            }`}>
              <Circle className="w-2 h-2 fill-current" />
              {isStoreOpen ? 'ABERTO' : 'FECHADO'}
            </div>
          )}
        </div>
      </header>

      <main className="max-w-2xl mx-auto p-4 space-y-4">
        {/* Endereços */}
        <section className="bg-white dark:bg-neutral-900 rounded-2xl p-4 shadow-sm border">
          <h2 className="font-semibold mb-4 flex items-center gap-2"><MapPin className="text-[#9d0094]"/> Endereço de entrega</h2>
          <div className="space-y-3">
            {addresses.map(address => {
              const Icon = getAddressIcon(address.label);
              const isSelected = selectedAddress?.id === address.id;
              return (
                <button 
                  key={address.id} 
                  onClick={() => handleSelectAddress(address)}
                  className={`w-full p-4 rounded-xl border-2 flex items-center gap-4 transition-all ${
                    isSelected ? 'border-[#9d0094] bg-[#9d0094]/5' : 'border-neutral-100 dark:border-neutral-800'
                  }`}
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

        {/* Pagamento */}
        <section className="bg-white dark:bg-neutral-900 rounded-2xl p-4 shadow-sm border">
          <h2 className="font-semibold mb-4">Forma de pagamento</h2>
          <div className="grid grid-cols-1 gap-2">
            {PAYMENT_METHODS.map(m => (
              <button 
                key={m.id} 
                onClick={() => setPaymentMethod(m.id)}
                className={`flex items-center gap-3 p-4 rounded-xl border-2 transition-all ${
                  paymentMethod === m.id ? 'border-[#9d0094] bg-[#9d0094]/5' : 'border-neutral-100 dark:border-neutral-800'
                }`}
              >
                <m.icon className={paymentMethod === m.id ? 'text-[#9d0094]' : ''} />
                <span className="font-medium text-sm">{m.label}</span>
              </button>
            ))}
          </div>
        </section>

        {/* Resumo e Botão de Ação */}
        <section className="bg-white dark:bg-neutral-900 rounded-2xl p-6 shadow-sm border space-y-3">
          <div className="flex justify-between text-sm">
            <span className="text-neutral-500">Subtotal</span>
            <span>R$ {cart.subtotal.toFixed(2)}</span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-neutral-500">Taxa de entrega</span>
            {loadingFee ? <Loader2 className="w-4 h-4 animate-spin" /> : (
              <span className={cart.deliveryFee === 0 ? 'text-green-600 font-bold' : ''}>
                {cart.deliveryFee === 0 ? 'Grátis' : `R$ ${cart.deliveryFee.toFixed(2)}`}
              </span>
            )}
          </div>
          <div className="flex justify-between items-center pt-4 border-t">
            <span className="font-bold text-lg">Total</span>
            <span className="text-2xl font-black text-[#9d0094]">R$ {cart.total.toFixed(2)}</span>
          </div>

          <Button 
            disabled={loading || loadingFee || !selectedAddress || !isStoreOpen} 
            onClick={handlePlaceOrder}
            className="w-full h-14 text-lg font-bold transition-transform active:scale-95"
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