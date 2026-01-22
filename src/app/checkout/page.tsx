// src/app/checkout/page.tsx
'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { 
  ArrowLeft, 
  MapPin, 
  Plus,
  Check,
  Home,
  Briefcase,
  MapPinned,
  CreditCard,
  Banknote,
  QrCode,
  Truck,
  Store,
  ChevronRight,
  X
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useCart } from '@/hooks/useCart';
import { toast } from 'sonner';
import { SavedAddress } from '@/types/api';
import { DeliveryType, PaymentMethod } from '@/types/cart';
import { sanitizeCep, sanitizeAddress, sanitizeName, sanitizeNumber, sanitizeMoneyValue } from '@/lib/sanitize';

// =====================================================
// MOCK DE ENDEREÇOS SALVOS
// =====================================================
// TODO: GET /api/auth/addresses

const mockAddresses: SavedAddress[] = [
  {
    id: 'addr-1',
    label: 'Casa',
    street: 'Rua das Flores',
    number: '123',
    complement: 'Apto 45',
    neighborhood: 'Aldeota',
    city: 'Fortaleza',
    state: 'CE',
    zipCode: '60150-000',
    reference: 'Próximo ao mercado',
    isDefault: true,
  },
  {
    id: 'addr-2',
    label: 'Trabalho',
    street: 'Av. Santos Dumont',
    number: '1500',
    complement: 'Sala 302',
    neighborhood: 'Aldeota',
    city: 'Fortaleza',
    state: 'CE',
    zipCode: '60150-161',
    isDefault: false,
  },
];

// =====================================================
// CONFIGURAÇÃO
// =====================================================

const DELIVERY_FEE = 5.00; // TODO: Calcular via API
const PICKUP_DISCOUNT = 0; // Desconto para retirada

const PAYMENT_METHODS: { id: PaymentMethod; label: string; icon: typeof CreditCard; description?: string }[] = [
  { id: 'pix', label: 'PIX', icon: QrCode, description: 'Aprovação instantânea' },
  { id: 'credit', label: 'Cartão de Crédito', icon: CreditCard, description: 'Débito na entrega' },
  { id: 'debit', label: 'Cartão de Débito', icon: CreditCard, description: 'Débito na entrega' },
  { id: 'cash', label: 'Dinheiro', icon: Banknote, description: 'Pague na entrega' },
];

// =====================================================
// COMPONENTE MODAL DE NOVO ENDEREÇO
// =====================================================

interface AddressModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (address: SavedAddress) => void;
}

function AddressModal({ isOpen, onClose, onSave }: AddressModalProps) {
  const [formData, setFormData] = useState({
    label: '',
    zipCode: '',
    street: '',
    number: '',
    complement: '',
    neighborhood: '',
    city: 'Fortaleza',
    state: 'CE',
    reference: '',
  });
  const [loading, setLoading] = useState(false);

  const handleZipCodeChange = async (zipCode: string) => {
    const cleaned = sanitizeCep(zipCode);
    setFormData(prev => ({ ...prev, zipCode: cleaned }));

    // Buscar CEP via API
    if (cleaned.length === 8) {
      setLoading(true);
      try {
        const response = await fetch(`https://viacep.com.br/ws/${cleaned}/json/`);
        const data = await response.json();
        if (!data.erro) {
          setFormData(prev => ({
            ...prev,
            street: data.logradouro || '',
            neighborhood: data.bairro || '',
            city: data.localidade || 'Fortaleza',
            state: data.uf || 'CE',
          }));
        }
      } catch (error) {
        console.error('Erro ao buscar CEP:', error);
      }
      setLoading(false);
    }
  };

  const handleSubmit = () => {
    if (!formData.street || !formData.number || !formData.neighborhood) {
      toast.error('Preencha os campos obrigatórios');
      return;
    }

    const newAddress: SavedAddress = {
      id: `addr-${Date.now()}`,
      ...formData,
      isDefault: false,
    };

    onSave(newAddress);
    onClose();
    
    // Reset form
    setFormData({
      label: '',
      zipCode: '',
      street: '',
      number: '',
      complement: '',
      neighborhood: '',
      city: 'Fortaleza',
      state: 'CE',
      reference: '',
    });
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center">
      {/* Overlay */}
      <div 
        className="absolute inset-0 bg-black/50"
        onClick={onClose}
      />
      
      {/* Modal */}
      <div className="relative bg-white dark:bg-neutral-900 w-full sm:max-w-lg sm:rounded-2xl rounded-t-2xl max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="sticky top-0 bg-white dark:bg-neutral-900 border-b border-neutral-200 dark:border-neutral-800 p-4 flex items-center justify-between">
          <h2 className="text-lg font-bold">Novo endereço</h2>
          <button
            onClick={onClose}
            className="p-2 rounded-full hover:bg-neutral-100 dark:hover:bg-neutral-800"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form */}
        <div className="p-4 space-y-4">
          {/* Apelido */}
          <div>
            <label className="text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-1.5 block">
              Apelido (opcional)
            </label>
            <div className="flex gap-2">
              {['Casa', 'Trabalho', 'Outro'].map((label) => (
                <button
                  key={label}
                  onClick={() => setFormData(prev => ({ ...prev, label }))}
                  className={`px-4 py-2 rounded-xl text-sm font-medium transition-all border-2 ${
                    formData.label === label
                      ? 'border-[#9d0094] text-[#9d0094] bg-[#9d0094]/5'
                      : 'border-neutral-200 dark:border-neutral-700 hover:border-neutral-300'
                  }`}
                >
                  {label}
                </button>
              ))}
            </div>
          </div>

          {/* CEP */}
          <div>
            <label className="text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-1.5 block">
              CEP *
            </label>
            <input
              type="text"
              value={formData.zipCode}
              onChange={(e) => handleZipCodeChange(e.target.value)}
              placeholder="00000-000"
              maxLength={9}
              className="w-full px-4 py-3 rounded-xl border-2 border-neutral-200 dark:border-neutral-700 bg-transparent focus:border-[#9d0094] focus:outline-none transition-colors"
            />
          </div>

          {/* Rua */}
          <div>
            <label className="text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-1.5 block">
              Rua *
            </label>
            <input
              type="text"
              value={formData.street}
              onChange={(e) => setFormData(prev => ({ ...prev, street: sanitizeAddress(e.target.value) }))}
              placeholder="Nome da rua"
              maxLength={200}
              className="w-full px-4 py-3 rounded-xl border-2 border-neutral-200 dark:border-neutral-700 bg-transparent focus:border-[#9d0094] focus:outline-none transition-colors"
            />
          </div>

          {/* Número e Complemento */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-1.5 block">
                Número *
              </label>
              <input
                type="text"
                value={formData.number}
                onChange={(e) => setFormData(prev => ({ ...prev, number: sanitizeNumber(e.target.value) }))}
                placeholder="123"
                maxLength={10}
                className="w-full px-4 py-3 rounded-xl border-2 border-neutral-200 dark:border-neutral-700 bg-transparent focus:border-[#9d0094] focus:outline-none transition-colors"
              />
            </div>
            <div>
              <label className="text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-1.5 block">
                Complemento
              </label>
              <input
                type="text"
                value={formData.complement}
                onChange={(e) => setFormData(prev => ({ ...prev, complement: sanitizeAddress(e.target.value) }))}
                placeholder="Apto, Bloco..."
                maxLength={100}
                className="w-full px-4 py-3 rounded-xl border-2 border-neutral-200 dark:border-neutral-700 bg-transparent focus:border-[#9d0094] focus:outline-none transition-colors"
              />
            </div>
          </div>

          {/* Bairro */}
          <div>
            <label className="text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-1.5 block">
              Bairro *
            </label>
            <input
              type="text"
              value={formData.neighborhood}
              onChange={(e) => setFormData(prev => ({ ...prev, neighborhood: sanitizeAddress(e.target.value) }))}
              placeholder="Nome do bairro"
              maxLength={100}
              className="w-full px-4 py-3 rounded-xl border-2 border-neutral-200 dark:border-neutral-700 bg-transparent focus:border-[#9d0094] focus:outline-none transition-colors"
            />
          </div>

          {/* Cidade e Estado */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-1.5 block">
                Cidade
              </label>
              <input
                type="text"
                value={formData.city}
                readOnly
                className="w-full px-4 py-3 rounded-xl border-2 border-neutral-200 dark:border-neutral-700 bg-neutral-50 dark:bg-neutral-800 text-neutral-500"
              />
            </div>
            <div>
              <label className="text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-1.5 block">
                Estado
              </label>
              <input
                type="text"
                value={formData.state}
                readOnly
                className="w-full px-4 py-3 rounded-xl border-2 border-neutral-200 dark:border-neutral-700 bg-neutral-50 dark:bg-neutral-800 text-neutral-500"
              />
            </div>
          </div>

          {/* Referência */}
          <div>
            <label className="text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-1.5 block">
              Ponto de referência
            </label>
            <input
              type="text"
              value={formData.reference}
              onChange={(e) => setFormData(prev => ({ ...prev, reference: sanitizeAddress(e.target.value) }))}
              placeholder="Próximo a..."
              maxLength={200}
              className="w-full px-4 py-3 rounded-xl border-2 border-neutral-200 dark:border-neutral-700 bg-transparent focus:border-[#9d0094] focus:outline-none transition-colors"
            />
          </div>
        </div>

        {/* Footer */}
        <div className="sticky bottom-0 bg-white dark:bg-neutral-900 border-t border-neutral-200 dark:border-neutral-800 p-4">
          <Button
            onClick={handleSubmit}
            disabled={loading}
            className="w-full h-12 text-white font-semibold rounded-xl"
            style={{ backgroundColor: '#9d0094' }}
          >
            Salvar endereço
          </Button>
        </div>
      </div>
    </div>
  );
}

// =====================================================
// PÁGINA PRINCIPAL DE CHECKOUT
// =====================================================

export default function CheckoutPage() {
  const router = useRouter();
  const cart = useCart();
  
  const [addresses, setAddresses] = useState<SavedAddress[]>(mockAddresses);
  const [selectedAddress, setSelectedAddress] = useState<SavedAddress | null>(
    mockAddresses.find(a => a.isDefault) || null
  );
  const [deliveryType, setDeliveryType] = useState<DeliveryType>('delivery');
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('pix');
  const [changeFor, setChangeFor] = useState('');
  const [showAddressModal, setShowAddressModal] = useState(false);
  const [loading, setLoading] = useState(false);

  // Atualizar taxa de entrega baseado no tipo
  useEffect(() => {
    if (deliveryType === 'delivery') {
      cart.setDeliveryFee(DELIVERY_FEE);
    } else {
      cart.setDeliveryFee(0);
    }
  }, [deliveryType]);

  const handleAddAddress = (newAddress: SavedAddress) => {
    setAddresses(prev => [...prev, newAddress]);
    setSelectedAddress(newAddress);
    toast.success('Endereço adicionado!');
  };

  const handlePlaceOrder = async () => {
    // Validações
    if (deliveryType === 'delivery' && !selectedAddress) {
      toast.error('Selecione um endereço de entrega');
      return;
    }

    if (paymentMethod === 'cash' && !changeFor) {
      toast.error('Informe o valor para troco');
      return;
    }

    setLoading(true);

    // TODO: POST /api/orders
    // Simular criação do pedido
    await new Promise(resolve => setTimeout(resolve, 2000));

    toast.success('Pedido realizado com sucesso!', {
      description: 'Acompanhe o status em "Meus Pedidos"',
    });

    cart.clearCart();
    router.push('/pedidos');
  };

  const getAddressIcon = (label: string) => {
    switch (label.toLowerCase()) {
      case 'casa': return Home;
      case 'trabalho': return Briefcase;
      default: return MapPinned;
    }
  };

  // Redirecionar se carrinho vazio
  if (cart.items.length === 0) {
    return (
      <div className="min-h-screen bg-neutral-50 dark:bg-background flex items-center justify-center p-4">
        <div className="text-center">
          <h1 className="text-xl font-bold mb-2">Carrinho vazio</h1>
          <p className="text-neutral-500 mb-4">Adicione itens para continuar</p>
          <Button onClick={() => router.push('/')} style={{ backgroundColor: '#9d0094' }} className="text-white">
            Ver cardápio
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background pb-20">
      {/* Header */}
      <header className="sticky top-0 z-40 bg-background border-b border-neutral-200/50 dark:border-neutral-800/50">
        <div className="max-w-2xl mx-auto px-4 py-3 flex items-center gap-3">
          <button
            onClick={() => router.back()}
            className="p-2 -ml-2 rounded-full hover:bg-neutral-100 dark:hover:bg-muted transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <h1 className="font-semibold text-lg">Finalizar pedido</h1>
        </div>
      </header>

      <div className="max-w-2xl mx-auto px-4 py-6 space-y-4">
        {/* Tipo de entrega */}
        <section className="bg-card rounded-2xl p-4">
          <h2 className="font-semibold text-neutral-800 dark:text-neutral-200 mb-3">
            Como deseja receber?
          </h2>
          <div className="grid grid-cols-2 gap-3">
            <button
              onClick={() => setDeliveryType('delivery')}
              className={`p-4 rounded-xl border-2 flex flex-col items-center gap-2 transition-all ${
                deliveryType === 'delivery'
                  ? 'border-[#9d0094] bg-[#9d0094]/5'
                  : 'border-neutral-200 dark:border-neutral-700 hover:border-neutral-300'
              }`}
            >
              <Truck className={`w-6 h-6 ${deliveryType === 'delivery' ? 'text-[#9d0094]' : 'text-neutral-500'}`} />
              <span className={`font-medium ${deliveryType === 'delivery' ? 'text-[#9d0094]' : ''}`}>
                Entrega
              </span>
              <span className="text-xs text-neutral-500">
                R$ {DELIVERY_FEE.toFixed(2)}
              </span>
            </button>
            <button
              onClick={() => setDeliveryType('pickup')}
              className={`p-4 rounded-xl border-2 flex flex-col items-center gap-2 transition-all ${
                deliveryType === 'pickup'
                  ? 'border-[#9d0094] bg-[#9d0094]/5'
                  : 'border-neutral-200 dark:border-neutral-700 hover:border-neutral-300'
              }`}
            >
              <Store className={`w-6 h-6 ${deliveryType === 'pickup' ? 'text-[#9d0094]' : 'text-neutral-500'}`} />
              <span className={`font-medium ${deliveryType === 'pickup' ? 'text-[#9d0094]' : ''}`}>
                Retirada
              </span>
              <span className="text-xs text-green-600">
                Grátis
              </span>
            </button>
          </div>
        </section>

        {/* Endereço de entrega */}
        {deliveryType === 'delivery' && (
          <section className="bg-card rounded-2xl p-4">
            <h2 className="font-semibold text-neutral-800 dark:text-neutral-200 mb-3 flex items-center gap-2">
              <MapPin className="w-5 h-5" style={{ color: '#9d0094' }} />
              Endereço de entrega
            </h2>

            <div className="space-y-2">
              {addresses.map((address) => {
                const Icon = getAddressIcon(address.label);
                const isSelected = selectedAddress?.id === address.id;

                return (
                  <button
                    key={address.id}
                    onClick={() => setSelectedAddress(address)}
                    className={`w-full p-3 rounded-xl border-2 flex items-start gap-3 text-left transition-all ${
                      isSelected
                        ? 'border-[#9d0094] bg-[#9d0094]/5'
                        : 'border-neutral-200 dark:border-neutral-700 hover:border-neutral-300'
                    }`}
                  >
                    <div 
                      className="w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0"
                      style={{ backgroundColor: isSelected ? 'rgba(157, 0, 148, 0.1)' : 'rgba(0,0,0,0.05)' }}
                    >
                      <Icon className="w-5 h-5" style={{ color: isSelected ? '#9d0094' : '#6b7280' }} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className={`font-medium ${isSelected ? 'text-[#9d0094]' : ''}`}>
                        {address.label}
                      </p>
                      <p className="text-sm text-neutral-600 dark:text-neutral-400 line-clamp-1">
                        {address.street}, {address.number}
                        {address.complement && ` - ${address.complement}`}
                      </p>
                      <p className="text-xs text-neutral-500">
                        {address.neighborhood}
                      </p>
                    </div>
                    {isSelected && (
                      <div 
                        className="w-6 h-6 rounded-full flex items-center justify-center flex-shrink-0"
                        style={{ backgroundColor: '#9d0094' }}
                      >
                        <Check className="w-4 h-4 text-white" />
                      </div>
                    )}
                  </button>
                );
              })}

              {/* Adicionar novo endereço */}
              <button
                onClick={() => setShowAddressModal(true)}
                className="w-full p-3 rounded-xl border-2 border-dashed border-neutral-300 dark:border-neutral-700 flex items-center justify-center gap-2 text-neutral-600 dark:text-neutral-400 hover:border-[#9d0094] hover:text-[#9d0094] transition-colors"
              >
                <Plus className="w-5 h-5" />
                Adicionar novo endereço
              </button>
            </div>
          </section>
        )}

        {/* Retirada na loja */}
        {deliveryType === 'pickup' && (
          <section className="bg-card rounded-2xl p-4">
            <h2 className="font-semibold text-neutral-800 dark:text-neutral-200 mb-3 flex items-center gap-2">
              <Store className="w-5 h-5" style={{ color: '#9d0094' }} />
              Local de retirada
            </h2>
            <div className="p-3 bg-neutral-50 dark:bg-neutral-800 rounded-xl">
              <p className="font-medium">GetAçaí</p>
              <p className="text-sm text-neutral-600 dark:text-neutral-400">
                Rua Exemplo, 123 - Centro
              </p>
              <p className="text-sm text-neutral-500 mt-1">
                Horário: 10h às 21h
              </p>
            </div>
          </section>
        )}

        {/* Forma de pagamento */}
        <section className="bg-card rounded-2xl p-4">
          <h2 className="font-semibold text-neutral-800 dark:text-neutral-200 mb-3 flex items-center gap-2">
            <CreditCard className="w-5 h-5" style={{ color: '#9d0094' }} />
            Forma de pagamento
          </h2>

          <div className="space-y-2">
            {PAYMENT_METHODS.map((method) => {
              const Icon = method.icon;
              const isSelected = paymentMethod === method.id;

              return (
                <button
                  key={method.id}
                  onClick={() => setPaymentMethod(method.id)}
                  className={`w-full p-3 rounded-xl border-2 flex items-center gap-3 transition-all ${
                    isSelected
                      ? 'border-[#9d0094] bg-[#9d0094]/5'
                      : 'border-neutral-200 dark:border-neutral-700 hover:border-neutral-300'
                  }`}
                >
                  <Icon className={`w-5 h-5 ${isSelected ? 'text-[#9d0094]' : 'text-neutral-500'}`} />
                  <div className="flex-1 text-left">
                    <p className={`font-medium ${isSelected ? 'text-[#9d0094]' : ''}`}>
                      {method.label}
                    </p>
                    {method.description && (
                      <p className="text-xs text-neutral-500">{method.description}</p>
                    )}
                  </div>
                  {isSelected && (
                    <div 
                      className="w-5 h-5 rounded-full flex items-center justify-center"
                      style={{ backgroundColor: '#9d0094' }}
                    >
                      <Check className="w-3 h-3 text-white" />
                    </div>
                  )}
                </button>
              );
            })}
          </div>

          {/* Troco */}
          {paymentMethod === 'cash' && (
            <div className="mt-4">
              <label className="text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-1.5 block">
                Troco para quanto?
              </label>
              <input
                type="text"
                value={changeFor}
                onChange={(e) => setChangeFor(sanitizeMoneyValue(e.target.value))}
                placeholder="R$ 0,00"
                maxLength={10}
                className="w-full px-4 py-3 rounded-xl border-2 border-neutral-200 dark:border-neutral-700 bg-transparent focus:border-[#9d0094] focus:outline-none transition-colors"
              />
            </div>
          )}
        </section>

        {/* Resumo */}
        <section className="bg-card rounded-2xl p-4">
          <h3 className="font-semibold text-neutral-800 dark:text-neutral-200 mb-3">
            Resumo do pedido
          </h3>

          <div className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-neutral-600 dark:text-neutral-400">
                Subtotal ({cart.itemCount} {cart.itemCount === 1 ? 'item' : 'itens'})
              </span>
              <span>R$ {cart.subtotal.toFixed(2)}</span>
            </div>

            {cart.discount > 0 && (
              <div className="flex justify-between text-green-600">
                <span>Desconto</span>
                <span>- R$ {cart.discount.toFixed(2)}</span>
              </div>
            )}

            <div className="flex justify-between">
              <span className="text-neutral-600 dark:text-neutral-400">
                {deliveryType === 'delivery' ? 'Taxa de entrega' : 'Retirada'}
              </span>
              <span className={cart.deliveryFee === 0 ? 'text-green-600' : ''}>
                {cart.deliveryFee === 0 ? 'Grátis' : `R$ ${cart.deliveryFee.toFixed(2)}`}
              </span>
            </div>

            <div className="pt-2 mt-2 border-t border-neutral-100 dark:border-neutral-800 flex justify-between">
              <span className="font-semibold">Total</span>
              <span className="text-lg font-bold" style={{ color: '#9d0094' }}>
                R$ {cart.total.toFixed(2)}
              </span>
            </div>
          </div>
        </section>

        {/* Botão de finalizar */}
        <Button
          onClick={handlePlaceOrder}
          disabled={loading || (deliveryType === 'delivery' && !selectedAddress)}
          className="w-full h-14 text-white font-semibold text-base rounded-xl disabled:opacity-50 mt-4"
          style={{ backgroundColor: '#139948' }}
        >
          {loading ? 'Finalizando...' : `Finalizar pedido • R$ ${cart.total.toFixed(2)}`}
        </Button>
      </div>

      {/* Modal de novo endereço */}
      <AddressModal
        isOpen={showAddressModal}
        onClose={() => setShowAddressModal(false)}
        onSave={handleAddAddress}
      />
    </div>
  );
}
