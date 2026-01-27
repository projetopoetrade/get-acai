// src/app/carrinho/page.tsx
'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import { 
  Minus, 
  Plus, 
  Trash2, 
  ShoppingBag,
  Cherry
} from 'lucide-react';
import { Header } from '@/components/layout/header';
import { Button } from '@/components/ui/button';
import { useCart } from '@/hooks/useCart';
import { toast } from 'sonner';
import { CartItem } from '@/types/cart';
  import { CouponInput } from '@/components/cart/coupon-input'; // 👈 Importamos o componente novo
  
// =====================================================
// COMPONENTE DE ITEM DO CARRINHO (Mantido Igual)
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

  const customizationDetails: string[] = [];
  
  if (item.customization) {
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

    if (item.customization.wantsCutlery) {
      customizationDetails.push('Com talheres');
    }

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
              
              {customizationDetails.length > 0 && (
                <p className="text-xs text-neutral-500 dark:text-neutral-400 mt-0.5 line-clamp-2">
                  {customizationDetails.join(' • ')}
                </p>
              )}
            </div>

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

          <div className="flex items-center justify-between mt-3">
            <span className="font-bold" style={{ color: '#9d0094' }}>
              R$ {item.totalPrice.toFixed(2)}
            </span>

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
  
  const isEmpty = cart.items.length === 0;

  // Ir para checkout
  const handleCheckout = () => {
    router.push('/checkout');
  };

  return (
    <div className="min-h-screen bg-neutral-50 dark:bg-black">
      <Header />

      <div className="max-w-2xl mx-auto px-4 py-6 pb-32">
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
              className="text-white font-bold"
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
              className="w-full py-3 px-4 rounded-xl border-2 border-dashed border-neutral-300 dark:border-neutral-700 text-neutral-600 dark:text-neutral-400 hover:border-[#9d0094] hover:text-[#9d0094] transition-colors flex items-center justify-center gap-2 mb-6 font-medium"
            >
              <Plus className="w-5 h-5" />
              Adicionar mais itens
            </button>

            {/* ✅ CUPOM DE DESCONTO (COMPONENTIZADO) */}
            <section className="mb-6">
              <CouponInput />
            </section>

            {/* Resumo */}
            <section className="bg-white dark:bg-neutral-900 rounded-2xl p-6 shadow-sm border border-neutral-200 dark:border-neutral-800">
              <h3 className="font-semibold text-neutral-800 dark:text-neutral-200 mb-4 text-lg">
                Resumo do pedido
              </h3>

              <div className="space-y-3">
                <div className="flex justify-between text-sm">
                  <span className="text-neutral-600 dark:text-neutral-400">
                    Subtotal ({cart.itemCount} {cart.itemCount === 1 ? 'item' : 'itens'})
                  </span>
                  <span className="font-medium">R$ {cart.subtotal.toFixed(2)}</span>
                </div>

                {/* ✅ EXIBIÇÃO DO DESCONTO */}
                {cart.discount > 0 && (
                  <div className="flex justify-between text-sm text-green-600 font-medium">
                    <span>Desconto</span>
                    <span>- R$ {cart.discount.toFixed(2)}</span>
                  </div>
                )}

                <div className="flex justify-between text-sm">
                  <span className="text-neutral-600 dark:text-neutral-400">
                    Taxa de entrega
                  </span>
                  <span className="text-neutral-400 text-xs italic">
                    Calculada no checkout
                  </span>
                </div>

                <div className="pt-4 mt-4 border-t border-neutral-100 dark:border-neutral-800">
                  <div className="flex justify-between items-end">
                    <span className="font-bold text-lg text-neutral-900 dark:text-neutral-100">
                      Total
                    </span>
                    <div className="text-right">
                      <span className="text-2xl font-black" style={{ color: '#9d0094' }}>
                        {/* ✅ CÁLCULO FINAL COM DESCONTO */}
                        R$ {Math.max(0, cart.subtotal - cart.discount).toFixed(2)}
                      </span>
                      <p className="text-[10px] text-neutral-400 mt-0.5">
                        (Sem incluir taxa de entrega)
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </section>

            {/* Botão de finalizar */}
            <Button
              onClick={handleCheckout}
              className="w-full h-14 text-white font-bold text-lg rounded-xl mt-6 shadow-lg hover:brightness-110 transition-all active:scale-[0.98]"
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