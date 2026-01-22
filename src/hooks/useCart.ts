// src/hooks/useCart.ts
// =====================================================
// GERENCIAMENTO DE CARRINHO - Preparado para integração com API
// =====================================================

'use client';

import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { Product } from '@/types/product';
import { 
  CartItem, 
  Cart, 
  ItemCustomization, 
  AppliedCoupon,
  SelectedTopping 
} from '@/types/cart';

// =====================================================
// TIPOS DO STORE
// =====================================================

interface CartStore extends Cart {
  // Ações do carrinho
  addItem: (product: Product, quantity?: number, customization?: ItemCustomization) => void;
  removeItem: (itemId: string) => void;
  updateItemQuantity: (itemId: string, quantity: number) => void;
  updateItemCustomization: (itemId: string, customization: ItemCustomization) => void;
  clearCart: () => void;
  
  // Cupons e descontos
  applyCoupon: (coupon: AppliedCoupon) => void;
  removeCoupon: () => void;
  
  // Taxa de entrega
  setDeliveryFee: (fee: number) => void;
  
  // Helpers
  getItemById: (itemId: string) => CartItem | undefined;
  calculateTotals: () => void;
}

// =====================================================
// HELPERS
// =====================================================

// Gerar ID único para item do carrinho
function generateCartItemId(): string {
  return `cart-item-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
}

// Calcular preço do item com personalizações
function calculateItemPrice(product: Product, customization?: ItemCustomization): number {
  let price = product.price;
  
  if (customization?.toppings) {
    // Soma apenas toppings que não são grátis
    customization.toppings.forEach(topping => {
      if (!topping.isFree) {
        price += topping.unitPrice * topping.quantity;
      }
    });
  }
  
  return price;
}

// Calcular desconto baseado no cupom
function calculateDiscount(subtotal: number, coupon?: AppliedCoupon): number {
  if (!coupon) return 0;
  
  // Verificar valor mínimo
  if (coupon.minOrderValue && subtotal < coupon.minOrderValue) {
    return 0;
  }
  
  switch (coupon.type) {
    case 'percentage':
      return subtotal * (coupon.value / 100);
    case 'fixed':
      return Math.min(coupon.value, subtotal);
    case 'freeDelivery':
      return 0; // Desconto aplicado na taxa de entrega
    default:
      return 0;
  }
}

// =====================================================
// STORE DO CARRINHO
// =====================================================

export const useCart = create<CartStore>()(
  persist(
    (set, get) => ({
      // Estado inicial
      items: [],
      subtotal: 0,
      discount: 0,
      deliveryFee: 0,
      total: 0,
      appliedCoupon: undefined,
      itemCount: 0,

      // Adicionar item ao carrinho
      addItem: (product, quantity = 1, customization) => {
        const unitPrice = calculateItemPrice(product, customization);
        
        const newItem: CartItem = {
          id: generateCartItemId(),
          product,
          quantity,
          customization,
          unitPrice,
          totalPrice: unitPrice * quantity,
        };

        set(state => {
          const newItems = [...state.items, newItem];
          const subtotal = newItems.reduce((sum, item) => sum + item.totalPrice, 0);
          const discount = calculateDiscount(subtotal, state.appliedCoupon);
          const deliveryFee = state.appliedCoupon?.type === 'freeDelivery' ? 0 : state.deliveryFee;
          
          return {
            items: newItems,
            subtotal,
            discount,
            deliveryFee,
            total: Math.max(0, subtotal - discount + deliveryFee),
            itemCount: newItems.reduce((sum, item) => sum + item.quantity, 0),
          };
        });
      },

      // Remover item do carrinho
      removeItem: (itemId) => {
        set(state => {
          const newItems = state.items.filter(item => item.id !== itemId);
          const subtotal = newItems.reduce((sum, item) => sum + item.totalPrice, 0);
          const discount = calculateDiscount(subtotal, state.appliedCoupon);
          const deliveryFee = state.appliedCoupon?.type === 'freeDelivery' ? 0 : state.deliveryFee;
          
          return {
            items: newItems,
            subtotal,
            discount,
            deliveryFee,
            total: Math.max(0, subtotal - discount + deliveryFee),
            itemCount: newItems.reduce((sum, item) => sum + item.quantity, 0),
          };
        });
      },

      // Atualizar quantidade do item
      updateItemQuantity: (itemId, quantity) => {
        if (quantity <= 0) {
          get().removeItem(itemId);
          return;
        }

        set(state => {
          const newItems = state.items.map(item => {
            if (item.id === itemId) {
              return {
                ...item,
                quantity,
                totalPrice: item.unitPrice * quantity,
              };
            }
            return item;
          });
          
          const subtotal = newItems.reduce((sum, item) => sum + item.totalPrice, 0);
          const discount = calculateDiscount(subtotal, state.appliedCoupon);
          const deliveryFee = state.appliedCoupon?.type === 'freeDelivery' ? 0 : state.deliveryFee;
          
          return {
            items: newItems,
            subtotal,
            discount,
            deliveryFee,
            total: Math.max(0, subtotal - discount + deliveryFee),
            itemCount: newItems.reduce((sum, item) => sum + item.quantity, 0),
          };
        });
      },

      // Atualizar personalizações do item
      updateItemCustomization: (itemId, customization) => {
        set(state => {
          const newItems = state.items.map(item => {
            if (item.id === itemId) {
              const unitPrice = calculateItemPrice(item.product, customization);
              return {
                ...item,
                customization,
                unitPrice,
                totalPrice: unitPrice * item.quantity,
              };
            }
            return item;
          });
          
          const subtotal = newItems.reduce((sum, item) => sum + item.totalPrice, 0);
          const discount = calculateDiscount(subtotal, state.appliedCoupon);
          const deliveryFee = state.appliedCoupon?.type === 'freeDelivery' ? 0 : state.deliveryFee;
          
          return {
            items: newItems,
            subtotal,
            discount,
            deliveryFee,
            total: Math.max(0, subtotal - discount + deliveryFee),
            itemCount: newItems.reduce((sum, item) => sum + item.quantity, 0),
          };
        });
      },

      // Limpar carrinho
      clearCart: () => {
        set({
          items: [],
          subtotal: 0,
          discount: 0,
          deliveryFee: 0,
          total: 0,
          appliedCoupon: undefined,
          itemCount: 0,
        });
      },

      // Aplicar cupom
      // TODO: Validar cupom com a API: POST /api/coupons/validate
      applyCoupon: (coupon) => {
        set(state => {
          const discount = calculateDiscount(state.subtotal, coupon);
          const deliveryFee = coupon.type === 'freeDelivery' ? 0 : state.deliveryFee;
          
          return {
            appliedCoupon: coupon,
            discount,
            deliveryFee,
            total: Math.max(0, state.subtotal - discount + deliveryFee),
          };
        });
      },

      // Remover cupom
      removeCoupon: () => {
        set(state => ({
          appliedCoupon: undefined,
          discount: 0,
          total: Math.max(0, state.subtotal + state.deliveryFee),
        }));
      },

      // Definir taxa de entrega
      // TODO: Calcular via API: POST /api/delivery/calculate { address }
      setDeliveryFee: (fee) => {
        set(state => {
          const deliveryFee = state.appliedCoupon?.type === 'freeDelivery' ? 0 : fee;
          return {
            deliveryFee,
            total: Math.max(0, state.subtotal - state.discount + deliveryFee),
          };
        });
      },

      // Obter item por ID
      getItemById: (itemId) => {
        return get().items.find(item => item.id === itemId);
      },

      // Recalcular totais (útil após sincronização com backend)
      calculateTotals: () => {
        set(state => {
          const subtotal = state.items.reduce((sum, item) => sum + item.totalPrice, 0);
          const discount = calculateDiscount(subtotal, state.appliedCoupon);
          const deliveryFee = state.appliedCoupon?.type === 'freeDelivery' ? 0 : state.deliveryFee;
          
          return {
            subtotal,
            discount,
            total: Math.max(0, subtotal - discount + deliveryFee),
            itemCount: state.items.reduce((sum, item) => sum + item.quantity, 0),
          };
        });
      },
    }),
    {
      name: 'acai-cart-storage',
      version: 2, // Incrementar ao mudar estrutura
    }
  )
);

// =====================================================
// HELPERS PARA CRIAR CUSTOMIZAÇÃO
// =====================================================

// Criar objeto de customização a partir das seleções da página de produto
export function createCustomization(
  sizeId: string | undefined,
  toppingQuantities: Record<string, number>,
  toppingsData: Array<{ id: string; name: string; price: number; category: string }>,
  limits: Record<string, number>,
  wantsCutlery: boolean,
  observations: string,
  skippedCategories: string[]
): ItemCustomization {
  // Calcular quais toppings são grátis
  const toppingsByCategory: Record<string, Array<{ topping: typeof toppingsData[0]; qty: number }>> = {};
  
  Object.entries(toppingQuantities).forEach(([toppingId, qty]) => {
    if (qty > 0) {
      const topping = toppingsData.find(t => t.id === toppingId);
      if (topping) {
        if (!toppingsByCategory[topping.category]) {
          toppingsByCategory[topping.category] = [];
        }
        toppingsByCategory[topping.category].push({ topping, qty });
      }
    }
  });

  const selectedToppings: SelectedTopping[] = [];

  Object.entries(toppingsByCategory).forEach(([category, items]) => {
    const limit = limits[category] || 0;
    let freeRemaining = limit;

    // Ordenar por preço (mais baratos primeiro para serem grátis)
    items.sort((a, b) => a.topping.price - b.topping.price);

    items.forEach(({ topping, qty }) => {
      for (let i = 0; i < qty; i++) {
        const isFree = category !== 'extras' && freeRemaining > 0;
        if (isFree) freeRemaining--;

        selectedToppings.push({
          toppingId: topping.id,
          name: topping.name,
          quantity: 1,
          unitPrice: topping.price,
          isFree,
        });
      }
    });
  });

  // Agrupar toppings iguais
  const groupedToppings: SelectedTopping[] = [];
  selectedToppings.forEach(t => {
    const existing = groupedToppings.find(
      g => g.toppingId === t.toppingId && g.isFree === t.isFree
    );
    if (existing) {
      existing.quantity++;
    } else {
      groupedToppings.push({ ...t });
    }
  });

  return {
    sizeId: sizeId as any,
    toppings: groupedToppings,
    wantsCutlery,
    observations: observations || undefined,
    skippedCategories: skippedCategories.length > 0 ? skippedCategories : undefined,
  };
}

/*
INTEGRAÇÃO COM API DE PEDIDOS:

// Criar pedido
const createOrder = async () => {
  const cart = useCart.getState();
  
  const payload: CreateOrderPayload = {
    items: cart.items.map(item => ({
      productId: item.product.id,
      quantity: item.quantity,
      customization: item.customization,
    })),
    customer: customerInfo,
    deliveryType: 'delivery',
    deliveryAddress: address,
    paymentMethod: 'pix',
    couponCode: cart.appliedCoupon?.code,
  };

  const response = await fetch('/api/orders', {
    method: 'POST',
    body: JSON.stringify(payload),
  });
  
  const { order, pixCode } = await response.json();
  
  // Limpar carrinho após criar pedido
  cart.clearCart();
  
  return { order, pixCode };
};
*/
