// src/app/checkout/page.tsx
'use client';

import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { 
  ArrowLeft, MapPin, Plus, Check, Home, Briefcase, MapPinned,
  CreditCard, Banknote, QrCode, Truck, X, Loader2
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useCart } from '@/hooks/useCart';
import { toast } from 'sonner';
import { CreateOrderRequest } from '@/types/api';
import { PaymentMethod } from '@/types/cart'; 
import { sanitizeMoneyValue } from '@/lib/sanitize';
import { ordersService } from '@/services/orders';
import { addressService, Address } from '@/services/address';
import { deliveryService } from '@/services/delivery';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';

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

// =====================================================
// CONFIGURAÇÃO DE PAGAMENTO
// =====================================================
const PAYMENT_METHODS: { id: PaymentMethod; label: string; icon: any; description?: string }[] = [
  { id: 'pix', label: 'PIX', icon: QrCode, description: 'Aprovação instantânea' },
  { id: 'credit', label: 'Cartão de Crédito', icon: CreditCard, description: 'Débito na entrega' },
  { id: 'debit', label: 'Cartão de Débito', icon: CreditCard, description: 'Débito na entrega' },
  { id: 'cash', label: 'Dinheiro', icon: Banknote, description: 'Pague na entrega' },
];

// =====================================================
// COMPONENTE MODAL (Novo Endereço)
// =====================================================
interface AddressModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (address: Address) => void;
}

function AddressModal({ isOpen, onClose, onSave }: AddressModalProps) {
  const [loadingCep, setLoadingCep] = useState(false);
  const [saving, setSaving] = useState(false);

  const { register, handleSubmit, setValue, reset, formState: { errors } } = useForm<AddressFormData>({
    resolver: zodResolver(addressFormSchema),
    defaultValues: { city: 'Camaçari', state: 'BA' }
  });

  useEffect(() => {
    if (!isOpen) reset();
  }, [isOpen, reset]);

  const handleCepBlur = async (e: React.FocusEvent<HTMLInputElement>) => {
    const cep = e.target.value.replace(/\D/g, '');
    if (cep.length !== 8) return;

    try {
      setLoadingCep(true);
      const data = await addressService.getByCep(cep);
      
      setValue('street', data.logradouro);
      setValue('neighborhood', data.bairro);
      setValue('city', data.localidade);
      setValue('state', data.uf);
      
      if (data.bairro) {
        try {
           const info = await deliveryService.checkNeighborhood(data.bairro);
           toast.success(`Entregamos em ${data.bairro}!`);
        } catch (err) {
           toast.warning(`Atenção: Talvez não entreguemos em ${data.bairro}`);
        }
      }
    } catch (error) {
      toast.error('CEP não encontrado');
    } finally {
      setLoadingCep(false);
    }
  };

  const onSubmit = async (data: AddressFormData) => {
    try {
      setSaving(true);
      const newAddress = await addressService.create({
        ...data,
        isDefault: false
      });
      onSave(newAddress);
      onClose();
      toast.success('Endereço salvo!');
    } catch (error) {
      toast.error('Erro ao salvar endereço');
    } finally {
      setSaving(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-4 sm:p-0">
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={onClose} />
      <div className="relative bg-white dark:bg-neutral-900 w-full sm:max-w-lg rounded-2xl max-h-[90vh] overflow-y-auto shadow-xl">
        <div className="sticky top-0 bg-white dark:bg-neutral-900 border-b border-neutral-100 dark:border-neutral-800 p-4 flex items-center justify-between z-10">
          <h2 className="text-lg font-bold">Novo endereço</h2>
          <button onClick={onClose} className="p-2 rounded-full hover:bg-neutral-100 dark:hover:bg-neutral-800">
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="p-4 space-y-4">
          <div>
            <label className="text-sm font-medium mb-1.5 block">Apelido</label>
            <div className="flex gap-2 mb-2">
              {['Casa', 'Trabalho'].map(l => (
                <button type="button" key={l} onClick={() => setValue('label', l)}
                  className="px-3 py-1.5 rounded-lg border text-sm hover:bg-neutral-50 dark:hover:bg-neutral-800">
                  {l}
                </button>
              ))}
            </div>
            <input {...register('label')} placeholder="Ex: Casa da Namorada" className="w-full px-4 py-3 rounded-xl border bg-transparent" />
            {errors.label && <span className="text-red-500 text-xs">{errors.label.message}</span>}
          </div>

          <div className="grid grid-cols-2 gap-3">
             <div>
                <label className="text-sm font-medium mb-1.5 block">CEP</label>
                <div className="relative">
                  <input {...register('cep')} onBlur={handleCepBlur} placeholder="00000-000" maxLength={9} className="w-full px-4 py-3 rounded-xl border bg-transparent" />
                  {loadingCep && <Loader2 className="absolute right-3 top-3.5 w-5 h-5 animate-spin text-neutral-400" />}
                </div>
                {errors.cep && <span className="text-red-500 text-xs">{errors.cep.message}</span>}
             </div>
             <div>
                <label className="text-sm font-medium mb-1.5 block">Número</label>
                <input {...register('number')} placeholder="123" className="w-full px-4 py-3 rounded-xl border bg-transparent" />
                {errors.number && <span className="text-red-500 text-xs">{errors.number.message}</span>}
             </div>
          </div>

          <div>
            <label className="text-sm font-medium mb-1.5 block">Rua</label>
            <input {...register('street')} readOnly={loadingCep} className="w-full px-4 py-3 rounded-xl border bg-transparent" />
            {errors.street && <span className="text-red-500 text-xs">{errors.street.message}</span>}
          </div>

          <div>
            <label className="text-sm font-medium mb-1.5 block">Bairro</label>
            <input {...register('neighborhood')} readOnly={loadingCep} className="w-full px-4 py-3 rounded-xl border bg-transparent" />
            {errors.neighborhood && <span className="text-red-500 text-xs">{errors.neighborhood.message}</span>}
          </div>

          <div className="grid grid-cols-2 gap-3">
            <input {...register('complement')} placeholder="Complemento" className="w-full px-4 py-3 rounded-xl border bg-transparent" />
            <input {...register('reference')} placeholder="Referência" className="w-full px-4 py-3 rounded-xl border bg-transparent" />
          </div>

          <div className="grid grid-cols-2 gap-3">
             <input {...register('city')} readOnly className="w-full px-4 py-3 rounded-xl border bg-neutral-100 dark:bg-neutral-800 text-neutral-500" />
             <input {...register('state')} readOnly className="w-full px-4 py-3 rounded-xl border bg-neutral-100 dark:bg-neutral-800 text-neutral-500" />
          </div>

          <div className="sticky bottom-0 pt-4 bg-white dark:bg-neutral-900">
            <Button type="submit" disabled={saving || loadingCep} className="w-full h-12 text-white font-semibold rounded-xl" style={{ backgroundColor: '#9d0094' }}>
              {saving ? <Loader2 className="w-5 h-5 animate-spin" /> : 'Salvar endereço'}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}

// =====================================================
// PÁGINA PRINCIPAL
// =====================================================
export default function CheckoutPage() {
  const router = useRouter();
  const cart = useCart();
  
  const [addresses, setAddresses] = useState<Address[]>([]);
  const [selectedAddress, setSelectedAddress] = useState<Address | null>(null);
  
  const deliveryType = 'delivery'; 
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('pix');
  const [changeFor, setChangeFor] = useState('');
  
  const [showAddressModal, setShowAddressModal] = useState(false);
  const [loading, setLoading] = useState(false);
  const [loadingAddresses, setLoadingAddresses] = useState(true);

  useEffect(() => {
    const loadAddresses = async () => {
      try {
        const data = await addressService.getMyAddresses();
        setAddresses(data);
        const def = data.find(a => a.isDefault) || data[0];
        if (def) handleSelectAddress(def);
      } catch (error) {
         // silent error
      } finally {
        setLoadingAddresses(false);
      }
    };
    loadAddresses();
  }, []);

  // ✅ CORREÇÃO 1: Conversão Segura da Taxa de Entrega
  const handleSelectAddress = useCallback(async (address: Address) => {
    setSelectedAddress(address);
    
    try {
      setLoading(true);
      const info = await deliveryService.checkNeighborhood(address.neighborhood);
      
      const feeNumber = Number(info.customDeliveryFee);
      const finalFee = isNaN(feeNumber) ? 0 : feeNumber;
      
      cart.setDeliveryFee(finalFee);
      toast.success(`Taxa de entrega atualizada: R$ ${finalFee.toFixed(2)}`);
    } catch (error: any) {
      toast.error(error.message || 'Não entregamos neste bairro');
      cart.setDeliveryFee(0);
    } finally {
      setLoading(false);
    }
  }, [cart]);

  const handlePlaceOrder = async () => {
    if (!selectedAddress) {
      toast.error('Selecione um endereço de entrega');
      return;
    }

    if (paymentMethod === 'cash' && !changeFor) {
      toast.error('Informe o valor para troco');
      return;
    }

    setLoading(true);

    try {
      const items = cart.items.map(item => ({
        productId: item.product.id,
        quantity: item.quantity,
        notes: item.customization?.observations,
        toppings: item.customization?.toppings.map(t => ({
          toppingId: t.id, 
          quantity: t.quantity,
        })) || [],
      }));

      const payload: CreateOrderRequest = {
        items,
        paymentMethod,
        deliveryMethod: deliveryType,
        notes: cart.items.map(i => i.customization?.observations).filter(Boolean).join('; '),
        changeFor: paymentMethod === 'cash' && changeFor ? parseFloat(changeFor.replace(',', '.')) : undefined,
        addressId: selectedAddress.id,
        // couponCode: cart.appliedCoupon?.code || undefined 
      };

      const order = await ordersService.create(payload);

      toast.success('Pedido realizado com sucesso!');
      cart.clearCart();
      router.push(`/pedidos`);
    } catch (error: any) {
      console.error(error);
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
      <div className="min-h-screen bg-neutral-50 dark:bg-background flex items-center justify-center p-4">
        <div className="text-center">
          <h1 className="text-xl font-bold mb-2">Carrinho vazio</h1>
          <Button onClick={() => router.push('/')} style={{ backgroundColor: '#9d0094' }} className="text-white">
            Ver cardápio
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background pb-32">
      <header className="sticky top-0 z-40 bg-background border-b border-neutral-200/50 dark:border-neutral-800/50">
        <div className="max-w-2xl mx-auto px-4 py-3 flex items-center gap-3">
          <button onClick={() => router.back()} className="p-2 -ml-2 rounded-full hover:bg-neutral-100 dark:hover:bg-muted">
            <ArrowLeft className="w-5 h-5" />
          </button>
          <h1 className="font-semibold text-lg">Finalizar pedido</h1>
        </div>
      </header>

      <div className="max-w-2xl mx-auto px-4 py-6 space-y-4">
        
        {/* Entrega */}
        <section className="bg-card rounded-2xl p-4 border border-neutral-200 dark:border-neutral-800">
          <h2 className="font-semibold mb-3">Como deseja receber?</h2>
          <div className="grid grid-cols-1">
            <div className="p-4 rounded-xl border-2 border-[#9d0094] bg-[#9d0094]/5 flex items-center gap-3">
              <Truck className="w-6 h-6 text-[#9d0094]" />
              <div className="flex-1">
                <span className="font-medium text-[#9d0094] block">Entrega</span>
                <span className="text-xs text-neutral-500">Receba no conforto de casa</span>
              </div>
              <Check className="w-5 h-5 text-[#9d0094]" />
            </div>
          </div>
        </section>

        {/* Endereço */}
        <section className="bg-card rounded-2xl p-4 border border-neutral-200 dark:border-neutral-800">
          <h2 className="font-semibold mb-3 flex items-center gap-2">
            <MapPin className="w-5 h-5" style={{ color: '#9d0094' }} /> Endereço de entrega
          </h2>
          
          <div className="space-y-2">
            {loadingAddresses ? (
                <div className="flex justify-center py-4"><Loader2 className="animate-spin text-neutral-400" /></div>
            ) : addresses.length === 0 ? (
                <p className="text-sm text-neutral-500 text-center py-2">Nenhum endereço salvo.</p>
            ) : (
              addresses.map((address) => {
                const Icon = getAddressIcon(address.label);
                const isSelected = selectedAddress?.id === address.id;
                return (
                  <button
                    key={address.id}
                    onClick={() => handleSelectAddress(address)}
                    className={`w-full p-3 rounded-xl border-2 flex items-start gap-3 text-left transition-all ${
                      isSelected ? 'border-[#9d0094] bg-[#9d0094]/5' : 'border-neutral-200 dark:border-neutral-700'
                    }`}
                  >
                    <div className="w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0" style={{ backgroundColor: isSelected ? 'rgba(157, 0, 148, 0.1)' : 'rgba(0,0,0,0.05)' }}>
                      <Icon className="w-5 h-5" style={{ color: isSelected ? '#9d0094' : '#6b7280' }} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className={`font-medium ${isSelected ? 'text-[#9d0094]' : ''}`}>{address.label}</p>
                      <p className="text-sm text-neutral-600 dark:text-neutral-400 line-clamp-1">
                        {address.street}, {address.number}
                      </p>
                      <p className="text-xs text-neutral-500">{address.neighborhood} - {address.city}</p>
                    </div>
                    {isSelected && <div className="w-6 h-6 rounded-full flex items-center justify-center flex-shrink-0" style={{ backgroundColor: '#9d0094' }}><Check className="w-4 h-4 text-white" /></div>}
                  </button>
                );
              })
            )}
            
            <button
              onClick={() => setShowAddressModal(true)}
              className="w-full p-3 rounded-xl border-2 border-dashed border-neutral-300 dark:border-neutral-700 flex items-center justify-center gap-2 text-neutral-600 hover:border-[#9d0094] hover:text-[#9d0094] transition-colors"
            >
              <Plus className="w-5 h-5" /> Adicionar novo endereço
            </button>
          </div>
        </section>

        {/* Pagamento */}
        <section className="bg-card rounded-2xl p-4 border border-neutral-200 dark:border-neutral-800">
           <h2 className="font-semibold mb-3 flex items-center gap-2">
             <CreditCard className="w-5 h-5" style={{ color: '#9d0094' }} /> Forma de pagamento
           </h2>
           <div className="space-y-2">
             {PAYMENT_METHODS.map(method => (
                <button
                  key={method.id}
                  onClick={() => setPaymentMethod(method.id)}
                  className={`w-full p-3 rounded-xl border-2 flex items-center gap-3 transition-all ${
                    paymentMethod === method.id ? 'border-[#9d0094] bg-[#9d0094]/5' : 'border-neutral-200 dark:border-neutral-700'
                  }`}
                >
                  <method.icon className={`w-5 h-5 ${paymentMethod === method.id ? 'text-[#9d0094]' : 'text-neutral-500'}`} />
                  <div className="flex-1 text-left">
                     <p className={`font-medium ${paymentMethod === method.id ? 'text-[#9d0094]' : ''}`}>{method.label}</p>
                     {method.description && <p className="text-xs text-neutral-500">{method.description}</p>}
                  </div>
                  {paymentMethod === method.id && <div className="w-5 h-5 rounded-full flex items-center justify-center" style={{ backgroundColor: '#9d0094' }}><Check className="w-3 h-3 text-white" /></div>}
                </button>
             ))}
           </div>
           {paymentMethod === 'cash' && (
              <div className="mt-4">
                 <label className="text-sm font-medium mb-1.5 block">Troco para quanto?</label>
                 <input 
                   value={changeFor}
                   onChange={(e) => setChangeFor(sanitizeMoneyValue(e.target.value))}
                   placeholder="R$ 0,00"
                   className="w-full px-4 py-3 rounded-xl border bg-transparent"
                 />
              </div>
           )}
        </section>

        {/* Resumo com BLINDAGEM */}
        <section className="bg-card rounded-2xl p-4 border border-neutral-200 dark:border-neutral-800 mb-8">
   <h3 className="font-semibold mb-3">Resumo do pedido</h3>
   <div className="space-y-2 text-sm">
      <div className="flex justify-between">
         <span className="text-neutral-600">Subtotal</span>
         <span>R$ {Number(cart.subtotal || 0).toFixed(2)}</span>
      </div>
      
      {(cart.discount || 0) > 0 && (
         <div className="flex justify-between text-green-600">
            <span>Desconto</span>
            <span>- R$ {Number(cart.discount || 0).toFixed(2)}</span>
         </div>
      )}
      
      <div className="flex justify-between">
         <span className="text-neutral-600">Taxa de entrega</span>
         <span className={(cart.deliveryFee || 0) === 0 ? 'text-green-600' : ''}>
            {(cart.deliveryFee || 0) === 0 ? 'Grátis' : `R$ ${Number(cart.deliveryFee || 0).toFixed(2)}`}
         </span>
      </div>

      <div className="pt-4 mt-4 border-t border-neutral-100 dark:border-neutral-800">
         <div className="flex justify-between items-center mb-6">
             <span className="font-semibold text-lg">Total</span>
             <span className="text-xl font-bold" style={{ color: '#9d0094' }}>
                R$ {Number(cart.total || 0).toFixed(2)}
             </span>
         </div>

         {/* ✅ O BOTÃO AGORA ESTÁ AQUI DENTRO */}
         <Button
           onClick={handlePlaceOrder}
           disabled={loading || !selectedAddress}
           className="w-full h-14 text-white font-semibold text-base rounded-xl shadow-md hover:shadow-lg transition-all"
           style={{ backgroundColor: '#139948' }}
         >
           {loading 
              ? <Loader2 className="animate-spin" /> 
              : 'Finalizar Pedido'
           }
         </Button>
      </div>
   </div>
</section>
</div>
</div>
);
}

