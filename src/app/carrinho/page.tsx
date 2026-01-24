// src/app/carrinho/page.tsx
'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import { 
  ArrowLeft, 
  Minus, 
  Plus, 
  Trash2, 
  ShoppingBag,
  Tag,
  Ticket,
  Cherry,
  AlertCircle
} from 'lucide-react';
import { Header } from '@/components/layout/header';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useCart } from '@/hooks/useCart';
import { toast } from 'sonner';
import { CartItem } from '@/types/cart';
import { sanitizeCouponCode } from '@/lib/sanitize';
import { couponSchema } from '@/lib/validations';
import { couponsService } from '@/services/coupons';

// =====================================================
// COMPONENTE DE ITEM DO CARRINHO
// =====================================================

function CartItemCard({ item }: { item: CartItem }) {
  const { updateItemQuantity, removeItem } = useCart();
  const [imageError, setImageError] = useState(false);

  const handleQuantityChange = (newQuantity: number) => {
    if (newQuantity <= 0) {
      removeItem(item.id);
      toast.success('Item removido do carrinho');
    } else {
      updateItemQuantity(item.id, newQuantity);
    }
  };

  // Montar descrição das customizações
  const customizationDetails: string[] = [];
  
  if (item.customization) {
    // Toppings
    const freeToppings = item.customization.toppings.filter(t => t.isFree);
    const paidToppings = item.customization.toppings.filter(t => !t.isFree);
    
    if (freeToppings.length > 0) {
      customizationDetails.push(
        freeToppings.map(t => t.quantity > 1 ? `${t.quantity}x ${t.name}` : t.name).join(', ')
      );
    }
    
    if (paidToppings.length > 0) {
      customizationDetails.push(
        `+ ${paidToppings.map(t => t.quantity > 1 ? `${t.quantity}x ${t.name}` : t.name).join(', ')}`
      );
    }

    // Talheres
    if (item.customization.wantsCutlery) {
      customizationDetails.push('Com talheres');
    }

    // Observações
    if (item.customization.observations) {
      customizationDetails.push(`"${item.customization.observations}"`);
    }
  }

  return (
    <div className="bg-white dark:bg-neutral-900 rounded-2xl p-4 border border-neutral-200 dark:border-neutral-800">
      <div className="flex gap-3">
        {/* Imagem */}
        <div className="relative w-20 h-20 rounded-xl overflow-hidden flex-shrink-0 bg-gradient-to-br from-neutral-100 to-neutral-50 dark:from-neutral-800 dark:to-neutral-900">
          {imageError ? (
            <div className="w-full h-full flex items-center justify-center">
              <Cherry className="w-8 h-8" style={{ color: '#c69abf' }} />
            </div>
          ) : (
            <Image
              src={item.product.imageUrl}
              alt={item.product.name}
              fill
              className="object-cover"
              onError={() => setImageError(true)}
            />
          )}
        </div>

        {/* Info */}
        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-2">
            <div className="flex-1 min-w-0">
              <h3 className="font-semibold text-neutral-900 dark:text-neutral-100">
                {item.product.name}
              </h3>
              
              {/* Customizações */}
              {customizationDetails.length > 0 && (
                <p className="text-xs text-neutral-500 dark:text-neutral-400 mt-0.5 line-clamp-2">
                  {customizationDetails.join(' • ')}
                </p>
              )}
            </div>

            {/* Botão remover */}
            <button
              onClick={() => {
                removeItem(item.id);
                toast.success('Item removido do carrinho');
              }}
              className="p-1.5 rounded-lg text-neutral-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          </div>

          {/* Preço e quantidade */}
          <div className="flex items-center justify-between mt-3">
            <span className="font-bold" style={{ color: '#9d0094' }}>
              R$ {item.totalPrice.toFixed(2)}
            </span>

            {/* Controle de quantidade */}
            <div className="flex items-center gap-2 bg-neutral-100 dark:bg-neutral-800 rounded-lg p-1">
              <button
                onClick={() => handleQuantityChange(item.quantity - 1)}
                disabled={item.quantity <= 1}
                className={`w-7 h-7 rounded-md flex items-center justify-center transition-colors ${
                  item.quantity <= 1
                    ? 'opacity-30 cursor-not-allowed'
                    : 'hover:bg-neutral-200 dark:hover:bg-neutral-700'
                }`}
              >
                <Minus className="w-4 h-4" />
              </button>
              <span className="w-6 text-center font-semibold text-sm">
                {item.quantity}
              </span>
              <button
                onClick={() => handleQuantityChange(item.quantity + 1)}
                className="w-7 h-7 rounded-md flex items-center justify-center hover:bg-neutral-200 dark:hover:bg-neutral-700 transition-colors"
              >
                <Plus className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// =====================================================
// PÁGINA PRINCIPAL DO CARRINHO
// =====================================================

export default function CarrinhoPage() {
  const router = useRouter();
  const cart = useCart();
  const [couponCode, setCouponCode] = useState('');
  const [couponLoading, setCouponLoading] = useState(false);
  const [couponError, setCouponError] = useState('');

  const isEmpty = cart.items.length === 0;

  // Validar cupom via API
  const handleApplyCoupon = async () => {
    setCouponLoading(true);
    setCouponError('');

    // Validação com Zod
    const result = couponSchema.safeParse({ code: couponCode });

    if (!result.success) {
      const firstError = result.error.issues[0];
      setCouponError(firstError?.message || 'Código inválido');
      setCouponLoading(false);
      return;
    }

    try {
      // Validar cupom via API
      const response = await couponsService.validate({
        code: result.data.code,
        subtotal: cart.subtotal,
        productIds: cart.items.map(item => item.product.id),
      });

      if (response.valid && response.coupon && response.discountAmount !== undefined) {
        // Mapear resposta da API para formato do carrinho
        const couponType = response.coupon.type === 'percentage' 
          ? 'percentage' 
          : response.coupon.type === 'fixed'
          ? 'fixed'
          : 'freeDelivery';

        cart.applyCoupon({
          code: response.coupon.code,
          type: couponType,
          value: response.coupon.value,
          minOrderValue: response.coupon.minOrderValue,
        });

        toast.success('Cupom aplicado!', { 
          description: response.message || 'Desconto aplicado com sucesso' 
        });
        setCouponCode('');
      } else {
        setCouponError(response.message || 'Cupom inválido ou expirado');
      }
    } catch (error: any) {
      setCouponError(error.response?.data?.message || 'Erro ao validar cupom');
    } finally {
      setCouponLoading(false);
    }
  };

  // Ir para checkout
  const handleCheckout = () => {
    router.push('/checkout');
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <Header />

      {/* Conteúdo */}
      <div className="max-w-2xl mx-auto px-4 py-6">
        <h1 className="text-2xl font-bold text-neutral-900 dark:text-neutral-100 mb-6">
          Meu Carrinho
        </h1>

        {isEmpty ? (
          /* Estado vazio */
          <div className="text-center py-16">
            <div 
              className="w-24 h-24 rounded-full flex items-center justify-center mx-auto mb-4"
              style={{ backgroundColor: 'rgba(157, 0, 148, 0.1)' }}
            >
              <ShoppingBag className="w-12 h-12" style={{ color: '#9d0094' }} />
            </div>
            <h3 className="text-lg font-semibold text-neutral-800 dark:text-neutral-200 mb-2">
              Seu carrinho está vazio
            </h3>
            <p className="text-neutral-500 dark:text-neutral-400 mb-6">
              Adicione itens deliciosos ao seu carrinho!
            </p>
            <Button
              onClick={() => router.push('/')}
              className="text-white"
              style={{ backgroundColor: '#9d0094' }}
            >
              Ver cardápio
            </Button>
          </div>
        ) : (
          <>
            {/* Lista de itens */}
            <section className="space-y-3 mb-6">
              {cart.items.map((item) => (
                <CartItemCard key={item.id} item={item} />
              ))}
            </section>

            {/* Adicionar mais itens */}
            <button
              onClick={() => router.push('/')}
              className="w-full py-3 px-4 rounded-xl border-2 border-dashed border-neutral-300 dark:border-neutral-700 text-neutral-600 dark:text-neutral-400 hover:border-[#9d0094] hover:text-[#9d0094] transition-colors flex items-center justify-center gap-2 mb-6"
            >
              <Plus className="w-5 h-5" />
              Adicionar mais itens
            </button>

            {/* Cupom de desconto */}
            <section className="bg-white dark:bg-neutral-900 rounded-2xl p-4 border border-neutral-200 dark:border-neutral-800 mb-4">
              <h3 className="font-semibold text-neutral-800 dark:text-neutral-200 mb-3 flex items-center gap-2">
                <Ticket className="w-5 h-5" style={{ color: '#9d0094' }} />
                Cupom de desconto
              </h3>

              {cart.appliedCoupon ? (
                /* Cupom aplicado */
                <div className="flex items-center justify-between p-3 rounded-xl bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800">
                  <div className="flex items-center gap-2">
                    <Tag className="w-4 h-4 text-green-600" />
                    <span className="font-medium text-green-700 dark:text-green-400">
                      {cart.appliedCoupon.code}
                    </span>
                    <span className="text-sm text-green-600 dark:text-green-500">
                      {cart.appliedCoupon.type === 'percentage' && `${cart.appliedCoupon.value}% OFF`}
                      {cart.appliedCoupon.type === 'fixed' && `R$ ${cart.appliedCoupon.value} OFF`}
                      {cart.appliedCoupon.type === 'freeDelivery' && 'Frete Grátis'}
                    </span>
                  </div>
                  <button
                    onClick={() => {
                      cart.removeCoupon();
                      toast.success('Cupom removido');
                    }}
                    className="text-sm text-red-500 hover:text-red-600 font-medium"
                  >
                    Remover
                  </button>
                </div>
              ) : (
                /* Input de cupom */
                <div>
                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={couponCode}
                      onChange={(e) => {
                        setCouponCode(sanitizeCouponCode(e.target.value));
                        setCouponError('');
                      }}
                      maxLength={20}
                      placeholder="Digite o código"
                      className="flex-1 min-w-0 px-3 py-2.5 rounded-xl border-2 border-neutral-200 dark:border-neutral-700 bg-transparent focus:border-[#9d0094] focus:outline-none transition-colors text-sm uppercase"
                    />
                    <Button
                      onClick={handleApplyCoupon}
                      disabled={couponLoading || !couponCode.trim()}
                      className="px-4 text-white flex-shrink-0 text-sm"
                      style={{ backgroundColor: '#9d0094' }}
                    >
                      {couponLoading ? '...' : 'Aplicar'}
                    </Button>
                  </div>
                  {couponError && (
                    <p className="text-sm text-red-500 mt-2 flex items-center gap-1">
                      <AlertCircle className="w-4 h-4" />
                      {couponError}
                    </p>
                  )}
                  <p className="text-xs text-neutral-500 dark:text-neutral-400 mt-2">
                    Teste: ACAI10 (10% off) ou FRETE (frete grátis)
                  </p>
                </div>
              )}
            </section>

            {/* Resumo */}
            <section className="bg-card rounded-2xl p-4">
              <h3 className="font-semibold text-neutral-800 dark:text-neutral-200 mb-4">
                Resumo do pedido
              </h3>

              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-neutral-600 dark:text-neutral-400">
                    Subtotal ({cart.itemCount} {cart.itemCount === 1 ? 'item' : 'itens'})
                  </span>
                  <span className="font-medium">R$ {cart.subtotal.toFixed(2)}</span>
                </div>

                {cart.discount > 0 && (
                  <div className="flex justify-between text-sm text-green-600">
                    <span>Desconto</span>
                    <span>- R$ {cart.discount.toFixed(2)}</span>
                  </div>
                )}

                <div className="flex justify-between text-sm">
                  <span className="text-neutral-600 dark:text-neutral-400">
                    Taxa de entrega
                  </span>
                  <span className={`font-medium ${cart.deliveryFee === 0 ? 'text-green-600' : ''}`}>
                    {cart.deliveryFee === 0 ? 'Grátis' : `R$ ${cart.deliveryFee.toFixed(2)}`}
                  </span>
                </div>

                <div className="pt-3 mt-3 border-t border-neutral-100 dark:border-neutral-800">
                  <div className="flex justify-between">
                    <span className="font-semibold text-neutral-900 dark:text-neutral-100">
                      Total
                    </span>
                    <span className="text-xl font-bold" style={{ color: '#9d0094' }}>
                      R$ {cart.total.toFixed(2)}
                    </span>
                  </div>
                </div>
              </div>
            </section>

            {/* Botão de finalizar */}
            <Button
              onClick={handleCheckout}
              className="w-full h-14 text-white font-semibold text-base rounded-xl mt-4 mb-4"
              style={{ backgroundColor: '#139948' }}
            >
              Escolher forma de pagamento
            </Button>
          </>
        )}
      </div>
    </div>
  );
}
